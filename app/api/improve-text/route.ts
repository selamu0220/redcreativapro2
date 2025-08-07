import { NextRequest, NextResponse } from 'next/server'
import { incrementUsage } from '@/app/lib/database'


export async function POST(request: NextRequest) {
  try {
    const { content, prompt } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Contenido es requerido' },
        { status: 400 }
      )
    }

    // Obtener configuración guardada del localStorage (simulado en servidor)
    // En un caso real, esto vendría de una base de datos o headers
    const apiKey = request.headers.get('x-api-key')
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key no configurada. Ve a Ajustes para configurar Gemini.' },
        { status: 401 }
      )
    }

    const model = request.headers.get('x-model') || 'gemini-1.5-flash'
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

    // Llamar a la API de Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: adjustedMaxTokens,
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || 'Error al comunicarse con Gemini API' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Extraer la respuesta del modelo
    let improvedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error al generar contenido mejorado'
    
    // Validar si la respuesta fue cortada por límite de tokens
    const finishReason = data.candidates?.[0]?.finishReason
    if (finishReason === 'MAX_TOKENS') {
      console.warn('Respuesta cortada por límite de tokens, reintentando con límite mayor')
      
      // Reintentar con límite de tokens más alto
      const retryResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: adjustedMaxTokens * 2, // Duplicar el límite
          }
        })
      })
      
      if (retryResponse.ok) {
        const retryData = await retryResponse.json()
        const retryContent = retryData.candidates?.[0]?.content?.parts?.[0]?.text
        if (retryContent && retryContent.length > improvedContent.length) {
          improvedContent = retryContent
        }
      }
    }
    
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