
const aiResponses = [
    // Standard case
    "Claro, aquí tienes la actualización. :::UPDATE_DOCUMENT::: Contenido del documento :::UPDATE_DOCUMENT:::",
    // Double wrapped (what might be happening)
    ":::UPDATE_DOCUMENT::: :::UPDATE_DOCUMENT::: Contenido doble :::UPDATE_DOCUMENT::: :::UPDATE_DOCUMENT:::",
    // Nested/Messy
    "Info extra. :::UPDATE_DOCUMENT::: Párrafo 1. :::UPDATE_DOCUMENT::: Párrafo 2. :::UPDATE_DOCUMENT::: Fin.",
    // Correct case
    ":::UPDATE_DOCUMENT:::Contenido limpio:::UPDATE_DOCUMENT:::"
];

aiResponses.forEach((aiResponse, i) => {
    console.log(`\n--- Test Case ${i + 1} ---`);
    console.log("Original:", aiResponse);

    // Logic from WriterChatPanel.tsx
    const updateMatch = aiResponse.match(/:::UPDATE_DOCUMENT:::([\s\S]*?):::UPDATE_DOCUMENT:::/);

    if (updateMatch) {
        // NEW LOGIC
        const newContent = updateMatch[1].replace(/:::UPDATE_DOCUMENT:::/g, '').trim();
        console.log("Extracted Content (Cleaned):", `"${newContent}"`);

        // NEW CLEANER LOGIC
        let cleanResponse = aiResponse.replace(/:::UPDATE_DOCUMENT:::[\s\S]*?:::UPDATE_DOCUMENT:::/g, '').trim();
        if (!cleanResponse) cleanResponse = "He actualizado el documento con tus cambios.";

        console.log("Chat Display:", `"${cleanResponse}"`);
    } else {
        console.log("No Match Found");
    }
});
