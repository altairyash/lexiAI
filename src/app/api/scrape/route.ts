import { fetchGitHubDocs } from "@/lib/scraper";
import { storeDocs } from "@/lib/pinecone";

export async function POST(req: Request) {
  try {
      const body = await req.json();
      const { url, namespace, githubToken } = body;

      if (!url) {
          return Response.json({ success: false, message: "Missing URL" }, { status: 400 });
      }

      // Use provided token or fall back to environment variable
      const token = githubToken || process.env.GITHUB_TOKEN;
      const text: string | null = await fetchGitHubDocs(url, token); 
      
      if (text !== null) {
          await storeDocs(url, text, namespace || "default");
          return Response.json({ success: true, message: "Docs scraped and stored." });
      }

      return Response.json({ success: false, message: "Failed to scrape." }, { status: 500 });
  } catch (error) {
      console.error("API POST Error:", error);
      return Response.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
