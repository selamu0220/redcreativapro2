import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, TRANSLATION_NAMESPACES } from '@/app/lib/language/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string; namespace: string }> }
) {
  try {
    const { locale, namespace } = await params;

    // Validar idioma soportado
    const supportedLanguageCodes = Object.keys(SUPPORTED_LANGUAGES);
    if (!supportedLanguageCodes.includes(locale)) {
      return NextResponse.json(
        { error: 'Idioma no soportado' },
        { status: 400 }
      );
    }

    // Validar namespace
    if (!TRANSLATION_NAMESPACES.includes(namespace as any)) {
      return NextResponse.json(
        { error: 'Namespace no válido' },
        { status: 400 }
      );
    }

    try {
      // Intentar cargar el archivo de traducción
      const filePath = join(process.cwd(), 'public', 'locales', locale, `${namespace}.json`);
      const fileContent = await readFile(filePath, 'utf-8');
      const translations = JSON.parse(fileContent);

      return NextResponse.json(translations, {
        headers: {
          'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Si no se encuentra el archivo, intentar con el idioma por defecto
      if (locale !== DEFAULT_LANGUAGE) {
        try {
          const fallbackPath = join(process.cwd(), 'public', 'locales', DEFAULT_LANGUAGE, `${namespace}.json`);
          const fallbackContent = await readFile(fallbackPath, 'utf-8');
          const fallbackTranslations = JSON.parse(fallbackContent);

          return NextResponse.json(fallbackTranslations, {
            headers: {
              'Cache-Control': 'public, max-age=3600',
              'Content-Type': 'application/json',
              'X-Fallback-Language': DEFAULT_LANGUAGE,
            },
          });
        } catch (fallbackError) {
          console.error(`Error cargando fallback para ${locale}/${namespace}:`, fallbackError);
        }
      }

      return NextResponse.json(
        { error: `Archivo de traducción no encontrado: ${locale}/${namespace}` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error en API de locales:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}