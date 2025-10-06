import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/app/lib/language/config';

/**
 * API endpoint para traducir contenido dinámico generado por IA
 * POST /api/translate-content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, targetLanguage, sourceLanguage = DEFAULT_LANGUAGE, contentType = 'text' } = body;

    // Validaciones básicas
    if (!content || !targetLanguage) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: content, targetLanguage' },
        { status: 400 }
      );
    }

    // Validar idioma objetivo soportado
    const supportedLanguageCodes = Object.keys(SUPPORTED_LANGUAGES);
    if (!supportedLanguageCodes.includes(targetLanguage)) {
      return NextResponse.json(
        { 
          error: 'Idioma objetivo no soportado',
          supportedLanguages: supportedLanguageCodes 
        },
        { status: 400 }
      );
    }

    // Si el idioma objetivo es el mismo que el origen, devolver el contenido original
    if (targetLanguage === sourceLanguage) {
      return NextResponse.json({
        success: true,
        translatedContent: content,
        sourceLanguage,
        targetLanguage,
        message: 'No se requiere traducción'
      });
    }

    // Por ahora, implementamos una traducción básica simulada
    // En el futuro se podría integrar con servicios como Google Translate, DeepL, etc.
    const translatedContent = await simulateTranslation(content, sourceLanguage, targetLanguage, contentType);

    return NextResponse.json({
      success: true,
      translatedContent,
      sourceLanguage,
      targetLanguage,
      contentType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error traduciendo contenido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al traducir contenido' },
      { status: 500 }
    );
  }
}

/**
 * Función simulada de traducción
 * En una implementación real, aquí se integraría con un servicio de traducción
 */
async function simulateTranslation(
  content: string, 
  sourceLanguage: string, 
  targetLanguage: string, 
  contentType: string
): Promise<string> {
  // Mapeo básico de frases comunes para demostración
  const basicTranslations: Record<string, Record<string, string>> = {
    'es': {
      'en': 'Contenido traducido al inglés',
      'de': 'Contenido traducido al alemán',
      'fr': 'Contenido traducido al francés',
      'zh': 'Contenido traducido al chino'
    },
    'en': {
      'es': 'Contenido traducido al español',
      'de': 'Contenido traducido al alemán',
      'fr': 'Contenido traducido al francés',
      'zh': 'Contenido traducido al chino'
    }
  };

  // Simulación de delay de API
  await new Promise(resolve => setTimeout(resolve, 500));

  // Si tenemos una traducción básica, la usamos
  if (basicTranslations[sourceLanguage]?.[targetLanguage]) {
    return `${basicTranslations[sourceLanguage][targetLanguage]}: ${content}`;
  }

  // Fallback: devolver contenido original con nota
  return `[Traducción automática ${sourceLanguage} → ${targetLanguage}]: ${content}`;
}

/**
 * GET endpoint para obtener idiomas soportados para traducción
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      supportedLanguages: SUPPORTED_LANGUAGES,
      defaultLanguage: DEFAULT_LANGUAGE,
      availableContentTypes: ['text', 'html', 'markdown'],
      message: 'Idiomas soportados para traducción de contenido'
    });
  } catch (error) {
    console.error('Error obteniendo idiomas soportados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}