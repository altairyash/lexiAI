import { Index, Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import pLimit from "p-limit";

// Initialize Pinecone and OpenAI clients
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const indexName = process.env.PINECONE_INDEX_NAME || "quickstart";

// Define Vector type explicitly
interface Vector {
  id: string;
  values: number[];
  metadata?: Record<string, string>;
}

/**
 * Creates or retrieves an existing Pinecone index.
 */
async function createOrGetIndex(): Promise<Index> {
  try {
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.indexes?.some(idx => idx.name === indexName);

    if (!indexExists) {
      console.log(`Index "${indexName}" not found. Creating...`);
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: process.env.PINECONE_ENVIRONMENT || "us-east-1",
          },
        },
      });
      console.log("Waiting for index initialization...");
      await new Promise(resolve => setTimeout(resolve, 5000)); // Simple wait for eventual consistency
    }
    
    return pinecone.Index(indexName);
  } catch (error) {
    console.error("Error managing Pinecone index:", error);
    throw error;
  }
}

/**
 * Splits text into sized chunks (approx. 3000 chars)
 */
function chunkText(text: string, maxChunkSize = 3000): string[] {
  const paragraphs = text.split(/\n\s*\n/); // Split by paragraph breaks
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length < maxChunkSize) {
      currentChunk += paragraph + "\n\n"; // Append to current chunk
    } else {
      chunks.push(currentChunk.trim()); // Store previous chunk
      currentChunk = paragraph + "\n\n"; // Start new chunk
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim()); // Add last chunk
  return chunks;
}

/**
 * Calculates the estimated byte size of the payload.
 */
function estimateByteSize(vectors: Vector[]): number {
  return JSON.stringify(vectors).length;
}

/**
 * Stores document embeddings in Pinecone.
 */
export async function storeDocs(
  url: string,
  text: string,
  namespace: string
): Promise<{ success: boolean; message: string }> {
  const index = await createOrGetIndex();
  const space = index.namespace(namespace);

  const chunks = chunkText(text, 3000);
  console.log(`🚀 Storing ${chunks.length} optimized chunks (approx. 3000 chars each)...`);

  const limit = pLimit(2); // Concurrency control
  const embeddingTasks = chunks.map((chunk, i) =>
    limit(async (): Promise<Vector | null> => {
      console.log(`Embedding chunk ${i + 1}/${chunks.length}`);
      try {
        const response = await openai.embeddings.create({
          input: chunk,
          model: "text-embedding-3-small",
        });

        return {
          id: `${url}-${i}-${Math.random().toString(36).substring(2, 10)}`,
          values: response.data[0].embedding,
          metadata: { url, text: chunk },
        };
      } catch (error) {
        console.error(`❌ Error embedding chunk ${i + 1}:`, error);
        return null;
      }
    })
  );

  const vectors: Vector[] = (await Promise.all(embeddingTasks)).filter(
    (v): v is Vector => v !== null
  );
  console.log(`✅ Successfully generated ${vectors.length} embeddings.`);

  // Adaptive batch size to fit under 4MB
  let batch: Vector[] = [];
  let batchSize = 0;
  const MAX_PAYLOAD_SIZE = 4194304; // 4MB limit

  for (let i = 0; i < vectors.length; i++) {
    const vectorSize = estimateByteSize([vectors[i]]);

    if (batchSize + vectorSize > MAX_PAYLOAD_SIZE) {
      // Upsert current batch before adding new item
      console.log(`📤 Upserting batch (${batch.length} vectors, ~${batchSize} bytes)`);
      await space.upsert(batch);
      batch = [];
      batchSize = 0;
    }

    batch.push(vectors[i]);
    batchSize += vectorSize;
  }

  // Upsert final batch if not empty
  if (batch.length > 0) {
    console.log(`📤 Upserting final batch (${batch.length} vectors, ~${batchSize} bytes)`);
    await space.upsert(batch);
  }

  console.log(`✅ Successfully stored ${vectors.length} embeddings in Pinecone.`);
  return { success: true, message: "Docs stored successfully." };
}
