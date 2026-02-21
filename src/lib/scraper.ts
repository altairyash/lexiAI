import got from "got";
import matter from "gray-matter";
import { remark } from "remark";
import strip from "strip-markdown";

const cache = new Map<string, string>();

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
  githubToken?: string
): Promise<string> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  console.log(`📂 Fetching directory: ${path || "root"}`);

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
      console.error(`❌ Failed to fetch contents of ${path}:`, error.message);
    } else {
      console.error(`❌ Failed to fetch contents of ${path}:`, error);
    }
    return "";
  }

  if (!Array.isArray(response)) {
    console.error(`⚠️ Unexpected response format for ${path}:`, response);
    return "";
  }

  let allDocs = "";

  for (const item of response) {
    if (item.type === "file" && (item.name.endsWith(".md") || item.name.endsWith(".mdx"))) {
      console.log(`📄 Fetching file: ${item.path}`);

      try {
        const fileContent = await got(item.download_url).text();
        console.log(`✅ Successfully fetched: ${item.path}`);

        allDocs += `\n\n### ${item.path}\n${fileContent}`;
      } catch (error) {
        if (error instanceof Error) {
          console.error(`❌ Failed to fetch content for ${item.path}:`, error.message);
        } else {
          console.error(`❌ Failed to fetch content for ${item.path}:`, error);
        }
      }
    } else if (item.type === "dir") {
      console.log(`📂 Entering subdirectory: ${item.path}`);
      allDocs += await fetchGitHubDocsRecursively(owner, repo, branch, item.path, githubToken);
    }
  }

  return allDocs;
}

export async function fetchGitHubDocs(githubUrl: string, githubToken?: string): Promise<string | null> {
  try {
    if (!githubUrl) throw new Error("GitHub URL is undefined or empty");
    console.log("Processing GitHub URL:", githubUrl);

    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+)\/(.+))?/);
    if (!match) throw new Error("Invalid GitHub URL format");

    const [owner, repo, branchFromUrl, rawPath] = match;
    let branch = branchFromUrl || "main";

    if (!branchFromUrl) {
      console.log("Fetching default branch...");
      const token = githubToken || process.env.GITHUB_TOKEN;
      const repoInfo = await got(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Authorization: token ? `token ${token}` : undefined,
        },
      }).json();
      branch = (repoInfo as { default_branch: string }).default_branch || "main";
      console.log("Detected default branch:", branch);
    }

    console.log("Extracted GitHub Info:", { owner, repo, branch, path: rawPath || "root" });
    return await fetchGitHubDocsRecursively(owner, repo, branch, rawPath || "", githubToken);
  } catch (error) {
    console.error("Error fetching GitHub docs:", error);
    return null;
  }
}

