import { queryDocs } from "@/lib/query";
import { LRUCache } from "lru-cache";

// Set up an in-memory rate limiter using LRU cache
const rateLimit = new LRUCache<string, number>({
  max: 100, // Store up to 100 unique IPs
  ttl: 60 * 1000, // Reset limit every 60 seconds (1 minute)
});

export async function POST(req: Request) {
  try {
    // Extract user IP (fallback for local development)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "local";

    // Rate limiting: Allow only 5 requests per IP per minute
    const currentCount = rateLimit.get(ip) ?? 0;
    if (currentCount >= 5) {
      return Response.json({ success: false, message: "Too many requests. Try again later." }, { status: 429 });
    }
    rateLimit.set(ip, currentCount + 1);

    // Validate input
    let requestData: any;
    try {
      requestData = await req.json();
    } catch (e) {
      console.error("Invalid JSON in request:", e);
      return Response.json({ success: false, message: "Invalid JSON format." }, { status: 400 });
    }

    const { 
      question, 
      namespace,
      chatHistory,
    } = requestData;
    
    if (!question || typeof question !== "string" || question.length > 500) {
      return Response.json({ success: false, message: "Invalid question." }, { status: 400 });
    }
    if (!namespace || typeof namespace !== "string" || namespace.length > 100) {
      return Response.json({ success: false, message: "Invalid namespace." }, { status: 400 });
    }

    // Ensure chatHistory is valid
    let validChatHistory: Array<{ role: "user" | "assistant"; content: string }> | undefined;
    if (chatHistory && Array.isArray(chatHistory)) {
      validChatHistory = chatHistory.map(m => ({
        role: (m.role === "user" || m.role === "assistant") ? m.role : "user",
        content: m.content
      })) as Array<{ role: "user" | "assistant"; content: string }>;
    }

    console.log(`📨 Query received - namespace: ${namespace}, question length: ${question.length}, history: ${validChatHistory?.length ?? 0} messages`);

    // Process query with chat history
    const answer = await queryDocs(question, namespace, validChatHistory);
    return Response.json({ success: true, answer });
  } catch (error) {
    console.error("Error in query API:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
