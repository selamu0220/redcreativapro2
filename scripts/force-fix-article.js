/**
 * Force rewrite of the translations block for 'aprende-escribir-articulos-blog-perfectos-ia'
 */
const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

console.log('Reading blog-data.ts...');
let content = fs.readFileSync(BLOG_PATH, 'utf-8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// We want to find:
// id: 'aprende-escribir-articulos-blog-perfectos-ia',
// ...
// translations: { ... }

// And verify if there are two occurrences or just replace the whole end of the object.

const articleId = "id: 'aprende-escribir-articulos-blog-perfectos-ia'";
const startIdx = content.indexOf(articleId);

if (startIdx === -1) {
    console.log("Article not found!");
    process.exit(1);
}

// Find the content string end
const contentMarker = "visita la página individual.* `";
const contentEnd = content.indexOf(contentMarker, startIdx);

if (contentEnd === -1) {
    console.log("Content end not found!");
    process.exit(1);
}

// Check what's after content end
const afterContent = content.substring(contentEnd + contentMarker.length);

// We expect `\n    translations: { ... } \n  },`

// Let's replace everything from contentEnd to the next article start or array end.
// Next article usually starts with `  {` or `  }, \n  {`

const nextArticleIdx = content.indexOf("id: 'asistente-escritura-ia-inteligente'", startIdx);

if (nextArticleIdx === -1) {
    console.log("Next article not found!");
    process.exit(1);
}

// We want to replace from contentEnd + marker.length up to the last `},` before nextArticle.

const segment = content.substring(contentEnd + contentMarker.length, nextArticleIdx);

// segment contains `\n    translations: { ... } \n  }, \n  { \n    ` (up to id)

console.log("Original segment length:", segment.length);

// Let's construct the clean translations block
const cleanTranslations = `
    translations: {
        en: {
        title: 'Learn to Write Perfect Blog Articles with AI: Complete Guide 2025',
        excerpt: 'Master the art of writing blog posts with AI. Techniques, tools, and strategies to create content that ranks on Google and converts readers.',
        content: ''
      }
    }
  },
  {
    `;

// Check if segment has multiple translations blocks?
const transCount = (segment.match(/translations:/g) || []).length;
console.log(`Found ${transCount} 'translations:' in the segment.`);

// If duplicates found, this replace will fix it because we overwrite the whole section.
// We replace the messy segment with our clean version.

// However, we need to match exactly where the next article object starts.
// The segment includes the opening brace of the next article?
// We searched for `id: 'next...'`.
// The object starts before that.

// Let's find the `{` before `id: 'asistente...'`.
const braceBeforeNext = content.lastIndexOf('{', nextArticleIdx);

// replace from (contentEnd + length) to braceBeforeNext + 1 (exclusive?)
// No, we want to replace up to the start of the next object.

const replaceStart = contentEnd + contentMarker.length;
// replacement ends at braceBeforeNext + 1 (so we keep the opening brace of next article included in our replacement string? or exclude it?)

// Let's stop AT braceBeforeNext.
// And our replacement string ends with `  },\n  ` (so it expects `{` to follow).

// But wait, my clean string included `  {\n    `.

// So:
const replaceEnd = content.indexOf("id: 'asistente-escritura-ia-inteligente'", braceBeforeNext); // This is just nextArticleIdx

// replace from replaceStart to replaceEnd
// Replace with: comma (if needed) + translations block + closing brace + comma + opening brace ?

// content after replacement:
// ... individual.* `
// translations: { ... }
// },
// {
// id: ...

const correctSegment = `
    translations: {
        en: {
        title: 'Learn to Write Perfect Blog Articles with AI: Complete Guide 2025',
        excerpt: 'Master the art of writing blog posts with AI. Techniques, tools, and strategies to create content that ranks on Google and converts readers.',
        content: ''
      }
    }
  },
  {
    `;

// We replace from replaceStart UNTIL the `id: ` start?
// content.substring(nextArticleIdx) starts with `id: ...`

const before = content.substring(0, replaceStart);
const after = content.substring(nextArticleIdx);

const newFileContent = before + correctSegment + after;

// Restore Windows line endings
fs.writeFileSync(BLOG_PATH, newFileContent.replace(/\n/g, '\r\n'));
console.log('Force fix applied!');
