/**
 * StealthWrite™ Analysis Engine v10.0 - GOD MODE MULTILINGUAL
 * Refactored into a shared library for better testability and maintenance.
 */

// ============= FINGERPRINT DEFINITIONS =============

interface Fingerprint {
    regex: RegExp;
    weight?: number;
    bonus?: number;
    msg: string;
}

// Helper to ensure global flag
const ensureGlobal = (regex: RegExp) => {
    return regex.flags.includes('g') ? regex : new RegExp(regex.source, regex.flags + 'g');
};

const GPT4_FINGERPRINTS: Fingerprint[] = [
    { regex: /\b(delve into|tapestry of|testament to|landscape of|realm of)\b/gi, weight: 25, msg: 'GPT-4 Tic: "Delve/Tapestry/Landscape". Dead giveaway.' },
    { regex: /\b(it is important to note|crucial to understand|underscores the)\b/gi, weight: 20, msg: 'GPT-4 Tic: Excessive signposting.' },
    { regex: /\b(comprehensive|meticulous|nuanced|multifaceted)\b/gi, weight: 15, msg: 'GPT-4 Tic: "CV words". Use simpler alternatives.' },
    { regex: /\b(in conclusion|to summarize|ultimately)\b/gi, weight: 10, msg: 'GPT-4 Tic: Robotic conclusion structure.' },
    // SPANISH PATTERNS
    { regex: /\b(cabe destacar|es importante señalar|en el ámbito de|un sinfín de|tapiz de|testimonio de|paisaje de)\b/gi, weight: 25, msg: 'GPT-4 Tic (ES): Frases cliché de IA.' },
    { regex: /\b(meticulosamente|integral|polifacético|matizado|profundizar en)\b/gi, weight: 15, msg: 'GPT-4 Tic (ES): Palabras "de currículum".' },
    { regex: /\b(en conclusión|en resumen|por último)\b/gi, weight: 10, msg: 'GPT-4 Tic (ES): Estructura robótica.' },
    // NEWS/ACADEMIC STYLE PATTERNS (New Layer)
    { regex: /\b(un hito que marca|no solo .* sino que también|juega un papel crucial|en lo que respecta a|por su parte)\b/gi, weight: 20, msg: 'AI News Style: Estructura periodística robótica.' },
    { regex: /\b(un paso de gigante|marcando el inicio|en contraste con|si bien es cierto)\b/gi, weight: 15, msg: 'AI News Style: Conectores formales excesivos.' }
];

const CLAUDE_FINGERPRINTS: Fingerprint[] = [
    { regex: /\b(foster|cultivate|harness|leverage)\b/gi, weight: 15, msg: 'Claude Tic: Corporate inspirational jargon.' },
    { regex: /\b(keen sense of|profound impact|stark contrast)\b/gi, weight: 15, msg: 'Claude Tic: Dramatic adjectives.' },
    { regex: /\b(while it is true that|however|on the other hand)\b/gi, weight: 10, msg: 'Claude Tic: Excessive unexpected balancing.' },
    // SPANISH PATTERNS
    { regex: /\b(fomentar|aprovechar|cultivar|impulsar el potencial)\b/gi, weight: 15, msg: 'Claude Tic (ES): Jerga corporativa.' },
    { regex: /\b(profundo impacto|marcado contraste|sentido agudo)\b/gi, weight: 15, msg: 'Claude Tic (ES): Adjetivos dramáticos.' },
    { regex: /\b(si bien es cierto que|por otro lado|sin embargo, es fundamental)\b/gi, weight: 12, msg: 'Claude Tic (ES): Balanceo excesivo.' }
];

const GEMINI_FINGERPRINTS: Fingerprint[] = [
    { regex: /\b(additionally|moreover|furthermore)\b/gi, weight: 12, msg: 'Gemini Tic: List-like transition words.' },
    { regex: /\b(key takeaway|vital aspect|essential component)\b/gi, weight: 12, msg: 'Gemini Tic: Consultant speak.' },
    // SPANISH PATTERNS
    { regex: /\b(adicionalmente|además de esto|asimismo|por añadidura)\b/gi, weight: 12, msg: 'Gemini Tic (ES): Palabras de transición de lista.' },
    { regex: /\b(aspecto vital|componente esencial|clave principal|punto clave)\b/gi, weight: 12, msg: 'Gemini Tic (ES): Habla de consultor.' }
];

