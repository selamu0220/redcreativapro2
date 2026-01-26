import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openrouter } from '../../lib/ai/openrouter';
import { createClient } from '@/utils/supabase/server';
import { checkUsage, incrementUsage } from '@/lib/database';

export const runtime = 'edge';

// PAID MODELS (use your OpenRouter credits - all paid, no rate limits!)
const MODEL_FAST = 'openai/gpt-4o-mini';      // Fast and cheap ~$0.00015/1k tokens
const MODEL_BALANCED = 'openai/gpt-4o-mini';  // Same, reliable
const MODEL_QUALITY = 'openai/gpt-4o';        // Better quality ~$0.0025/1k tokens

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate User
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();


        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check Usage Limits
        const usageCheck = await checkUsage(user.id);
        if (!usageCheck.canGenerate) {
            return NextResponse.json({
                error: 'Limit Reached',
                message: usageCheck.message,
                limitReached: true
            }, { status: 403 });
        }

        const { content, customPrompt, prePrompt, context, speed = 1 } = await request.json();

        console.log('⚡ [improve-text] Request:', { length: content?.length, speed, userId: user.id });

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Select model based on speed
        let modelId: string;
        if (speed === 2) {
            modelId = MODEL_FAST;      // GPT-4o-mini - super fast
        } else if (speed === 0) {
            modelId = MODEL_QUALITY;   // Claude Haiku - quality
        } else {
            modelId = MODEL_BALANCED;  // Gemini Flash - balanced
        }

        console.log(`🚀 [improve-text] Using model: ${modelId}`);

        // Determine system prompt: Use customPrompt if provided, otherwise default
        const systemPrompt = customPrompt ?
            `You are a professional text editor. Your instructions are: ${customPrompt}. Return ONLY the result.` :
            `You are a professional text editor. 
Your task: Rewrite the user's text with perfect grammar, spelling, and style.
Rules:
- Output ONLY the corrected/improved text
- NO explanations, NO introductions, NO markdown
- Maintain the original meaning and intent
- Fix all errors and improve clarity`;

        let userContent = content;
        if (prePrompt) userContent += `\n\nAdditional instructions: ${prePrompt}`;
        if (context) userContent += `\n\nContext: ${context.substring(0, 3000)}`;

        const result = await generateText({
            model: openrouter(modelId),
            system: systemPrompt,
            messages: [{ role: 'user', content: userContent }],
            temperature: 0.3,
        });

        const improvedContent = result.text?.trim();

        if (!improvedContent) {
            throw new Error('No content received from AI');
        }

        // 3. Increment Usage
        // Estimate word count (simple whitespace split)
        const wordsGenerated = improvedContent.split(/\s+/).length;
        // Don't await this to keep response fast? Or safer to await?
        // In Edge, context might close if we don't await. Safer to await.
        await incrementUsage(user.id, wordsGenerated);

        console.log('✅ [improve-text] Success with', modelId, `Words: ${wordsGenerated}`);

        return NextResponse.json({
            improvedContent,
            modelUsed: modelId,
            wordsUsed: wordsGenerated
        });

    } catch (error: any) {
        console.error('❌ [improve-text] Error:', error.message);

        return NextResponse.json({
            error: 'Error al procesar el texto',
            details: error.message
        }, { status: 500 });
    }
}

