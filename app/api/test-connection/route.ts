import { NextRequest, NextResponse } from 'next/server'


export async function POST(request: NextRequest) {
  try {
    const { apiKey, model } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key es requerida' },
        { status: 400 }
      )
    }

    // Realizar una prueba básica de conexión con la API de Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Test'
          }]
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || 'Error de conexión con Gemini API' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, message: 'Conexión exitosa' })
  } catch (error) {
    console.error('Error en test-connection:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}