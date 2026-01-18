import { NextRequest, NextResponse } from 'next/server';
import { analyzeText } from '@/app/lib/ai-detector';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Text is required', code: 'MISSING_TEXT' },
                { status: 400 }
            );
        }

        if (text.length < 50) {
            return NextResponse.json(
                { error: 'Text must be at least 50 characters for analysis', code: 'TEXT_TOO_SHORT' },
                { status: 400 }
            );
        }

        // Limit to 50k chars to prevent abuse
        const truncatedText = text.slice(0, 50000);
        const result = analyzeText(truncatedText);

        // Add metadata
        return NextResponse.json({
            ...result,
            meta: {
                version: '2.0',
                engine: 'local-heuristic',
                truncated: text.length > 50000,
            }
        });

    } catch (error) {
        console.error('AI detection error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze text', code: 'ANALYSIS_ERROR' },
            { status: 500 }
        );
    }
}

// Also support GET for simple testing
export async function GET() {
    return NextResponse.json({
        name: 'AI Text Detector API',
        version: '2.0',
        engine: 'local-heuristic',
        description: 'Detects AI-generated text using perplexity, burstiness, formality, creativity, and predictability metrics',
        usage: 'POST with { "text": "your text here" }',
        metrics: [
            'perplexity - How surprising/predictable word choices are',
            'burstiness - Variation in sentence structure and length',
            'formality - Formal/academic vs casual tone',
            'creativity - Literary devices and personal touch',
            'predictability - Rhythm and pattern repetition',
        ],
    });
}
