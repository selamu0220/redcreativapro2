const text = `** Más natural y estándar (Ideal para amigos o conocidos)** 
¡Qué tal todo, hermano!`;

const cleaner = (text) => {
    let clean = text;
    // New Generic Rule: Remove lines that are just Bold headers
    clean = clean.replace(/^\*\*.*\**$/gim, '') // Remove lines starting with ** and ending with ** or similar
        .replace(/^\*\*.*\*\* ?:?$/gim, '');

    clean = clean.trim();
    return clean;
};

console.log("Input:", text);
console.log("Output:", cleaner(text));

if (cleaner(text) === "¡Qué tal todo, hermano!") console.log("✅ PASSED");
else console.log("❌ FAILED");