const COMMON_AI_CLICHES: Fingerprint[] = [
    { regex: /\b(hito monumental|avance monumental|abre la puerta a|misterios de la|un paso más cerca|revolucionar la|cambio de paradigma|en el mundo de|hoy en día|cada vez más)\b/gi, weight: 15, msg: 'IA Cliché: Frase robótica común.' },
    { regex: /\b(tapiz|sinfín|abanico de|paisaje|reino)\b/gi, weight: 10, msg: 'IA Cliché: Metáfora forzada.' }
];

const WIKI_STYLE_FINGERPRINTS: Fingerprint[] = [
    { regex: /^\d{1,2} de [a-z]+ de \d{4} [–-] .+, (el|la) [a-z]+ de \d+ años/mi, weight: 40, msg: 'AI Wiki-Intro: Estructura robótica "Fecha - Nombre, Edad".' },
    { regex: /conocido por (desafiar|ser|haber)/gi, weight: 15, msg: 'AI Context: Explicación innecesaria tipo Wikipedia.' },
    { regex: /marcado un nuevo hito/gi, weight: 20, msg: 'AI Cliché: "Marcado un nuevo hito".' }
];

const DRAMATIC_AI_FINGERPRINTS: Fingerprint[] = [
    { regex: /\b(icónico|monstruosa|traicioneras|implacable|mortal|desafiar la muerte|vértigo absoluto)\b/gi, weight: 15, msg: 'AI Drama: Adjetivos excesivamente dramáticos.' },
    { regex: /\b(espectáculo donde la belleza se mezcla con el terror|monstruo|infierno|abismo)\b/gi, weight: 20, msg: 'AI Drama: Metáforas extremas.' }
];

const MORBID_OBSESSION_FINGERPRINTS: Fingerprint[] = [
    { regex: /\b(muerte segura|muerte instantánea|huesos pulverizados|órganos reventados|sangre salpica|cadáver|cuerpo destrozado|agonía)\b/gi, weight: 25, msg: 'AI Morbidity: Obsesión gráfica con la muerte/daño.' },
    { regex: /\b(sin posibilidad de supervivencia|consecuencia inevitable|muerte violenta)\b/gi, weight: 20, msg: 'AI Doom: Fatalismo robótico.' }
];

const JOURNALISM_PATTERNS: Fingerprint[] = [
    { regex: /By .+ (CNN|BBC|Reuters|AP|AFP)/gi, bonus: 40, msg: 'Journalism: Recognized News Source Byline.' },
    { regex: /Updated \d+ hr ago/gi, bonus: 30, msg: 'Journalism: News Timestamp format.' },
    { regex: /\d+ min read/gi, bonus: 20, msg: 'Journalism: Metadata format.' }
];

interface VitalitySignal {
    id: string;
    regex: RegExp;
    bonus: number;
}

const HUMAN_VITALITY_SIGNALS: Record<'es' | 'en', VitalitySignal[]> = {
    es: [
        { id: 'sensory', regex: /\b(hedor|fragancia|aspereza|suavidad|crujido|susurro|escalofrío|sudor|lágrimas|carcajada|gritos|viscoso|áspero|tibia|helado)\b/gi, bonus: 10 },
        { id: 'imperfection', regex: /\b(bueno,|vaya,|quizás,|mira,|oye,|pues,|verdad\?|recórcholis|joder|genial|guay|che,|onda,|vale,)\b/yi, bonus: 8 },
        { id: 'fragment', regex: /^([A-Z][^.!?]+[.!?])$/gm, bonus: 4 }
    ],
    en: [
        { id: 'sensory', regex: /\b(stench|fragrance|roughness|smoothness|crackling|whisper|shiver|sweat|tears|laughter|scream|slimy|rough|lukewarm|icy)\b/gi, bonus: 10 },
        { id: 'imperfection', regex: /\b(well,|look,|listen,|y know|kinda|sorta|maybe,|actually,|basically,|literally,|frankly,)\b/yi, bonus: 8 },
        { id: 'idiom', regex: /\b(break the ice|bite the bullet|hit the sack|under the weather|spill the beans|piece of cake)\b/gi, bonus: 12 }
    ]
};

// ============= INTERFACES =============

export interface AnalysisIssue {
    type: string;
    name: string;
    count?: number;
    severity: 'low' | 'medium' | 'high';
    locations?: number[];
    suggestion: string;
}

