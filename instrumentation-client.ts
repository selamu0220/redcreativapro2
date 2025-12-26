import * as Sentry from "@sentry/nextjs";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

Sentry.init({
  dsn: "https://a415047a33cf8e3528a9aae48c0f1053@o4510585204572160.ingest.de.sentry.io/4510585207586896",
  integrations: [Sentry.browserTracingIntegration()],
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/]
});
