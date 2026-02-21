import got from "got";
import matter from "gray-matter";
import { remark } from "remark";
import strip from "strip-markdown";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const cache = new Map<string, string>();

// Global counter for tracking progress across recursive calls
let filesScraped = 0;

export interface ProgressEvent {
  type: "scanning" | "scraping" | "embedding" | "uploading" | "complete" | "error";
  message: string;
  count?: number;
  total?: number;
}

type ProgressCallback = (event: ProgressEvent) => void;

export async function fetchMarkdownFile(url: string): Promise<string | null> {
  if (cache.has(url)) return cache.get(url) || null;

  try {
    const { body } = await got(url, { headers: { "User-Agent": "your-app" } });
    const content = body.toString();

    const { content: markdownText } = matter(content);
    const processed = await remark().use(strip).process(markdownText);
    const textContent = processed.toString().trim();

    cache.set(url, textContent);
    return textContent;
  } catch (error) {
    console.error("Error fetching file:", url, error);
    return null;
  }
}

async function fetchGitHubDocsRecursively(
  owner: string,
  repo: string,
  branch: string,
  path: string = "",
  githubToken?: string,
  depth: number = 0,
  maxDepth: number = 10,
  onProgress?: ProgressCallback,
  tempFilePath?: string
): Promise<void> {
  // Prevent stack overflow from deep recursion  
  if (depth > maxDepth) {
    return;
  }

  // Skip common non-documentation directories
  const skipDirs = [
    'node_modules', '.git', '.github', '.gitlab', 'dist', 'build', '.next', 
    'coverage', '.vscode', '.idea', 'target', 'out', '__pycache__', 'venv',
    'env', '.env', 'temp', 'tmp', '.cache', 'test', 'tests', 'spec', 'specs',
    'examples', 'sample', 'demo', '.storybook', 'public'
  ];

  if (path) {
    const currentDir = path.split('/').pop()?.toLowerCase() || '';
    if (skipDirs.includes(currentDir)) {
      return;
    }
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  let response;
  try {
    response = await got(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Authorization: githubToken ? `token ${githubToken}` : undefined,
      },
    }).json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("404")) {
        onProgress?.({ type: "error", message: `Repository or path not found (404)` });
      } else if (error.message.includes("401") || error.message.includes("403")) {
        onProgress?.({ type: "error", message: `Authentication failed. Check your GitHub token.` });
      }
    }
    return;
  }

  if (!Array.isArray(response)) {
    return;
  }

  for (const item of response) {
    if (item.type === "file" && (item.name.endsWith(".md") || item.name.endsWith(".mdx"))) {
      filesScraped++;
      onProgress?.({
        type: "scraping",
        message: `${item.path}`,
        count: filesScraped,
      });
      try {
        const fileContent = await got(item.download_url).text();
        // Stream to temp file instead of storing in memory
        const content = `\n\n### ${item.path}\n${fileContent}`;
        await fs.appendFile(tempFilePath!, content);
      } catch (error) {
        if (error instanceof Error) {
          onProgress?.({
            type: "error",
            message: `Failed to fetch ${item.path}: ${error.message}`,
          });
        }
      }
    } else if (item.type === "dir") {
      await fetchGitHubDocsRecursively(
        owner,
        repo,
        branch,
        item.path,
        githubToken,
        depth + 1,
        maxDepth,
        onProgress,
        tempFilePath
      );
    }
  }
}

export async function fetchGitHubDocsWithProgress(
  githubUrl: string,
  githubToken?: string,
  onProgress?: ProgressCallback
): Promise<string | null> {
  const tempFilePath = join(tmpdir(), `scrape-${Date.now()}-${Math.random().toString(36).slice(2)}.md`);
  
  try {
    if (!githubUrl) throw new Error("GitHub URL is undefined or empty");

    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+)\/(.+))?/);
    if (!match) throw new Error("Invalid GitHub URL format");

    const [, owner, repo, branchFromUrl, rawPath] = match;
    let branch = branchFromUrl || "main";

    if (!branchFromUrl) {
      const token = githubToken || process.env.GITHUB_TOKEN;
      const repoInfo = await got(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Authorization: token ? `token ${token}` : undefined,
        },
      }).json();
      branch = (repoInfo as { default_branch: string }).default_branch || "main";
    }

    onProgress?.({ type: "scanning", message: "Scanning repository for markdown files..." });
    filesScraped = 0; // Reset counter
    
    // Initialize temp file
    await fs.writeFile(tempFilePath, "");
    
    // Scrape and stream to temp file
    await fetchGitHubDocsRecursively(
      owner,
      repo,
      branch,
      rawPath || "",
      githubToken,
      0,
      10,
      onProgress,
      tempFilePath
    );
    
    // Read the accumulated content from temp file
    const docs = await fs.readFile(tempFilePath, "utf-8");
    
    if (!docs || docs.trim().length === 0) {
      onProgress?.({
        type: "error",
        message: "No markdown files found in repository",
      });
      return null;
    }

    onProgress?.({
      type: "complete",
      message: `Successfully scraped ${filesScraped} markdown files`,
    });
    
    return docs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    onProgress?.({ type: "error", message: errorMessage });
    return null;
  } finally {
    // Always clean up temp file
    try {
      await fs.unlink(tempFilePath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

export async function fetchGitHubDocs(githubUrl: string, githubToken?: string): Promise<string | null> {
  return fetchGitHubDocsWithProgress(githubUrl, githubToken, (event) => {
    if (event.type === "scraping") {
      console.log(`📄 Scraping: ${event.message} (${event.count || 0} files)`);
    } else if (event.type === "scanning") {
      console.log(`🔍 ${event.message}`);
    } else if (event.type === "error") {
      console.error(`❌ ${event.message}`);
    } else if (event.type === "complete") {
      console.log(`✅ ${event.message}`);
    }
  });
}