export interface AnalysisResult {
    score: number;
    verdict: string;
    perplexity: number;
    issues: AnalysisIssue[];
    meta: {
        language: 'es' | 'en';
        journalismBonus: boolean;
        version: string;
        engine: string;
    };
    stats: {
        sentences: number;
        avgSentenceLength: number;
        variance: number;
    };
}

// ============= UTILS =============

export function calculateEntropy(text: string): number {
    // N-Gram Repetition Analysis
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    if (words.length < 10) return 0;

    const trigrams: Record<string, number> = {};
    let repetitions = 0;

    for (let i = 0; i < words.length - 2; i++) {
        const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        if (trigrams[trigram]) repetitions++;
        trigrams[trigram] = (trigrams[trigram] || 0) + 1;
    }

    const repetitionRate = repetitions / words.length;
    return Math.max(0, 100 - (repetitionRate * 500));
}

export function detectLanguage(text: string): 'es' | 'en' {
    const spanishWords = /\b(el|la|los|las|en|de|que|y|es|por|con|para)\b/gi;
    const englishWords = /\b(the|and|is|in|of|that|it|to|for|with|on)\b/gi;

    const esCount = (text.match(spanishWords) || []).length;
    const enCount = (text.match(englishWords) || []).length;

    return esCount > enCount ? 'es' : 'en';
}

// ============= MAIN ANALYSIS FUNCTION =============

