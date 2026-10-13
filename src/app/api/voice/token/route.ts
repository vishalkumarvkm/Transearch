import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("[Voice Token API] GEMINI_API_KEY is not configured.");
      return NextResponse.json(
        { error: "Gemini API key not configured on server. Please set GEMINI_API_KEY in .env." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenAI({ 
      apiKey,
      httpOptions: { apiVersion: 'v1alpha' } as any
    });
    
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    
    // Create an ephemeral token for the Multimodal Live API
    const token = await genAI.authTokens.create({
      config: {
        uses: 1, // Number of times this token can be used to start a session
        expireTime: expireTime, // 30 minutes
        newSessionExpireTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes to start a session
      }
    });

    return NextResponse.json({ 
      token: token.name,
      expiresAt: expireTime 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Voice Token API] Error generating ephemeral token:", error);
    return NextResponse.json(
      { error: "Failed to generate voice session token", details: errorMessage },
      { status: 500 }
    );
  }
}
