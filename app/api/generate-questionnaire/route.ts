import { NextRequest, NextResponse } from 'next/server';

interface QuestionnaireQuestion {
  type: 'text' | 'email' | 'select' | 'textarea' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

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

    const { prompt, maxQuestions = 8 } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Se requiere una descripción válida' },
        { status: 400 }
      );
    }

    // Obtener API key de Gemini
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || 
                   request.headers.get('x-api-key') ||
                   process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key de Gemini no configurada' },
        { status: 500 }
      );
    }

    const systemPrompt = `Eres un experto en marketing digital y generación de leads. Tu tarea es crear un cuestionario efectivo para recopilar información valiosa de leads potenciales.

Basándote en la descripción del usuario, genera un cuestionario con máximo ${maxQuestions} preguntas que:
1. Sea relevante para el objetivo descrito
2. No sea demasiado largo (para evitar abandono)
3. Recopile información útil para personalización
4. Use tipos de campo apropiados

Tipos de campo disponibles:
- text: Para respuestas cortas de texto
- email: Para direcciones de correo
- number: Para valores numéricos
- date: Para fechas
- select: Para opciones múltiples (incluye las opciones)
- textarea: Para respuestas largas

Responde ÚNICAMENTE con un JSON válido en este formato:
{
  "questions": [
    {
      "type": "text",
      "label": "¿Cuál es tu profesión?",
      "placeholder": "Ej: Marketing Manager",
      "required": true
    },
    {
      "type": "select",
      "label": "¿Cuál es tu nivel de experiencia?",
      "required": true,
      "options": ["Principiante", "Intermedio", "Avanzado", "Experto"]
    }
  ]
}

Descripción del usuario: "${prompt}"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Limpiar la respuesta para extraer solo el JSON
    let jsonText = text.trim();
    
    // Remover markdown si existe
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let questionnaire;
    try {
      questionnaire = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('AI response text:', text);
      
      // Fallback: crear un cuestionario básico
      questionnaire = {
        questions: [
          {
            type: 'text',
            label: '¿Cuál es tu nombre?',
            placeholder: 'Tu nombre completo',
            required: true
          },
          {
            type: 'text',
            label: '¿Cuál es tu profesión u ocupación?',
            placeholder: 'Ej: Marketing Manager, Estudiante, Emprendedor',
            required: true
          },
          {
            type: 'select',
            label: '¿Cuál es tu principal interés?',
            required: true,
            options: ['Marketing Digital', 'Ventas', 'Emprendimiento', 'Tecnología', 'Otro']
          }
        ]
      };
    }

    // Validar y limpiar el cuestionario
    if (!questionnaire.questions || !Array.isArray(questionnaire.questions)) {
      throw new Error('Formato de cuestionario inválido');
    }

    // Limitar número de preguntas
    questionnaire.questions = questionnaire.questions.slice(0, maxQuestions);

    // Validar cada pregunta
    questionnaire.questions = questionnaire.questions.map((q: any, index: number) => {
      const validTypes = ['text', 'email', 'select', 'textarea', 'number', 'date'];
      
      return {
        type: validTypes.includes(q.type) ? q.type : 'text',
        label: q.label || q.question || `Pregunta ${index + 1}`,
        placeholder: q.placeholder || '',
        required: q.required !== false, // Por defecto true
        options: q.type === 'select' && Array.isArray(q.options) ? q.options : undefined
      };
    }).filter((q: QuestionnaireQuestion) => q.label.trim().length > 0);

    return NextResponse.json({
      questions: questionnaire.questions,
      generated: true
    });

  } catch (error) {
    console.error('Error generating questionnaire:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al generar el cuestionario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}