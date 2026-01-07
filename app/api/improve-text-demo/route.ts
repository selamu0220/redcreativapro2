import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, language = 'es' } = await request.json();

    console.log('🔍 [improve-text-demo] Received request:', {
      contentLength: content?.length || 0,
      language,
      hasContent: !!content
    });

    if (!content || !content.trim()) {
      console.error('❌ [improve-text-demo] Missing content');
      return NextResponse.json(
        { error: 'Contenido es requerido' },
        { status: 400 }
      );
    }

    console.log('🔧 [improve-text-demo] Using demo mode (no real API)');
    console.log('📝 [improve-text-demo] Original text:', content);

    // Check minimum word count (5 words minimum)
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount < 5) {
      console.log(`❌ [improve-text-demo] Text too short: ${wordCount} words (minimum 5)`);
      return NextResponse.json(
        { error: `Contenido muy corto (${wordCount} palabras, mínimo 5 requeridas)` },
        { status: 400 }
      );
    }

    // Simular mejoras reales basadas en reglas
    let improvedContent = content.trim();
    let hasChanges = false;

    // Regla 1: Capitalizar primera letra
    if (!/^[A-Z]/.test(improvedContent)) {
      improvedContent = improvedContent.charAt(0).toUpperCase() + improvedContent.slice(1);
      hasChanges = true;
      console.log('✏️ [improve-text-demo] Applied: Capitalize first letter');
    }

    // Regla 2: Agregar punto final si no existe
    if (!improvedContent.endsWith('.') && !improvedContent.endsWith('!') && !improvedContent.endsWith('?')) {
      improvedContent += '.';
      hasChanges = true;
      console.log('✏️ [improve-text-demo] Applied: Add final period');
    }

    // Regla 3: Corregir errores comunes
    const corrections = [
      { from: /\bgramatica\b/g, to: 'gramática' },
      { from: /\bortografia\b/g, to: 'ortografía' },
      { from: /\bestas\b/g, to: 'estás' },
      { from: /\bgustaria\b/g, to: 'gustaría' },
      { from: /\btio\b/g, to: 'tío' },
      { from: /\bporfa\b/g, to: 'por favor' },
      { from: /\bayudame\b/g, to: 'ayúdame' },
      { from: /\bse\b(?=\s+que)/g, to: 'sé' },
      { from: /\besta\b(?=\s+(super|muy|bien))/g, to: 'está' }
    ];

    corrections.forEach(correction => {
      const before = improvedContent;
      improvedContent = improvedContent.replace(correction.from, correction.to);
      if (before !== improvedContent) {
        hasChanges = true;
        console.log(`✏️ [improve-text-demo] Applied: ${correction.from} → ${correction.to}`);
      }
    });

    // Regla 4: Mejorar puntuación básica
    if (improvedContent.includes(' como estas ')) {
      improvedContent = improvedContent.replace(' como estas ', ', ¿cómo estás? ');
      hasChanges = true;
      console.log('✏️ [improve-text-demo] Applied: Improve punctuation');
    }

    // Regla 5: Formalizar expresiones informales
    const formalizations = [
      { from: /\boye\b/gi, to: 'Disculpa' },
      { from: /\bsuper mal\b/gi, to: 'muy problemático' },
      { from: /\bno se que hacer\b/gi, to: 'no sé qué hacer' }
    ];

    formalizations.forEach(formal => {
      const before = improvedContent;
      improvedContent = improvedContent.replace(formal.from, formal.to);
      if (before !== improvedContent) {
        hasChanges = true;
        console.log(`✏️ [improve-text-demo] Applied: Formalize "${formal.from}" → "${formal.to}"`);
      }
    });

    // Verificar si realmente cambió
    const originalText = content.trim().toLowerCase();
    const improvedText = improvedContent.trim().toLowerCase();
    
    if (originalText === improvedText || !hasChanges) {
      console.log('📝 [improve-text-demo] No improvements needed');
      return NextResponse.json(
        { error: 'El texto ya está bien escrito y no necesita mejoras.' },
        { status: 400 }
      );
    }

    console.log('✅ [improve-text-demo] Success:', {
      originalLength: content.length,
      improvedLength: improvedContent.length,
      isDifferent: content !== improvedContent,
      hasChanges
    });

    console.log('📝 [improve-text-demo] Improved text:', improvedContent);

    return NextResponse.json({
      improvedContent: improvedContent
    });

  } catch (error) {
    console.error('❌ [improve-text-demo] Unhandled error:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}