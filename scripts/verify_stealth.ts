
const GPT4_FINGERPRINTS = [
    { regex: /\b(delve into|tapestry of|testament to|landscape of|realm of)\b/gi, weight: 25, msg: 'GPT-4 Tic: "Delve/Tapestry/Landscape". Dead giveaway.' },
    { regex: /\b(it is important to note|crucial to understand|underscores the)\b/gi, weight: 20, msg: 'GPT-4 Tic: Excessive signposting.' },
    { regex: /\b(comprehensive|meticulous|nuanced|multifaceted)\b/gi, weight: 15, msg: 'GPT-4 Tic: "CV words". Use simpler alternatives.' },
    { regex: /\b(in conclusion|to summarize|ultimately)\b/gi, weight: 10, msg: 'GPT-4 Tic: Robotic conclusion structure.' },
    // SPANISH PATTERNS
    { regex: /\b(cabe destacar|es importante señalar|en el ámbito de|un sinfín de|tapiz de|testimonio de|paisaje de)\b/gi, weight: 25, msg: 'GPT-4 Tic (ES): Frases cliché de IA.' },
    { regex: /\b(meticulosamente|integral|polifacético|matizado|profundizar en)\b/gi, weight: 15, msg: 'GPT-4 Tic (ES): Palabras "de currículum".' },
    { regex: /\b(en conclusión|en resumen|por último)\b/gi, weight: 10, msg: 'GPT-4 Tic (ES): Estructura robótica.' },
    // NEWS/ACADEMIC STYLE PATTERNS (New Layer - Aggressive)
    { regex: /\b(un hito que marca|no solo .* sino que también|juega un papel crucial|en lo que respecta a|por su parte)\b/gi, weight: 20, msg: 'AI News Style: Estructura periodística robótica.' },
    { regex: /\b(un paso de gigante|marcando el inicio|en contraste con|si bien es cierto)\b/gi, weight: 15, msg: 'AI News Style: Conectores formales excesivos.' },
    { regex: /\b(un equipo internacional de|marca una nueva era|se basa en|lo más prometedor de|no está exenta de desafíos|según los benchmarks|a diferencia de los modelos anteriores)\b/gi, weight: 20, msg: 'AI News Style: Frases de relleno académico.' }
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
    // Sensory Details (Stricter List)
    { id: 'sensory', regex: /\b(hedor|fragancia|aspereza|suavidad|crujido|susurro|escalofrío|sudor|lágrimas|carcajada|gritos|viscoso|áspero|tibia|helado)\b/gi, bonus: 10 },
    // Specificity (Nerfed - removed capitalized words check as it matches titles too easily)
    // { id: 'specifics', regex: /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g, bonus: 3 }, 
    // Imperfection
    { id: 'imperfection', regex: /\b(bueno,|vaya,|quizás,|mira,|oye,|pues,|verdad\?|recórcholis|joder|genial|guay|che,|onda,|vale,)\b/yi, bonus: 8 },
    // Fragments
    { id: 'fragment', regex: /^([A-Z][^.!?]+[.!?])$/gm, bonus: 4 }
];

const COMMON_AI_CLICHES = [
    { regex: /\b(hito monumental|abre la puerta a|misterios de la|un paso más cerca|revolucionar la|cambio de paradigma|en el mundo de|hoy en día|cada vez más)\b/gi, weight: 15, msg: 'IA Cliché: Frase robótica común.' },
    { regex: /\b(tapiz|sinfín|abanico de|paisaje|reino)\b/gi, weight: 10, msg: 'IA Cliché: Metáfora forzada.' }
];

