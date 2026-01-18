/**
 * StealthWrite™ Analysis API v7 - TRAINED WITH CNN & EL PAÍS
 * 
 * Trained on:
 * - CNN Reporting (Human narrative/sensory details)
 * - El País journalism (Human formal structures)
 * - ChatGPT outputs (AI patterns)
 * 
 * Target: AI text ~5-20%, Human journalism ~70-95%
 */

import { NextRequest, NextResponse } from 'next/server';

// ============= AI PATTERNS (learnt from ChatGPT samples) =============

const AI_SIGNATURE_WORDS = [
    // ChatGPT's favorite Spanish words
    'quizás', 'quizá', 'innegable', 'indiscutible', 'innumerables',
    'infranqueable', 'inquebrantable', 'inestimable', 'invaluable',
    'fundamental', 'fundamentales', 'humanitaria', 'humanitario',
    'contradicción', 'paradigma', 'holístico', 'integral',
    // Elevated adjectives AI overuses
    'significativo', 'considerable', 'sustancial', 'notable',
    'destacable', 'relevante', 'pertinente', 'trascendental',
    // English AI words
    'vibrant', 'tapestry', 'delve', 'crucial', 'pivotal', 'robust',
    'seamless', 'comprehensive', 'cutting-edge', 'innovative',
    'leverage', 'utilize', 'facilitate', 'optimize', 'synergy',
    'underscore', 'showcase', 'foster', 'cultivate'
];

