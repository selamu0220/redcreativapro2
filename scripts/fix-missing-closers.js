/**
 * Fix missing closing braces for articles
 * Ensure article objects are properly closed with }, before the next article starts
 */
const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

console.log('Reading blog-data.ts...');
let content = fs.readFileSync(BLOG_PATH, 'utf-8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Pattern:
// content: `...`
// {
// (next article starts)

// OR
// content: `...`
// ]
// (end of file)

// Regex to capture:
// (content:\s*`[\s\S]*?`)(\s*\n\s*)(\{)

// We want to replace with:
// $1$2},\n    $3

content = content.replace(
    /(content:\s*`[\s\S]*?`)(\s*\n\s*)(\{)/g,
    (match, contentBlock, newline, nextObjStart) => {
        console.log("Found missing closer before next object!");
        return `${contentBlock},\n    }${newline}${nextObjStart}`;
    }
);

// Check if file ends with content block too
// (content:\s*`[\s\S]*?`)(\s*\n\s*)(\])

content = content.replace(
    /(content:\s*`[\s\S]*?`)(\s*\n\s*)(\]\;?\s*$)/g,
    (match, contentBlock, newline, arrayEnd) => {
        console.log("Found missing closer at end of file!");
        return `${contentBlock},\n    }${newline}${arrayEnd}`;
    }
);

// Restore Windows line endings
content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(BLOG_PATH, content);
console.log('Done!');
