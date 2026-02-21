import { queryDocsWithAgent, ChatMessage } from "@/lib/agent";
import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";

const rateLimit = new LRUCache<string, number>({
  max: 100,
  ttl: 60 * 1000,
});

const RATE_LIMIT_PER_MINUTE = 5;
const MAX_QUESTION_LENGTH = 500;
const MAX_NAMESPACE_LENGTH = 100;

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("cf-connecting-ip") ||
      "local";

    const currentCount = rateLimit.get(ip) ?? 0;
    if (currentCount >= RATE_LIMIT_PER_MINUTE) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { 
          success: false, 
          message: `Too many requests (${RATE_LIMIT_PER_MINUTE} max per minute). Please try again later.` 
        },
        { status: 429 }
      );
    }
    rateLimit.set(ip, currentCount + 1);

    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { success: false, message: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    let requestData: any;
    try {
      requestData = await req.json();
    } catch (e) {
      console.error("❌ Invalid JSON in request:", e);
      return NextResponse.json(
        { success: false, message: "Invalid JSON format." },
        { status: 400 }
      );
    }

    const { question, namespace, chatHistory } = requestData;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing question." },
        { status: 400 }
      );
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json(
        { success: false, message: `Question exceeds maximum length of ${MAX_QUESTION_LENGTH} characters.` },
        { status: 400 }
      );
    }

    if (!namespace || typeof namespace !== "string" || namespace.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing namespace." },
        { status: 400 }
      );
    }

    if (namespace.length > MAX_NAMESPACE_LENGTH) {
      return NextResponse.json(
        { success: false, message: `Namespace exceeds maximum length of ${MAX_NAMESPACE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    let validChatHistory: ChatMessage[] | undefined;
    if (chatHistory) {
      if (!Array.isArray(chatHistory)) {
        return NextResponse.json(
          { success: false, message: "Chat history must be an array." },
          { status: 400 }
        );
      }

      validChatHistory = chatHistory
        .filter(m => m && typeof m === "object")
        .map((m) => ({
          role:
            m.role === "user" || m.role === "assistant"
              ? m.role
              : ("user" as const),
          content: String(m.content || "").slice(0, 2000),
        }))
        .slice(-10);
    }

    console.log(`📨 Query API: Processing`, {
      question: question.substring(0, 80),
      namespace: namespace,
      chatHistoryCount: validChatHistory?.length ?? 0,
      ip: ip,
    });

    const answer = await queryDocsWithAgent(
      question.trim(),
      namespace.trim(),
      validChatHistory
    );

    if (!answer || answer.trim().length === 0) {
      console.warn(`⚠️ Empty response from agent`);
      return NextResponse.json(
        { success: true, answer: "Unable to generate response. Please try a different question." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, answer },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in query API:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const isDev = process.env.NODE_ENV === "development";
    
    return NextResponse.json(
      { 
        success: false, 
        message: isDev ? errorMessage : "Failed to process query. Please try again later.",
        ...(isDev && { debug: errorMessage })
      },
      { status: 500 }
    );
  }
}