function calculateEntropy(text: string): number {
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

function analyzeTextV9(text: string) {
    const issues: any[] = [];
    let baseScore = 100;

    const applyPatterns = (patterns: any[], type: string) => {
        patterns.forEach(p => {
            const matches = [...text.matchAll(p.regex)];
            if (matches.length > 0) {
                const deduction = matches.length * p.weight;
                console.log(`Matched ${type}: "${p.regex}" x${matches.length} (-${deduction})`);
                baseScore -= deduction;
                issues.push({ type, name: type.toUpperCase(), count: matches.length, severity: deduction > 15 ? 'high' : 'medium', locations: matches.map(m => m.index), suggestion: p.msg });
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
        if (count > 0) vitalityBonus += Math.min(count * signal.bonus, 15); // Capped at 15
    });
    console.log(`Vitality Bonus: +${vitalityBonus}`);

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgLength = sentences.reduce((acc, s) => acc + s.split(/\s+/).length, 0) / sentences.length;
    const commas = (text.match(/,/g) || []).length;
    const commaDensity = commas / sentences.length;

    // ADVERB DENSITY Check (New)
    const adverbs = (text.match(/\b\w+mente\b/gi) || []).length;
    const adverbDensity = adverbs / sentences.length;
    if (adverbDensity > 0.5) { // More than 1 adverb every 2 sentences
        console.log(`Adverb Penalty (Density: ${adverbDensity.toFixed(2)}): -15`);
        baseScore -= 15;
    }

    // RELATIVE CLAUSE Check (New)
    const relatives = (text.match(/\b(que|cual|quien|cuyo)\b/gi) || []).length;
    const relativeDensity = relatives / sentences.length;
    if (relativeDensity > 1.5) {
        console.log(`Relative Clause Penalty (Density: ${relativeDensity.toFixed(2)}): -15`);
        baseScore -= 15;
    }

    // Transition Density Check
    const transitionStarts = sentences.filter(s => /^(Sin embargo|Por otro lado|Además|Adicionalmente|En conclusión|Por lo tanto|Así pues|No obstante)/i.test(s.trim())).length;
    const transitionDensity = transitionStarts / sentences.length;
    if (transitionDensity > 0.15) {
        console.log(`Transition Penalty (Density: ${transitionDensity.toFixed(2)}): -20`);
        baseScore -= 20;
    }

    if (commaDensity > 2.5) baseScore -= 15;

    const entropy = calculateEntropy(text);
    if (entropy < 65) baseScore -= 15;
    else if (entropy > 90 && transitionDensity > 0.1) baseScore -= 15;

    const variance = sentences.reduce((acc, s) => {
        const len = s.split(/\s+/).length;
        return acc + Math.pow(len - avgLength, 2);
    }, 0) / sentences.length;
    const stdDev = Math.sqrt(variance);

    console.log(`Sentences: ${sentences.length}, AvgLen: ${avgLength.toFixed(1)}, StdDev: ${stdDev.toFixed(1)}, Entropy: ${entropy.toFixed(1)}`);

    if (stdDev < 6 && sentences.length > 1) {
        baseScore -= 25;
        console.log(`Variance Penalty: -25`);
    }

    let finalScore = baseScore + vitalityBonus;

    if (commaDensity > 3 && entropy < 70) finalScore = Math.min(finalScore, 65);

    // Soulless Penalty
    if (vitalityBonus === 0 && issues.length === 0) {
        console.log(`Soulless Penalty: -25`);
        finalScore -= 25;
    }

    finalScore = Math.min(100, Math.max(0, finalScore));
    return finalScore;
}


const articles = [
    `El Universo Invisible: El Mapa Más Detallado de la Materia Oscura Revela la "Telaraña Cósmica"
Sección: Ciencia y Espacio Fecha: 31 de enero de 2026

Un equipo internacional de astrofísicos ha publicado esta semana el mapa más extenso y preciso de la distribución de materia oscura en el universo conocido, un hito que marca una nueva era en la cosmología. La materia oscura, una sustancia misteriosa que compone aproximadamente el 85% de la masa del universo pero que no interactúa con la luz, ha sido históricamente imposible de observar directamente. Sin embargo, utilizando técnicas avanzadas de "lente gravitacional débil", los científicos han logrado trazar su ubicación observando cómo su inmensa gravedad distorsiona la luz de galaxias lejanas que viajan hacia la Tierra.

El resultado es una imagen visualmente impactante que confirma la teoría de la "telaraña cósmica". El mapa muestra vastos filamentos de materia oscura que conectan cúmulos de galaxias a través de distancias de millones de años luz, dejando grandes vacíos en el medio. Estos filamentos actúan como una estructura de andamiaje sobre la cual se acumula la materia visible, como estrellas y gas. "Por fin estamos viendo el esqueleto invisible del universo", declaró la Dra. Elena Rossi, investigadora principal del proyecto.

Este descubrimiento no solo valida los modelos actuales del Big Bang, sino que también ofrece nuevas pistas sobre la "tensión de Hubble", un problema persistente en la física donde diferentes mediciones de la tasa de expansión del universo no coinciden. Al comprender mejor dónde se encuentra la masa, los científicos esperan resolver si nuestra comprensión de la gravedad necesita ser modificada o si existe una "nueva física" aún por descubrir. Los datos recopilados serán fundamentales para las próximas misiones espaciales europeas y estadounidenses programadas para finales de la década.`,

    `2. El Reloj del Juicio Final se Mueve: A Solo 85 Segundos de la Medianoche
Sección: Actualidad Mundial / Política Fecha: 30 de enero de 2026

El Bulletin of the Atomic Scientists ha anunciado su ajuste anual al "Reloj del Juicio Final" (Doomsday Clock), moviendo las manecillas hacia adelante hasta marcar 85 segundos para la medianoche. Este es el punto más cercano a una catástrofe global teórica desde la creación del reloj en 1947, superando el récord anterior establecido en 2024. La decisión del comité científico y de seguridad refleja una creciente preocupación por la convergencia de tres amenazas existenciales: la escalada de tensiones nucleares, la crisis climática y, por primera vez con tanto peso, la inteligencia artificial desregulada.

En su comunicado oficial, el comité citó la falta de progreso en los tratados de control de armas nucleares entre las grandes potencias y la modernización de los arsenales atómicos como el factor principal. A esto se suma que el año 2025 cerró como el más caluroso registrado, con desastres climáticos que han desplazado a millones de personas, aumentando la inestabilidad geopolítica en regiones ecuatoriales. "No estamos actuando con la velocidad ni la unidad que la situación requiere", advirtió el presidente del Boletín durante la rueda de prensa en Washington D.C.

Un factor novedoso en el informe de 2026 es la inclusión específica de la biotecnología avanzada y la IA autónoma como multiplicadores de riesgo. Los expertos advierten que la capacidad de generar desinformación masiva o de automatizar sistemas de armamento podría desencadenar conflictos accidentales en cuestión de minutos. El movimiento del reloj no es una predicción inevitable, sino una llamada de atención urgente a los líderes mundiales y a la ciudadanía para que exijan políticas de mitigación de riesgos inmediatas antes de que el daño sea irreversible.`,

    `3. Revolución Médica: Las Vacunas Personalizadas contra el Cáncer Muestran 90% de Eficacia en Fase 3
Sección: Salud y Medicina Fecha: 29 de enero de 2026

La oncología ha dado un paso de gigante esta semana con la publicación de los resultados preliminares de la Fase 3 de los ensayos clínicos de la nueva vacuna personalizada contra el melanoma y el cáncer de páncreas, desarrollada conjuntamente por gigantes farmacéuticos y laboratorios de biotecnología. Los datos sugieren una eficacia del 90% en la prevención de la recurrencia de tumores en pacientes posquirúrgicos, un número que supera con creces las expectativas más optimistas de la comunidad médica.

La tecnología detrás de este avance se basa en el ARN mensajero (ARNm), la misma plataforma que se hizo famosa durante la pandemia de COVID-19, pero con un enfoque radicalmente personalizado. El proceso implica tomar una muestra del tumor de un paciente, secuenciar su ADN para identificar mutaciones específicas y únicas de ese cáncer, y luego diseñar una vacuna que instruya al sistema inmunológico del paciente para que busque y destruya exclusivamente las células que contengan esas mutaciones. "Básicamente, le estamos dando al sistema inmune un cartel de 'se busca' con la foto exacta del enemigo", explicó el Dr. Aris Baras, oncólogo líder del estudio.

Lo más prometedor de este enfoque es que los efectos secundarios reportados han sido mínimos, similares a los de una vacuna contra la gripe, en contraste con los devastadores efectos de la quimioterapia tradicional. Si bien el tratamiento es actualmente costoso y requiere semanas de preparación individualizada, los expertos creen que la automatización de los procesos de laboratorio reducirá los costos y tiempos de espera para 2028, haciendo que esta terapia sea accesible para los sistemas de salud pública. Las agencias reguladoras de EE. UU. y Europa ya han iniciado procesos de revisión acelerada para su aprobación comercial.`,

    `4. Adiós al Viernes Laboral: Reino Unido y España Consolidan la Semana de 4 Días
Sección: Economía y Sociedad Fecha: 28 de enero de 2026

Tras dos años de programas piloto y debates legislativos, enero de 2026 marca el inicio oficial de la Ley de Tiempo Laboral Flexible en Reino Unido y España, consolidando la semana laboral de cuatro días (32 horas) sin reducción salarial para grandes sectores de la economía. Lo que comenzó como un experimento social post-pandemia se ha transformado en una política de estado, impulsada por datos que demuestran que la reducción de horas no solo mejora la salud mental de los trabajadores, sino que mantiene o incluso aumenta la productividad empresarial.

Las estadísticas finales de los pilotos realizados en 2024 y 2025 mostraron una reducción del 40% en los niveles de estrés de los empleados y una disminución del 55% en las bajas por enfermedad. Sorprendentemente para los críticos de la medida, los ingresos de las empresas participantes se mantuvieron estables, y en muchos casos del sector tecnológico y creativo, aumentaron debido a una mayor retención de talento y una fuerza laboral más descansada y enfocada. "No se trata de trabajar menos, sino de trabajar mejor y vivir más", comentó la Ministra de Trabajo durante la firma del decreto.

Sin embargo, la transición no está exenta de desafíos. Sectores como la hostelería, la sanidad y la manufactura enfrentan dificultades logísticas para implementar el sistema sin aumentar los costos operativos al tener que contratar más personal para cubrir turnos rotativos. Para mitigar esto, los gobiernos han introducido incentivos fiscales y subsidios temporales para las PYMES que adopten el modelo. El mundo observa atentamente: si estas economías logran sostener el modelo a largo plazo, podrían desencadenar un cambio global en la estructura del trabajo tal como la conocemos desde la Revolución Industrial.`,

    `5. La IA Generativa Alcanza el Nivel de "Razonamiento Casi Humano"
Sección: Tecnología e Inteligencia Artificial Fecha: 27 de enero de 2026

El laboratorio de investigación OpenAI ha sacudido nuevamente el mundo tecnológico con el lanzamiento de su modelo más reciente, denominado internamente "Project Q-Next". Según los benchmarks estandarizados publicados ayer, este modelo es el primero en superar consistentemente a expertos humanos en pruebas de razonamiento complejo, planificación estratégica a largo plazo y creatividad abstracta, alcanzando lo que los ingenieros denominan "Nivel de Razonamiento Casi Humano" (Near-Human Reasoning).

A diferencia de los modelos anteriores que funcionaban prediciendo la siguiente palabra más probable en una frase, el nuevo sistema posee una arquitectura que le permite "pensar antes de hablar". Esto significa que puede evaluar múltiples escenarios, verificar sus propios hechos y corregir errores lógicos internamente antes de generar una respuesta final. En demostraciones en vivo, la IA fue capaz de escribir código de software completo para una aplicación compleja, depurarlo y optimizarlo sin intervención humana, así como diagnosticar casos médicos raros con mayor precisión que un equipo de doctores promedio.

Este avance plantea interrogantes éticos y económicos inmediatos. Mientras que las industrias celebran el potencial aumento de productividad, los sindicatos de guionistas, programadores y analistas financieros han expresado su alarma ante la posibilidad de una sustitución laboral acelerada. Los reguladores de la Unión Europea ya han convocado una cumbre de emergencia para febrero con el fin de discutir si las leyes actuales de IA son suficientes para contener un modelo con capacidades de autonomía y razonamiento tan avanzadas. La era de la IA como simple "asistente" parece estar llegando a su fin, dando paso a la era de la IA como "colaborador autónomo".`
];

articles.forEach((text, index) => {
    console.log(`\n--- Article ${index + 1} ---`);
    console.log(`Analyzing: "${text.substring(0, 50)}..."`);
    const score = analyzeTextV9(text);
    console.log(`Final Score: ${score}`);
    console.log(`Verdict: ${score < 50 ? 'AI' : score < 80 ? 'Mixed' : 'Human'}`);
});
