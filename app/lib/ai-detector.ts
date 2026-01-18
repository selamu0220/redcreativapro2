/**
 * Local AI Text Detector v2 - Enhanced with QuillBot-inspired metrics
 * Zero external dependencies, 100% local, never expires
 * 
 * Key detection methods:
 * 1. PERPLEXITY - How predictable/surprising the word choices are
 * 2. BURSTINESS - Variation in sentence structure and length
 * 3. FORMALITY - Overly formal/robotic tone detection
 * 4. CREATIVITY - Literary devices, personal examples, variation
 * 5. RHYTHM - Syntax variety and structural patterns
 */

// ============= AI PATTERN DETECTION =============

// Overused AI words (QuillBot research)
const AI_OVERUSED_WORDS = [
    'vibrant', 'tapestry', 'embark', 'delve', 'crucial', 'pivotal', 'robust',
    'seamless', 'comprehensive', 'cutting-edge', 'innovative', 'leverage',
    'utilize', 'facilitate', 'optimize', 'enhance', 'streamline', 'dynamic',
    'holistic', 'synergy', 'paradigm', 'ecosystem', 'landscape', 'realm',
    'foster', 'underscore', 'nuanced', 'multifaceted', 'intricate',
];

// Spanish AI overused words
const AI_OVERUSED_WORDS_ES = [
    'vibrante', 'innovador', 'integral', 'holístico', 'optimizar', 'potenciar',
    'robusto', 'dinámico', 'sinérgico', 'paradigma', 'ecosistema', 'panorama',
    'fundamental', 'esencial', 'primordial', 'indispensable', 'sin precedentes',
    'piedra angular', 'en este contexto', 'cabe destacar', 'es menester',
];

// ============= NEW: STRUCTURAL AI PATTERNS =============

// Headers that signal AI listicle/essay structure
const AI_STRUCTURAL_HEADERS = [
    /^#{1,3}\s*(conclusión|conclusion|resumen|summary):/im,
    /^#{1,3}\s*\d+\.\s+[A-ZÁÉÍÓÚ]/gm,  // Numbered headers like "## 1. El Hecho:"
    /^\d+\.\s+[A-ZÁÉÍÓÚ][^\n]+:/gm,    // "1. El Hecho:" style
    /conclusión:\s*[¿?]/i,              // "Conclusión: ¿Qué sigue?"
    /\?qué\s+sigue\s+(ahora|después)\?/i,
];

// Dramatic openers typical of AI
const AI_DRAMATIC_PATTERNS = [
    /marcó un antes y un después/gi,
    /han pasado (exactamente )?\d+ días/gi,
    /en un (movimiento|giro) (sorpresivo|inesperado|histórico)/gi,
    /cambio de paradigma/gi,
    /punto de inflexión/gi,
    /hito histórico/gi,
    /momento crucial/gi,
    /sin precedentes/gi,
];

// AI cliché metaphors (from training data)
const AI_CLICHE_METAPHORS = [
    /elefante en la habitación/gi,
    /tablero de ajedrez (geopolítico|político|internacional)/gi,
    /tapiz (complejo )?tejido/gi,
    /piedra angular/gi,
    /oro (azul|negro|blanco)/gi,
    /puerta (abierta )?de par en par/gi,
    /corriente salvaje/gi,
    /tragedia griega/gi,
    /calma antes de la tormenta/gi,
    /terreno inexplorado/gi,
    /vacío de (poder|liderazgo)/gi,
];

// News article AI patterns
const AI_NEWS_PATTERNS = [
    /a continuación,?\s+(desglosamos|analizamos|explicamos)/gi,
    /para (entender|comprender) ("[^"]+"|lo que está pasando)/gi,
    /qué (está|sigue) pasando (realmente|ahora)/gi,
    /las claves (de|para)/gi,
    /puntos clave/gi,
    /lo que (debes|necesitas) saber/gi,
    /en (este|el) (artículo|análisis)(,)? (exploraremos|analizaremos|veremos)/gi,
];

