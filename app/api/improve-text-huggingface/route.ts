import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { content } = await request.json();

        console.log('🔍 [improve-text-huggingface] Received request:', {
            contentLength: content?.length || 0,
        });

        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: 'Contenido es requerido' },
                { status: 400 }
            );
        }

        const apiKey = process.env.HUGGINGFACE_API_KEY;

        if (!apiKey) {
            console.error('❌ [improve-text-huggingface] Missing API key');
            return NextResponse.json(
                { error: 'API key de HuggingFace no configurada' },
                { status: 503 }
            );
        }

        const systemPrompt = `Eres un corrector profesional de textos en español.
MISIÓN: Reescribir CUALQUIER texto para que sea claro, correcto y profesional.

REGLAS:
1. SIEMPRE corrige el texto, sin importar qué tan informal sea.
2. Corrige gramática, ortografía y puntuación.
3. No cambies el significado original.
4. Devuelve SOLO el texto corregido, nada más.
5. NO expliques los cambios.
6. NO agregues saludos ni comentarios.`;

        const userPrompt = `Corrige este texto:\n\n${content}`;

        console.log('📤 [improve-text-huggingface] Calling HuggingFace API...');

        // Use Mistral-7B-Instruct - available on free tier
        const response = await fetch(
            'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: `<s>[INST] ${systemPrompt}\n\nCorrige este texto:\n${content} [/INST]`,
                    parameters: {
                        max_new_tokens: 1024,
                        temperature: 0.3,
                        top_p: 0.9,
                        do_sample: true,
                        return_full_text: false,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [improve-text-huggingface] API Error:', errorData);

            // Check if model is loading
            if (errorData.error?.includes('loading')) {
                return NextResponse.json(
                    { error: 'El modelo está cargando, intenta de nuevo en unos segundos' },
                    { status: 503 }
                );
            }

            return NextResponse.json(
                { error: 'Error al comunicarse con HuggingFace', details: errorData.error },
                { status: 500 }
            );
        }

        const data = await response.json();
        console.log('📦 [improve-text-huggingface] Raw response:', JSON.stringify(data).slice(0, 200));

        // HuggingFace returns an array with generated_text
        let improvedContent = '';
        if (Array.isArray(data) && data[0]?.generated_text) {
            improvedContent = data[0].generated_text.trim();
        } else if (typeof data === 'string') {
            improvedContent = data.trim();
        } else if (data.generated_text) {
            improvedContent = data.generated_text.trim();
        }

        // Clean up any remaining chat tokens
        improvedContent = improvedContent
            .replace(/<\|im_end\|>/g, '')
            .replace(/<\|im_start\|>/g, '')
            .replace(/^(assistant|user|system)\n?/gi, '')
            .trim();

        if (!improvedContent) {
            console.error('❌ [improve-text-huggingface] No content in response');
            return NextResponse.json(
                { error: 'HuggingFace no pudo generar contenido mejorado' },
                { status: 500 }
            );
        }

        console.log('✅ [improve-text-huggingface] Success:', {
            originalLength: content.length,
            improvedLength: improvedContent.length,
        });

        return NextResponse.json({
            improvedContent: improvedContent
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ [improve-text-huggingface] Error:', errorMessage);

        return NextResponse.json(
            { error: 'Error al procesar la solicitud con HuggingFace', details: errorMessage },
            { status: 500 }
        );
    }
}
