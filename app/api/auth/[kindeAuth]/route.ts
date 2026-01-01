import { NextRequest, NextResponse } from "next/server";

// Lazy load handleAuth to avoid build-time issues
function getHandleAuth() {
  // Only import at runtime
  const { handleAuth } = require("@kinde-oss/kinde-auth-nextjs/server");
  return handleAuth;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kindeAuth: string }> }
) {
  // Check if we have the required environment variables
  if (!process.env.KINDE_ISSUER_URL) {
    console.warn('[Kinde Auth] Environment variables not configured');
    return NextResponse.json(
      { error: 'Authentication not configured' },
      { status: 503 }
    );
  }

  try {
    const handleAuth = getHandleAuth();
    // In Next.js 15+, params is a Promise
    const params = await context.params;
    
    // Call handleAuth with the request and context
    return handleAuth(request, context);
  } catch (error) {
    console.error('[Kinde Auth] Error:', error);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
}
