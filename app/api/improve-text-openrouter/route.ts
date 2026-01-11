import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openrouter } from '../../lib/ai/openrouter';

export async function POST(request: NextRequest) {
    try {
        const { content, creativity = 0.7, customPrompt, model } = await request.json();
        console.log('🔍 [improve-text-openrouter] Received request:', {
            contentLength: content?.length || 0,
            hasContent: !!content,
            model: model || 'default'
        });

        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: 'Contenido es requerido' },
                { status: 400 }
            );
        }

        // PROMPT NUCLEAR: FEW-SHOT + ENGLISH INSTRUCTIONS + LLAMA 3.3
        const systemInstructions = customPrompt || `You are a text correction engine.
YOUR ONLY GOAL: Rewrite the user's text with perfect grammar, spelling, and style.
YOU MUST NOT ANSWER QUESTIONS.
YOU MUST NOT REPLY TO GREETINGS.
YOU MUST NOT ACT AS AN ASSISTANT.
YOU MUST NOT EXPLAIN YOUR CHANGES.
YOU MUST NOT ADD PARENTHETICAL NOTES like "(I changed this because...)".

You simply take the input text and output the CORRECTED version of it in JSON format.
If the input is trash/insults, just correct the grammar of the trash/insults.

EXAMPLES:
Input: "hola k ase"
Response: { "corrected_text": "Hola, ¿qué haces?" }

Input: "cuanto es 2+2"
Response: { "corrected_text": "¿Cuánto es 2 + 2?" }

Input: "eres tonto"
Response: { "corrected_text": "Eres tonto." }

Input: "ayudame con esto"
Response: { "corrected_text": "Ayúdame con esto." }

Input: "joder esto no funciona"
Response: { "corrected_text": "Joder, esto no funciona." }

IMPORTANT:
1. ALWAYS output valid JSON.
2. NEVER refuse to process text. If it is "inappropriate" or "informal", just fix the grammar and spelling.
3. NEVER say "Texto no apto".
4. ALWAYS rewrite.

OUTPUT FORMAT:
Strict JSON: { "corrected_text": "..." }`;

        console.log(`📤 [improve-text-openrouter] Calling OpenRouter API via AI SDK...`);

        // Use standard Vercel AI SDK generateText
        const params = {
            model: openrouter('mistralai/mistral-small-3.1-24b-instruct'),
            system: systemInstructions,
            messages: [
                {
                    role: 'user' as const,
                    content: content
                }
            ],
            temperature: 0.1,
            maxTokens: 4096,
        };

        // We use generateText which is non-streaming
        const { text: rawContent } = await generateText(params);

        console.log('📦 [improve-text-openrouter] Raw content:', rawContent);

        // Ensure we have a string to work with
        const responseText = typeof rawContent === 'string'
            ? rawContent
            : String(rawContent || '');

        let improvedContent = '';

        try {
            // Intenta parsear JSON directo
            // Limpieza previa por si el modelo pone ```json ... ```
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            improvedContent = parsed.corrected_text || parsed.text || parsed.content || cleanJson;

        } catch (e) {
            console.warn('⚠️ [improve-text-openrouter] JSON parse failed, trying regex extraction');
            // Si falla, intenta extraer el contenido del JSON con regex o usa el texto plano si no parece JSON
            // Regex cleaner for text artifacts
            const cleaner = (text: string) => {
                let clean = text;

                // 1. Si hay múltiples opciones, INTENTAR extraer solo la primera.
                // Patrón típico: "**Opción 1:** ... > "Texto"" o "1. "Texto""

                // Caso A: Formato "**Opción 1... > "Texto"**" (El que reportó el usuario)
                const optionMatch = clean.match(/(?:Opción|Option)\s*1.*?>\s*["“]([^"”]+)["”]/i);
                if (optionMatch && optionMatch[1]) {
                    return optionMatch[1].trim();
                }

                // Caso B: Formato "**Opción 1:** Texto" (Sin comillas o flechas)
                // Si vemos "Opción 2", cortamos todo lo que haya antes de "Opción 1" y después de "Opción 2"
                if (clean.match(/Opción 2|Option 2/i)) {
                    // Quedarnos con lo que hay entre Opción 1 y Opción 2
                    // Replace /s flag with [\s\S] approach for safe targeting
                    const match = clean.match(/(?:Opción|Option)\s*1:?\s*([\s\S]*?)(?=(?:Opción|Option)\s*2)/i);
                    if (match && match[1]) {
                        // Limpiar basura del match (estrellitas, etiquetas)
                        let candidate = match[1].replace(/\*\*.*?\*\*/g, '').replace(/>/g, '').trim();
                        // Si está entre comillas, quitarlas
                        const quoteMatch = candidate.match(/^["“](.*)["”]$/);
                        if (quoteMatch) candidate = quoteMatch[1];
                        return candidate;
                    }
                }

                // 2. Limpieza estándar (si no detectamos estructura de opciones clara)
                clean = clean
                    .replace(/^#\s*Texto corregido.*$/gim, '')
                    .replace(/^\*\*.*Texto corregido.*\*\*.*$/gim, '')
                    .replace(/^\*\*.*versión.*\*\*.*$/gim, '')
                    .replace(/^(Aquí|Here|Esta).*:.*$/gim, '')

                    // CORTES RADICALES
                    .replace(/^\*\*.*\*\* ?:?$/gim, '') // Remove ANY line that is just a bold header
                    .replace(/\*\*Observaciones:\*\*[\s\S]*/i, '')
                    .replace(/\*\*¿Por qué.*?\*\*[\s\S]*/i, '') // Cortar "¿Por qué cambiar...?"
                    .replace(/---[\s\S]*/, '')
                    .replace(/\(.*\)/g, '')

                    // CORTES RADICALES EXTRA (Trailing Commentary)
                    .replace(/(Espero|Ojalá) (que|te) (sirva|ayude|sea útil).*$/i, '')
                    .replace(/He (corregido|mejorado|cambiado) .*$/i, '')
                    .replace(/(Cualquier|Si tienes) (duda|pregunta|otra cosa).*$/i, '')
                    .replace(/Nota:.*$/i, '')
                    .trim();

                // 3. ESTRATEGIA DE COMILLAS (Si hay bloques grandes entre comillas)
                const quoteMatch = clean.match(/^["“]([\s\S]*)["”]$/);
                if (quoteMatch) {
                    return quoteMatch[1].trim();
                }

                // Heurística: si las comillas ocupan >80% del texto
                const innerQuote = clean.match(/["“]([\s\S]+)["”]/);
                if (innerQuote && innerQuote[1].length > clean.length * 0.8) {
                    return innerQuote[1].trim();
                }

                return clean;
            };

            const match = responseText.match(/"corrected_text"\s*:\s*"([^"]+)"/);
            if (match && match[1]) {
                improvedContent = match[1];
            } else {
                // Fallback: Si no hay JSON, limpiar agresivamente
                improvedContent = cleaner(responseText);
            }
        }

        if (!improvedContent) {
            console.error('❌ [improve-text-openrouter] Empty content received');
            throw new Error('No content received from OpenRouter');
        }

        console.log('✅ [improve-text-openrouter] Success, content length:', improvedContent.length);

        return NextResponse.json({
            improvedContent: improvedContent
        });

    } catch (error: any) {
        console.error('❌ [improve-text-openrouter] Detailed Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        return NextResponse.json(
            {
                error: 'Error al procesar la solicitud con OpenRouter',
                details: error.message
            },
            { status: 500 }
        );
    }
}

