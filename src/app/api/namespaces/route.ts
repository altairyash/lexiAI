import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

export async function GET(): Promise<Response> {
  try {
    // Validate environment variables
    if (!process.env.PINECONE_API_KEY) {
      console.error("❌ PINECONE_API_KEY not configured");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.Index("quickstart");
    
    // Get index statistics
    const stats = await index.describeIndexStats();

    // Extract and filter namespace names
    const namespaces: string[] = Object.keys(stats.namespaces || {})
      .filter(ns => ns && ns.trim() !== "")
      .sort(); // Sort for consistency

    console.log(`✅ Retrieved ${namespaces.length} namespaces from Pinecone`);

    return NextResponse.json(
      { success: true, namespaces },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching namespaces:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Return user-friendly error message
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch namespaces. Please check your configuration and try again." 
      },
      { status: 500 }
    );
  }
}
