const text = `**Opción 1: Más natural y fluida ** > "¡Qué tal todo, hermano!" **Opción 2: Un poco más formal ** > "¿Qué tal todo?" **Opción 3: Manteniendo la jerga juvenil ** > "¡Qué tal todo, tío!" > "¡Qué tal todo, man!" **¿Por qué cambiar "bro"?** Aunque "bro" se entiende perfectamente...`;

const cleaner = (text) => {
    let clean = text;

    // Caso A: Formato "**Opción 1... > "Texto"**" (El que reportó el usuario)
    const optionMatch = clean.match(/(?:Opción|Option)\s*1.*?>\s*["“]([^"”]+)["”]/i);
    if (optionMatch && optionMatch[1]) {
        return optionMatch[1].trim();
    }

    // Caso B
    if (clean.match(/Opción 2|Option 2/i)) {
        const match = clean.match(/(?:Opción|Option)\s*1:?\s*(.*?)(?=(?:Opción|Option)\s*2)/is);
        if (match && match[1]) {
            let candidate = match[1].replace(/\*\*.*?\*\*/g, '').replace(/>/g, '').trim();
            const quoteMatch = candidate.match(/^["“](.*)["”]$/);
            if (quoteMatch) candidate = quoteMatch[1];
            return candidate;
        }
    }

    // Standard cleaning fallback (simulated)
    clean = clean.replace(/\*\*¿Por qué.*?\*\*[\s\S]*/i, '');
    return clean;
};

console.log("Input:", text.substring(0, 50) + "...");
console.log("Output:", cleaner(text));

if (cleaner(text) === "¡Qué tal todo, hermano!") console.log("✅ PASSED");
else console.log("❌ FAILED");
