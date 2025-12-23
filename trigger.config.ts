import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_lhrpbwoycmqjqoijlard",
  runtime: "node",
  logLevel: "info",
  retries: {
    enabled: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
});
