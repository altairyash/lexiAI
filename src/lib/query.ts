import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const index = pinecone.Index("quickstart");

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function queryDocs(
  question: string,
  namespace: string,
  chatHistory?: ChatMessage[]
): Promise<string> {
  console.log(`🔍 Querying vector DB for namespace: ${namespace}`);
  console.log(`📝 User Question: ${question}`);
  if (chatHistory && chatHistory.length > 0) {
    console.log(`💬 Chat history: ${chatHistory.length} messages`);
  }

  // Step 1: Refine the question for better semantic search
  let refinementSystemPrompt = `You are an AI assistant that refines user queries for semantic vector search. Your task is to enhance the query with:
1. **Keywords from documentation** to improve semantic matching
2. **Specific context** that clarifies intent
3. **Related technical terms** that might appear in docs

Keep the refined query **concise** (1-2 sentences max).

Example:
- Input: "State management?" 
- Output: "What are the different state management patterns and solutions, including hooks, context, and external libraries?"`;

  if (chatHistory && chatHistory.length > 0) {
    refinementSystemPrompt += "\n4. **Consider conversation context** - If this is a follow-up question, expand it with context from the chat history";
  }

  const refinementResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: refinementSystemPrompt,
      },
      {
        role: "user",
        content: `Refine this query for semantic search in "${namespace}" documentation:\n"${question}"`,
      },
    ],
    temperature: 0.1,
  });

  const refinedQuestion =
    refinementResponse.choices[0].message.content?.trim() || question;
  console.log(`🔎 Refined: ${refinedQuestion}`);

  // Step 2: Generate embedding
  const embedding = await openai.embeddings.create({
    input: refinedQuestion,
    model: "text-embedding-3-small",
  });
  console.log(`✅ Embedding created`);

  // Step 3: Query Pinecone with relevance filtering
  const space = index.namespace(namespace);
  const results = await space.query({
    vector: embedding.data[0].embedding,
    topK: 30, // Fetch more, then filter by relevance
    includeMetadata: true,
  });

  console.log(`📊 Pinecone returned ${results.matches.length} raw results`);

  // Log top scores for debugging
  if (results.matches.length > 0) {
    const topScores = results.matches.slice(0, 5).map((m, i) => `#${i+1}: ${(m.score ?? 0).toFixed(3)}`).join(", ");
    console.log(`📈 Top 5 scores: ${topScores}`);
    
    // Log metadata structure of first result
    if (results.matches[0]?.metadata) {
      console.log(`🔍 Metadata keys:`, Object.keys(results.matches[0].metadata));
    }
  }

  // **CRITICAL: Use much more aggressive approach**
  // Use top 15 results directly (quality control happens in GPT)
  let relevantMatches = results.matches.slice(0, 15);

  if (relevantMatches.length === 0) {
    console.warn(`⚠️ No results from Pinecone`);
    return "I couldn't find relevant information in the documentation for your query. Please try rephrasing or ask something else.";
  }

  console.log(`✅ Using top ${relevantMatches.length} results for context`);

  // Build context from results
  const context = relevantMatches
    .map((match) => {
      // Try multiple metadata field names
      return match.metadata?.text || match.metadata?.content || match.metadata?.body || JSON.stringify(match.metadata);
    })
    .filter(Boolean)
    .join("\n\n");

  console.log(`📄 Context length: ${context.length} chars from ${relevantMatches.length} chunks`);
  
  if (!context || context.trim().length === 0) {
    console.warn(`⚠️ Context is empty after extraction`);
    return "I couldn't find information about this in the documentation.";
  }

  // Step 4: Build messages with chat history context
  const messages: any[] = [
    {
      role: "system",
      content: `You are a documentation assistant. Answer based on the provided documentation.

**IMPORTANT RULES:**
1. **Use the provided documentation** - Answer directly from the context given
2. **No filler** - Start with the answer immediately. No "Here's how...", "Let me explain..."
3. **Direct answers only** - Be concise (1-2 sentences max for simple questions)
4. **Format well:**
   - Use GitHub-flavored markdown
   - Add language tags (\`\`\`tsx, \`\`\`bash, \`\`\`json)
   - Keep it clear and readable
5. **Only say "I don't know" if** - The documentation genuinely doesn't address the question

**Response format:**
- Direct answer
- Code example (if relevant)
- Key details (bullets if needed)`,
    },
  ];

  // Add recent chat history if available (last 4 messages for context)
  if (chatHistory && chatHistory.length > 0) {
    const recentMessages = chatHistory.slice(-4);
    messages.push(...recentMessages);
  }

  // Add current question with documentation
  messages.push({
    role: "user",
    content: `**Question:** ${question}\n\n**Available Documentation:**\n${context}`,
  });

  // Step 5: Generate response
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.2, // Keep responses accurate and grounded
  });

  console.log(`💬 Response generated`);
  return response.choices[0].message.content ?? "";
}
