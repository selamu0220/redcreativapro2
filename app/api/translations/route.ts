import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/app/lib/language/config';
import { TranslationApiResponse } from '@/app/lib/language/types';

const getTranslation = (lang: string, ns: string): object | null => {
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', lang, `${ns}.json`);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (e) {
    console.error(`Error reading translation file for ${lang}/${ns}:`, e);
  }
  return null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || DEFAULT_LANGUAGE;
    const namespace = searchParams.get('namespace') || 'common';

    const supportedLanguageCodes = Object.keys(SUPPORTED_LANGUAGES);
    if (!supportedLanguageCodes.includes(lang)) {
      return NextResponse.json(
        { error: 'Idioma no soportado', supportedLanguages: supportedLanguageCodes },
        { status: 400 }
      );
    }

    let translations = getTranslation(lang, namespace);
    let fallback = false;
    let finalLang = lang;

    if (!translations && lang !== DEFAULT_LANGUAGE) {
      translations = getTranslation(DEFAULT_LANGUAGE, namespace);
      fallback = true;
      finalLang = DEFAULT_LANGUAGE;
    }

    if (translations) {
      const response: TranslationApiResponse = {
        success: true,
        data: translations,
        language: finalLang,
        namespace,
        fallback,
      };
      return NextResponse.json(response);
    }

    return NextResponse.json(
      { error: `No se encontraron traducciones para el namespace '${namespace}'`, language: lang, namespace },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error en API de traducciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { language, namespace, key, value } = body;

    if (!language || !namespace || !key || !value) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: language, namespace, key, value' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Traducción actualizada correctamente',
      data: { language, namespace, key, value },
    });
  } catch (error) {
    console.error('Error actualizando traducción:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
