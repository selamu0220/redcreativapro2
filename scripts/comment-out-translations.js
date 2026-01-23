/**
 * Comment out the translations block for 'aprende-escribir-articulos-blog-perfectos-ia'
 * To enable build and debug duplicate key issue
 */
const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

console.log('Reading blog-data.ts...');
let content = fs.readFileSync(BLOG_PATH, 'utf-8');

const id = "id: 'aprende-escribir-articulos-blog-perfectos-ia'";
const startIdx = content.indexOf(id);

if (startIdx === -1) {
    console.log("ID not found!");
    process.exit(1);
}

// Find translations block in this article
const transStart = content.indexOf("translations: {", startIdx);

if (transStart !== -1) {
    console.log("Found translations block at index:", transStart);
    // Find the end
    let braceCount = 0;
    let endIdx = -1;
    let started = false;
    for (let i = transStart; i < content.length; i++) {
        if (content[i] === '{') {
            braceCount++;
            started = true;
        } else if (content[i] === '}') {
            braceCount--;
            if (started && braceCount === 0) {
                endIdx = i + 1;
                break;
            }
        }
    }

    if (endIdx !== -1) {
        // Comment out
        const block = content.substring(transStart, endIdx);
        // Replace with commented block
        // We can just rename the key to "translations_debug" to avoid duplicate key error
        // But if it's strictly checked, that might fail type check.

        // Let's just remove it.
        const newContent = content.substring(0, transStart) + "/* " + block + " */" + content.substring(endIdx);

        fs.writeFileSync(BLOG_PATH, newContent);
        console.log("Commented out translations block!");
    } else {
        console.log("Could not find end of translations block.");
    }
} else {
    console.log("Translations block NOT found for this article!");
}
