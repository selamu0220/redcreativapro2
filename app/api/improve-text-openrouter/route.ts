import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { gateway, DEFAULT_MODEL } from '../../lib/ai/gateway';
import { createClient } from '@/utils/supabase/server';
import { checkUsage, incrementUsage } from '@/lib/database';

export const runtime = 'edge';

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

        const { content, customPrompt, prePrompt, context } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        console.log(`🚀 [improve-text] Using Gateway Model: ${DEFAULT_MODEL}`);

        // System Prompt
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
            model: gateway(DEFAULT_MODEL),
            system: systemPrompt,
            messages: [{ role: 'user', content: userContent }],
            temperature: 0.3,
        });

        const improvedContent = result.text?.trim();

        if (!improvedContent) {
            throw new Error('No content received from AI');
        }

        // 3. Increment Usage
        const wordsGenerated = improvedContent.split(/\s+/).length;
        await incrementUsage(user.id, wordsGenerated);

        console.log('✅ [improve-text] Success. Words:', wordsGenerated);

        return NextResponse.json({
            improvedContent,
            modelUsed: DEFAULT_MODEL,
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
