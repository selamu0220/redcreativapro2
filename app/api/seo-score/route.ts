import { NextResponse } from 'next/server';

interface SEOCheck {
    id: string;
    label: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    details?: string;
}

export async function POST(req: Request) {
    try {
        const { text, keyword } = await req.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Text required' }, { status: 400 });
        }

        const checks: SEOCheck[] = [];
        let score = 100;
        const wordCount = text.trim().split(/\s+/).length;

        // 1. Content Length
        if (wordCount < 300) {
            score -= 20;
            checks.push({
                id: 'length',
                label: 'Longitud del contenido',
                status: 'fail',
                message: `Solo ${wordCount} palabras. Mínimo recomendado: 300.`
            });
        } else if (wordCount < 600) {
            score -= 5;
            checks.push({
                id: 'length',
                label: 'Longitud del contenido',
                status: 'warn',
                message: `Buen comienzo (${wordCount} palabras), se recomienda >1000 para artículos profundos.`
            });
        } else {
            checks.push({
                id: 'length',
                label: 'Longitud del contenido',
                status: 'pass',
                message: 'Excelente longitud.'
            });
        }

        // 2. Headings (Simple Check for MD or HTML)
        // Supports # Heading or <h1>Heading
        const hasH2 = /^(## |<h2)/m.test(text);
        const hasH3 = /^(### |<h3)/m.test(text);

        if (!hasH2 && wordCount > 300) {
            score -= 15;
            checks.push({
                id: 'h2-missing',
                label: 'Estructura de Encabezados (H2)',
                status: 'fail',
                message: 'Faltan subtítulos H2 para estructurar el contenido.'
            });
        } else if (hasH2) {
            checks.push({
                id: 'h2-found',
                label: 'Estructura de Encabezados (H2)',
                status: 'pass',
                message: 'Subtítulos presentes.'
            });
        }

        // 3. Keyword Analysis
        if (keyword && keyword.trim().length > 0) {
            const cleanKeyword = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(cleanKeyword, 'gi');
            const matches = text.match(regex) || [];
            const count = matches.length;
            const density = wordCount > 0 ? (count / wordCount) * 100 : 0;

            if (count === 0) {
                score -= 30;
                checks.push({
                    id: 'keyword-missing',
                    label: `Palabra clave: "${keyword}"`,
                    status: 'fail',
                    message: 'No aparece en el texto.'
                });
            } else {
                if (density > 2.5) {
                    score -= 10;
                    checks.push({
                        id: 'keyword-stuffing',
                        label: 'Densidad de palabra clave',
                        status: 'fail',
                        message: `Excesiva (${density.toFixed(1)}%). Posible keyword stuffing.`
                    });
                } else if (density < 0.5 && wordCount > 300) {
                    score -= 5;
                    checks.push({
                        id: 'keyword-low',
                        label: 'Densidad de palabra clave',
                        status: 'warn',
                        message: `Baja (${density.toFixed(1)}%). Úsala más frecuente.`
                    });
                } else {
                    checks.push({
                        id: 'keyword-optimal',
                        label: 'Densidad de palabra clave',
                        status: 'pass',
                        message: `Óptima (${density.toFixed(1)}%).`
                    });
                }

                // Keyword in first 100 words?
                const introText = text.slice(0, 800); // approx chars
                if (!regex.test(introText)) {
                    score -= 5;
                    checks.push({
                        id: 'keyword-intro',
                        label: 'Palabra clave en introducción',
                        status: 'warn',
                        message: 'Intenta incluir la palabra clave en el primer párrafo.'
                    });
                } else {
                    checks.push({
                        id: 'keyword-intro',
                        label: 'Palabra clave en introducción',
                        status: 'pass'
                    });
                }
            }
        } else {
            checks.push({
                id: 'keyword-none',
                label: 'Palabra clave objetivo',
                status: 'warn',
                message: 'No definida. Ingresa una palabra clave para análisis completo.'
            });
            // Don't penalize score too much if user just hasn't entered it yet, but warn.
        }

        // 4. Readability (Paragraph length)
        const paragraphs = text.split(/\n\s*\n/);
        const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 60).length;

        if (longParagraphs > 0) {
            score -= Math.min(10, longParagraphs * 2);
            checks.push({
                id: 'readability-paragraphs',
                label: 'Legibilidad',
                status: 'warn',
                message: `${longParagraphs} párrafos son muy largos. Acórtalos para mejorar la lectura.`
            });
        } else {
            checks.push({
                id: 'readability-pass',
                label: 'Legibilidad',
                status: 'pass',
                message: 'Párrafos concisos y fáciles de leer.'
            });
        }

        return NextResponse.json({
            score: Math.max(0, Math.min(100, score)),
            checks
        });

    } catch (error) {
        console.error('SEO Analysis Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
