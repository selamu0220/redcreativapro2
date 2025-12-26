import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

Sentry.init({
  dsn: "https://a415047a33cf8e3528a9aae48c0f1053@o4510585204572160.ingest.de.sentry.io/4510585207586896",
  integrations: [Sentry.browserTracingIntegration()],
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/]
});

// PostHog initialization
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2025-05-24',
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});
