/**
 * Fix content incorrectly nested inside translations
 */
const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

console.log('Reading blog-data.ts...');
let content = fs.readFileSync(BLOG_PATH, 'utf-8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Pattern:
// translations: {
//   en: { ... },
//   content: `...`
// }

// We want:
// translations: {
//   en: { ... }
// },
// content: `...`

// Regex to capture:
// (translations:\s*\{[\s\S]*?en:\s*\{[\s\S]*?\n\s*\}\,)(\s*\n\s*)(content:\s*`)

// Wait, the indentation matters.
// line 5616:     }, (closes en)
// line 5617:     content: `...`

// We just need to insert `},` before `content:`.

content = content.replace(
    /(\n\s*\}\,)(\s*\n\s*content:\s*`)/g,
    "$1\n    },$2"
);

// But wait, if we add `},` we act as if `translations` closed. But did we REMOVE the existing closing brace `}` later?
// 5637:   }, (closes translations)

// If we close `translations` early, then 5637 becomes an extra `}` or closes the Article object.
// If 5637 closes Article, then we are good?

// Let's check structure:
// Article {
//   resources: [...],
//   translations: { ... },
//   content: `...`
// }

// Currently:
// Article {
//   resources: [...],
//   translations: {
//     en: { ... },
//     content: `...`
//   }
// }

// If I add `},` before content:
// translations: { en: {...} },
// content: `...`
// } (the matching brace for translations)

// So we have an EXTRA `}` at the end.
// We need to remove the `}` at the end of the block.

// The block ends with a backtick check `... ` \n   },`

// So:
// Replace: `content: ... ` \n   },`
// With: `content: ... ` \n`

// OR better:
// Replace: `\n    content:` with `\n    },\n    content:`
// AND
// Replace: `\n  },` (that was closing translations) with nothing? Or rather, we need to match the specific closing brace that belonged to translations.

// Since `translations` wraps `content`, the closing brace is AFTER `content`.

// Regex:
// (translations: \{[\s\S]*?en: \{[\s\S]*?\}\,)\s*\n\s*(content: `[\s\S]*?`)\s*\n\s*\}\,

// Replace with:
// $1\n    },\n    $2

// This assumes the `translations` object was closed by `},` immediately after content backtick.
// Line 5636: ... `
// Line 5637:   },

// So yes.

content = content.replace(
    /(translations:\s*\{[\s\S]*?en:\s*\{[\s\S]*?\n\s*\}\,)(\s*\n\s*)(content:\s*`[\s\S]*?`\s*\n)(\s*\}\,)/g,
    (match, transStart, newline, contentBlock, closingBrace) => {
        console.log("Fixed nested content!");
        return `${transStart}\n    },${newline}${contentBlock}`; // Remove closingBrace which was closing translations
    }
);

// Restore Windows line endings
content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(BLOG_PATH, content);
console.log('Done!');
