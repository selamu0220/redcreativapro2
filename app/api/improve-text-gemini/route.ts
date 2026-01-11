import { NextRequest, NextResponse } from 'next/server';
import { getProfile } from '@/app/lib/writing-profiles';

export async function POST(request: NextRequest) {
  try {
    const { content, customPrompt, profileId = 'journalism-general' } = await request.json();

    console.log('🔍 [improve-text-gemini] Received request:', {
      contentLength: content?.length || 0,
      profileId,
      hasCustomPrompt: !!customPrompt,
      hasContent: !!content
    });

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Contenido es requerido' },
        { status: 400 }
      );
    }

    // Get API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ [improve-text-gemini] Missing API key');
      return NextResponse.json(
        { error: 'API key de Gemini no configurada en el servidor' },
        { status: 503 }
      );
    }

    // Get system instruction from profile or use custom
    const profile = getProfile(profileId);
    const systemInstruction = customPrompt || profile.systemInstruction || `Eres un corrector profesional de textos.
  MISIÓN: Reescribir CUALQUIER texto para que sea claro, objetivo y directo.

REGLAS ABSOLUTAS:
1. SIEMPRE corrige el texto, sin importar qué tan informal, breve o coloquial sea.
2. Si el texto es un saludo("hola bro"), conviértelo en un saludo formal("Saludos cordiales").
3. Si el texto es un insulto, corrígele la ortografía al insulto.
4. Si el texto es una pregunta, reformúlala formalmente.
5. Corrige gramática y ortografía impecablemente.

LO QUE NUNCA DEBES HACER:
- NUNCA digas "Este texto no es apto para mejora".
- NUNCA expliques por qué no puedes procesar el texto.
- NUNCA agregues saludos, despedidas o meta - comentarios.
- NUNCA justifiques tus cambios.

FORMATO DE SALIDA: Solo devuelve el texto mejorado, nada más.`;

    console.log('📤 [improve-text-gemini] Calling Gemini API with profile:', profileId);

    // Call Gemini REST API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [{
            parts: [{ text: content }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [improve-text-gemini] API Error:', errorData);

      let errorMessage = 'Error al comunicarse con Gemini';
      if (response.status === 401) errorMessage = 'API key inválida';
      else if (response.status === 429) errorMessage = 'Cuota excedida';

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const data = await response.json();
    const improvedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!improvedContent) {
      console.error('❌ [improve-text-gemini] No content in response');
      return NextResponse.json(
        { error: 'Gemini no pudo generar contenido mejorado' },
        { status: 500 }
      );
    }

    console.log('✅ [improve-text-gemini] Success:', {
      originalLength: content.length,
      improvedLength: improvedContent.length,
      changePercentage: Math.round((Math.abs(improvedContent.length - content.length) / content.length) * 100)
    });

    return NextResponse.json({
      improvedContent: improvedContent
    });

  } catch (error: any) {
    console.error('❌ [improve-text-gemini] Detailed Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json(
      { error: 'Error al procesar la solicitud con Gemini', details: error.message },
      { status: 500 }
    );
  }
}
