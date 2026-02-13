import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { query, availableNamespaces } = await req.json();

    if (!query || !availableNamespaces || availableNamespaces.length === 0) {
      return NextResponse.json({ namespace: null });
    }

    const namespacesList = availableNamespaces.join(", ");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a classification assistant. 
          Given a user query and a list of documentation namespaces, identify the single most relevant namespace.
          
          Return ONLY the exact name of the namespace. 
          If none are relevant or you are unsure, return "null".
          
          List of namespaces: [${namespacesList}]`
        },
        {
          role: "user",
          content: `Query: "${query}"`
        }
      ],
      temperature: 0,
    });

    const namespaceRaw = response.choices[0].message.content?.trim();
    const namespace = namespaceRaw === "null" ? null : namespaceRaw;

    // Verify the returned namespace is actually in the list (hallucination check)
    if (namespace && availableNamespaces.includes(namespace)) {
        return NextResponse.json({ namespace });
    }

    return NextResponse.json({ namespace: null });

  } catch (error) {
    console.error("Error classifying namespace:", error);
    return NextResponse.json({ namespace: null }, { status: 500 });
  }
}
