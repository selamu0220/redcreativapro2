import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const envVars = {
    hasOpenRouterApiKey: !!process.env.OPEN_ROUTER_API_KEY,
    apiKeyLength: process.env.OPEN_ROUTER_API_KEY?.length,
    apiKeyPreview: process.env.OPEN_ROUTER_API_KEY ? process.env.OPEN_ROUTER_API_KEY.substring(0, 10) + '...' : null,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('OPEN_ROUTER')),
    nodeEnv: process.env.NODE_ENV,
  };
  
  return NextResponse.json(envVars);
}