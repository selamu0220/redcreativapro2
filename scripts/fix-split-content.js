/**
 * Fix split content strings in blog-data.ts
 * The translation script accidentally inserted translations in the middle of content strings
 */
const fs = require('fs');
const path = require('path');

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

console.log('Reading blog-data.ts...');
let content = fs.readFileSync(BLOG_PATH, 'utf-8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Pattern: 
// content: `[PART1]`,
// translations: { ... }
// [PART2]`
// },

// We need to capture:
// 1. content: `[PART1]
// 2. , [newlines] translations: { ... }
// 3. [PART2]`

// The regex needs to be careful.
// match `content: `` followed by chars until `,` then newlines then `translations: {` ... `}` then newlines then chars until backtick

// Let's do this iteratively. find index of "content: `", find the matching backtick.
// Check if the NEXT non-whitespace thing is "translations:".
// If so, we are in the "Part 1" scenario.

let newContent = content;

// This regex finds the broken pattern
// content: `...`,
// translations: { ... }
// ...`
const brokenPattern = /(content:\s*`[^`]*`),\s*\n\s*(translations:\s*\{[\s\S]*?\n\s*\}\s*\n)\s*\n\s*([^`]*`)/g;

newContent = content.replace(brokenPattern, (match, part1WithQuotes, translationBlock, part2WithQuote) => {
    console.log('Found broken content block!');

    // Remove the backtick and comma from the end of part1
    const part1Clean = part1WithQuotes.replace(/`,\s*$/, '');

    // Clean part 2 (it's fine, it has the trailing backtick)
    // But we need to make sure we don't duplicate the end backtick if it's there

    // Construct the fixed string
    // content: `PART1
    // PART2`
    // translations: { ... }

    // We need to insert a newline between part1 and part2 to be safe
    return `${part1Clean}\n\n${part2WithQuote},\n    ${translationBlock}`;
});

// Restore Windows line endings
newContent = newContent.replace(/\n/g, '\r\n');

if (newContent !== content) {
    console.log('Fixes applied!');
    fs.writeFileSync(BLOG_PATH, newContent);
} else {
    console.log('No matches found for the broken pattern. Trying manual string search...');

    // Fallback: splitting by lines and state machine
    const lines = content.split('\n');
    const resultLines = [];
    let buffer = [];
    let inBrokenState = false;
    let brokenContentStart = -1;
    let translationBlockLines = [];

    // This is too risky for a quick script. Let's try a simpler replacement for the specific file we saw.
    // The file showed:
    // content: `...`,
    // translations: { ... }

    // Let's look for ``, inverted logic

    // Find: `,
    //     translations: {

    // And replace with: 
    // (nothing, just merge) 

    // But we need to move translations to the end.

    // Let's try the regex again but simpler
    // Find ``, followed by whitespace, then `translations:`

    const badSequence = /`,\s*\n\s*translations:/g;
    let match;
    while ((match = badSequence.exec(content)) !== null) {
        console.log(`Found bad sequence at index ${match.index}`);
    }
}

// Re-run the replace logic purely
const finalContent = content.replace(
    /(content:\s*`)([\s\S]*?)(`,\s*\n\s*)(translations:\s*\{[\s\S]*?\n\s{4}\})(\s*\n\s*)([\s\S]*?`\s*\n\s*\})/g,
    (match, startContent, part1, separator, translationBlock, separator2, part2AndEnd) => {
        console.log('Fixed a broken article!');
        // startContent: content: `
        // part1: text text text
        // separator: `, \n 
        // translationBlock: translations: { ... }
        // separator2: \n
        // part2AndEnd: remaining text` \n }

        // We want: content: `part1 + part2` , \n translationBlock \n } (adjusted)

        // part2AndEnd ends with ` \n }
        // We need to split that ` \n } part
        const lastBacktick = part2AndEnd.lastIndexOf('`');
        const part2 = part2AndEnd.substring(0, lastBacktick);
        const endBrace = part2AndEnd.substring(lastBacktick + 1); // contains ` \n } basically

        // Actually part2AndEnd is ALL the text after the translation block until the END of the content string which closes the object?
        // No, the regex is greedy.

        return `${startContent}${part1}\n\n${part2}\`,\n    ${translationBlock}\n    ${endBrace.trim()}`;
    }
);

