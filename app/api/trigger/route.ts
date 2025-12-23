import { createAppRoute } from "@trigger.dev/nextjs";
import { trigger } from "@/trigger/example"; // We will create this next

// This is the endpoint that Trigger.dev will use to call your tasks
export const { POST } = createAppRoute();
