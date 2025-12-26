import { xai } from "@ai-sdk/xai";
import { generateText, streamText } from "ai";

/**
 * GrokClient class to handle interactions with xAI's Grok models
 * using the Vercel AI SDK.
 */
export class GrokClient {
  private apiKey: string;
  private defaultModel: string = "grok-2-1212";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.XAI_API_KEY || "";
    if (!this.apiKey) {
      console.warn("XAI_API_KEY is not set in environment variables");
    }
  }

  /**
   * Generates a complete text response
   */
  async generateResponse(prompt: string, modelName?: string) {
    try {
        const { text } = await generateText({
          model: xai(modelName || this.defaultModel),
          prompt: prompt,
          experimental_telemetry: {
            isEnabled: true,
            recordInputs: true,
            recordOutputs: true,
          },
        });
      return { success: true, text };
    } catch (error) {
      console.error("Error generating text with Grok:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  /**
   * Returns a stream for real-time text generation
   */
    async getStream(prompt: string, modelName?: string) {
      return streamText({
        model: xai(modelName || this.defaultModel),
        prompt: prompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      });
    }
}

export const grok = new GrokClient();
