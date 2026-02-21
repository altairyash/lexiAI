import { fetchGitHubDocsWithProgress } from "@/lib/scraper";
import { storeDocs } from "@/lib/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, namespace, githubToken } = body;

    if (!url || !githubToken || !namespace) {
      return Response.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Return a streaming response with SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encode = (data: any) => {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        try {
          // Scrape with progress callback
          const text = await fetchGitHubDocsWithProgress(url, githubToken, (event) => {
            encode(event);
          });

          if (!text || text.trim().length === 0) {
            encode({
              type: "error",
              message: `Failed to scrape content from URL. The repository may not exist or have no markdown files.`,
            });
            controller.close();
            return;
          }

          // Store docs
          encode({ type: "status", message: "Uploading to vector database..." });

          await storeDocs(url, text, namespace);

          encode({
            type: "complete",
            success: true,
            message: "Documentation indexed successfully!",
            namespace,
          });

          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          encode({
            type: "error",
            message: errorMessage,
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    );
  }
}