// Tricolon patterns (rule of 3) - very AI
const AI_TRICOLON_PATTERN = /([^.,]+)\s*,\s*([^.,]+)\s*y\s*([^.,]+)/g;

// Filler phrases that signal AI writing
const AI_FILLER_PATTERNS = [
    // English patterns
    /\b(it'?s worth noting that|it is important to note|in conclusion|to summarize|in summary)\b/gi,
    /\b(furthermore|moreover|additionally|consequently|therefore|thus|hence)\b/gi,
    /\b(in terms of|when it comes to|with regard to|in the context of)\b/gi,
    /\b(a wide range of|a variety of|a number of|a significant amount of)\b/gi,
    /\b(plays a (crucial|vital|important|key|significant) role)\b/gi,
    /\b(it can be (said|argued|noted|observed) that)\b/gi,
    /\b(this (ensures|allows|enables|facilitates|promotes))\b/gi,
    /\b(overall|ultimately|essentially|basically|fundamentally)\b/gi,
    /\b(in today'?s (world|society|age|era|digital landscape))\b/gi,
    /\b(whether you'?re a|whether it'?s)\b/gi,
    /\b(not only .+ but also)\b/gi,
    /\b(the (fact|reality|truth) (is|remains) that)\b/gi,
];

// Spanish filler patterns
const AI_FILLER_PATTERNS_ES = [
    /\b(es importante (destacar|mencionar|señalar|notar) que)\b/gi,
    /\b(en (conclusión|resumen|definitiva|síntesis))\b/gi,
    /\b(por (consiguiente|tanto|ende|lo tanto))\b/gi,
    /\b(además|asimismo|igualmente|de igual manera)\b/gi,
    /\b(cabe (destacar|mencionar|señalar|resaltar))\b/gi,
    /\b(una (amplia|gran) variedad de)\b/gi,
    /\b(juega un papel (crucial|fundamental|importante|clave))\b/gi,
    /\b(en términos de|en lo que respecta a|en cuanto a)\b/gi,
    /\b(en el (mundo|panorama|contexto) actual)\b/gi,
    /\b(no solo .+ sino también)\b/gi,
];

// ============= HUMAN WRITING INDICATORS =============

// Literary devices that indicate human writing
const LITERARY_DEVICES = [
    /[.!?]["']?\s+[A-ZÁÉÍÓÚ]/g,  // Varied sentence starters
    /\.\.\./g,                    // Ellipsis for effect
    /[—–]/g,                      // Em/en dashes
    /[!?]{2,}/g,                  // Multiple punctuation for emphasis
    /\b(like|as if|as though)\b/gi, // Similes
    /"[^"]+"/g,                   // Quoted speech
    /\([^)]+\)/g,                 // Parenthetical asides
];

// Personal/casual indicators
const PERSONAL_INDICATORS = [
    /\b(I think|I believe|I feel|in my opinion|honestly|frankly)\b/gi,
    /\b(you know|well|anyway|by the way|actually)\b/gi,
    /\b(haha|lol|jaja|wow|oh|ah|hmm|ugh)\b/gi,
    /\b(my (experience|view|take|perspective))\b/gi,
    // Contractions are more human
    /\b(don't|won't|can't|shouldn't|wouldn't|couldn't|I'm|you're|we're|they're)\b/gi,
];

// ============= INTERFACES =============

interface DetailedAnalysis {
    perplexity: number;        // 0-100, higher = more surprising/human
    burstiness: number;        // 0-100, higher = more varied/human  
    formality: number;         // 0-100, higher = more formal/AI-like
    creativity: number;        // 0-100, higher = more creative/human
    predictability: number;    // 0-100, higher = more predictable/AI-like
    structuralAI: number;      // 0-100, higher = more AI structural patterns (listicles, headers)
}

interface AnalysisResult {
    humanScore: number;
    aiScore: number;
    verdict: 'human' | 'mixed' | 'ai';
    confidence: 'low' | 'medium' | 'high';
    analysis: DetailedAnalysis;
    issues: Issue[];
    charactersAnalyzed: number;
    wordsAnalyzed: number;
}

interface Issue {
    type: 'mechanical' | 'formal' | 'impersonal' | 'uncreative' | 'predictable' | 'robotic' | 'structural';
    description: string;
    severity: 'low' | 'medium' | 'high';
}

// ============= HELPER FUNCTIONS =============

function detectLanguage(text: string): 'es' | 'en' {
    const spanishWords = text.match(/\b(de|que|en|la|el|los|las|un|una|es|por|con|para|pero|como|más)\b/gi) || [];
    const englishWords = text.match(/\b(the|is|are|was|were|have|has|been|will|would|could|and|but|or)\b/gi) || [];
    return spanishWords.length > englishWords.length ? 'es' : 'en';
}

function getSentences(text: string): string[] {
    return text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
}

function getWords(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-záéíóúüñ\s]/gi, '')
        .split(/\s+/)
        .filter(w => w.length > 2);
}

