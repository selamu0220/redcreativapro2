import { task } from "@trigger.dev/sdk/v3";

export const exampleTask = task({
  id: "example-task",
  run: async (payload: { message: string }) => {
    console.log("Running example task with payload:", payload);
    // Add your logic here
    return {
      finished: true,
      received: payload.message,
    };
  },
});
