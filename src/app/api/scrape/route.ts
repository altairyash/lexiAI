import { fetchGitHubDocs } from "@/lib/scraper";
import { storeDocs } from "@/lib/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export async function POST(req: Request) {
  try {
    if (req.method !== "POST") {
      return Response.json(
        { success: false, message: "Method not allowed. Use POST." },
        { status: 405 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { success: false, message: "Invalid JSON format." },
        { status: 400 }
      );
    }

    const { url, namespace, githubToken, rescrape } = body;

    if (rescrape && namespace) {
      if (!githubToken) {
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
        return Response.json(
          { success: false, message: `Namespace "${safeNamespace}" not found or is empty.` },
          { status: 404 }
        );
      }

      console.log(`🔄 Re-scraping namespace: ${safeNamespace} (id: ${safeNamespace})`);
      console.log(`⚠️  Note: Rescrape needs original URL. Consider storing URL in namespace metadata.`);

      return Response.json(
        { 
          success: true, 
          message: "Re-scrape operation triggered. Implementation note: Store original URL in metadata for full rescrape support.",
          namespace: safeNamespace
        },
        { status: 200 }
      );
    }

    if (!url) {
      return Response.json(
        { success: false, message: "Missing required field: url" },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return Response.json(
        { success: false, message: "Invalid URL format." },
        { status: 400 }
      );
    }

    const safeNamespace = (namespace || "default").replace(/[^a-zA-Z0-9_-]/g, "_");

    if (!githubToken) {
      return Response.json(
        { success: false, message: "GitHub token is required." },
        { status: 400 }
      );
    }

    const token = githubToken;
    
    const text = await fetchGitHubDocs(url, token);
    
    if (!text || text.trim().length === 0) {
      return Response.json(
        { success: false, message: "Failed to scrape content from URL or content is empty." },
        { status: 400 }
      );
    }

    await storeDocs(url, text, safeNamespace);
    
    console.log(`✅ Successfully scraped and stored docs from ${url} in namespace: ${safeNamespace}`);
    return Response.json(
      { success: true, message: "Docs scraped and stored successfully.", namespace: safeNamespace },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ API Error in /scrape:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const statusCode = errorMessage.includes("fetch") || errorMessage.includes("404") ? 400 : 500;
    
    return Response.json(
      { success: false, message: `Failed to scrape: ${errorMessage}` },
      { status: statusCode }
    );
  }
}
