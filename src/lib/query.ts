import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const index = pinecone.Index("quickstart");

export async function queryDocs(
  question: string,
  namespace: string
): Promise<string> {
  console.log(`🔍 Querying vector DB for namespace: ${namespace}`);
  console.log(`📝 Original User Question: ${question}`);

  // Step 1: Ask OpenAI to refine the question
  const refinementResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant that helps refine user queries before they are processed by a vector search system. 
        Your task is to make the query **clear, specific, and well-structured** based on the given documentation namespace.
        Also keep in mind that the query will be embedded to vector space for accurate search results so insert keywords relevant to it 
        .
        **Instructions:**
        - If the question is too vague, add **necessary context**.
        - If it’s **ambiguous**, suggest a better phrasing.
        - Maintain the **original intent** but **optimize for better search accuracy**.
        - Keep your response **short and concise** (1-2 sentences).
        
        **Example Inputs & Outputs:**
        ---
        **User Question:** "State management?"
        **Namespace:** "React Docs"
        **Refined Query:** "What are the different state management options in React, including useState, useReducer, and Context API?"
        `,
      },
      {
        role: "user",
        content: `User Question: "${question}"\nDocumentation Namespace: "${namespace}"`,
      },
    ],
    temperature: 0.2, // Keep it accurate and not too creative
  });

  const refinedQuestion =
    refinementResponse.choices[0].message.content?.trim() || question;

  console.log(`🔎 Refined Question: ${refinedQuestion}`);

  // Step 2: Generate embedding for the refined question
  const embedding = await openai.embeddings.create({
    input: refinedQuestion,
    model: "text-embedding-3-small",
  });

  console.log(`✅ Embedding generated successfully`);

  // Step 3: Query Pinecone
  const space = index.namespace(namespace);
  const results = await space.query({
    vector: embedding.data[0].embedding,
    topK: 20, // Adjusted for relevance
    includeMetadata: true,
  });

  console.log(`🔎 Pinecone returned ${results.matches.length} results`);

  if (results.matches.length === 0) {
    console.warn(`⚠️ No relevant matches found in Pinecone.`);
    return "I couldn't find relevant documentation for your query.";
  }

  const context = results.matches
    .map((match) => match.metadata?.text)
    .join("\n");
  console.log(`📄 Retrieved context:\n${context.slice(0, 500)}...`);

  // Step 4: Generate response with OpenAI using the refined question and retrieved context
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a Senior Software Engineer acting as a documentation expert.
        
        **Your Goal:** Provide the most accurate, concise, and production-ready answer based strictly on the provided context.

        **Guidelines:**
        1. **Direct Answer:** Start immediately with the solution. No "Here is how you do it" fluff.
        2. **Code First:** If a code snippet solves the problem, provide it first.
        3. **Context-Driven:** Use ONLY the provided documentation context. If the context is insufficient, state that clearly instead of hallucinating.
        4. **Formatting:** 
           - Use strictly GitHub Flavored Markdown.
           - Use appropriate language tags for code blocks (e.g., \`tsx\`, \`bash\`).
        5. **No Hallucinations:** Do not invent APIs or features not present in the context.

        **Response Structure:**
        - **Direct Answer/Summary** (1-2 sentences)
        - **Code Snippet** (Production ready, TypeScript preferred if applicable)
        - **Key Details** (Bullet points for parameters, edge cases, if necessary)
        `,
      },
      {
        role: "user",
        content: `**Question:**\n${refinedQuestion}\n\n**Relevant Documentation:**\n\`\`\`\n${context}\n\`\`\``,
      },
    ],
    temperature: 0.3, // Keeps responses precise
  });
  
  
  
  console.log(`💬 OpenAI response received`);

  return response.choices[0].message.content ?? "";
}
