const text = "# Texto corregido\nHola mundo\n** versión:** 2.0\n---";
const cleaner = (text) => {
    return text
        .replace(/^#\s*Texto corregido.*$/gim, '')
        .replace(/^\*\*.*Texto corregido.*\*\*.*$/gim, '')
        .replace(/^\*\*.*versión.*\*\*.*$/gim, '')
        .replace(/^(Aquí|Here|Esta).*:.*$/gim, '')
        .replace(/---[\s\S]*/, '')
        .trim();
};
console.log("Original:\n", text);
console.log("Cleaned:\n", cleaner(text));
if (cleaner(text) === "Hola mundo") console.log("✅ PASSED");
else console.log("❌ FAILED");
