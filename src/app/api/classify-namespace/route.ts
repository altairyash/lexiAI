import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    let requestData: any;
    try {
      requestData = await req.json();
    } catch {
      return NextResponse.json(
        { namespace: null, error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    const { query, availableNamespaces } = requestData;

    // Validate required fields
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      console.warn("⚠️ Missing or invalid query parameter");
      return NextResponse.json({ namespace: null });
    }

    if (!availableNamespaces || !Array.isArray(availableNamespaces) || availableNamespaces.length === 0) {
      console.warn("⚠️ Missing or invalid availableNamespaces parameter");
      return NextResponse.json({ namespace: null });
    }

    const namespacesList = availableNamespaces.join(", ");

    console.log(`🤖 Classifying query: "${query.substring(0, 80)}..." against ${availableNamespaces.length} namespaces`);

    // Call OpenAI to classify namespace
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a classification assistant. Given a user query and a list of documentation namespaces, identify the single most relevant namespace.
          
Return ONLY the exact name of the namespace from the provided list.
If none are relevant, return "null".

Available namespaces: [${namespacesList}]`,
        },
        {
          role: "user",
          content: `Query: "${query}"`,
        },
      ],
      temperature: 0,
      max_tokens: 50,
    });

    const namespaceRaw = response.choices[0].message.content?.trim();
    const namespace = namespaceRaw === "null" || !namespaceRaw ? null : namespaceRaw;

    // Verify the returned namespace is actually in the list (prevent hallucination)
    if (namespace && availableNamespaces.includes(namespace)) {
      console.log(`✅ Classified to namespace: ${namespace}`);
      return NextResponse.json({ namespace });
    }

    console.log(`ℹ️ No suitable namespace found for query`);
    return NextResponse.json({ namespace: null });

  } catch (error) {
    console.error("❌ Error classifying namespace:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { namespace: null, error: errorMessage },
      { status: 500 }
    );
  }
}