// ============= METRIC CALCULATIONS =============

/**
 * BURSTINESS: Measures variation in sentence structure and length
 * AI writing tends to have LOW burstiness (uniform sentences)
 * Human writing tends to have HIGH burstiness (varied sentences)
 */
function calculateBurstiness(sentences: string[]): number {
    if (sentences.length < 3) return 50;

    const lengths = sentences.map(s => s.split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean; // Coefficient of variation

    // Also check for variety in sentence starters
    const starters = sentences.map(s => s.split(/\s+/)[0]?.toLowerCase() || '');
    const uniqueStarters = new Set(starters).size;
    const starterVariety = uniqueStarters / sentences.length;

    // Combine metrics
    const lengthScore = Math.min(100, (cv / 0.5) * 100);
    const starterScore = starterVariety * 100;

    return Math.round((lengthScore * 0.6 + starterScore * 0.4));
}

/**
 * PERPLEXITY (approximation): Measures how surprising/predictable word choices are
 * Uses vocabulary diversity and uncommon word usage as proxy
 */
function calculatePerplexity(words: string[], text: string, lang: 'es' | 'en'): number {
    if (words.length < 20) return 50;

    // Type-Token Ratio (vocabulary diversity)
    const uniqueWords = new Set(words).size;
    const ttr = uniqueWords / words.length;

    // Check for overused AI words (predictable = AI)
    const overusedList = lang === 'es'
        ? [...AI_OVERUSED_WORDS, ...AI_OVERUSED_WORDS_ES]
        : AI_OVERUSED_WORDS;

    const textLower = text.toLowerCase();
    let overusedCount = 0;
    for (const word of overusedList) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = textLower.match(regex);
        if (matches) overusedCount += matches.length;
    }
    const overusedRatio = overusedCount / (words.length / 100);

    // Higher TTR = more surprising = more human
    // Less overused words = more surprising = more human
    const ttrScore = Math.min(100, (ttr / 0.6) * 100);
    const overusedPenalty = Math.min(50, overusedRatio * 10);

    return Math.round(Math.max(0, ttrScore - overusedPenalty));
}

/**
 * FORMALITY: Detects overly formal, academic tone
 * AI tends to be more formal; humans more casual
 */
function calculateFormality(text: string, lang: 'es' | 'en'): number {
    const patterns = lang === 'es'
        ? [...AI_FILLER_PATTERNS, ...AI_FILLER_PATTERNS_ES]
        : AI_FILLER_PATTERNS;

    let formalCount = 0;
    for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) formalCount += matches.length;
    }

    // Check for personal/casual indicators (reduces formality)
    let casualCount = 0;
    for (const pattern of PERSONAL_INDICATORS) {
        const matches = text.match(pattern);
        if (matches) casualCount += matches.length;
    }

    const words = getWords(text);
    const formalRatio = formalCount / Math.max(words.length / 50, 1);
    const casualRatio = casualCount / Math.max(words.length / 50, 1);

    // Higher = more formal = more AI-like
    const formalityScore = Math.min(100, (formalRatio * 30) - (casualRatio * 20) + 50);

    return Math.round(Math.max(0, Math.min(100, formalityScore)));
}

/**
 * NEW: STRUCTURAL AI DETECTION
 * Detects listicles, essay structure, numbered headers, dramatic openers
 * These are strong AI indicators that the original detector missed
 */
