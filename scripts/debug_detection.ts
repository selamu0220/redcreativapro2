
// Mock logic from app/api/stealth-analyze/route.ts

const GPT4_FINGERPRINTS = [
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

const CLAUDE_FINGERPRINTS = [
    { regex: /\b(foster|cultivate|harness|leverage)\b/gi, weight: 15, msg: 'Claude Tic: Corporate inspirational jargon.' },
    { regex: /\b(keen sense of|profound impact|stark contrast)\b/gi, weight: 15, msg: 'Claude Tic: Dramatic adjectives.' },
    { regex: /\b(while it is true that|however|on the other hand)\b/gi, weight: 10, msg: 'Claude Tic: Excessive unexpected balancing.' },
    // SPANISH PATTERNS
    { regex: /\b(fomentar|aprovechar|cultivar|impulsar el potencial)\b/gi, weight: 15, msg: 'Claude Tic (ES): Jerga corporativa.' },
    { regex: /\b(profundo impacto|marcado contraste|sentido agudo)\b/gi, weight: 15, msg: 'Claude Tic (ES): Adjetivos dramáticos.' },
    { regex: /\b(si bien es cierto que|por otro lado|sin embargo, es fundamental)\b/gi, weight: 12, msg: 'Claude Tic (ES): Balanceo excesivo.' }
];

const GEMINI_FINGERPRINTS = [
    { regex: /\b(additionally|moreover|furthermore)\b/gi, weight: 12, msg: 'Gemini Tic: List-like transition words.' },
    { regex: /\b(key takeaway|vital aspect|essential component)\b/gi, weight: 12, msg: 'Gemini Tic: Consultant speak.' },
    // SPANISH PATTERNS
    { regex: /\b(adicionalmente|además de esto|asimismo|por añadidura)\b/gi, weight: 12, msg: 'Gemini Tic (ES): Palabras de transición de lista.' },
    { regex: /\b(aspecto vital|componente esencial|clave principal|punto clave)\b/gi, weight: 12, msg: 'Gemini Tic (ES): Habla de consultor.' }
];

const HUMAN_VITALITY_SIGNALS = [
    { id: 'sensory', regex: /\b(hedor|fragancia|aspereza|suavidad|crujido|susurro|escalofrío|sudor|lágrimas|carcajada|gritos|viscoso|áspero|tibia|helado)\b/gi, bonus: 10 },
    { id: 'imperfection', regex: /\b(bueno,|vaya,|quizás,|mira,|oye,|pues,|verdad\?|recórcholis|joder|genial|guay|che,|onda,|vale,)\b/yi, bonus: 8 },
    { id: 'fragment', regex: /^([A-Z][^.!?]+[.!?])$/gm, bonus: 4 }
];

const COMMON_AI_CLICHES = [
    { regex: /\b(hito monumental|avance monumental|abre la puerta a|misterios de la|un paso más cerca|revolucionar la|cambio de paradigma|en el mundo de|hoy en día|cada vez más)\b/gi, weight: 15, msg: 'IA Cliché: Frase robótica común.' },
    { regex: /\b(tapiz|sinfín|abanico de|paisaje|reino)\b/gi, weight: 10, msg: 'IA Cliché: Metáfora forzada.' }
];

function calculateEntropy(text: string): number {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    if (words.length < 10) return 0;
    const trigrams: any = {};
    let repetitions = 0;
    for (let i = 0; i < words.length - 2; i++) {
        const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        if (trigrams[trigram]) repetitions++;
        trigrams[trigram] = (trigrams[trigram] || 0) + 1;
    }
    const repetitionRate = repetitions / words.length;
    return Math.max(0, 100 - (repetitionRate * 500));
}

function analyzeTextV9(text: string) {
    console.log(`\nAnalyzing Text (${text.length} chars)...`);
    const issues: any[] = [];
    let baseScore = 100;

    const applyPatterns = (patterns: any[], type: string) => {
        patterns.forEach((p: any) => {
            const matches = [...text.matchAll(p.regex)];
            if (matches.length > 0) {
                const deduction = matches.length * p.weight;
                console.log(`[MATCH] ${type}: "${p.regex}" x${matches.length} (-${deduction})`);
                baseScore -= deduction;
                issues.push({ type, name: type.toUpperCase() });
            }
        });
    };

    applyPatterns(GPT4_FINGERPRINTS, 'gpt4_fingerprint');
    applyPatterns(CLAUDE_FINGERPRINTS, 'claude_fingerprint');
    applyPatterns(GEMINI_FINGERPRINTS, 'gemini_fingerprint');
    applyPatterns(COMMON_AI_CLICHES, 'ai_cliche');

    let vitalityBonus = 0;
    HUMAN_VITALITY_SIGNALS.forEach(signal => {
        const count = (text.match(signal.regex) || []).length;
        if (count > 0) {
            const bonus = Math.min(count * signal.bonus, 15);
            vitalityBonus += bonus;
            console.log(`[BONUS] Vitality (${signal.id}): +${bonus}`);
        }
    });

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgLength = sentences.reduce((acc, s) => acc + s.split(/\s+/).length, 0) / sentences.length;
    const commas = (text.match(/,/g) || []).length;
    const commaDensity = commas / sentences.length;

    // Adverb Density
    const adverbs = (text.match(/\b\w+mente\b/gi) || []).length;
    const adverbDensity = adverbs / sentences.length;
    console.log(`Adverb Density: ${adverbDensity.toFixed(2)} (Count: ${adverbs})`);
    if (adverbDensity > 0.2) { // LOWERED from 0.35
        baseScore -= 15;
        console.log(`[PENALTY] Adverb Overload: -15`);
    }

    // HYPERBOLE CHECK (New)
    const hyperbole = (text.match(/\b(drásticamente|excepcionales|monumental|sin precedentes|innegable|crucial|fundamental)\b/gi) || []).length;
    if (hyperbole > 1) {
        baseScore -= 15;
        console.log(`[PENALTY] AI Hyperbole: -15 (Count: ${hyperbole})`);
    }

    // Relative Clause Density
    const relatives = (text.match(/\b(que|cual|quien|cuyo)\b/gi) || []).length;
    const relativeDensity = relatives / sentences.length;
    console.log(`Relative Density: ${relativeDensity.toFixed(2)} (Count: ${relatives})`);
    if (relativeDensity > 1.1) {
        baseScore -= 15;
        console.log(`[PENALTY] Relative Clause Stacking: -15`);
    }

    // Transition Density
    const transitionStarts = sentences.filter(s => /^(Sin embargo|Por otro lado|Además|Adicionalmente|En conclusión|Por lo tanto|Así pues|No obstante)/i.test(s.trim())).length;
    const transitionDensity = transitionStarts / sentences.length;
    console.log(`Transition Density: ${transitionDensity.toFixed(2)}`);
    if (transitionDensity > 0.15) {
        baseScore -= 20;
        console.log(`[PENALTY] Robotic Flow: -20`);
    }

    // Comma Density
    console.log(`Comma Density: ${commaDensity.toFixed(2)}`);
    if (commaDensity > 2.5) {
        baseScore -= 15;
        console.log(`[PENALTY] Complexity Overload: -15`);
    }

    // Entropy
    const entropy = calculateEntropy(text);
    console.log(`Entropy: ${entropy.toFixed(1)}`);
    if (entropy < 65) {
        baseScore -= 15;
        console.log(`[PENALTY] Low Entropy: -15`);
    }

    // Burstiness
    const variance = sentences.reduce((acc, s) => {
        const len = s.split(/\s+/).length;
        return acc + Math.pow(len - avgLength, 2);
    }, 0) / sentences.length;
    const stdDev = Math.sqrt(variance);
    console.log(`StdDev: ${stdDev.toFixed(2)}`);

    if (stdDev < 6 && sentences.length > 1) {
        baseScore -= 25;
        console.log(`[PENALTY] Flatline Rhythm: -25`);
    }

    let finalScore = baseScore + vitalityBonus;

    // Caps
    if (commaDensity > 3 && entropy < 70) {
        console.log(`[CAP] Comma/Entropy Cap Applied (Max 65)`);
        finalScore = Math.min(finalScore, 65);
    }

    // Soulless Penalty
    if (vitalityBonus === 0 && issues.length === 0) {
        console.log(`[PENALTY] Soulless (Perfect Grammar, No Soul): -25`);
        finalScore -= 25;
    }

    finalScore = Math.min(100, Math.max(0, finalScore));
    console.log(`\nFINAL SCORE: ${Math.round(finalScore)}`);

    return finalScore;
}

const testText = "Esta semana, la oncología ha presenciado un avance monumental: la publicación de los resultados preliminares de la Fase 3 de una nueva vacuna personalizada. Desarrollada por una alianza entre gigantes farmacéuticos y laboratorios de biotecnología, la vacuna apunta al melanoma y al cáncer de páncreas. Los datos son excepcionales, sugiriendo una eficacia del 90% en la prevención de la recurrencia tumoral en pacientes posquirúrgicos. Este porcentaje supera drásticamente las expectativas más optimistas de la comunidad médica.";

analyzeTextV9(testText);
