import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a415047a33cf8e3528a9aae48c0f1053@o4510585204572160.ingest.de.sentry.io/4510585207586896",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
});
