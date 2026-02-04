import { NextRequest, NextResponse } from 'next/server';

/**
 * GEO (Generative Engine Optimization) Analyzer v3.0 - CITATION MATRIX
 * 
 * Capability:
 * - "Zero-Click" Answer Optimization (Position 0 Target)
 * - Knowledge Graph Siganl Emulation (Entity Triads)
 * - Related Question Coverage
 * - Data Density Heatmap
 */

// ============= GEO v3 SIGNAL DATASETS =============

// Entities that signal authority in Knowledge Graphs
const AUTHORITY_SIGNALS = [
    /\b(PhD|Dr\.|Prof\.)\b/g,
    /\b(Universidad|Instituto|Asociación|Organización|Fundación|Agencia)\s+[A-Z]/g,
    /\b(estudio|informe|reporte|análisis|encuesta)\s+(de|por)\s+[A-Z]/gi, // "Informe de Gartner"
    /\b(según|de acuerdo con|citando a)\s+[A-Z]/gi
];

// Patterns favored by SGE / Bing Chat for "Direct Answers"
const DIRECT_ANSWER_PATTERNS = [
    // Definition Structures
    /^(El|La|Los|Las) [\w\s]+ (es|son) (un|una|el|la|los|las) [\w\s]+ que/i,
    // "In short" summaries
    /^(En resumen|En conclusión|Básicamente),/i
];

// Related Question Starters to check "Topic Coverage"
const QUESTION_PATTERNS = [
    /\b(cómo|cuándo|dónde|por qué|qué es|cuál es)\b/gi
];

// ============= ENGINE V3 =============

function analyzeGeoScoreV3(text: string) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).length;
    let score = 0;
    const insights: any[] = [];

    // 1. DATA DENSITY (The "Information Gain" Metric)
    const numbers = (text.match(/\d+/g) || []).length;
    const properNouns = (text.match(/\b[A-Z][a-z]+\b/g) || []).filter(w => w.length > 3).length;

    // Weighted Density: Proper Nouns (Entities) are worth 2x Numbers
    const weightedDensity = ((numbers + (properNouns * 1.5)) / words) * 100;

    if (weightedDensity > 8) {
        score += 25;
        insights.push({ type: 'success', msg: 'Densidad de datos ÉLITE (>8%). Los LLMs aman esto.' });
    } else if (weightedDensity > 4) {
        score += 15;
    } else {
        insights.push({ type: 'warning', msg: 'Baja densidad de datos real. Añade más nombres, fechas y cifras.' });
    }

    // 2. KNOWLEDGE GRAPH "TRIADS" (Subject-Verb-Object Authority)
    // Heuristic: Check for sentences that contain an Authority Signal AND a Citation/Link
    let triadScore = 0;
    const hasExternalRefs = /\b(http|www\.|\.com|\.org|doi|ISBN)\b/i.test(text);

    AUTHORITY_SIGNALS.forEach(pattern => {
        if (pattern.test(text)) triadScore += 10;
    });

    if (hasExternalRefs && triadScore > 0) {
        score += 20; // Bonus for citing the expert
        insights.push({ type: 'success', msg: 'Conexiones de Knowledge Graph detectadas (Experto + Cita).' });
    } else if (triadScore === 0) {
        insights.push({ type: 'critical', msg: 'Invisible para el Knowledge Graph. Cita fuentes o expertos explícitos.' });
    }

    // 3. ZERO-CLICK OPTIMIZATION (Position 0)
    // Check if the FIRST 10% of the text contains a direct answer definition
    const introText = text.substring(0, Math.min(text.length, 500));
    const definesTerm = DIRECT_ANSWER_PATTERNS.some(p => p.test(introText));

    if (definesTerm) {
        score += 25;
        insights.push({ type: 'success', msg: 'Estructura de "Respuesta Directa" detectada al inicio (Posición 0).' });
    } else {
        insights.push({ type: 'warning', msg: 'Falta una definición directa al inicio para capturar el "Featured Snippet".' });
    }

    // 4. TOPIC COVERAGE (Related Questions)
    const questionCount = (text.match(QUESTION_PATTERNS[0]) || []).length;
    if (questionCount >= 3) {
        score += 15;
        insights.push({ type: 'success', msg: 'Cobertura de "Preguntas Relacionadas" excelente.' });
    } else {
        insights.push({ type: 'info', msg: 'Responde a más preguntas implícitas (Qué, Cómo, Por qué) para dominar el tema.' });
    }

    // 5. STRUCTURE
    const hasLists = /(- |\d+\. )/.test(text);
    const hasTable = /\|.*\|.*\|/.test(text);
    if (hasLists || hasTable) {
        score += 15;
    } else {
        insights.push({ type: 'warning', msg: 'Añade Tablas o Listas. A la IA le cuesta leer párrafos largos.' });
    }

    // FINAL NORMALIZE
    score = Math.min(100, Math.max(0, score));

    return {
        score,
        dataDensity: weightedDensity.toFixed(1),
        insights,
        metrics: {
            entities: properNouns,
            citations: hasExternalRefs,
            structure: hasLists || hasTable
        }
    };
}

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text || text.length < 50) {
            return NextResponse.json({ error: 'Text too short' }, { status: 400 });
        }

        const result = analyzeGeoScoreV3(text);

        return NextResponse.json({
            success: true,
            ...result,
            meta: { version: '3.0-CITATION', engine: 'geo-v3' }
        });

    } catch (error) {
        return NextResponse.json({ error: 'GEO Analysis failed' }, { status: 500 });
    }
}
