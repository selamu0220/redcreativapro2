/**
 * Aggressive fix for blog-data.ts - removes malformed translations and rebuilds them
 */
const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

console.log('Reading blog-data.ts...');
let content = fs.readFileSync(BLOG_PATH, 'utf-8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Strategy: Remove ALL translation blocks and re-add them properly
// This is nuclear but should work

// First, let's count articles before
const articleCountBefore = (content.match(/id:\s*'/g) || []).length;
console.log(`Articles before: ${articleCountBefore}`);

// Pattern to match any malformed translation blocks
// This matches translations: { ... } including nested content
// Also matches standalone en: { blocks

// Remove standalone translations: { blocks that are not properly attached
content = content.replace(
    /\s*\n\s*translations:\s*\{\s*\n\s*\n\s*\n/g,
    '\n    translations: {\n'
);

// Fix: image: '...' followed by whitespace then translations (missing comma)
content = content.replace(
    /(image:\s*'[^']*')\s*\n\s*(translations:\s*\{)/g,
    "$1,\n    $2"
);

// Fix double en: blocks - keep only the properly indented one
content = content.replace(
    /en:\s*\{\s*\n\s*en:\s*\{/g,
    'en: {'
);

// Fix: translations: { followed by blank lines then en:
content = content.replace(
    /(translations:\s*\{)\s*\n\s*\n\s*\n\s*(en:)/g,
    "$1\n      $2"
);

// Remove double translations: { 
content = content.replace(
    /translations:\s*\{\s*\n\s*translations:\s*\{/g,
    'translations: {'
);

// Fix articles ending with ...}' then newlines then translations without comma
content = content.replace(
    /('\s*)\n(\s*translations:)/g,
    "$1,\n$2"
);

// Restore Windows line endings
content = content.replace(/\n/g, '\r\n');

const articleCountAfter = (content.match(/id:\s*'/g) || []).length;
console.log(`Articles after: ${articleCountAfter}`);

console.log('Writing fixed file...');
fs.writeFileSync(BLOG_PATH, content);
console.log('Done!');
