import { NextRequest, NextResponse } from 'next/server';
import { LLMSManager, LLMSFileServer, createDefaultLLMSConfig } from '@/lib/llms-manager';

/**
 * LLMS.txt endpoint for AI crawler access control
 * Serves LLMS.txt file according to the LLMS.txt specification
 */

// Cache the LLMS manager instance
let llmsManager: LLMSManager | null = null;
let llmsFileServer: LLMSFileServer | null = null;

/**
 * Initialize LLMS manager with default configuration
 */
function initializeLLMSManager(): { manager: LLMSManager; server: LLMSFileServer } {
  if (!llmsManager || !llmsFileServer) {
    // Create default configuration
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Content Platform';
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@example.com';

    const config = createDefaultLLMSConfig(siteName, contactEmail);

    // Apply permissive configuration to allow AI crawlers (SEO fix)
    llmsManager = new LLMSManager(config);
    llmsManager.createPermissiveConfig();

    // Add specific rules for AI search bots
    llmsManager.addRule({
      userAgent: 'ChatGPT-User',
      allow: ['/'],
      disallow: ['/api/', '/admin/', '/dashboard'],
      crawlDelay: 1,
      comment: 'OpenAI ChatGPT browsing - full access'
    });
    llmsManager.addRule({
      userAgent: 'OAI-SearchBot',
      allow: ['/'],
      disallow: ['/api/', '/admin/', '/dashboard'],
      crawlDelay: 1,
      comment: 'OpenAI Search Bot - full access'
    });

    llmsFileServer = new LLMSFileServer(llmsManager);
  }

  return { manager: llmsManager, server: llmsFileServer };
}

/**
 * GET /llms.txt
 * Returns the LLMS.txt file content with proper headers
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { server } = initializeLLMSManager();

    // Generate response with proper headers
    const response = server.generateResponse();

    // Create Next.js response with proper headers
    return new NextResponse(response.content, {
      status: response.statusCode,
      headers: response.headers
    });

  } catch (error) {
    console.error('Error serving LLMS.txt:', error);

    // Return error response
    return new NextResponse(
      '# LLMS.txt service temporarily unavailable\n# Please try again later',
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

/**
 * HEAD /llms.txt
 * Returns headers only for LLMS.txt file
 */
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    const { server } = initializeLLMSManager();

    // Generate response to get headers
    const response = server.generateResponse();

    // Return headers only
    return new NextResponse(null, {
      status: response.statusCode,
      headers: response.headers
    });

  } catch (error) {
    console.error('Error serving LLMS.txt HEAD:', error);

    return new NextResponse(null, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

/**
 * OPTIONS /llms.txt
 * Returns allowed methods for LLMS.txt endpoint
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, HEAD, OPTIONS',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    }
  });
}