function calculateStructuralAIScore(text: string): number {
    let aiStructureScore = 0;

    // Check for AI structural headers (Conclusión:, numbered lists, etc.)
    for (const pattern of AI_STRUCTURAL_HEADERS) {
        const matches = text.match(pattern);
        if (matches) aiStructureScore += matches.length * 15;
    }

    // Check for dramatic AI openers
    for (const pattern of AI_DRAMATIC_PATTERNS) {
        const matches = text.match(pattern);
        if (matches) aiStructureScore += matches.length * 12;
    }

    // Check for cliché metaphors
    for (const pattern of AI_CLICHE_METAPHORS) {
        const matches = text.match(pattern);
        if (matches) aiStructureScore += matches.length * 10;
    }

    // Check for news article AI patterns
    for (const pattern of AI_NEWS_PATTERNS) {
        const matches = text.match(pattern);
        if (matches) aiStructureScore += matches.length * 8;
    }

    // Check for tricolon (rule of 3) - typical AI rhetorical device
    const tricolons = text.match(AI_TRICOLON_PATTERN);
    if (tricolons && tricolons.length >= 2) {
        aiStructureScore += tricolons.length * 5;
    }

    // Check for perfect listicle structure (1. 2. 3. 4.)
    const listNumbers = text.match(/^\d+\./gm);
    if (listNumbers && listNumbers.length >= 3) {
        // Sequential numbering is very AI
        const nums = listNumbers.map(n => parseInt(n));
        let sequential = 0;
        for (let i = 1; i < nums.length; i++) {
            if (nums[i] === nums[i - 1] + 1) sequential++;
        }
        if (sequential >= nums.length - 2) {
            aiStructureScore += 20;
        }
    }

    // Cap at 100
    return Math.min(100, aiStructureScore);
}

/**
 * CREATIVITY: Detects literary devices, personal examples, variety
 */
