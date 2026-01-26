# Error Tracking & Debugging Guide

## Overview

This guide explains the improved error tracking system implemented to help identify and debug API errors, especially those returning 500 status codes.

## Changes Made

### 1. Enhanced Client-Side Error Logging (`app/hooks/useAuthenticatedFetch.ts`)

All HTTP methods (GET, POST, PUT, DELETE) now include detailed, visually prominent error logging:

```typescript
// Before (hard to spot URL)
console.error('❌ [ERROR] POST request failed:', { url, status, error });

// After (highly visible)
console.error('');
console.error('═══════════════════════════════════════════════════════');
console.error('❌ POST REQUEST FAILED');
console.error('═══════════════════════════════════════════════════════');
console.error(`🔗 URL: ${url}`);
console.error(`📊 Status: ${response.status} ${response.statusText}`);
console.error(`💬 Error: ${error.message}`);
console.error(`📋 Details:`, details);
console.error('═══════════════════════════════════════════════════════');
console.error('');
```

**Benefits:**
- URL is immediately visible in console
- Clear visual separation from other logs
- Status code and error message are prominent
- Additional error details included

### 2. New Server-Side Error Logger (`app/lib/api-error-handler.ts`)

Created a reusable error logging utility for API routes with three main functions:

#### `logApiError(request, error, additionalContext?)`

Logs comprehensive error information including endpoint, method, stack trace, and custom context.

**Usage:**
```typescript
import { logApiError } from '../../lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    // Your code
  } catch (error) {
    logApiError(request, error, { 
      userEmail: request.headers.get('x-user-email'),
      operation: 'save_data'
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Output:**
```
═══════════════════════════════════════════════════════
❌ API ERROR OCCURRED
═══════════════════════════════════════════════════════
🔗 Endpoint: /api/business-context
📍 Full URL: https://example.com/api/business-context
🔧 Method: POST
💬 Error Message: KV connection failed
📋 Context: { userEmail: 'user@example.com', operation: 'save_data' }
📚 Stack Trace:
Error: KV connection failed
    at readBusinessContexts (route.ts:48)
    ...
═══════════════════════════════════════════════════════
```

#### `withErrorLogging(handler)`

Wrapper function that automatically catches and logs errors:

**Usage:**
```typescript
import { withErrorLogging } from '../../lib/api-error-handler';

export const POST = withErrorLogging(async (request) => {
  const data = await request.json();
  // Your code - errors are automatically logged
  return NextResponse.json({ success: true });
});
```

#### `createErrorResponse(request, error, status?, customMessage?, context?)`

Creates a standardized error response with automatic logging:

**Usage:**
```typescript
import { createErrorResponse } from '../../lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    // Your code
  } catch (error) {
    return createErrorResponse(
      request, 
      error, 
      500, 
      'Failed to save business context',
      { userEmail: request.headers.get('x-user-email') }
    );
  }
}
```

### 3. Example Implementation (`app/api/business-context/route.ts`)

Updated this endpoint to demonstrate the new error logging pattern.

## How to Debug 500 Errors

### Step 1: Check Browser Console

When a POST request fails, you'll now see:

```
═══════════════════════════════════════════════════════
❌ POST REQUEST FAILED
═══════════════════════════════════════════════════════
🔗 URL: /api/business-context
📊 Status: 500 Internal Server Error
💬 Error: Error interno del servidor
📋 Details: {...}
═══════════════════════════════════════════════════════
```

The URL is now immediately visible!

### Step 2: Check Server Logs

With the new `logApiError` function, server logs will show:

```
═══════════════════════════════════════════════════════
❌ API ERROR OCCURRED
═══════════════════════════════════════════════════════
🔗 Endpoint: /api/business-context
📍 Full URL: https://yoursite.com/api/business-context
🔧 Method: POST
💬 Error Message: [actual error]
📋 Context: {userEmail: "user@example.com"}
📚 Stack Trace: [full stack trace]
═══════════════════════════════════════════════════════
```

### Step 3: Match Client and Server Logs

1. Find the failing URL in browser console
2. Search server logs for that endpoint
3. Check the stack trace and context for root cause

## Applying to Other Endpoints

### Option 1: Manual Implementation (Recommended for existing code)

```typescript
import { logApiError } from '../../lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    // existing code
  } catch (error) {
    logApiError(request, error, { 
      // Add any relevant context
      userId: request.headers.get('x-user-uid'),
      operation: 'specific_operation_name'
    });
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

### Option 2: Wrapper Function (For new endpoints)

```typescript
import { withErrorLogging } from '../../lib/api-error-handler';

export const POST = withErrorLogging(async (request) => {
  // Your code - no try/catch needed
  return NextResponse.json({ success: true });
});
```

### Option 3: Error Response Helper

```typescript
import { createErrorResponse } from '../../lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    // Your code
  } catch (error) {
    return createErrorResponse(request, error, 500, 'Custom error message');
  }
}
```

## Priority Endpoints to Update

Based on the codebase analysis, these endpoints have the most POST requests and should be prioritized:

1. ✅ `/api/business-context` - Already updated
2. `/api/improve-content` - Used by escritor-ia
3. `/api/stripe/verify-session` - Payment verification
4. `/api/execute-chain` - Prompt chain execution
5. `/api/subscription/status` - Subscription checks
6. `/api/calendar/events` - Calendar operations
7. `/api/calendar/time-slots` - Time slot management
8. `/api/documents` - Document management
9. `/api/prompts` - Prompt management
10. `/api/folders` - Folder operations

## Common Error Patterns Found

### 1. Missing URL in Logs
**Before:** Generic "Internal Server Error" with no endpoint info
**After:** Clear endpoint path and full URL

### 2. Silent Failures
**Before:** Error caught but details lost
**After:** Full stack trace and context preserved

### 3. Difficult Correlation
**Before:** Hard to match client error to server error
**After:** Both logs show same URL/endpoint

## Best Practices

1. **Always include context**: Add relevant user/operation info to `logApiError`
2. **Use consistent error messages**: Keep user-facing messages generic, log details server-side
3. **Check both logs**: Always correlate browser console with server logs
4. **Add operation names**: Include operation context to quickly identify code path
5. **Preserve stack traces**: Never swallow errors without logging the stack

## Testing the Improvements

1. Trigger a POST request that you know fails
2. Check browser console - URL should be clearly visible
3. Check server logs - endpoint and error details should be clear
4. Verify you can quickly identify the problem

## Next Steps

1. Apply `logApiError` to remaining high-priority endpoints
2. Consider adding request ID for tracking across logs
3. Set up error monitoring/alerting for production
4. Create error dashboard with common failures

## Questions or Issues?

If you encounter any errors that aren't being logged properly:

1. Verify the endpoint uses the new error logging
2. Check that stack traces are enabled in your environment
3. Ensure console output isn't being filtered
4. Review the `api-error-handler.ts` implementation
