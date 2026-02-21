import { fetchGitHubDocs } from "@/lib/scraper";
import { storeDocs } from "@/lib/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export async function POST(req: Request) {
  const logs: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;
  
  // Intercept console logs
  console.log = (...args: any[]) => {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    logs.push(message);
    originalLog(message);
  };
  
  console.error = (...args: any[]) => {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    logs.push(message);
    originalError(message);
  };

  try {
    if (req.method !== "POST") {
      console.log = originalLog;
      console.error = originalError;
      return Response.json(
        { success: false, message: "Method not allowed. Use POST." },
        { status: 405 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      console.log = originalLog;
      console.error = originalError;
      return Response.json(
        { success: false, message: "Invalid JSON format." },
        { status: 400 }
      );
    }

    const { url, namespace, githubToken, rescrape } = body;

    if (rescrape && namespace) {
      if (!githubToken) {
        console.log = originalLog;
        console.error = originalError;
        return Response.json(
          { success: false, message: "GitHub token is required for re-scraping." },
          { status: 400 }
        );
      }

      const safeNamespace = namespace.replace(/[^a-zA-Z0-9_-]/g, "_");
      
      const index = pinecone.Index("quickstart");
      const stats = await index.describeIndexStats();
      
      const nsStats = (stats.namespaces || {})[safeNamespace];
      
      if (!nsStats || nsStats.recordCount === 0) {
        console.log = originalLog;
        console.error = originalError;
        return Response.json(
          { success: false, message: `Namespace "${safeNamespace}" not found or is empty.` },
          { status: 404 }
        );
      }

      console.log(`🔄 Re-scraping namespace: ${safeNamespace}`);
      console.log(`⚠️  Note: Rescrape needs original URL. Consider storing URL in namespace metadata.`);

      const allLogs = logs.join('\n');
      console.log = originalLog;
      console.error = originalError;

      return Response.json(
        { 
          success: true, 
          message: "Re-scrape operation triggered.",
          namespace: safeNamespace,
          logs: allLogs
        },
        { status: 200 }
      );
    }

    if (!url) {
      console.log = originalLog;
      console.error = originalError;
      return Response.json(
        { success: false, message: "Missing required field: url" },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      console.log = originalLog;
      console.error = originalError;
      return Response.json(
        { success: false, message: "Invalid URL format." },
        { status: 400 }
      );
    }

    const safeNamespace = (namespace || "default").replace(/[^a-zA-Z0-9_-]/g, "_");

    if (!githubToken) {
      console.log = originalLog;
      console.error = originalError;
      return Response.json(
        { success: false, message: "GitHub token is required." },
        { status: 400 }
      );
    }

    const token = githubToken;
    
    try {
      const text = await fetchGitHubDocs(url, token);
      
      if (!text || text.trim().length === 0) {
        const errorMsg = url.includes("owner/repo") 
          ? `The URL "owner/repo" is a placeholder example. Please use a real GitHub repository URL like: https://github.com/facebook/react`
          : `Failed to scrape content from URL. The repository may not exist, have no markdown files, or the GitHub token may lack necessary permissions.`;
        
        console.log = originalLog;
        console.error = originalError;
        
        return Response.json(
          { success: false, message: errorMsg, logs: logs.join('\n') },
          { status: 400 }
        );
      }

      await storeDocs(url, text, safeNamespace);
      
      console.log(`✅ Successfully scraped and stored docs in namespace: ${safeNamespace}`);
      
      const allLogs = logs.join('\n');
      console.log = originalLog;
      console.error = originalError;
      
      return Response.json(
        { success: true, message: "Docs scraped and stored successfully.", namespace: safeNamespace, logs: allLogs },
        { status: 200 }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Internal server error";
      const allLogs = logs.join('\n');
      console.log = originalLog;
      console.error = originalError;
      
      return Response.json(
        { success: false, message: `Failed to scrape: ${errorMessage}`, logs: allLogs },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const allLogs = logs.join('\n');
    console.log = originalLog;
    console.error = originalError;
    
    return Response.json(
      { success: false, message: `Failed to scrape: ${errorMessage}`, logs: allLogs },
      { status: 500 }
    );
  }
}
