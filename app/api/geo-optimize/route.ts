import { NextRequest, NextResponse } from 'next/server';

/**
 * GEO (Generative Engine Optimization) Analyzer
 * 
 * Analyzes text for characteristics that make it likely to be cited by LLMs (ChatGPT, Gemini, Perplexity).
 * Based on research: Data Density, Direct Answers, Authority Signals.
 */

// Key phrases that signal a "Direct Answer" structure
const DEFINITION_PATTERNS = [
    /^(el|la|los|las|un|una) \w+ (es|son|se define como|consiste en)/i,
    /^\w+ (is|are|refer to|defined as)/i,
    /\b(en resumen|en conclusión|básicamente)\b/i
];

// Statistical/Data patterns
const DATA_PATTERNS = [
    /\d+(\.|,)\d+%/, // Percentages
    /\d+ (millones|mil|dólares|euros|personas|usuarios)/i, // Quantities
    /(según|de acuerdo con) (el estudio|el informe|la investigación|datos de)/i, // Citations
    /\b(estadístic\w+|cifras|datos|reporte)\b/i
];

// Authority signals
const AUTHORITY_SIGNALS = [
    /\b(experto|especialista|doctor|profesor|investigador)\b/i,
    /\b(estudio|análisis|investigación|informe) (reciente|publicado|realizado)/i,
    /"[^"]+" (dijo|afirmó|señaló)/i // Direct quotes
];

function analyzeGeoScore(text: string) {
    const sentences = text.split(/[.!?]+/).filter(s => s.length > 10);
    const words = text.split(/\s+/).length;

    let score = 50; // Base score
    const suggestions: string[] = [];
    const strengths: string[] = [];

    // 1. DIRECT ANSWER CHECK (First 100 words)
    const introduction = text.substring(0, 500); // approx first paragraph
    const hasDirectAnswer = DEFINITION_PATTERNS.some(p => p.test(introduction));

    if (hasDirectAnswer) {
        score += 15;
        strengths.push("Estructura de Respuesta Directa detectada al inicio.");
    } else {
        score -= 10;
        suggestions.push("Añade una definición directa al principio (ej: 'El SEO es...'). Los LLMs buscan esto para los 'snippets'.");
    }

    // 2. DATA DENSITY
    let dataCount = 0;
    DATA_PATTERNS.forEach(p => {
        const matches = text.match(p);
        if (matches) dataCount += matches.length;
    });

    const dataDensity = (dataCount / (words / 100)); // Data points per 100 words

    if (dataDensity > 1.5) {
        score += 20;
        strengths.push("Alta densidad de datos y estadísticas.");
    } else if (dataDensity > 0.5) {
        score += 10;
    } else {
        score -= 10;
        suggestions.push("Incluye más estadísticas concretas, porcentajes o cifras. Los LLMs priorizan el contenido con 'Data Density' alta.");
    }

    // 3. AUTHORITY SIGNALS
    let authorityCount = 0;
    AUTHORITY_SIGNALS.forEach(p => {
        if (p.test(text)) authorityCount++;
    });

    if (authorityCount >= 2) {
        score += 15;
        strengths.push("Señales de autoridad (citas/expertos) detectadas.");
    } else {
        suggestions.push("Cita a expertos o estudios ('Según el Dr. X...'). Esto aumenta la confianza del Knowledge Graph.");
    }

    // 4. STRUCTURE (Lists and Headers)
    // Heuristic: check for markdown headers or bullet points equivalent
    const hasLists = /(- |\d+\. )/.test(text);
    if (hasLists) {
        score += 10;
        strengths.push("Uso de listas detectado (fácil de procesar para LLMs).");
    } else {
        suggestions.push("Usa listas (bullets) o tablas. A los LLMs les encanta la información estructurada.");
    }

    // Cap score
    score = Math.min(100, Math.max(0, score));

    // Determine Verdict
    let verdict = "";
    if (score > 80) verdict = "Altamente Citable (GEO Friendly)";
    else if (score > 50) verdict = "Optimización Media";
    else verdict = "Invisible para LLMs";

    return {
        score,
        verdict,
        dataDensity: dataDensity.toFixed(2),
        suggestions,
        strengths
    };
}

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text || text.length < 50) {
            return NextResponse.json({ error: 'Text too short' }, { status: 400 });
        }

        const result = analyzeGeoScore(text);

        return NextResponse.json({ success: true, ...result });

    } catch (error) {
        return NextResponse.json({ error: 'GEO Analysis failed' }, { status: 500 });
    }
}