const AI_PATTERNS = [
    // ChatGPT Spanish openers
    /^(el|la|los|las) \w+ (es|son|representa),? (quizás?|sin duda)/gi,
    /\b(vivimos en|nos encontramos|estamos ante) (un|una)/gi,
    /\b(cada uno de|todos y cada uno)\b/gi,

    // AI's dramatic rhetorical style
    /\b(no es (simplemente|solo|solamente|únicamente))\b/gi,
    /\b(más allá de|trasciende|va más allá)\b/gi,
    /\b((barrera|obstáculo|desafío) (para|al|del))\b/gi,

    // Classic AI transitions (HEAVILY penalized)
    /\b(y sin embargo|pero sin embargo|no obstante)\b/gi,
    /\b(por otro lado|por otra parte|en contraste)\b/gi,
    /\b(es decir|en otras palabras|dicho de otro modo)\b/gi,
    /\b(en este (sentido|contexto|marco))\b/gi,
    /\b(cabe (destacar|mencionar|señalar))\b/gi,
    /\b(es importante (destacar|señalar|mencionar))\b/gi,

    // AI's favorite formal phrases
    /\b(derechos humanos fundamentales)\b/gi,
    /\b(crisis (humanitaria|climática|económica))\b/gi,
    /\b(violación de (los )?derechos)\b/gi,
    /\b(era (moderna|actual|contemporánea|digital))\b/gi,
    /\b(mundo (actual|moderno|globalizado))\b/gi,
    /\b(desarrollo (sostenible|humano|económico))\b/gi,

    // AI's abstract generalizations
    /\b(la (humanidad|sociedad|comunidad) (necesita|requiere|debe))\b/gi,
    /\b(millones de personas)\b/gi,
    /\b(el planeta|nuestro planeta)\b/gi,

    // English AI patterns
    /\b(it is (worth noting|important to note|essential))\b/gi,
    /\b(in today's (world|society|fast-paced))\b/gi,
    /\b(cannot be (overstated|understated|ignored))\b/gi,
    /\b(furthermore|moreover|additionally|consequently)\b/gi,

    // ===== v6: Generic attribution (AI never names specific sources) =====
    /\b(expertos (consideran|señalan|advierten|coinciden))\b/gi,
    /\b(analistas (señalan|consideran|advierten|observan))\b/gi,
    /\b(fuentes de prensa|según fuentes)\b/gi,
    /\b(organizaciones de derechos humanos (han|reportaron))\b/gi,
    /\b(algunos (gobiernos|expertos|analistas) han expresado)\b/gi,
    /\b(observadores (internacionales|políticos))\b/gi,

    // ===== v6: Vague temporal markers (AI can't give specific dates) =====
    /\b(recientemente|próximamente)\b/gi,
    /\b(en las (primeras|últimas) semanas)\b/gi,
    /\b(en los (próximos|últimos) (días|meses|años))\b/gi,
    /\b(en un futuro (cercano|próximo))\b/gi,

    // ===== v6: AI's hedging language =====
    /\b(podría (tener|afectar|generar|provocar|enfrentar))\b/gi,
    /\b(lo que (representa|refleja|evidencia|demuestra) un)\b/gi,
    /\b(lo que podría (significar|implicar))\b/gi,

    // ===== v6: AI's complex bureaucratic noun phrases =====
    /\b(mecanismo (diplomático|multilateral|estructurado))\b/gi,
    /\b(estrategias (económicas|políticas) resilientes)\b/gi,
    /\b(horizonte (global|internacional) turbulento)\b/gi,
    /\b(rivalidad geoeconómica)\b/gi,
    /\b(fragmentación de (alianzas|mercados))\b/gi,
    /\b(tensiones (geopolíticas|comerciales|económicas) recientes)\b/gi,
    /\b(implicaciones (económicas|políticas) más allá)\b/gi,

    // ===== v7: Gemini 1.5 Pro patterns (The "Opinionated Analyst") =====
    /\b(conclusión:)\b/gi, // AI loves explicit labels
    /\b(aquí reside la (tragedia|paradoja|ironía))\b/gi,
    /\b(pero no nos engañemos)\b/gi, // Preachy conversational marker
    /\b(la paradoja de)\b/gi, // Structured subheader style
    /\b(el factor (X|Y|Z))\b/gi, // "The X Factor" style subheaders
    /\b(han pasado (exactamente|apenas|casi) .+ desde que)\b/gi, // Perfect narrative opener
    /\b(despliegue de fuerza bruta)\b/gi,
    /\b(despliegue de fuerza bruta)\b/gi,
    /\b(ajuste de cuentas geopolítico)\b/gi,

    // ===== v7.3: Gemini 3.0 Pro patterns (The "Sophisticated Academic") =====
    /\b(elefante en la habitación)\b/gi, // Classic translated idiom
    /\b(tablero de ajedrez (geopolítico|mundial|global))\b/gi,
    /\b(piedra angular)\b/gi,
    /\b(tapiz complejo)\b/gi,
    /\b(abiert[oa] de par en par)\b/gi,
    /\b(sin precedentes)\b/gi, // Overused
    /\b(un camino sin retorno)\b/gi,
    /\b(transformación sin precedentes)\b/gi,
    /\b(encrucijada histórica)\b/gi,
    /\b(ocaso .+ horizonte)\b/gi, // Poetic AI nonsense
];

// ============= HUMAN PATTERNS (learnt from El País & CNN) =============

const HUMAN_JOURNALISM_PATTERNS = [
    // Direct quotes with attribution (STRONG human signal)
    /["«][^"»]+["»"],?\s+(ha|han)\s+(dicho|afirmado|declarado|escrito|anunciado|señalado)/gi,
    /["«][^"»]+["»"],?\s+(explica|añade|asegura|sostiene|apunta)/gi,
    /,\s+(ha|han)\s+(dicho|afirmado|escrito|anunciado)\s+\w+/gi,
    // Messy/Narrative quotes (CNN style)
    /(gritó|dijo) (algo como|que) ["«]/gi,
    /["«].*["»] - (dijo|apuntó|señaló)/gi,

    // Attribution patterns
    /según\s+(fuentes|el|la|los|las|\w+)/gi,
    /\b(ha explicado|ha asegurado|ha añadido)\s+a\s+\w+/gi,
    /en (declaraciones|conversación|entrevista) (a|con)/gi,
    /\b(contó|dijo|declaró) a (CNN|El País|la prensa)\b/gi, // Specific media attribution

    // Social media references (very human)
    /en (la red social |su cuenta de )?(X|Twitter|Instagram)/gi,
    /ha (escrito|publicado|anunciado) en (X|Twitter)/gi,

    // Specific temporal markers (journalism style)
    /\b(este (sábado|domingo|lunes|martes|miércoles|jueves|viernes))\b/gi,
    /\b(esta (mañana|tarde|noche|semana|madrugada))\b/gi,
    /\b(a (última|primera) hora de (la tarde|la mañana))\b/gi,
    /\b(el pasado (lunes|martes|miércoles|jueves|viernes|sábado|domingo))\b/gi,

    // Real names with titles (journalism)
    /\b(el|la) (presidente|primer ministro|ministro|canciller|secretario)\s+[A-ZÁÉÍÓÚ]\w+/gi,
    /\b[A-ZÁÉÍÓÚ][a-záéíóúñ]+\s+(García|López|Martínez|Sánchez|Fernández|González)/gi,
    // Specific Demographics (CNN style)
    /de \d+ años/gi,
    /de \d+ meses/gi,
];

const HUMAN_NARRATIVE_PATTERNS = [
    // Narrative flow/Chaos (CNN style)
    /\b(de repente|de pronto|súbitamente)\b/gi,
    /\b(en ese (momento|instante))\b/gi,
    /\b(todo se volvió (borroso|negro|oscuro|confuso))\b/gi,
    /\b(los siguientes momentos (pasaron|fueron))\b/gi,
    /\b(se (lanzó|tiró|abalanzó))\b/gi,
    /\b(cara a cara con)\b/gi,
];

const HUMAN_SENSORY_PATTERNS = [
    // Sensory/Physical details (AI is usually abstract)
    /\b(sentí|sintió|sentía) (que|un|una|el|la)\b/gi,
    /\b(olor|aroma|hedor) a\b/gi,
    /\b(ruido|sonido|grito|llanto)\b/gi,
    /\b(ojos (cerrados|abiertos|llorosos))\b/gi,
    /\b(piel|manos|dedos|cuerpo)\b/gi,
    /\b(respirar|aliento|aire|pecho)\b/gi,
];

const HUMAN_OPINION_PATTERNS = [
    // Personal voice (opinion columns)
    /\b(yo creo|pienso que|me parece|en mi opinión)\b/gi,
    /\b(he leído|he visto|he oído|me (intriga|sorprende|preocupa))\b/gi,
    /\b(sinceramente|francamente|honestamente)\b/gi,
    /\b(no consigo (entender|creer|ver))\b/gi, // Frustration/Emotion

    // Rhetorical questions
    /¿[^?]+\?/g,

    // Informal/colloquial mixed with formal
    /\b(ojalá|vaya|vamos|bueno)\b/gi,
    /\b(por las buenas o las malas)\b/gi,

    // Literary/cultural references
    /\b(como (escribió|dijo|decía|explicaba))\s+[A-ZÁÉÍÓÚ]\w+/gi,
    /\b(el (libro|poema|texto|ensayo) de)\s+[A-ZÁÉÍÓÚ]\w+/gi,
];

const TIPS: Record<string, string> = {
    aiStyle: 'Tu texto tiene el estilo típico de ChatGPT.',
    transitions: 'Elimina transiciones genéricas como "sin embargo", "no obstante".',
    formal: 'Vocabulario demasiado formal. Simplifica.',
    noVoice: 'Falta tu voz personal. Añade opiniones o imperfecciones.',
    noQuotes: 'Añade citas directas o narrativa.',
    noSpecifics: 'Añade datos específicos: nombres, edades, lugares exactos.',
    perfect: 'Texto demasiado pulido. Añade naturalidad y detalles sensoriales.',
};

// ============= ANALYSIS FUNCTIONS =============

function getSentences(text: string): string[] {
    return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
}

function getWords(text: string): string[] {
    return text.toLowerCase().replace(/[^a-záéíóúüñ\s]/gi, '').split(/\s+/).filter(w => w.length > 2);
}

function countPatternMatches(text: string, patterns: RegExp[]): number {
    let count = 0;
    for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) count += matches.length;
    }
    return count;
}

