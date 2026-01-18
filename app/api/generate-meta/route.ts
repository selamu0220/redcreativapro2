import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { content, keyword } = await req.json();

        if (!content || typeof content !== 'string') {
            return NextResponse.json({ error: 'Content required' }, { status: 400 });
        }

        // Extract key information from content
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const firstSentence = sentences[0]?.trim() || '';
        const words = content.split(/\s+/);

        // Try to find a good title from the content
        // Look for lines that might be headings (short, impactful)
        const lines = content.split('\n').filter(l => l.trim());
        const potentialTitle = lines.find(l => {
            const trimmed = l.replace(/^#+\s*/, '').trim();
            return trimmed.length > 10 && trimmed.length < 70;
        })?.replace(/^#+\s*/, '').trim();

        // Generate title
        let title = '';
        if (potentialTitle) {
            title = potentialTitle;
        } else if (keyword) {
            // Use keyword as base
            title = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: Guía Completa ${new Date().getFullYear()}`;
        } else if (firstSentence.length < 60) {
            title = firstSentence;
        } else {
            // Extract key phrases
            const keyPhrases = extractKeyPhrases(content);
            title = keyPhrases.slice(0, 3).join(' - ') || 'Título de tu artículo';
        }

        // Ensure title includes keyword if provided
        if (keyword && !title.toLowerCase().includes(keyword.toLowerCase())) {
            if (title.length + keyword.length + 3 <= 60) {
                title = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: ${title}`;
            }
        }

        // Truncate title if too long
        if (title.length > 60) {
            title = title.substring(0, 57) + '...';
        }

        // Generate description
        let description = '';

        // Use first meaningful sentences
        const meaningfulSentences = sentences.filter(s =>
            s.trim().length > 30 &&
            !s.trim().startsWith('#') &&
            !s.includes('http')
        );

        if (meaningfulSentences.length > 0) {
            description = meaningfulSentences.slice(0, 2).join('. ').trim();
        } else {
            // Fallback: summarize key points
            const wordSummary = words.slice(0, 30).join(' ');
            description = wordSummary;
        }

        // Add keyword to description if not present
        if (keyword && !description.toLowerCase().includes(keyword.toLowerCase())) {
            description = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: ${description}`;
        }

        // Truncate description
        if (description.length > 155) {
            description = description.substring(0, 152) + '...';
        }

        // Add call to action if space allows
        if (description.length < 140) {
            description += ' Descubre más aquí.';
        }

        return NextResponse.json({
            title: cleanText(title),
            description: cleanText(description)
        });

    } catch (error) {
        console.error('Meta generation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function extractKeyPhrases(text: string): string[] {
    // Simple key phrase extraction
    const words = text.toLowerCase().split(/\s+/);
    const wordCount: Record<string, number> = {};

    const stopWords = new Set([
        'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al',
        'en', 'con', 'por', 'para', 'sobre', 'entre', 'desde', 'hasta', 'sin',
        'que', 'como', 'más', 'pero', 'este', 'esta', 'esto', 'ese', 'esa', 'eso',
        'y', 'o', 'ni', 'si', 'no', 'es', 'son', 'ser', 'estar', 'hay', 'tiene',
        'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be',
        'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for',
        'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before',
        'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once'
    ]);

    words.forEach(word => {
        const clean = word.replace(/[^a-záéíóúñü]/gi, '');
        if (clean.length > 3 && !stopWords.has(clean)) {
            wordCount[clean] = (wordCount[clean] || 0) + 1;
        }
    });

    return Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

function cleanText(text: string): string {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[#*_`]/g, '')
        .trim();
}
