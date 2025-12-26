import { NextRequest, NextResponse } from "next/server";
import { grok } from "@/app/lib/grok-client";

export async function GET(request: NextRequest) {
  try {
    const prompt = request.nextUrl.searchParams.get("prompt") || "Hello Grok! Tell me a short joke about AI.";
    const result = await grok.generateResponse(prompt);
    
    if (result.success) {
      return NextResponse.json({ 
        message: "Grok integration working!",
        response: result.text 
      });
    } else {
      return NextResponse.json({ 
        error: "Failed to get response from Grok",
        details: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
