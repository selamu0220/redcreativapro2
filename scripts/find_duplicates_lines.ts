import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'lib', 'blog-data.ts');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const idRegex = /id:\s*['"]([^'"]+)['"]/;
const seenIds = new Map<string, number>(); // id -> first line number
const duplicateRanges: { start: number, end: number, id: string }[] = [];

let currentBlockStart = -1;
let openBraces = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Simple heuristic for block detection inside the array
    if (line.trim() === '{') {
        if (openBraces === 0) currentBlockStart = i;
        openBraces++;
    }

    // Search for ID
    const match = line.match(idRegex);
    if (match && currentBlockStart !== -1) {
        const id = match[1];
        if (seenIds.has(id)) {
            // It's a duplicate! We need to find the end of this block
            // We'll search forward for the closing brace
            let j = i;
            let bracesBalance = 1; // We are inside one
            // Since we didn't track braces strictly line by line above for the *exact* block, 
            // let's rely on the indentation or just Assume standard formatting
            // Better: Count braces from the start of the block
        } else {
            seenIds.set(id, i);
        }
    }

    if (line.trim() === '},' || line.trim() === '}') {
        openBraces--;
    }
}

// Actually, regex matching on the whole file content might be easier to find positions
// But let's use a simpler approach: 
// 1. Find all `id: '...'`
// 2. Check for duplicates
// 3. If duplicate, find the surrounding object
console.log("Analyzing duplicates...");

const matches = [];
let match;
const regex = /id:\s*['"]([^'"]+)['"]/g; // global search
while ((match = regex.exec(content)) !== null) {
    matches.push({ id: match[1], index: match.index });
}

const seen = new Set();
const duplicates = [];

for (const m of matches) {
    if (seen.has(m.id)) {
        duplicates.push(m);
    } else {
        seen.add(m.id);
    }
}

console.log(`Found ${duplicates.length} duplicates.`);

// For each duplicate, finding the start and end of the object is tricky without an AST.
// But we can output the line number roughly.
duplicates.forEach(d => {
    // Count newlines before index
    const lineNumber = content.substring(0, d.index).split('\n').length;
    console.log(`Duplicate: ${d.id} at line ${lineNumber}`);
});
