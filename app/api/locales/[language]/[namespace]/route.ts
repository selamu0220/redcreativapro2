import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LANGUAGES, TRANSLATION_NAMESPACES, DEFAULT_LANGUAGE } from '@/app/lib/language/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ language: string; namespace: string }> }
) {
  try {
    const { language, namespace } = await params;
    
    // Validate language
    if (!SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      );
    }
    
    // Validate namespace
    if (!TRANSLATION_NAMESPACES.includes(namespace as any)) {
      return NextResponse.json(
        { error: 'Invalid namespace' },
        { status: 400 }
      );
    }
    
    try {
      // Use dynamic import instead of fs to ensure compatibility
      const translation = await import(`../../../../../public/locales/${language}/${namespace}.json`);
      
      return NextResponse.json(translation.default || translation, {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'Content-Type': 'application/json',
        },
      });
    } catch (fileError) {
      // If file doesn't exist, try fallback to default language
      if (language !== DEFAULT_LANGUAGE) {
        try {
          const fallbackTranslation = await import(`../../../../../public/locales/${DEFAULT_LANGUAGE}/${namespace}.json`);
          
          return NextResponse.json(fallbackTranslation.default || fallbackTranslation, {
            headers: {
              'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
              'Content-Type': 'application/json',
              'X-Fallback': 'true',
              'X-Fallback-Language': DEFAULT_LANGUAGE,
            },
          });
        } catch (fallbackError) {
          console.error(`Error loading fallback translations for ${namespace}:`, fallbackError);
        }
      }
      
      // Return empty object if no translations found
      return NextResponse.json({}, {
        headers: {
          'Cache-Control': 'public, max-age=300',
          'Content-Type': 'application/json',
          'X-Empty': 'true',
        },
      });
    }
  } catch (error) {
    console.error('Error in translation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}