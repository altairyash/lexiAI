import OpenAI from "openai";
import { queryDocs } from "./query";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export class QueryAgent {
  private namespace: string;
  private chatHistory: ChatMessage[];

  constructor(namespace: string, chatHistory?: ChatMessage[]) {
    this.namespace = namespace;
    this.chatHistory = chatHistory || [];
  }

  private async analyzeQuery(question: string): Promise<{
    action: "search_and_answer" | "answer_followup" | "clarify";
    refined_question?: string;
    reasoning: string;
  }> {
    console.log(`🧠 Agent: Analyzing query intent...`);

    const contextSummary =
      this.chatHistory.length > 0
        ? `\nRecent conversation:\n${this.chatHistory
            .slice(-2)
            .map((m) => `${m.role}: ${m.content.substring(0, 80)}...`)
            .join("\n")}`
        : "";

    const analysisPrompt = `Analyze this user query and decide the best action:

Actions available:
1. "search_and_answer" - Search docs and answer (use for new topics or direct questions)
2. "answer_followup" - Answer based on conversation context (use for follow-ups like "also", "in detail", "through code")
3. "clarify" - Ask for clarification (use if query is too vague)

${contextSummary}

User Query: "${question}"

Respond in JSON format:
{
  "action": "search_and_answer" | "answer_followup" | "clarify",
  "reasoning": "brief explanation of why",
  "refined_question": "improved query if action is search_and_answer, otherwise null"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: analysisPrompt }],
        temperature: 0.1,
        max_tokens: 300,
      });

      const content = response.choices[0].message.content || "{}";
      const parsed = JSON.parse(content);

      console.log(`   Action: ${parsed.action}`);
      console.log(`   Reasoning: ${parsed.reasoning}`);
      if (parsed.refined_question) {
        console.log(`   Refined: "${parsed.refined_question}"`);
      }

      return {
        action: parsed.action || "search_and_answer",
        refined_question: parsed.refined_question,
        reasoning: parsed.reasoning,
      };
    } catch (error) {
      console.error(`   Parse error, defaulting to search_and_answer`);
      return {
        action: "search_and_answer",
        reasoning: "Default action due to parse error",
      };
    }
  }

  private async improveQuery(question: string): Promise<string> {
    console.log(`✨ Agent: Improving query for better search...`);

    const contextText =
      this.chatHistory.length > 0
        ? `Previous context:\n${this.chatHistory
            .slice(-1)
            .map((m) => `${m.role}: ${m.content.substring(0, 150)}`)
            .join("\n")}`
        : "";

    const improvePrompt = `Improve this query for semantic search by:
1. Adding specific technical keywords
2. Expanding vague terms with context
3. Including synonyms and related concepts

${contextText}

Original query: "${question}"

Output ONLY the improved query (2-3 sentences, keyword-focused):`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: improvePrompt }],
      temperature: 0.15,
      max_tokens: 150,
    });

    const improved = response.choices[0].message.content?.trim() || question;
    console.log(`   Improved: "${improved}"`);
    return improved;
  }

  private async buildContextAwareAnswer(
    original_question: string
  ): Promise<string> {
    console.log(`🔗 Agent: Building context-aware answer from history...`);

    const conversationContext = this.chatHistory
      .slice(-2)
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n\n");

    const contextPrompt = `Given the conversation context and current question, provide a helpful answer.
Remember the topic from previous messages and relate your answer to it.

Conversation:
${conversationContext}

Current question: "${original_question}"

Provide a direct, helpful answer based on what was discussed:`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: contextPrompt }],
      temperature: 0.2,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "";
  }

  async run(question: string): Promise<string> {
    console.log(`\n${"=".repeat(65)}`);
    console.log(`🤖 AGENT PIPELINE`);
    console.log(`📝 Question: "${question}"`);
    console.log(`📍 Namespace: "${this.namespace}"`);
    console.log(`💬 History: ${this.chatHistory.length} messages`);
    console.log(`${"=".repeat(65)}\n`);

    try {
      // Step 1: Analyze query intent
      const analysis = await this.analyzeQuery(question);

      let answer: string;

      if (analysis.action === "search_and_answer") {
        let searchQuery = analysis.refined_question || question;

        if (!analysis.refined_question) {
          searchQuery = await this.improveQuery(question);
        }

        console.log(`🔎 Agent: Using queryDocs tool to search and answer...`);
        answer = await queryDocs(searchQuery, this.namespace, this.chatHistory);
      } else if (analysis.action === "answer_followup") {
        answer = await this.buildContextAwareAnswer(question);
      } else {
        answer =
          "I need more context to answer accurately. Could you please clarify or provide more details about what you're looking for?";
      }

      console.log(`\n✅ Agent Pipeline Complete`);
      console.log(`${"=".repeat(65)}\n`);

      return answer;
    } catch (error) {
      console.error(`❌ Agent error:`, error);
      throw error;
    }
  }
}

export async function queryDocsWithAgent(
  question: string,
  namespace: string,
  chatHistory?: ChatMessage[]
): Promise<string> {
  const agent = new QueryAgent(namespace, chatHistory);
  return agent.run(question);
}
