import { NextRequest, NextResponse } from 'next/server'

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
    const maxTokens = parseInt(request.headers.get('x-max-tokens') || '1000')

    const fullPrompt = `Mejora el siguiente texto según esta instrucción: ${prompt}. Devuelve SOLO el texto mejorado, sin explicaciones, sin introducciones, sin múltiples versiones, solo el texto puro mejorado.\n\nTexto original: ${content}`

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
          maxOutputTokens: maxTokens,
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
    const improvedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error al generar contenido mejorado'

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