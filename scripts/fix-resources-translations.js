/**
 * Robust fix for blog-data.ts syntax errors
 */
const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

console.log('Reading blog-data.ts...');
let content = fs.readFileSync(BLOG_PATH, 'utf-8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// FIX 1: Translations inside Resources
// Pattern: 
// { name: "...", href: "..." 
// translations: { ... }
// }
// },

// We want to transform it to:
// { name: "...", href: "..." },
// { ... }
// ],
// translations: { ... }

// Since regex is hard for nested structures, let's use a simpler approach that targets the specific broken text
// We look for: name: "...", href: "..." followed directly by translations:

const brokenResourcePattern = /(\{ name: "[^"]+", href: "[^"]+")\s*\n\s*(translations:\s*\{[\s\S]*?\n\s*\}\s*\n\s*\}\s*\n\s*\},\s*\n)/g;

content = content.replace(brokenResourcePattern, (match, resourceStart, transBlockFull) => {
    // resourceStart: { name: "...", href: "..."
    // transBlockFull: includes translations block and the closing braces of the bad structure

    // We need to extract the actual translations block
    const transStart = transBlockFull.indexOf('translations: {');
    // Find the matching closing brace for translations
    // It's the first } matching { count, or just indented...

    // Let's assume standard indentation from previous scripts:
    // translations: {
    //   en: { ... }
    // }

    // The previous script output:
    //       translations: {
    //  
    //         en: {
    //         title: '...',
    //         excerpt: '...',
    //         content: ''
    //       }
    //     }
    //   }
    // },

    // We want to keep the inner translations: { ... } part.
    // And we need to close the resource object with ` },`

    // Let's just strip the extra braces at the end of transBlockFull
    // The bad block likely ends with `} \n } \n },`
    // One } closes en, one closes translations, one closes the fake resource obj?

    // Let's rely on the fact that we want to move `translations: { ... }` OUT of the array.

    // Simplest fix:
    // Start: { name: "...", href: "..."
    // End: },

    // We simply insert `},` after href.
    // And we define `translations` after the array closes?

    // This is hard because we are inside the array.

    // Let's try to find the END of the resources array `],`
    // This requires a lookahead or capturing more context.

    console.log("Found broken resource!");

    // HACK: Just close the object and let it be a valid object in the array with a 'translations' property?
    // The BlogPost interface has `resources: { name: string, href: string }[]`.
    // It does NOT allow `translations` property in the resource object. TS will error.

    // So we MUST move it out.

    return match; // pass for now, regex too risky
});

// Iterative approach
let fixedContent = "";
let currentIndex = 0;
const marker = 'href: "';

