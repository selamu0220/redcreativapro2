const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');
const content = fs.readFileSync(BLOG_PATH, 'utf-8');

const lines = content.split('\n');
const start = 5600;
const end = 5700;

console.log(lines.slice(start, end).join('\n'));
