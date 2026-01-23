import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'lib/blog-data.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const START_MARKER = 'export const blogPosts: BlogPost[] = [';
const END_MARKER_REGEX = /];\s*$/m; // Roughly find the end, but we'll use parser for precision

const startIndex = content.indexOf(START_MARKER);
if (startIndex === -1) {
    console.error('Could not find start marker');
    process.exit(1);
}

const header = content.substring(0, startIndex + START_MARKER.length);
let rest = content.substring(startIndex + START_MARKER.length);

// We need to find where the array ends.
// But actually, we can just parse objects one by one until we hit the closing ']' of the array.

function parseObjects(text: string) {
    const objects: { id: string, fullText: string }[] = [];
    let parsingObject = false;
    let depth = 0;
    let currentObjectStart = -1;
    let inString: false | "'" | '"' | "`" = false;
    let isEscaped = false;

    // Start parsing after the initial [
    // We are looking for top-level { ... } separated by commas

    // Pointer to verify if we are inside the array or finished
    let i = 0;

    // Use a Set to track IDs we've accepted
    const seenIds = new Set<string>();
    const keptObjects: string[] = [];

    // Helper to extract ID roughly from a chunk of text
    const extractId = (objText: string): string | null => {
        const match = objText.match(/id:\s*['"`]([^'"`]+)['"`]/);
        return match ? match[1] : null;
    };

    while (i < text.length) {
        const char = text[i];

        if (inString) {
            if (isEscaped) {
                isEscaped = false;
            } else if (char === '\\') {
                isEscaped = true;
            } else if (char === inString) {
                inString = false;
            }
        } else {
            // Not in string
            if (char === "'" || char === '"' || char === '`') {
                inString = char;
            } else if (char === '{') {
                if (depth === 0) {
                    currentObjectStart = i;
                    parsingObject = true;
                }
                depth++;
            } else if (char === '}') {
                depth--;
                if (depth === 0 && parsingObject) {
                    // Object finished
                    const fullObjectText = text.substring(currentObjectStart, i + 1);
                    const id = extractId(fullObjectText);

                    if (id) {
                        if (!seenIds.has(id)) {
                            seenIds.add(id);
                            keptObjects.push(fullObjectText); // Keep formatting
                        } else {
                            console.log(`Removed duplicate: ${id}`);
                        }
                    } else {
                        // fallback: keep objects without clear ID (shouldn't happen)
                        keptObjects.push(fullObjectText);
                    }

                    parsingObject = false;
                }
            } else if (char === ']') {
                if (depth === 0) {
                    // End of array
                    break;
                }
            }
        }
        i++;
    }

    return {
        keptObjects,
        endIndex: i // The index of ']'
    };
}

const result = parseObjects(rest);

// Reconstruct
const footer = rest.substring(result.endIndex);
// footer starts with ']' so we don't need to add it manually if we just join with commas.
// Actually footer starts with ']', we need to be careful.
// parseObjects index stopped AT ']'.

const newContent = header + '\n' + result.keptObjects.join(',\n') + footer;

fs.writeFileSync(filePath, newContent, 'utf-8');
console.log(`Deduplication complete. Kept ${result.keptObjects.length} objects.`);
