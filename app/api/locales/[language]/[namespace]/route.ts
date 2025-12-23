import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SUPPORTED_LANGUAGES, TRANSLATION_NAMESPACES, DEFAULT_LANGUAGE } from '@/app/lib/language/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { language: string; namespace: string } }
) {
  try {
    const { language, namespace } = params;

    if (!SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    if (!TRANSLATION_NAMESPACES.includes(namespace as any)) {
      return NextResponse.json({ error: 'Invalid namespace' }, { status: 400 });
    }

    const getTranslation = (lang: string, ns: string) => {
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

    let translation = getTranslation(language, namespace);
    let isFallback = false;

    if (!translation && language !== DEFAULT_LANGUAGE) {
      translation = getTranslation(DEFAULT_LANGUAGE, namespace);
      isFallback = true;
    }

    if (translation) {
      const headers: HeadersInit = {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Content-Type': 'application/json',
      };
      if (isFallback && translation) {
        headers['X-Fallback'] = 'true';
        headers['X-Fallback-Language'] = DEFAULT_LANGUAGE;
      }
      return NextResponse.json(translation, { headers });
    }

    return NextResponse.json({}, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Content-Type': 'application/json',
        'X-Empty': 'true',
      },
    });
  } catch (error) {
    console.error('Error in translation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
