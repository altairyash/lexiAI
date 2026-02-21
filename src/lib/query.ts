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
    console.log(`💬 Chat history received: ${chatHistory.length} messages`);
    chatHistory.forEach((msg, i) => {
      console.log(`   [${i}] ${msg.role}: ${msg.content.substring(0, 80)}...`);
    });
  } else {
    console.log(`💬 No chat history provided`);
  }
  let refinementSystemPrompt = `You are an expert query refiner for semantic vector search. Your task is to:
1. **Expand the query** with specific keywords, synonyms, and related technical terms
2. **Add context** from the conversation if it's a follow-up
3. **Be specific** - vague terms get better results when made concrete

Output: ONLY the refined query (1-3 sentences max)

Example:
- Input: "State management?"
- Output: "React state management patterns including useState hook useReducer Context API Redux Zustand MobX"`;

  let refinementUserContent = `Current user query: "${question}"\nDocumentation namespace: ${namespace}`;

  if (chatHistory && chatHistory.length > 0) {
    refinementSystemPrompt = `You are an expert query refiner for semantic vector search. Your task is to:
1. **Understand the conversation** - This might be a follow-up to a previous question
2. **Combine context** - If the current query is vague (like "through code", "also", "alternative"), merge it with the previous question
3. **Expand with keywords** - Add specific technical terms, synonyms, and related concepts
4. **Be deliberate** - Keywords matter more than perfect grammar for search

Output: ONLY the refined query (1-3 sentences, heavy on keywords and technical terms)

Example:
- Previous: "How to deploy?"
- Current: "in production"
- Refined: "Production deployment environment variables CI/CD pipeline build deploy monitoring"`;

    const lastUserMsg = chatHistory
      .reverse()
      .find(m => m.role === "user");
    
    if (lastUserMsg) {
      refinementUserContent += `\n\nPrevious user question: "${lastUserMsg.content.substring(0, 150)}"`;
    }
  }

  console.log(`🔄 Refining question...`);

  const refinementResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: refinementSystemPrompt,
      },
      {
        role: "user",
        content: refinementUserContent,
      },
    ],
    temperature: 0.15,
  });

  const refinedQuestion =
    refinementResponse.choices[0].message.content?.trim() || question;
  console.log(`🔎 Refined Query: "${refinedQuestion}"`);
  console.log(`📊 Generating embeddings for refined query...`);
  const embedding = await openai.embeddings.create({
    input: refinedQuestion,
    model: "text-embedding-3-small",
  });
  console.log(`✅ Primary embedding created`);
  const space = index.namespace(namespace);
  
  console.log(`🔎 Primary search with refined query...`);
  let results = await space.query({
    vector: embedding.data[0].embedding,
    topK: 30,
    includeMetadata: true,
  });

  console.log(`📊 Primary search returned ${results.matches.length} results`);
  if (results.matches.length > 0) {
    const topScores = results.matches.slice(0, 5).map((m, i) => `#${i+1}: ${(m.score ?? 0).toFixed(3)}`).join(", ");
    console.log(`📈 Top 5 scores: ${topScores}`);
    console.log(`📊 Average score: ${(results.matches.reduce((sum, m) => sum + (m.score ?? 0), 0) / results.matches.length).toFixed(3)}`);
  }


  if (results.matches.length > 0 && chatHistory && chatHistory.length > 0) {
    const primaryAvgScore = results.matches.reduce((sum, m) => sum + (m.score ?? 0), 0) / results.matches.length;
    
    if (primaryAvgScore < 0.4) {
      console.warn(`⚠️ Primary search avg score ${primaryAvgScore.toFixed(3)} is low, trying fallback...`);
      

      const fallbackEmbedding = await openai.embeddings.create({
        input: question,
        model: "text-embedding-3-small",
      });
      
      const fallbackResults = await space.query({
        vector: fallbackEmbedding.data[0].embedding,
        topK: 20,
        includeMetadata: true,
      });
      
      const fallbackAvgScore = fallbackResults.matches.reduce((sum, m) => sum + (m.score ?? 0), 0) / fallbackResults.matches.length || 0;
      console.log(`🔄 Fallback search avg score: ${fallbackAvgScore.toFixed(3)}`);
      
      if (fallbackAvgScore > primaryAvgScore) {
        console.log(`✅ Fallback search is better, using it`);
        results = fallbackResults;
      }
    }
  }


  let relevantMatches = results.matches.slice(0, 20);

  if (relevantMatches.length === 0) {
    console.warn(`⚠️ No results from Pinecone`);
    return "I couldn't find relevant information in the documentation for your query. Please try rephrasing or ask something else.";
  }

  console.log(`✅ Using top ${relevantMatches.length} results for context`);

  const context = relevantMatches
    .map((match) => {
      return match.metadata?.text || match.metadata?.content || match.metadata?.body || JSON.stringify(match.metadata);
    })
    .filter(Boolean)
    .join("\n\n");

  console.log(`📄 Context length: ${context.length} chars from ${relevantMatches.length} chunks`);
  
  if (!context || context.trim().length === 0) {
    console.warn(`⚠️ Context is empty after extraction`);
    return "I couldn't find information about this in the documentation.";
  }
  let systemPrompt = `You are a documentation assistant. Answer based on the provided documentation.

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
- Key details (bullets if needed)`;

  if (chatHistory && chatHistory.length > 0) {
    systemPrompt += `\n\n**Context awareness:**
- You have conversation history below - use it to understand what the user is asking about
- If current question is vague (like "through code" or "also"), connect it to previous topics
- Provide alternative approaches or relate to what was just discussed`;
  }

  const messages: any[] = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];
  if (chatHistory && chatHistory.length > 0) {
    const recentMessages = chatHistory.slice(-4);
    messages.push(...recentMessages);
  }

  messages.push({
    role: "user",
    content: `**Question:** ${question}\n\n**Available Documentation:**\n${context}`,
  });
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.2,
  });

  console.log(`💬 Response generated`);
  return response.choices[0].message.content ?? "";
}
