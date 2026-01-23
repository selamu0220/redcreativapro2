/**
 * Rebuild blog-data.ts from scratch by parsing and cleaning each article
 */
const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');
const OUTPUT_PATH = path.join(__dirname, '..', 'lib', 'blog-data-clean.ts');

console.log('Reading blog-data.ts...');
let content = fs.readFileSync(BLOG_PATH, 'utf-8');

// Normalize
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// 1. Extract Header (imports, interface)
const arrayStart = content.indexOf('export const blogPosts: BlogPost[] = [');
if (arrayStart === -1) {
    console.error("Could not find array start!");
    process.exit(1);
}

const header = content.substring(0, arrayStart + 'export const blogPosts: BlogPost[] = ['.length);

// 2. Split articles
// We assume articles start with `  {` followed by `    id: '`
// But better to split by `    id: '` and backtrack to `{`

const parts = content.split(/id:\s*'/);
// parts[0] is header + opening brace of first article? No.

// Let's rely on the fact that every article has an ID.
// We will iterate and find matches.

const articles = [];
const idRegex = /id:\s*'([^']+)'/g;
let match;
const matches = [];

while ((match = idRegex.exec(content)) !== null) {
    matches.push({ index: match.index, id: match[1] });
}

console.log(`Found ${matches.length} articles.`);

