import { NextRequest } from 'next/server';
import { NexusCore } from '@/app/nexus-ai/core/NexusCore';
import { SentinelMonitor } from '@/app/nexus-ai/monitoring/SentinelMonitor';

export const maxDuration = 60; // Allow longer processing for complex tasks

export async function POST(req: NextRequest) {
    const sentinel = SentinelMonitor.getInstance();
    const start = Date.now();

    try {
        const { messages, config } = await req.json();

        // Core Initialization (ensures singleton is ready)
        const nexus = NexusCore.getInstance();

        // Optional: Update config per request if allowed/needed
        if (config) {
            nexus.initialize(config);
        }

        // Extract last message for processing
        const lastMessage = messages[messages.length - 1];
        const history = messages.slice(0, -1);

        // Process stream
        const streamConfig = await nexus.processMessageStream(lastMessage.content, history);

        // Record successful request start (latency will be tracked via stream completion theoretically, 
        // but here we mark the handshake success)
        sentinel.recordRequest(Date.now() - start, 'openrouter', true); // Provider hardcoded for now until dynamic

        return streamConfig.toTextStreamResponse();

    } catch (error: any) {
        console.error('[NexusAPI] Error processing request:', error);

        sentinel.recordRequest(Date.now() - start, 'openrouter', false);

        return new Response(JSON.stringify({
            error: 'NexusAI Processing Failed',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
