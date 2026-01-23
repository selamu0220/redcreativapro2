/**
 * Remove duplicate translations keys from blog-data.ts (keeping the last one)
 */
const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

console.log('Reading blog-data.ts...');
let content = fs.readFileSync(BLOG_PATH, 'utf-8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// We need to parse the objects... regex is hard for this.
// But we know the duplicate is likely in the same object block.

// Strategy:
// Match "translations: {" ... "}"
// If an object has two of these, remove the first one.

// How to detect an object boundary? "id: '...'"

// Let's iterate through the file looking for "id: '"
// Then within that scope (until next "id: '" or end of array), check for multiple "translations:"

let newContent = "";
let lastIndex = 0;
const idRegex = /id:\s*'([^']+)'/g;

// Find all matches
const matches = [];
let match;
while ((match = idRegex.exec(content)) !== null) {
    matches.push({ index: match.index, id: match[1] });
}

// Add end of file sentinel
matches.push({ index: content.length, id: "EOF" });

for (let i = 0; i < matches.length - 1; i++) {
    const current = matches[i];
    const next = matches[i + 1];

    // Get the full text of this article (approx)
    // Start from current.index (which points to start of 'id: ...')
    // But the object starts slightly before that (at '{')
    // We can assume the text between current.index and next.index belongs to this object (mostly).

    // Actually, capturing from "id:" to next "id:" is safe enough to find duplicates.

    const chunk = content.substring(current.index, next.index);

    // Count occurrences of "translations: {"
    const translationMatches = [];
    const transRegex = /translations:\s*\{/g;
    let tMatch;

    while ((tMatch = transRegex.exec(chunk)) !== null) {
        translationMatches.push(tMatch);
    }

    if (translationMatches.length > 1) {
        console.log(`Found ${translationMatches.length} translations in article ${current.id}`);

        // Remove all but the LAST one.
        // We need to be careful to remove the matching brace block for the ones we remove.
        // This is tricky.

        // Simpler approach:
        // Use string replacement on the chunk.
        // Find the first occurrence, find its end, remove it.

        let modifiedChunk = chunk;

        // Process in reverse so indices don't shift? No, we need to remove the FIRST ones.
        // So we process 0 to length-2.

        // Actually, let's just use a specific fix for the article we know failed: 'aprende-escribir-articulos-blog-perfectos-ia'
        if (current.id === 'aprende-escribir-articulos-blog-perfectos-ia') {
            console.log("Fixing specifically 'aprende-escribir-articulos-blog-perfectos-ia'");

            // We need to find the FIRST translations block and remove it.
            const firstTrans = modifiedChunk.indexOf('translations:');
            if (firstTrans !== -1) {
                // But wait, is it the one we want to keep?
                // The one at the END is usually the good one (inserted by our scripts).
                // The one at the START might be the duplicate (inherited/erroneous).

                // If there are 2, remove the first.

                // Find end of first block.
                let braceCount = 0;
                let endIdx = -1;
                let foundStart = false;

                for (let k = firstTrans; k < modifiedChunk.length; k++) {
                    if (modifiedChunk[k] === '{') {
                        braceCount++;
                        foundStart = true;
                    } else if (modifiedChunk[k] === '}') {
                        braceCount--;
                        if (foundStart && braceCount === 0) {
                            endIdx = k + 1;
                            break;
                        }
                    }
                }

                if (endIdx !== -1) {
                    // Check if there is another translations block after this
                    const secondTrans = modifiedChunk.indexOf('translations:', endIdx);
                    if (secondTrans !== -1) {
                        console.log("Removing first duplicate translations block.");
                        // Remove from firstTrans to endIdx. And maybe the trailing comma?

                        // Check for trailing comma
                        let cutEnd = endIdx;
                        if (modifiedChunk[cutEnd] === ',') cutEnd++;

                        // Reconstruct chunk
                        modifiedChunk = modifiedChunk.substring(0, firstTrans) + modifiedChunk.substring(cutEnd);

                        // Replace in content
                        // We need to be careful replacing globally.
                        // Let's just create a new content string by appending.
                    }
                }
            }
        }

        // Append modified (or original) chunk to newContent
        if (i === 0) {
            newContent += content.substring(0, current.index) + modifiedChunk;
        } else {
            newContent += modifiedChunk;
        }

        // But wait, the loop logic is flawed for reconstruction because we are slicing by Matches.
        // We need to handle the stuff BEFORE the first match.
    } else {
        if (i === 0) {
            newContent += content.substring(0, next.index);
        } else {
            newContent += chunk;
        }
    }
}

// Wait, the reconstruction logic above is buggy.
// Let's restart the loop logic.

newContent = content.substring(0, matches[0].index); // Header stuff

for (let i = 0; i < matches.length - 1; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    let chunk = content.substring(current.index, next.index);

    // Check for duplicates in this chunk
    const transMatches = [];
    const tRegex = /translations:\s*\{/g;
    let tm;
    while ((tm = tRegex.exec(chunk)) !== null) {
        transMatches.push(tm.index);
    }

    if (transMatches.length > 1) {
        console.log(`Fixing duplicate in ${current.id}`);
        // Remove the FIRST occurrence
        const start = transMatches[0];
        // Find end
        let braceCount = 0;
        let endIdx = -1;
        let started = false;
        for (let k = start; k < chunk.length; k++) {
            if (chunk[k] === '{') {
                braceCount++;
                started = true;
            } else if (chunk[k] === '}') {
                braceCount--;
                if (started && braceCount === 0) {
                    endIdx = k + 1;
                    break;
                }
            }
        }

        if (endIdx !== -1) {
            // Check comma
            let suffixLen = 0;
            // Also check whitespace before?
            // Just remove the block.

            // If there is a comma after, remove it too
            if (chunk[endIdx] === ',') suffixLen = 1;

            chunk = chunk.substring(0, start) + chunk.substring(endIdx + suffixLen);
        }
    }

    newContent += chunk;
}

// Restore Windows line endings
newContent = newContent.replace(/\n/g, '\r\n');
fs.writeFileSync(BLOG_PATH, newContent);
console.log('Done!');
