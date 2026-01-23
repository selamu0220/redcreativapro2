/**
 * Fix extra closing braces before content property
 */
const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

console.log('Reading blog-data.ts...');
let content = fs.readFileSync(BLOG_PATH, 'utf-8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Pattern:
//     },
//     },
//     },
//     content: `...

// We likely want:
//     }, (closes en)
//     }, (closes translations)
//     content: `...`

// So valid is:
// translations: {
//   en: { ... }
// },
// content: `...`

// We search for:
// },
// },
// },
// content:

// And replace with:
// },
// },
// content:

// But careful about indentation.
// The file has:
// 5616:     },
// 5617:     },
// 5618:     },
// 5619:     content: `

// Regex to capture this stack of braces
content = content.replace(
    /(\n\s*\}\,)(\s*\n\s*\}\,)(\s*\n\s*\}\,)(\s*\n\s*content:\s*`)/g,
    (match, b1, b2, b3, contentLine) => {
        console.log("Found triple brace stack!");
        // We probably only want 2 braces? (one for en, one for translations).
        // OR maybe just 1 if translations wasn't closed?

        // If 5616 closes en.
        // We need one more } to close translations.
        // Then we are in Article.
        // Then content: is a property of Article.

        // So we want:
        // },
        // },
        // content:

        return `${b1}${b2}${contentLine}`;
    }
);

// Also handle double brace stack if that's the case elsewhere
// },
// },
// content:
// This is actually valid if it closes en and translations... 

// Wait, looking at the code:
// 5611:     translations: {
// 5612:         en: {
// ...
// 5616:     },

// So 5616 closes en.
// We need 5617 to close translations.
// We DO NOT want 5618.

// So triple brace -> double brace.

// Restore Windows line endings
content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(BLOG_PATH, content);
console.log('Done!');