function countSignatureWords(text: string): number {
    const lower = text.toLowerCase();
    let count = 0;
    for (const word of AI_SIGNATURE_WORDS) {
        if (lower.includes(word.toLowerCase())) count++;
    }
    return count;
}

function calculateBurstiness(sentences: string[]): number {
    // Standardize variance calculation
    const lengths = sentences.map(s => s.split(/\s+/).length);
    if (lengths.length === 0) return 0;

    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    if (mean === 0) return 0;

    const variance = lengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / lengths.length;
    const cv = Math.sqrt(variance) / mean; // Coefficient of Variation

    // Base score from variation
    let rawScore = (cv - 0.12) * 200;

    // For very short texts, CV is volatile. Dampen it towards neutral (50).
    if (sentences.length < 5) {
        return Math.min(100, Math.max(0, (rawScore * 0.5) + 30));
    }

    return Math.min(100, Math.max(0, rawScore));
}

function hasDirectQuotes(text: string): boolean {
    // Check for quoted speech patterns
    return /["«][^"»]{10,}["»]/.test(text);
}

function hasSpecificNames(text: string): boolean {
    const names = text.match(/\b[A-ZÁÉÍÓÚ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚ][a-záéíóúñ]+\b/g);
    return names !== null && names.length >= 2;
}

function hasTricolons(text: string): boolean {
    // Detects "A governs B, C governs D, and E governs F" pattern common in AI
    // Looks for repeated verb structures or noun-verb patterns in close proximity
    const tricolonPattern = /(\w+ \w+ \w+, \w+ \w+ \w+ y \w+ \w+ \w+)/;
    return tricolonPattern.test(text);
}

/**
 * MAIN ANALYSIS - v7 with CNN & El País data
 */
function analyzeText(text: string): {
    humanityScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    issues: Array<{ type: string; matches: string[]; suggestion: string; severity: number }>;
    stats: { wordCount: number; sentenceCount: number; avgSentenceLength: number };
    recommendations: string[];
} {
    const sentences = getSentences(text);
    const words = getWords(text);
    const issues: Array<{ type: string; matches: string[]; suggestion: string; severity: number }> = [];

    // ============= METRICS =============

    // AI indicators (penalties)
    const aiPatternCount = countPatternMatches(text, AI_PATTERNS);
    const aiWordCount = countSignatureWords(text);
    const burstiness = calculateBurstiness(sentences);

    // Human indicators (bonuses)
    const journalismPatterns = countPatternMatches(text, HUMAN_JOURNALISM_PATTERNS);
    const opinionPatterns = countPatternMatches(text, HUMAN_OPINION_PATTERNS);
    const narrativePatterns = countPatternMatches(text, HUMAN_NARRATIVE_PATTERNS);
    const sensoryPatterns = countPatternMatches(text, HUMAN_SENSORY_PATTERNS);

    const hasQuotes = hasDirectQuotes(text);
    const hasNames = hasSpecificNames(text);
    const hasTricolon = hasTricolons(text);
    const hasQuestions = (text.match(/\?/g) || []).length;

    // Gemini 1.5/3.0 acts like a "columnist"
    // If it has headers like "Conclusión:" or "La Paradoja de...", it's likely AI.
    const hasAIHeaders = /\b(Conclusión:|La Paradoja de|El Factor|La Encrucijada|El Auge|Un (Cambio|Espejo|Camino) (de|Sin))\b/i.test(text);

    // Personal voice check
    const hasPersonalVoice = /\b(yo|creo|pienso|opino|me parece|I\s|my\s|think|believe)\b/i.test(text);

    // ============= SCORING =============

    // Unified Logic: Base score derived from structure (Burstiness)
    // "Innocent until proven guilty" approach, but strict on robotic patterns.
    // Burstiness gives the "Vitality" score.
    let score = Math.max(20, burstiness * 0.6);

    // Bonus for short, informal texts (likely human chat)
    if (words.length < 150 && burstiness > 30) {
        score += 15;
    }

    // === PENALTIES (AI signals) ===

    // AI patterns are HEAVILY penalized
    if (aiPatternCount > 0) {
        const penalty = Math.min(aiPatternCount * 12, 60); // Increased penalty weight
        score -= penalty;

        issues.push({
            type: 'aiStyle',
            matches: [],
            suggestion: TIPS.aiStyle,
            severity: penalty,
        });
    }

    // AI signature words
    if (aiWordCount > 0) {
        const penalty = Math.min(aiWordCount * 8, 40); // Increased penalty
        score -= penalty;

        issues.push({
            type: 'formal',
            matches: [],
            suggestion: TIPS.formal,
            severity: penalty,
        });
    }

    // No personal voice penalty
    // We scale the requirements based on length
    // Short texts (<200w) don't NEED voice. Long texts (>400w) WITHOUT voice are suspicious.
    if (!hasPersonalVoice && words.length > 300) {
        // Only penalize if it's substantial text without a soul
        score -= 20;

        issues.push({
            type: 'noVoice',
            matches: [],
            suggestion: TIPS.noVoice,
            severity: 20,
        });
    }

    // No specifics - Scaled Check
    // A 1000 word article without a single Name is 100% AI.
    // A 50 word text without a name is normal.
    if (!hasNames && words.length > 250) {
        score -= 15;
        issues.push({
            type: 'noSpecifics',
            matches: [],
            suggestion: TIPS.noSpecifics,
            severity: 15,
        });
    }

    // Gemini Tricolons (Perfect Parallelism)
    if (hasTricolon) {
        score -= 25;
        issues.push({
            type: 'aiStyle',
            matches: ['Estructura paralela perfecta (Tricolon)'],
            suggestion: 'Rompe la simetría perfecta de las frases. Es muy robótica.',
            severity: 25
        });
    }

    // Gemini Headers (Dead giveaway)
    if (hasAIHeaders) {
        score -= 30;
        issues.push({
            type: 'aiStyle',
            matches: ['Encabezados estilo IA'],
            suggestion: 'Evita títulos como "Conclusión" o "La Paradoja de". Parecen generados.',
            severity: 30
        });
    }

    // Low burstiness (uniform AI sentences)
    if (burstiness < 25) {
        const penalty = (25 - burstiness) * 1.0; // Stricter penalty
        score -= penalty;
    }

    // === BONUSES (Human signals) ===

    // Journalism patterns (STRONG human signal)
    if (journalismPatterns > 0) {
        const bonus = Math.min(journalismPatterns * 15, 45);
        score += bonus;
    }

    // Opinion/personal patterns
    if (opinionPatterns > 0) {
        const bonus = Math.min(opinionPatterns * 12, 35);
        score += bonus;
    }

    // Narrative Flow (NEW - CNN)
    if (narrativePatterns > 0) {
        const bonus = Math.min(narrativePatterns * 10, 30);
        score += bonus;
    }

    // Sensory Details (NEW - CNN)
    if (sensoryPatterns > 0) {
        const bonus = Math.min(sensoryPatterns * 10, 30);
        score += bonus; // Big bonus for sensory details
    }

    // Direct quotes (very human)
    if (hasQuotes) {
        score += 25;
    }

    // Specific names (journalism indicator)
    if (hasNames) {
        score += 15;
    }

    // Questions (engagement)
    if (hasQuestions > 0) {
        score += Math.min(hasQuestions * 8, 20);
    }

    // Parenthetical asides (human touch)
    const parentheticals = (text.match(/\([^)]{3,50}\)/g) || []).length;
    if (parentheticals > 0) {
        score += Math.min(parentheticals * 6, 15);
    }

    // ============= FINAL SCORE =============

    const humanityScore = Math.round(Math.max(0, Math.min(100, score)));

    // Risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (humanityScore >= 60 && issues.length <= 1) {
        riskLevel = 'low';
    } else if (humanityScore >= 30) {
        riskLevel = 'medium';
    } else {
        riskLevel = 'high';
    }

    // Sort issues
    const sortedIssues = [...issues].sort((a, b) => b.severity - a.severity);

    // Generate recommendations
    const recommendations: string[] = [];
    for (const issue of sortedIssues.slice(0, 3)) {
        if (issue.type === 'aiStyle') recommendations.push('Elimina frases de transición genéricas');
        if (issue.type === 'formal') recommendations.push('Simplifica el vocabulario');
        if (issue.type === 'noVoice') recommendations.push('Añade tu voz personal y detalles sensoriales');
        if (issue.type === 'noSpecifics') recommendations.push('Añade nombres, edades y datos específicos');
        if (issue.type === 'noQuotes') recommendations.push('Incluye citas directas o diálogo');
    }

    return {
        humanityScore,
        riskLevel,
        issues: sortedIssues,
        stats: {
            wordCount: words.length,
            sentenceCount: sentences.length,
            avgSentenceLength: Math.round(words.length / Math.max(sentences.length, 1)),
        },
        recommendations: [...new Set(recommendations)],
    };
}

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (text.length < 50) {
            return NextResponse.json({ error: 'Text must be at least 50 characters' }, { status: 400 });
        }

        const analysis = analyzeText(text);

        return NextResponse.json({
            success: true,
            ...analysis,
            meta: { version: '7.0', engine: 'stealth-trained-cnn' },
        });

    } catch (error) {
        console.error('[StealthAnalyze] Error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
