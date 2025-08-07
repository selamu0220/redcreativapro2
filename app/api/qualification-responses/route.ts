import { NextRequest, NextResponse } from 'next/server'
import { updateContact } from '../../lib/database'

interface QualificationResponse {
  questionId: string;
  answer: string | string[];
}

interface QualificationData {
  responses: Record<string, string | string[]>;
  interests: string[];
  communicationStyle: string;
  preferredTopics: string[];
  languageStyle: string;
  demographicInfo?: Record<string, any>;
  qualificationScore: number;
  segment: string;
  completedAt: string;
}

function processQualificationResponses(responses: QualificationResponse[]): QualificationData {
  const responseMap: Record<string, string | string[]> = {}
  const interests: string[] = []
  const preferredTopics: string[] = []
  let communicationStyle = ''
  let languageStyle = ''
  const demographicInfo: Record<string, any> = {}
  
  // Procesar respuestas
  responses.forEach(response => {
    responseMap[response.questionId] = response.answer
    
    // Extraer información específica basada en patrones comunes
    const answer = response.answer
    
    // Detectar intereses (respuestas que contienen palabras clave)
    if (Array.isArray(answer)) {
      answer.forEach(item => {
        if (typeof item === 'string') {
          const lowerItem = item.toLowerCase()
          if (lowerItem.includes('marketing') || lowerItem.includes('ventas') || 
              lowerItem.includes('emprendimiento') || lowerItem.includes('productividad') ||
              lowerItem.includes('liderazgo') || lowerItem.includes('tecnología') ||
              lowerItem.includes('finanzas') || lowerItem.includes('desarrollo')) {
            interests.push(item)
          }
          
          if (lowerItem.includes('tutorial') || lowerItem.includes('caso') || 
              lowerItem.includes('tendencia') || lowerItem.includes('herramienta') ||
              lowerItem.includes('consejo') || lowerItem.includes('análisis')) {
            preferredTopics.push(item)
          }
        }
      })
    } else if (typeof answer === 'string') {
      const lowerAnswer = answer.toLowerCase()
      
      // Detectar estilo de comunicación
      if (lowerAnswer.includes('formal') || lowerAnswer.includes('profesional')) {
        communicationStyle = 'formal'
      } else if (lowerAnswer.includes('casual') || lowerAnswer.includes('cercano')) {
        communicationStyle = 'casual'
      } else if (lowerAnswer.includes('directo') || lowerAnswer.includes('conciso')) {
        communicationStyle = 'direct'
      } else if (lowerAnswer.includes('detallado') || lowerAnswer.includes('explicativo')) {
        communicationStyle = 'detailed'
      } else if (lowerAnswer.includes('motivacional') || lowerAnswer.includes('inspirador')) {
        communicationStyle = 'motivational'
      }
      
      // Detectar información demográfica
      if (lowerAnswer.includes('tecnología') || lowerAnswer.includes('servicios') ||
          lowerAnswer.includes('retail') || lowerAnswer.includes('salud') ||
          lowerAnswer.includes('educación') || lowerAnswer.includes('finanzas')) {
        demographicInfo.sector = answer
      }
      
      if (lowerAnswer.includes('startup') || lowerAnswer.includes('crecimiento') ||
          lowerAnswer.includes('establecido') || lowerAnswer.includes('empleado')) {
        demographicInfo.businessStage = answer
      }
    }
  })
  
  // Calcular puntuación de cualificación (0-100)
  let qualificationScore = 0
  
  // Puntos por completar respuestas
  qualificationScore += Math.min(responses.length * 10, 50)
  
  // Puntos por intereses específicos
  qualificationScore += Math.min(interests.length * 5, 25)
  
  // Puntos por preferencias de contenido
  qualificationScore += Math.min(preferredTopics.length * 3, 15)
  
  // Puntos por información demográfica
  qualificationScore += Object.keys(demographicInfo).length * 5
  
  // Determinar segmento
  let segment = 'general'
  
  if (qualificationScore >= 80) {
    segment = 'high-value'
  } else if (qualificationScore >= 60) {
    segment = 'medium-value'
  } else if (qualificationScore >= 40) {
    segment = 'low-value'
  }
  
  // Ajustar segmento basado en intereses específicos
  if (interests.some(interest => 
    interest.toLowerCase().includes('emprendimiento') || 
    interest.toLowerCase().includes('liderazgo') ||
    interest.toLowerCase().includes('ventas')
  )) {
    segment = segment === 'general' ? 'business-focused' : `${segment}-business`
  }
  
  if (interests.some(interest => 
    interest.toLowerCase().includes('marketing') || 
    interest.toLowerCase().includes('tecnología')
  )) {
    segment = segment === 'general' ? 'tech-marketing' : `${segment}-tech`
  }
  
  return {
    responses: responseMap,
    interests: [...new Set(interests)], // Eliminar duplicados
    communicationStyle: communicationStyle || 'casual',
    preferredTopics: [...new Set(preferredTopics)],
    languageStyle: languageStyle || communicationStyle || 'casual',
    demographicInfo,
    qualificationScore: Math.min(qualificationScore, 100),
    segment,
    completedAt: new Date().toISOString()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pageId, email, responses } = await request.json()
    
    if (!pageId || !email || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }
    
    // Procesar respuestas del cuestionario
    const qualificationData = processQualificationResponses(responses)
    
    // Actualizar el contacto con los datos de cualificación
    await updateContact(email, {
      qualificationData,
      lastQualificationUpdate: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      qualificationData: {
        score: qualificationData.qualificationScore,
        segment: qualificationData.segment,
        interests: qualificationData.interests,
        communicationStyle: qualificationData.communicationStyle
      }
    })
    
  } catch (error) {
    console.error('Error processing qualification responses:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}