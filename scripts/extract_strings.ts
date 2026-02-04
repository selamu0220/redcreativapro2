
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse as any;
import * as t from '@babel/types';

const SOURCE_DIR = './app';
const OUTPUT_FILE = './messages/en.json';

// Configuration for what to extract
const CONFIG = {
    ignoreAttributes: ['className', 'style', 'key', 'ref', 'width', 'height', 'src', 'alt', 'href', 'target', 'rel'],
    minStringLength: 3,
};

interface MessageMap {
    [key: string]: string;
}

const existingMessages: MessageMap = {};
if (fs.existsSync(OUTPUT_FILE)) {
    try {
        Object.assign(existingMessages, JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'))); // Keep existing keys
    } catch (e) {
        console.warn('Could not read existing messages, starting fresh.');
    }
}

const newMessages: MessageMap = {};

function generateKey(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .substring(0, 50); // Cap length
}

function processFile(filePath: string) {
    const code = fs.readFileSync(filePath, 'utf-8');

    try {
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
        });

        traverse(ast, {
            JSXText(path) {
                const text = path.node.value.trim();
                if (text.length >= CONFIG.minStringLength) {
                    const key = generateKey(text);
                    if (!existingMessages[key] && !newMessages[key]) {
                        newMessages[key] = text;
                    }
                }
            },
            JSXAttribute(path) {
                if (t.isJSXIdentifier(path.node.name) &&
                    !CONFIG.ignoreAttributes.includes(path.node.name.name) &&
                    path.node.value &&
                    t.isStringLiteral(path.node.value)) {
                    const text = path.node.value.value.trim();
                    if (text.length >= CONFIG.minStringLength) {
                        // Heuristic: Only extract attributes that look like readable text (has spaces or specific length)
                        if (text.includes(' ') || text.length > 5) {
                            const key = generateKey(text);
                            if (!existingMessages[key] && !newMessages[key]) {
                                newMessages[key] = text;
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
    }
}

async function run() {
    console.log('Starting string extraction...');
    const files = await glob(`${SOURCE_DIR}/**/*.{tsx,jsx}`);

    console.log(`Found ${files.length} files. Processing...`);

    for (const file of files) {
        processFile(file);
    }

    const mergedMessages = { ...existingMessages, ...newMessages };
    const sortedMessages = Object.keys(mergedMessages).sort().reduce((acc, key) => {
        acc[key] = mergedMessages[key];
        return acc;
    }, {} as MessageMap);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedMessages, null, 2));
    console.log(`Extraction complete. Added ${Object.keys(newMessages).length} new keys to ${OUTPUT_FILE}`);
}

run();
