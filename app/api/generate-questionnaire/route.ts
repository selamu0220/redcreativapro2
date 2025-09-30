import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterClient } from '../../lib/openrouter-client';

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

    // Obtener API key de OpenRouter
    const apiKey = process.env.OPEN_ROUTER_API_KEY || 
                   request.headers.get('x-openrouter-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key de OpenRouter no configurada' },
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

    // Crear cliente de OpenRouter
    const openRouterClient = new OpenRouterClient({
      apiKey,
      model: 'openai/gpt-4o-mini'
    });

    // Llamar a la API de OpenRouter
    const result = await openRouterClient.generateContent({
      prompt: systemPrompt,
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.8
    });

    if (!result.success) {
      console.error('❌ OpenRouter API Error:', result.error);
      throw new Error(`OpenRouter API error: ${result.error?.message || 'Unknown error'}`);
    }

    const text = result.content || '';

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