// Function to extract value of a key
function extractValue(chunk, key) {
    // Regex for simple keys: key: 'value', or key: "value", or key: number, or key: boolean
    // content is special (backticks)

    if (key === 'content') {
        const startMarker = 'content: `';
        const startIdx = chunk.indexOf(startMarker);
        if (startIdx === -1) return null;

        // We want to find the matching closing backtick.
        // It's the last backtick before `translations:` or `}` (end of object).

        const contentStart = startIdx + startMarker.length;

        // Look for next property or end of object
        // Properties we know: translations
        const transIdx = chunk.indexOf('translations:', contentStart);
        let limitIdx = transIdx !== -1 ? transIdx : chunk.lastIndexOf('}');

        // Find the last backtick before limitIdx
        const contentEnd = chunk.lastIndexOf('`', limitIdx);

        if (contentEnd > contentStart) {
            const raw = chunk.substring(contentStart, contentEnd);
            return JSON.stringify(raw);
        }
        return JSON.stringify("");
    }

    // For arrays (tags, processSteps, etc.)
    if (['tags', 'processSteps', 'summaryHighlights', 'prompts'].includes(key)) {
        // capture [ ... ]
        // scan from key start
        const keyStart = chunk.indexOf(key + ':');
        if (keyStart === -1) return null;

        const bracketStart = chunk.indexOf('[', keyStart);
        if (bracketStart === -1) return null;

        let bracketCount = 0;
        let endIdx = -1;
        for (let i = bracketStart; i < chunk.length; i++) {
            if (chunk[i] === '[') bracketCount++;
            if (chunk[i] === ']') {
                bracketCount--;
                if (bracketCount === 0) {
                    endIdx = i + 1;
                    break;
                }
            }
        }
        if (endIdx !== -1) return chunk.substring(bracketStart, endIdx);
        return null;
    }

    // For resources (array of objects)
    if (key === 'resources') {
        // Similar to array
        const keyStart = chunk.indexOf(key + ':');
        if (keyStart === -1) return null;
        const bracketStart = chunk.indexOf('[', keyStart);
        if (bracketStart === -1) return null;
        let bracketCount = 0;
        let endIdx = -1;
        for (let i = bracketStart; i < chunk.length; i++) {
            if (chunk[i] === '[') bracketCount++;
            if (chunk[i] === ']') {
                bracketCount--;
                if (bracketCount === 0) {
                    endIdx = i + 1;
                    break;
                }
            }
        }
        if (endIdx !== -1) return chunk.substring(bracketStart, endIdx);
        return null;
    }

    // For translations (object)
    if (key === 'translations') {
        // Find LAST occurrence of "translations: {"
        // Because we deduced duplicates exist
        const keyMatches = [];
        const re = /translations:\s*\{/g;
        let m;
        while ((m = re.exec(chunk)) !== null) {
            keyMatches.push(m.index);
        }

        if (keyMatches.length === 0) return null;

        const lastKeyIndex = keyMatches[keyMatches.length - 1];

        let braceCount = 0;
        let endIdx = -1;
        for (let i = lastKeyIndex; i < chunk.length; i++) {
            if (chunk[i] === '{') {
                braceCount++;
            } else if (chunk[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                    endIdx = i + 1;
                    break;
                }
            }
        }

        if (endIdx !== -1) {
            // Extract just the inner part? No, the whole object.
            // We need to verify it's valid.
            const block = chunk.substring(lastKeyIndex + "translations:".length, endIdx).trim();
            return block;
        }
        return null;
    }

    // Simple strings/primitives
    const simpleRegex = new RegExp(`${key}:\\s*('[^']*'|"[^"]*"|true|false|\\d+)`);
    const m = chunk.match(simpleRegex);
    if (m) return m[1];

    // Try backticks for simple string?
    return null;
}

matches.push({ index: content.lastIndexOf('];'), id: 'EOF' }); // End of array

const cleanArticles = [];

for (let i = 0; i < matches.length - 1; i++) {
    const start = matches[i].index; // points to "id: ..."
    const end = matches[i + 1].index;

    // We scan slightly before 'id:' to find '{'? No, we just need the properties.
    // The previous loop gives us index of "id:".
    // We can just grab the chunk between IDs.

    let chunk = content.substring(start, end);

    // Extract properties
    const id = matches[i].id;
    const title = extractValue(chunk, 'title');
    const excerpt = extractValue(chunk, 'excerpt');
    const category = extractValue(chunk, 'category');
    const subcategory = extractValue(chunk, 'subcategory');
    const author = extractValue(chunk, 'author');
    const publishedAt = extractValue(chunk, 'publishedAt');
    const readTime = extractValue(chunk, 'readTime');
    const tags = extractValue(chunk, 'tags');
    const featured = extractValue(chunk, 'featured');
    const trending = extractValue(chunk, 'trending');
    const views = extractValue(chunk, 'views');
    const image = extractValue(chunk, 'image');

    // Special handling for content (split issues)
    let contentVal = extractValue(chunk, 'content');
    if (!contentVal) contentVal = "`[Content Missing or Failed Parse]`";

    // Arrays
    const processSteps = extractValue(chunk, 'processSteps');
    const summaryHighlights = extractValue(chunk, 'summaryHighlights');
    const prompts = extractValue(chunk, 'prompts');
    const resources = extractValue(chunk, 'resources');

    const translations = extractValue(chunk, 'translations');

    // Build Clean Object
    let obj = `  {
    id: '${id}',
    title: ${title},
    excerpt: ${excerpt},
    category: ${category},
    subcategory: ${subcategory},
    author: ${author},
    publishedAt: ${publishedAt},
    readTime: ${readTime},
    tags: ${tags},
    featured: ${featured},
    trending: ${trending},
    views: ${views},
    image: ${image},
`;

    if (summaryHighlights) obj += `    summaryHighlights: ${summaryHighlights},\n`;
    if (processSteps) obj += `    processSteps: ${processSteps},\n`;
    if (prompts) obj += `    prompts: ${prompts},\n`;
    if (resources) obj += `    resources: ${resources},\n`;

    obj += `    content: ${contentVal}`;

    if (translations) {
        obj += `,\n    translations: ${translations}`;
    }

    obj += `\n  }`;

    cleanArticles.push(obj);
}

// Reassemble file
const newFile = header + "\n" + cleanArticles.join(",\n") + "\n];\n";

fs.writeFileSync(OUTPUT_PATH, newFile.replace(/\n/g, '\r\n'));
console.log('Clean file written to blog-data-clean.ts');

// Optional: Rename to real file
fs.renameSync(OUTPUT_PATH, BLOG_PATH);
console.log('Replaced blog-data.ts with clean version.');
