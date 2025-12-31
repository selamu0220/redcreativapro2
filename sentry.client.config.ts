import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Ignore common network errors that are often false positives or handled elsewhere
  ignoreErrors: [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource",
    "Load failed",
    "TypeError: Failed to fetch",
    "TypeError: Load failed",
    "Non-Error promise rejection captured with value: Object Not Found Matching Id",
  ],

  // Adjust instrumentation to be more compatible with Server Actions
  integrations: [
    Sentry.browserApiErrorsIntegration({
      // Disable automatic fetch error wrapping if it's causing issues
    }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,

  // Disable Sentry's default fetch instrumentation if it's too aggressive
  // but keep performance monitoring for fetches if needed.
});
