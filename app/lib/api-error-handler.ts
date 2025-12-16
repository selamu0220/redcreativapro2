import { NextRequest, NextResponse } from 'next/server';

/**
 * Enhanced error logging for API routes
 * Logs the route path, method, error details, and stack trace
 */
export function logApiError(
  request: NextRequest,
  error: unknown,
  additionalContext?: Record<string, any>
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  const url = request.url;
  const method = request.method;
  const pathname = new URL(request.url).pathname;

  console.error('');
  console.error('═══════════════════════════════════════════════════════');
  console.error('❌ API ERROR OCCURRED');
  console.error('═══════════════════════════════════════════════════════');
  console.error(`🔗 Endpoint: ${pathname}`);
  console.error(`📍 Full URL: ${url}`);
  console.error(`🔧 Method: ${method}`);
  console.error(`💬 Error Message: ${errorMessage}`);
  
  if (additionalContext) {
    console.error(`📋 Context:`, additionalContext);
  }
  
  if (errorStack) {
    console.error(`📚 Stack Trace:`);
    console.error(errorStack);
  }
  
  console.error('═══════════════════════════════════════════════════════');
  console.error('');
}

/**
 * Wrapper for API route handlers that automatically logs errors with full context
 * 
 * @example
 * export const POST = withErrorLogging(async (request) => {
 *   // Your handler code
 *   return NextResponse.json({ success: true });
 * });
 */
export function withErrorLogging<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      logApiError(request, error);
      
      // Return generic 500 error
      return NextResponse.json(
        { 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Create a standardized error response with consistent logging
 */
export function createErrorResponse(
  request: NextRequest,
  error: unknown,
  status: number = 500,
  customMessage?: string,
  additionalContext?: Record<string, any>
): NextResponse {
  logApiError(request, error, additionalContext);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return NextResponse.json(
    { 
      error: customMessage || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    },
    { status }
  );
}

/**
 * Logs successful API calls (optional, for debugging)
 */
export function logApiSuccess(
  request: NextRequest,
  responseData?: any,
  additionalInfo?: string
) {
  if (process.env.NODE_ENV === 'development') {
    const pathname = new URL(request.url).pathname;
    const method = request.method;
    
    console.log(`✅ [API SUCCESS] ${method} ${pathname}${additionalInfo ? ` - ${additionalInfo}` : ''}`);
    
    if (responseData && Object.keys(responseData).length > 0) {
      console.log('Response preview:', 
        JSON.stringify(responseData).substring(0, 200)
      );
    }
  }
}
