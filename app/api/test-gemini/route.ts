import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { apiKey, model, temperature, maxTokens, testMessage } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key es requerida' },
        { status: 400 }
      )
    }

    if (!testMessage) {
      return NextResponse.json(
        { error: 'Mensaje de prueba es requerido' },
        { status: 400 }
      )
    }

    // Realizar una prueba completa con la API de Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: testMessage
          }]
        }],
        generationConfig: {
          temperature: temperature || 0.7,
          maxOutputTokens: maxTokens || 1000,
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
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta'

    return NextResponse.json({ 
      success: true, 
      response: generatedText,
      model: model,
      temperature: temperature,
      maxTokens: maxTokens
    })
  } catch (error) {
    console.error('Error en test-gemini:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}