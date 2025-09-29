import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const envVars = {
    hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
    apiKeyLength: process.env.GEMINI_API_KEY?.length,
    apiKeyPreview: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : null,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('GEMINI')),
    nodeEnv: process.env.NODE_ENV,
  };
  
  return NextResponse.json(envVars);
}