while (true) {
    const idx = content.indexOf(marker, currentIndex);
    if (idx === -1) break;

    // Check what follows the href value
    const endQuote = content.indexOf('"', idx + marker.length);
    const checkRegion = content.substring(endQuote + 1, endQuote + 50);

    if (checkRegion.includes('translations:')) {
        console.log(`Found broken resource at index ${idx}`);

        // Find the start of the resource object `{`
        const resourceStart = content.lastIndexOf('{', idx);

        // Find the end of data (start of translations)
        const transStart = content.indexOf('translations:', endQuote);

        // Find the end of translations
        // Assume indented with 4 or 6 spaces
        // Count braces
        let braceCount = 0;
        let transEnd = -1;
        for (let i = transStart; i < content.length; i++) {
            if (content[i] === '{') braceCount++;
            if (content[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                    transEnd = i + 1;
                    break;
                }
            }
        }

        // Now locate the end of the resources array `]`
        const arrayEnd = content.indexOf(']', transEnd);

        // Construct the pieces
        const preResource = content.substring(currentIndex, resourceStart);
        const resourceContent = content.substring(resourceStart, transStart).trim(); // { name: "...", href: "..."
        const transContent = content.substring(transStart, transEnd);
        const postArray = content.substring(arrayEnd + 1); // , ...

        // We want:
        // preResource
        // { name: "...", href: "..." },
        // ]
        // , // maybe comma
        // transContent

        // Wait, where do we put it?
        // resources: [ ... ],
        // translations: { ... }

        // We need to keep the OTHER items in the resource array?
        // Usually the translation was appended to the LAST item.

        // If there are valid items before:
        // resources: [
        //   { valid },
        //   { broken name, href
        //     translations
        //   }
        // ]

        // We want:
        // resources: [
        //   { valid },
        //   { broken name, href }
        // ],
        // translations

        // So:
        // 1. Add `}` to close the broken resource.
        // 2. Add `],` to close the array (assuming it was the last item).
        // 3. Add `translations: ...`
        // 4. Skip the existing `} \n } \n },` junk and the existing `],` key?

        // This is getting messy.

        // Let's try the Specific File Fix again since we know the context.
        // It's safer to run a targeted regex for the patterns we KNOW exist.

        // Pattern seen in file:
        // { name: "IA de Correos", href: "/correos-ia" 
        //       translations: {
        // ...
        //       }
        //     }
        //   },
        //       { name: "Generador de Prompts", href: "/prompts" }
        //     ],

        // In this case, it was NOT the last item!

        // We want:
        // { name: "IA de Correos", href: "/correos-ia" },
        // { name: "Generador de Prompts", href: "/prompts" }
        // ],
        // translations: { ... }

        // So we need to:
        // 1. Extract translations block.
        // 2. Remove it from current spot.
        // 3. Add `},` to close the resource.
        // 4. Insert translations block AFTER `],`

        // Regex to capture:
        // (resources: \[[\s\S]*?)(\{ name: "[^"]+", href: "[^"]+")(\s*\n\s*)(translations: \{[\s\S]*?\n\s{6}\}\s*\n\s*\}\s*\n\s*\},\s*\n)([\s\S]*?\]\,)

        // Replace with:
        // $1$2 },\n$5\n    $4

        // Let's refine the regex for exactly this.
    }

    currentIndex = endQuote + 1;
}

// Global regex fix for the "translations inside resources"
// Matches: resources: [ ... { name: "...", href: "..." \n translations: { ... } } }, { ... } ]
content = content.replace(
    /(resources:\s*\[[\s\S]*?)(\{ name: "[^"]+", href: "[^"]+")(\s*\n\s*)(translations:\s*\{[\s\S]*?\n\s{6}\})(\s*\n\s*\}\s*\n\s*\},)(\s*\n\s*\{[\s\S]*?\])/g,
    (match, before, resourceStart, newline, transBlock, badClosing, restOfArray) => {
        console.log("Fixed interleaved resource/translation!");
        // We need to move transBlock to AFTER the array closes.
        // But `restOfArray` ends with `]`

        // Clean up transBlock indentation
        const cleanTrans = transBlock.replace(/\n\s{8}/g, "\n      ").replace(/\n\s{6}\}/, "\n    }");

        return `${before}${resourceStart} },${restOfArray},\n    ${cleanTrans}`;
    }
);

// Another variant where it IS the last item
content = content.replace(
    /(resources:\s*\[[\s\S]*?)(\{ name: "[^"]+", href: "[^"]+")(\s*\n\s*)(translations:\s*\{[\s\S]*?\n\s{6}\})(\s*\n\s*\}\s*\n\s*\}\s*\n\s*\],)/g,
    (match, before, resourceStart, newline, transBlock, badClosing) => {
        console.log("Fixed last item resource/translation!");
        const cleanTrans = transBlock.replace(/\n\s{8}/g, "\n      ").replace(/\n\s{6}\}/, "\n    }");

        return `${before}${resourceStart} }\n    ],\n    ${cleanTrans}`;
    }
);

// Restore Windows line endings
content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(BLOG_PATH, content);
console.log('Done!');
