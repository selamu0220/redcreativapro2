import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openrouter } from '../../lib/ai/openrouter';

export const runtime = 'edge';

// Use a high-quality model for humanization
const MODEL = 'openai/gpt-4o'; // Best for nuance

export async function POST(request: NextRequest) {
    try {
        const { text, issues } = await request.json();

        if (!text || !text.trim()) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        console.log('🕵️ [stealth-humanize] Processing text length:', text.length);

        // Construct the prompt based on identified issues
        const issuesSummary = issues && issues.length > 0
            ? issues.map((i: any) => `- ${i.type}: ${i.suggestion}`).join('\n')
            : 'Make it sound more natural and less robotic.';

        const systemPrompt = `You are an expert Ghostwriter and Editor known for making AI-generated text sound 100% human.
        
Your Goal: Rewrite the text to eliminate "AI-speak" and make it undetectable by AI detectors.

TARGET AUDIENCE: General audience, conversational but professional tone.
LANGUAGE: Detect the language of the input (likely Spanish) and output in the SAME language.

 SPECIFIC INSTRUCTIONS:
1.  **Vary Sentence Length:** Mix very short sentences (punchy) with longer, flowing ones. Avoid uniform rhythm.
2.  **Remove Transition Words:** Eliminate words like "Therefore", "Moreover", "In conclusion", "It is important to note", "Additionally" (and their Spanish equivalents: "Por lo tanto", "Además", "En conclusión", "Cabe destacar"). Just say what needs to be said.
3.  **Active Voice:** Use strong verbs. Avoid passive voice.
4.  **Add Personality:** Use occasional idioms, rhetorical questions, or direct address to the reader ("You might be thinking...").
5.  **Simplify Vocabulary:** Don't use "utilize" when "use" works. Don't use "paramount" when "critical" works.
6.  **Directness:** Cut fluff. If a sentence doesn't add value, delete it.
7.  **Structure:** Break long paragraphs. Use varied paragraph lengths.

SPECIFIC ISSUES DETECTED IN THIS TEXT (Fix these!):
${issuesSummary}

OUTPUT FORMAT:
Return ONLY the rewritten text. Do not include "Here is the rewritten text" or any markdown wrapping unless it was in original.`;

        const result = await generateText({
            model: openrouter(MODEL),
            system: systemPrompt,
            messages: [{ role: 'user', content: text }],
            temperature: 0.7, // Slightly higher temperature for more variety/human-like randomness
        });

        const humanizedText = result.text?.trim();

        if (!humanizedText) {
            throw new Error('No content received from AI');
        }

        return NextResponse.json({
            humanizedText,
            modelUsed: MODEL
        });

    } catch (error: any) {
        console.error('❌ [stealth-humanize] Error:', error.message);
        return NextResponse.json({
            error: 'Error humanizing text',
            details: error.message
        }, { status: 500 });
    }
}
