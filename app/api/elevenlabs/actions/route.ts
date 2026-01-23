import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Optional: Validate a secret header for security
const ELEVENLABS_WEBHOOK_SECRET = process.env.ELEVENLABS_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    try {
        // 1. Security Check
        if (ELEVENLABS_WEBHOOK_SECRET) {
            const authHeader = request.headers.get('x-elevenlabs-signature') || request.headers.get('authorization');
            if (authHeader !== ELEVENLABS_WEBHOOK_SECRET) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        // 2. Parse Body
        const body = await request.json();
        const { action, text, context } = body;

        console.log(`🎙️ [ElevenLabs Webhook] Action: ${action}`, { textLength: text?.length });

        // 3. Handle Actions
        let responseData = {};

        switch (action) {
            case 'analyze':
                // Simple mock analysis or connect to your existing analysis logic
                responseData = {
                    message: "Analysis complete.",
                    result: {
                        wordCount: text?.split(/\s+/).length || 0,
                        sentiment: "neutral", // You could connect this to a real sentiment analyzer
                        summary: `Analyzed ${text?.length} characters.`
                    }
                };
                break;

            case 'summarize':
                // You could call your own improve-text-openrouter here internally if you wanted
                responseData = {
                    message: "Summary generated.",
                    summary: text ? text.substring(0, 50) + "..." : "No text provided."
                };
                break;

            case 'context':
                // Return information about the current page/app state if provided in the input
                responseData = {
                    message: "Context retrieved.",
                    currentContext: context || "No context provided."
                };
                break;

            default:
                // Default "echo" or generic response if action is unknown
                responseData = {
                    message: `Received action: ${action}`,
                    receivedText: text ? text.substring(0, 100) : "No text"
                };
        }

        // 4. Return JSON
        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('❌ [ElevenLabs Webhook] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