// Actually, the specific error at 5549 is:
// content: `...`,
// translations: { ... }
// ## El Top 5... (this is just text)
// ... `
// },

// So the regex should be:
// content: `[PART1]`,
// translations: { ... }
// [PART2]`
// },

// Let's apply a very specific join
const specificFix = content.replace(
    /offering specialized solutions for every niche\.`,\s*\n\s*translations:/,
    "offering specialized solutions for every niche.\n\n"
);
// Wait, the content in the file is Spanish! "soluciones especializadas para cada nicho."

const spanishFix = content.replace(
    /(soluciones especializadas para cada nicho\.)`,\s*\n\s*(translations:\s*\{[\s\S]*?\}\s*\n\s*\})(\s*\n\s*)/,
    "$1\n\n$3$2," // Remove backtick and comma, keep newlines, put text back, then translations
);
// Logic:
// 1. "soluciones ... nicho." (PART 1 content)
// 2. `,\n translations: { ... } (REMOVE `,)
// 3. \n
// 4. (PART 2 implied follows)
// We want:
// "soluciones ... nicho." \n\n (PART 2) `,\n translations: { ... }

// This is getting complicated. Let's do it by finding the specific string "soluciones especializadas para cada nicho."
const anchor = "soluciones especializadas para cada nicho.";
const idx = content.indexOf(anchor);

if (idx !== -1) {
    console.log(`Found anchor at ${idx}`);
    // Expected after: `,\n    translations: {
    const afterAnchor = content.substring(idx + anchor.length);

    if (afterAnchor.startsWith("`,")) {
        console.log("Confirmed broken format.");
        // Find the end of translations object
        const openTrans = afterAnchor.indexOf("translations: {");
        let braceCount = 0;
        let transEndIdx = -1;
        let inTrans = false;

        // Need to parse braces strictly
        for (let i = openTrans; i < afterAnchor.length; i++) {
            if (afterAnchor[i] === '{') {
                braceCount++;
                inTrans = true;
            } else if (afterAnchor[i] === '}') {
                braceCount--;
                if (inTrans && braceCount === 0) {
                    transEndIdx = i + 1; // Include }
                    break;
                }
            }
        }

        if (transEndIdx !== -1) {
            const transBlock = afterAnchor.substring(openTrans, transEndIdx);
            // The rest is PART 2
            // We need to construct:
            // PART 1 (up to anchor) + anchor + "\n\n" + PART 2 (rest of content) + ",\n" + transBlock

            // Find where PART 2 ends. It ends at the last backtick before the next article ID or EOF?
            // Actually, looking at the file, PART 2 ends at `\n  },`

            // Simple swap:
            // Remove `,\n [TRANS_BLOCK]
            // Add `,\n [TRANS_BLOCK]` at the end of the content string

            // Find the END of the content string (the next backtick)
            const restOfString = afterAnchor.substring(transEndIdx);
            const endOfContent = restOfString.indexOf('`');

            // Wait, restOfString starts with text like "\n\n## El Top 5..."

            if (endOfContent !== -1) {
                console.log("Found end of content.");

                // Reconstruct
                const part1 = content.substring(0, idx + anchor.length);
                const part2 = restOfString.substring(0, endOfContent + 1); // Include backtick
                // part2 starts with newlines usually?

                const fixed = part1 + "\n" + part2 + ",\n    " + transBlock + restOfString.substring(endOfContent + 1);

                fs.writeFileSync(BLOG_PATH, fixed.replace(/\n/g, '\r\n'));
                console.log("Fixed specific article!");
                process.exit(0);
            }
        }
    }
}

console.log("Specific fix not applied.");
