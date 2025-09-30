import { NextRequest, NextResponse } from 'next/server'
import { getTodayUsage, incrementUsage, hasUnlimitedAccess } from '../../lib/database';
import { OpenRouterClient } from '../../lib/openrouter-client';


export async function POST(request: NextRequest) {
  try {
    // Build time detection - prevent Google API imports during build
    const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL && !process.env.RUNTIME;
    
    if (isBuildTime) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable during build' },
        { status: 503 }
      );
    }

    const { content, prompt } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Contenido es requerido' },
        { status: 400 }
      )
    }

    // Obtener configuración de OpenRouter
    const apiKey = process.env.OPEN_ROUTER_API_KEY || 
                   request.headers.get('x-openrouter-api-key')
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key de OpenRouter no configurada. Ve a Ajustes para configurar OpenRouter.' },
        { status: 401 }
      )
    }

    const model = request.headers.get('x-model') || 'openai/gpt-4o-mini'
    const temperature = parseFloat(request.headers.get('x-temperature') || '0.7')
    const maxTokens = parseInt(request.headers.get('x-max-tokens') || '4000') // Aumentar límite por defecto

    // Calcular tokens aproximados del contenido original para ajustar el límite
    const contentTokens = Math.ceil(content.length / 4) // Aproximación: 4 caracteres = 1 token
    const adjustedMaxTokens = Math.max(maxTokens, contentTokens * 1.5) // Al menos 1.5x el contenido original

    const fullPrompt = `Mejora el siguiente texto según esta instrucción: ${prompt}. 

REGLAS CRÍTICAS:
1. Devuelve SOLO el texto mejorado completo
2. NO cortes el texto a la mitad
3. NO agregues explicaciones ni introducciones
4. NO uses placeholders como [Nombre], [Empresa], Señor/Señora:, o/a, (nombre), (apellido) o similares
5. Asegúrate de que el texto esté COMPLETO desde el inicio hasta el final
6. Si el texto es largo, mejóralo TODO, no solo una parte
7. IMPORTANTE: SIEMPRE debes hacer mejoras al texto, nunca respondas "Ninguna mejora necesaria" o similar. Incluso si el texto está bien, mejora al menos la fluidez, claridad o estructura.
8. NO incluyas fórmulas genéricas como "Estimado/a", "Sr./Sra.", "o/a" o cualquier variante con barras o paréntesis

Texto original: ${content}`

    // Crear cliente de OpenRouter
    const openRouterClient = new OpenRouterClient({
      apiKey,
      model
    });

    // Llamar a la API de OpenRouter
    const result = await openRouterClient.generateContent({
      prompt: fullPrompt,
      temperature: temperature,
      maxTokens: adjustedMaxTokens,
    });

    if (!result.success) {
      console.error('❌ OpenRouter API Error:', result.error);
      return NextResponse.json(
        { error: result.error?.message || 'Error al comunicarse con OpenRouter API' },
        { status: 500 }
      )
    }
    
    // Extraer la respuesta del modelo
    let improvedContent = result.content || 'Error al generar contenido mejorado'
    
    // La verificación de truncamiento ya se maneja dentro del cliente OpenRouter
    // No necesitamos verificar finishReason aquí ya que el cliente maneja todos los casos
    
    // Validación adicional: verificar que el contenido no esté obviamente incompleto
    const originalWordCount = content.split(/\s+/).length
    const improvedWordCount = improvedContent.split(/\s+/).length
    
    // Si el texto mejorado es significativamente más corto que el original (más del 50% menos palabras)
    // y no termina con puntuación, probablemente está incompleto
    if (improvedWordCount < originalWordCount * 0.5 && !/[.!?]$/.test(improvedContent.trim())) {
      console.warn('Posible respuesta incompleta detectada')
      // En este caso, devolver el texto original con una nota
      improvedContent = content + '\n\n[Nota: El texto no pudo ser mejorado completamente. Intenta con un texto más corto o ajusta la configuración.]'
    }

    // Incrementar el uso de escritorIA
    const userEmail = request.headers.get('x-user-email')
    if (userEmail) {
      try {
        incrementUsage(userEmail, 'escritorIA')
      } catch (error) {
        console.error('Error al incrementar uso:', error)
      }
    }

    return NextResponse.json({ 
      improvedContent: improvedContent.trim()
    })
  } catch (error) {
    console.error('Error en improve-text:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}