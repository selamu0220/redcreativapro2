// Runtime-only Google Sheets functionality
// This module should only be imported dynamically to avoid build-time issues

// Build time detection
const isBuildTime = 
  process.env.NODE_ENV === 'production' && 
  (process.env.VERCEL_ENV === 'production' || 
   process.env.npm_lifecycle_event === 'build' ||
   typeof window !== 'undefined');

export async function createGoogleSheetsClient(config: {
  GOOGLE_SHEETS_CLIENT_EMAIL: string;
  GOOGLE_SHEETS_PRIVATE_KEY: string;
}) {
  if (isBuildTime) {
    console.log('Google Sheets runtime module called during build time, returning null');
    return null;
  }
  
  // Always return null since googleapis is not available
  console.log('Google Sheets functionality disabled - googleapis dependency removed');
  return null;
}
