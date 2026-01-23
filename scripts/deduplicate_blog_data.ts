import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'lib', 'blog-data.ts');
console.log(`Reading file: ${filePath}`);
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const START_LINE = 3941;
const END_LINE = 7772;

// 1-based to 0-based
const startIndex = START_LINE - 1;
const endIndex = END_LINE - 1;

console.log(`Targeting removal around lines ${START_LINE} to ${END_LINE} (inclusive).`);

// Fuzzy find start
let actualStart = -1;
for (let i = startIndex - 5; i <= startIndex + 5; i++) {
    if (lines[i] && lines[i].trim().startsWith('{')) {
        actualStart = i;
        console.log(`Found start '{' at line ${i + 1}`);
        break;
    }
}

if (actualStart === -1) {
    console.error(`ERROR: Could not find start '{' around line ${START_LINE}`);
    // Print context
    for (let i = startIndex - 5; i <= startIndex + 5; i++) {
        console.log(`${i + 1}: ${lines[i]}`);
    }
    process.exit(1);
}

// Fuzzy find end
let actualEnd = -1;
for (let i = endIndex - 5; i <= endIndex + 5; i++) {
    if (lines[i] && lines[i].trim().startsWith('}')) { // could be '},'
        actualEnd = i;
        console.log(`Found end '}' at line ${i + 1}`);
        break;
    }
}

if (actualEnd === -1) {
    console.error(`ERROR: Could not find end '}' around line ${END_LINE}`);
    process.exit(1);
}

// Splicing
const removeCount = actualEnd - actualStart + 1;
lines.splice(actualStart, removeCount);

console.log(`New total lines: ${lines.length}`);
console.log(`Removing from ${actualStart + 1} to ${actualEnd + 1}`);

const newContent = lines.join('\n');
fs.writeFileSync(filePath, newContent, 'utf8');
console.log("File written successfully.");
