import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { content, creativity = 0.7, customPrompt } = await request.json();

        console.log('🔍 [improve-text-zai] Received request:', {
            contentLength: content?.length || 0,
            hasContent: !!content,
            model: 'glm-4.6'
        });

        if (!content || !content.trim()) {
            console.error('❌ [improve-text-zai] Missing content');
            return NextResponse.json(
                { error: 'Contenido es requerido' },
                { status: 400 }
            );
        }

        // Z.AI API Key
        const apiKey = process.env.ZAI_API_KEY || 'a767bdd91d0b49ee87d947dfe8ced853.cG5B2xbxCWynt3xF';

        console.log('🔧 [improve-text-zai] Using GLM-4.6 via Z.AI');

        // PROMPT DIRECTO Y CLARO
        const systemInstructions = customPrompt || `Eres un corrector de textos profesional. Tu trabajo es SOLO corregir ortografía y gramática.
        
REGLAS:
1. Devuelve SOLO el texto corregido
2. NO respondas al texto como chatbot
3. NO agregues explicaciones
4. Si el texto es "hola que tal" → devuelve "Hola, ¿qué tal?"
5. NO devuelvas "¡Hola! Todo bien gracias"`;

        const userMessage = content;

        console.log('📤 [improve-text-zai] Calling Z.AI API...');

        // Llamada a Z.AI
        const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'glm-4.7',
                messages: [
                    {
                        role: 'system',
                        content: systemInstructions
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: creativity,
                max_tokens: 4096
            })
        });

        console.log('📊 [improve-text-zai] Z.AI response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [improve-text-zai] Z.AI API Error:', {
                status: response.status,
                error: errorData
            });

            return NextResponse.json(
                { error: 'Error al comunicarse con Z.AI' },
                { status: 500 }
            );
        }

        const data = await response.json();
        let improvedContent = data.choices?.[0]?.message?.content?.trim();

        if (!improvedContent) {
            console.error('❌ [improve-text-zai] No content in response');
            return NextResponse.json(
                { error: 'La IA no pudo generar contenido mejorado' },
                { status: 500 }
            );
        }

        console.log('🧹 [improve-text-zai] Raw response:', improvedContent.substring(0, 200));

        // LIMPIEZA BÁSICA - GLM-4.6 es más obediente
        improvedContent = improvedContent
            .replace(/^["«]/gm, '')
            .replace(/["»]$/gm, '')
            .trim();

        console.log('✅ [improve-text-zai] Success:', {
            originalLength: content.length,
            improvedLength: improvedContent.length
        });

        return NextResponse.json({
            improvedContent: improvedContent
        });

    } catch (error) {
        console.error('❌ [improve-text-zai] Unhandled error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
