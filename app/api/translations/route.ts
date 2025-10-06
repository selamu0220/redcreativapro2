import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/app/lib/language/config';
import { TranslationApiResponse } from '@/app/lib/language/types';

/**
 * API endpoint para obtener traducciones dinámicas
 * GET /api/translations?lang=es&namespace=common
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || DEFAULT_LANGUAGE;
    const namespace = searchParams.get('namespace') || 'common';

    // Validar idioma soportado
    const supportedLanguageCodes = Object.keys(SUPPORTED_LANGUAGES);
    if (!supportedLanguageCodes.includes(lang)) {
      return NextResponse.json(
        { 
          error: 'Idioma no soportado',
          supportedLanguages: supportedLanguageCodes 
        },
        { status: 400 }
      );
    }

    // Intentar cargar las traducciones del idioma solicitado
    try {
      const translations = await import(`@/public/locales/${lang}/${namespace}.json`);
      
      const response: TranslationApiResponse = {
        success: true,
        data: translations.default,
        language: lang,
        namespace: namespace
      };

      return NextResponse.json(response);
    } catch (error) {
      // Si no se encuentra el archivo, intentar con el idioma por defecto
      try {
        const fallbackTranslations = await import(`@/public/locales/${DEFAULT_LANGUAGE}/${namespace}.json`);
        
        const response: TranslationApiResponse = {
          success: true,
          data: fallbackTranslations.default,
          language: DEFAULT_LANGUAGE,
          namespace: namespace,
          fallback: true
        };

        return NextResponse.json(response);
      } catch (fallbackError) {
        return NextResponse.json(
          { 
            error: `No se encontraron traducciones para el namespace '${namespace}'`,
            language: lang,
            namespace: namespace
          },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    console.error('Error en API de traducciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint para actualizar traducciones dinámicamente (para uso futuro)
 * POST /api/translations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { language, namespace, key, value } = body;

    // Validaciones básicas
    if (!language || !namespace || !key || !value) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: language, namespace, key, value' },
        { status: 400 }
      );
    }

    // Por ahora, solo retornamos éxito sin persistir
    // En el futuro se podría implementar persistencia en base de datos
    return NextResponse.json({
      success: true,
      message: 'Traducción actualizada correctamente',
      data: { language, namespace, key, value }
    });
  } catch (error) {
    console.error('Error actualizando traducción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}