function calculateCreativity(text: string): number {
    let creativityPoints = 0;

    // Check for literary devices
    for (const pattern of LITERARY_DEVICES) {
        const matches = text.match(pattern);
        if (matches) creativityPoints += matches.length * 3;
    }

    // Punctuation variety
    const punctuation = text.match(/[.,!?;:—–\-()[\]"'¡¿]/g) || [];
    const uniquePunctuation = new Set(punctuation).size;
    creativityPoints += uniquePunctuation * 5;

    // Check for numbers and specifics (humans cite specific numbers)
    const specifics = text.match(/\b\d+(\.\d+)?(%|€|\$|años|years|days|días)?\b/g) || [];
    creativityPoints += specifics.length * 4;

    // Normalize
    const words = getWords(text);
    const score = (creativityPoints / Math.max(words.length / 20, 1)) * 10;

    return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * PREDICTABILITY: Measures rhythm and pattern repetition
 */
function calculatePredictability(sentences: string[]): number {
    if (sentences.length < 3) return 50;

    // Check if sentences follow same structure patterns
    const structures = sentences.map(s => {
        const words = s.split(/\s+/);
        // Simplified structure: first word, sentence length bucket, ends with?
        const lengthBucket = Math.floor(words.length / 5);
        return `${words[0]?.toLowerCase()}-${lengthBucket}`;
    });

    // Count repeated structures
    const structureCounts: Record<string, number> = {};
    for (const struct of structures) {
        structureCounts[struct] = (structureCounts[struct] || 0) + 1;
    }

    const repeatedStructures = Object.values(structureCounts).filter(c => c > 1).length;
    const repetitionRatio = repeatedStructures / sentences.length;

    // Higher = more predictable = more AI-like
    return Math.round(Math.min(100, repetitionRatio * 200 + 30));
}

// ============= MAIN ANALYSIS FUNCTION =============

export function analyzeText(text: string): AnalysisResult {
    const cleanText = text.trim();
    const sentences = getSentences(cleanText);
    const words = getWords(cleanText);
    const lang = detectLanguage(cleanText);

    // Minimum requirements
    if (cleanText.length < 100 || sentences.length < 2) {
        return {
            humanScore: 50,
            aiScore: 50,
            verdict: 'mixed',
            confidence: 'low',
            analysis: {
                perplexity: 50,
                burstiness: 50,
                formality: 50,
                creativity: 50,
                predictability: 50,
                structuralAI: 50,
            },
            issues: [{
                type: 'mechanical',
                description: 'Text too short for accurate analysis (min 100 chars, 2+ sentences)',
                severity: 'low',
            }],
            charactersAnalyzed: cleanText.length,
            wordsAnalyzed: words.length,
        };
    }

    // Calculate all metrics
    const burstiness = calculateBurstiness(sentences);
    const perplexity = calculatePerplexity(words, cleanText, lang);
    const formality = calculateFormality(cleanText, lang);
    const creativity = calculateCreativity(cleanText);
    const predictability = calculatePredictability(sentences);

    // NEW: Calculate structural AI score
    const structuralAI = calculateStructuralAIScore(cleanText);

    // Weighted human score calculation
    // Higher burstiness, perplexity, creativity = more human
    // Lower formality, predictability, structuralAI = more human
    let humanScore = Math.round(
        burstiness * 0.20 +
        perplexity * 0.20 +
        (100 - formality) * 0.15 +
        creativity * 0.10 +
        (100 - predictability) * 0.10 +
        (100 - structuralAI) * 0.25  // NEW: Heavy weight on structural patterns
    );

    // Apply hard penalty for strong structural AI signals
    if (structuralAI >= 40) {
        humanScore = Math.max(5, humanScore - (structuralAI - 40) * 0.5);
    }

    const aiScore = 100 - humanScore;

    // Determine verdict
    let verdict: 'human' | 'mixed' | 'ai';
    if (humanScore >= 60) verdict = 'human';
    else if (humanScore <= 40) verdict = 'ai';
    else verdict = 'mixed';

    // Determine confidence
    let confidence: 'low' | 'medium' | 'high';
    if (cleanText.length < 300 || sentences.length < 5) {
        confidence = 'low';
    } else if (cleanText.length < 800 || Math.abs(humanScore - 50) < 15) {
        confidence = 'medium';
    } else {
        confidence = 'high';
    }

    // Generate specific issues
    const issues: Issue[] = [];

    if (burstiness < 35) {
        issues.push({
            type: 'predictable',
            description: 'Predictable rhythm: sentence lengths are too uniform',
            severity: burstiness < 20 ? 'high' : 'medium',
        });
    }

    if (formality > 65) {
        issues.push({
            type: 'formal',
            description: 'Overly formal: excessive use of academic/formal phrases',
            severity: formality > 80 ? 'high' : 'medium',
        });
    }

    if (creativity < 30) {
        issues.push({
            type: 'uncreative',
            description: 'Lacks creativity: missing literary devices and personal touch',
            severity: creativity < 15 ? 'high' : 'medium',
        });
    }

    if (perplexity < 40) {
        issues.push({
            type: 'mechanical',
            description: 'Mechanical writing: predictable word choices and AI-typical vocabulary',
            severity: perplexity < 25 ? 'high' : 'medium',
        });
    }

    if (predictability > 65) {
        issues.push({
            type: 'robotic',
            description: 'Robotic formality: repetitive sentence structures',
            severity: predictability > 80 ? 'high' : 'medium',
        });
    }

    // NEW: Check for structural AI patterns
    if (structuralAI >= 30) {
        issues.push({
            type: 'structural',
            description: 'Structural AI patterns: listicle format, numbered headers, typical AI phrases like "Conclusión:", "a continuación", dramatic openers',
            severity: structuralAI >= 60 ? 'high' : structuralAI >= 40 ? 'medium' : 'low',
        });
    }

    return {
        humanScore,
        aiScore,
        verdict,
        confidence,
        analysis: {
            perplexity,
            burstiness,
            formality,
            creativity,
            predictability,
            structuralAI,
        },
        issues,
        charactersAnalyzed: cleanText.length,
        wordsAnalyzed: words.length,
    };
}