export function analyzeText(text: string): AnalysisResult {
    const lang = detectLanguage(text);
    const issues: AnalysisIssue[] = [];
    let baseScore = 100;

    // JOURNALISM BYPASS (Immediate Boost for verified structures)
    let journalismBoost = 0;
    JOURNALISM_PATTERNS.forEach(p => {
        if (p.regex.test(text)) {
            journalismBoost += (p.bonus || 0);
        }
    });

    // 1. ADVANCED FINGERPRINTING
    const applyPatterns = (patterns: Fingerprint[], type: string) => {
        patterns.forEach(p => {
            const globalRegex = ensureGlobal(p.regex);
            const matches = [...text.matchAll(globalRegex)];
            if (matches.length > 0) {
                const deduction = matches.length * (p.weight || 10);
                baseScore -= deduction;
                issues.push({
                    type: type,
                    name: type.toUpperCase(),
                    count: matches.length,
                    severity: deduction > 15 ? 'high' : 'medium',
                    locations: matches.map(m => m.index!),
                    suggestion: p.msg
                });
            }
        });
    };

    applyPatterns(GPT4_FINGERPRINTS, 'gpt4_fingerprint');
    applyPatterns(CLAUDE_FINGERPRINTS, 'claude_fingerprint');
    applyPatterns(GEMINI_FINGERPRINTS, 'gemini_fingerprint');
    applyPatterns(COMMON_AI_CLICHES, 'ai_cliche');

    // V10 patterns are mostly ES currently. Keeping them global but they won't trigger much in EN.
    applyPatterns(WIKI_STYLE_FINGERPRINTS, 'wiki_ai');
    applyPatterns(DRAMATIC_AI_FINGERPRINTS, 'dramatic_ai');
    applyPatterns(MORBID_OBSESSION_FINGERPRINTS, 'morbid_ai');

    // 2. HUMAN VITALITY V2 (Language Aware)
    let vitalityBonus = 0;
    const signals = HUMAN_VITALITY_SIGNALS[lang] || HUMAN_VITALITY_SIGNALS.es;

    signals.forEach((signal: VitalitySignal) => {
        const count = (text.match(signal.regex) || []).length;
        if (count > 0) vitalityBonus += Math.min(count * signal.bonus, 15);
    });

    // 3. MORPHOLOGICAL ANALYSIS
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgLength = sentences.reduce((acc, s) => acc + s.split(/\s+/).length, 0) / (sentences.length || 1);

    const commas = (text.match(/,/g) || []).length;
    const commaDensity = commas / (sentences.length || 1);

    // ADVERB DENSITY Check (Language Aware for -mente vs -ly)
    let adverbs = 0;
    if (lang === 'es') {
        adverbs = (text.match(/\b\w+mente\b/gi) || []).length;
    } else {
        adverbs = (text.match(/\b\w+ly\b/gi) || []).length;
    }

    const adverbDensity = adverbs / (sentences.length || 1);
    if (adverbDensity > 0.2) {
        baseScore -= 15;
        issues.push({ type: 'morphology', name: 'ADVERB OVERLOAD', severity: 'medium', suggestion: lang === 'es' ? 'Abuso de adverbios (-mente).' : 'Too many adverbs (-ly).' });
    }

    if (lang === 'es') {
        // ES-Specific checks
        const relatives = (text.match(/\b(que|cual|quien|cuyo)\b/gi) || []).length;
        const relativeDensity = relatives / (sentences.length || 1);
        if (relativeDensity > 1.1) {
            baseScore -= 15;
            issues.push({ type: 'morphology', name: 'RELATIVE CLAUSE STACKING', severity: 'high', suggestion: 'Demasiadas oraciones subordinadas.' });
        }

        const transitionStarts = sentences.filter(s => /^(Sin embargo|Por otro lado|Además|Adicionalmente|En conclusión|Por lo tanto|Así pues|No obstante)/i.test(s.trim())).length;
        if (transitionStarts / (sentences.length || 1) > 0.15) {
            baseScore -= 20;
            issues.push({ type: 'structure', name: 'ROBOTIC FLOW', severity: 'high', suggestion: 'Demasiados conectores lógicos.' });
        }
    } else {
        // EN-Specific checks
        const transitionStarts = sentences.filter(s => /^(However|Moreover|Furthermore|In conclusion|Therefore|Thus)/i.test(s.trim())).length;
        if (transitionStarts / (sentences.length || 1) > 0.15) {
            baseScore -= 20;
            issues.push({ type: 'structure', name: 'ROBOTIC FLOW', severity: 'high', suggestion: 'Too many robotic transition words.' });
        }
    }

    if (commaDensity > 2.5) {
        baseScore -= 15;
        issues.push({
            type: 'morphology',
            name: 'COMPLEXITY OVERLOAD',
            severity: 'medium',
            suggestion: 'Tus frases son demasiado complejas (muchas comas).'
        });
    }

    // 4. STATISTICAL DEEP DIVE
    const entropy = calculateEntropy(text);
    if (entropy < 65) {
        baseScore -= 15;
        issues.push({
            type: 'entropy',
            name: 'LOW ENTROPY',
            severity: 'high',
            suggestion: 'Vocabulario predecible.'
        });
    }

    // Burstiness
    const variance = sentences.reduce((acc, s) => {
        const len = s.split(/\s+/).length;
        return acc + Math.pow(len - avgLength, 2);
    }, 0) / (sentences.length || 1);
    const stdDev = Math.sqrt(variance);

    if (stdDev < 6 && sentences.length > 1) {
        baseScore -= 25;
        issues.push({
            type: 'burstiness',
            name: 'FLATLINE RHYTHM',
            severity: 'high',
            suggestion: 'Tus frases miden casi lo mismo.'
        });
    }

    // 5. FINAL SCORING
    if (journalismBoost > 0) {
        baseScore += journalismBoost;
    }

    let finalScore = baseScore + vitalityBonus;

    // Strict Cap for pure AI
    if (commaDensity > 3 && entropy < 70) finalScore = Math.min(finalScore, 65);

    // V10 KILL SWITCH (For User's Specific AI Styles)
    const heavyAiMatches = issues.filter(i => ['WIKI_AI', 'DRAMATIC_AI', 'MORBID_AI'].includes(i.name)).length;
    if (heavyAiMatches >= 1) {
        finalScore = Math.min(finalScore, 40);
        if (heavyAiMatches >= 2) finalScore = Math.min(finalScore, 25);
    }

    // "Soulless" Penalty logic adjustment for News
    if (vitalityBonus === 0 && issues.length === 0 && journalismBoost === 0) {
        finalScore -= 25;
    }

    // CUMULATIVE EVIDENCE PENALTY (New) (Skip if journalism)
    if (issues.length >= 3 && vitalityBonus < 5 && journalismBoost === 0) {
        finalScore -= 25;
    }

    finalScore = Math.min(100, Math.max(0, finalScore));

    let verdict = 'Indetectable';
    if (finalScore < 30) verdict = 'IA Confirmada (V10)';
    else if (finalScore < 50) verdict = 'Probablemente IA';
    else if (finalScore < 80) verdict = 'Híbrido / Sospechoso';

    return {
        score: Math.round(finalScore),
        verdict,
        perplexity: Math.round(entropy),
        issues,
        meta: {
            language: lang,
            journalismBonus: journalismBoost > 0,
            version: '10.0-GODMODE-MULTI-LANG',
            engine: 'stealth-v10'
        },
        stats: {
            sentences: sentences.length,
            avgSentenceLength: Math.round(avgLength),
            variance: Math.round(stdDev)
        }
    };
}
