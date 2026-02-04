
// Logic from WriterChatPanel.tsx
function processResponse(aiResponse) {
    console.log("--- Input ---");
    console.log(aiResponse);

    // Robust Regex v3
    // Matches: :::UPDATE_DOCUMENT:::, **:::UPDATE_DOCUMENT:::**, etc.
    const updateRegex = /(?:\*\*?)?:::\s*UPDATE[-_ ]?DOCUMENT\s*:::(?:\*\*?)?([\s\S]*?)(?:\*\*?)?:::\s*UPDATE[-_ ]?DOCUMENT\s*:::(?:\*\*?)?/i;
    const updateMatch = aiResponse.match(updateRegex);

    let extractedContent = null;
    let cleanResponse = aiResponse;

    if (updateMatch) {
        extractedContent = updateMatch[1].trim();
        // Clean response for chat display
        cleanResponse = cleanResponse.replace(updateRegex, '').trim();
        if (!cleanResponse) cleanResponse = "He actualizado el documento con tus cambios.";
    }

    // SAFETY: Final cleanup
    cleanResponse = cleanResponse.replace(/(?:\*\*?)?:::\s*UPDATE[-_ ]?DOCUMENT\s*:::(?:\*\*?)?/gi, '').trim();

    console.log("--- Extracted Content (should be the document) ---");
    console.log(extractedContent ? "✅ FOUND: " + extractedContent : "❌ NOT FOUND");

    console.log("--- Clean Response (for Chat UI) ---");
    console.log(JSON.stringify(cleanResponse)); // parsing to see hidden chars
    console.log("\n");
}

// Test Cases
const test1 = `Claro, aquí tienes la versión mejorada:
:::UPDATE_DOCUMENT:::
Este es el nuevo texto del documento.
:::UPDATE_DOCUMENT:::`;

const test2 = `He realizado los cambios.
**:::UPDATE_DOCUMENT:::**
Texto con negritas en las etiquetas.
**:::UPDATE_DOCUMENT:::**`;

const test3 = `Aquí está.
::: UPDATE DOCUMENT :::
Texto con espacios en las etiquetas.
::: UPDATE DOCUMENT :::`;

const test4 = `Solo texto conversacional, sin documento.`;

console.log("=== TEST 1: Standard Tags ===");
processResponse(test1);

console.log("=== TEST 2: Bold Tags (**:::...:::**) ===");
processResponse(test2);

console.log("=== TEST 3: Spaced Tags (::: UPDATE DOCUMENT :::) ===");
processResponse(test3);

console.log("=== TEST 4: No Tags ===");
processResponse(test4);
