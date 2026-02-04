import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { gateway, DEFAULT_MODEL, googleProvider, MODEL_PRIMARY, MODEL_BACKUP } from '../../lib/ai/gateway';

// export const runtime = 'edge'; // SWITCHED TO NODEJS FOR STABILITY
export const maxDuration = 300; // Allow 300 seconds for slow models (Task #14)

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { message, history, documentContent, mode, prePrompt } = payload;

    // Log for debugging
    console.log('[API/chat] Stream Request:', {
      mode,
      model: request.headers.get('x-model') || DEFAULT_MODEL
    });

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Determine intent and setup prompt
    const isPlan = mode === 'plan';
    const systemPrompt = `Eres un "Editor IA" avanzado.
Tu MISION es MODIFICAR y MEJORAR el documento del usuario.

[ESTADO MENTAL Y ROL]
NO eres un chat genérico. Eres un EDITOR DE TEXTO PROFESIONAL.
Tu objetivo principal es editar, mejorar y transformar documentos.
Sin embargo, debes poder distinguir entre una SOLICITUD DE EDICIÓN y una PREGUNTA/CONVERSACIÓN.

[PROCESO DE PENSAMIENTO]
1. ANALIZA la entrada del usuario.
2. CLASIFICA la intención:
   - TIPO A (Edición): "Mejora esto", "Cambia el tono", "Reescribe", "Corrige".
   - TIPO B (Conversacional): "¿Qué opinas?", "¿Cómo estás?", "Explica este concepto".
   - TIPO C (Mixto): "Explícame esto y luego añádelo". -> TRATAR COMO EDICIÓN.

[REGLAS DE EJECUCIÓN - TIPO A (EDICIÓN)]
- DEBES generar el DOCUMENTO COMPLETO actualizado.
- DEBES usar las etiquetas :::UPDATE_DOCUMENT::: para envolver el texto nuevo.
- Formato:
  He realizado los cambios solicitados.
  :::UPDATE_DOCUMENT:::
  [DOCUMENTO COMPLETO]
  :::UPDATE_DOCUMENT:::

[REGLAS DE EJECUCIÓN - TIPO B (CONVERSACIÓN)]
- Responde directamente a la pregunta.
- NO uses las etiquetas :::UPDATE_DOCUMENT:::.
- NO generes el documento de nuevo si no se ha pedido un cambio.
- Sé breve, profesional y útil.

[PENALIZACIONES Y ERRORES]
- NUNCA pongas texto conversacional dentro de :::UPDATE_DOCUMENT:::.
- NUNCA devuelvas el documento sin las etiquetas si es una edición.
`;

    const fullDetails = `
--- CONTEXTO DEL DOCUMENTO (LO QUE DEBES EDITAR) ---
${documentContent || "(Documento vacío o no proporcionado)"}
--- FIN CONTEXTO ---
`;

    // Messages array
    const messages = [
      ...(history && Array.isArray(history) ? history.map((msg: any) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      })) : []),
      { role: 'user', content: message }
    ] as any;

    // Execute with Fallback
    try {
      // 1. Primary Provider
      const result = await streamText({
        model: gateway(MODEL_PRIMARY),
        system: systemPrompt + fullDetails, // INJECT DOCUMENT CONTENT HERE
        messages,
        temperature: 0.3,
      });

      return new NextResponse(result.textStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });

    } catch (primaryError: any) {
      console.warn(`[API/chat] Primary failed, switching to backup: ${primaryError.message}`);

      // 2. Backup Provider
      try {
        const result = await streamText({
          model: googleProvider(MODEL_BACKUP),
          system: systemPrompt,
          messages,
          temperature: 0.3,
        });

        return new NextResponse(result.textStream, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      } catch (backupError: any) {
        console.error(`[API/chat] All providers failed.`, backupError);
        throw new Error(`Service Unavailable: ${backupError.message}`);
      }
    }

  } catch (error: any) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
