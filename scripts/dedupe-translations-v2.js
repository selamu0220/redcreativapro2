/**
 * Aggressive deduplication of translations keys V2
 */
const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

console.log('Reading blog-data.ts...');
let content = fs.readFileSync(BLOG_PATH, 'utf-8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// We will iterate through the file by splitting by "id: '"
// We need to keep the header (before first id)

const parts = content.split(/id:\s*'/);
// parts[0] is the header
// parts[1..] are article bodies (starting with ID string)

console.log(`Found ${parts.length - 1} articles.`);

let newContent = parts[0];

for (let i = 1; i < parts.length; i++) {
    let part = "id: '" + parts[i];

    // Check occurrences of "translations: {"
    const matches = part.match(/translations:\s*\{/g);

    if (matches && matches.length > 1) {
        console.log(`Article #${i} has ${matches.length} translations keys. removing all except the last one.`);

        // We need to find the locations of all matches
        const indices = [];
        let regex = /translations:\s*\{/g;
        let m;
        while ((m = regex.exec(part)) !== null) {
            indices.push(m.index);
        }

        // We want to keep the LAST one (indices[indices.length - 1])
        // We want to remove the others.

        // We process from last to first (excluding the very last one) so indices don't shift
        for (let j = indices.length - 2; j >= 0; j--) {
            const startIdx = indices[j];

            // Find end of this block
            let braceCount = 0;
            let endIdx = -1;
            let started = false;

            // Scan from startIdx
            for (let k = startIdx; k < part.length; k++) {
                if (part[k] === '{') {
                    braceCount++;
                    started = true;
                } else if (part[k] === '}') {
                    braceCount--;
                    if (started && braceCount === 0) {
                        endIdx = k + 1;
                        break;
                    }
                }
            }

            if (endIdx !== -1) {
                // Check for trailing comma
                let removeEnd = endIdx;
                if (part[removeEnd] === ',') removeEnd++;

                // Remove it
                console.log(`Removing duplicate at index ${startIdx}`);
                part = part.substring(0, startIdx) + part.substring(removeEnd);
            }
        }
    }

    newContent += part;
}

// Restore Windows line endings
newContent = newContent.replace(/\n/g, '\r\n');
fs.writeFileSync(BLOG_PATH, newContent);
console.log('Done!');
