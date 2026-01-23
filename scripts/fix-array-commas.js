/**
 * Fix missing commas between array objects
 */
const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

console.log('Reading blog-data.ts...');
let content = fs.readFileSync(BLOG_PATH, 'utf-8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Pattern:
// }
// {
// Missing comma!

// We want:
// },
// {

// Regex:
// (\n\s*\})(\s*\n\s*\{)

content = content.replace(
    /(\n\s*\})(\s*\n\s*\{)/g,
    "$1,$2"
);

// Restore Windows line endings
content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(BLOG_PATH, content);
console.log('Done!');
