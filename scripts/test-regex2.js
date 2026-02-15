const line = '**Meta Título:** Mejores Herramientas IA';

console.log('Testing line:', line);
console.log('Length:', line.length);
console.log('Char codes:', [...line].map(c => `${c}=${c.charCodeAt(0)}`).join(', '));

// Probar paso a paso
console.log('\nStep by step:');
console.log('line[0]:', line[0], 'code:', line.charCodeAt(0)); // Debería ser *
console.log('line[1]:', line[1], 'code:', line.charCodeAt(1)); // Debería ser *
console.log('line[2]:', line[2], 'code:', line.charCodeAt(2)); // Debería ser M

// Probar con indexOf
console.log('\nIndex of **:', line.indexOf('**'));
console.log('Index of :**:', line.indexOf('**:'));
console.log('Index of :', line.indexOf(':'));

// Probar split
const parts = line.split('**');
console.log('\nSplit by **:', parts);

// Probar con substring
console.log('\nSubstring 0-10:', line.substring(0, 10));

// Regex ultra simple
const match = line.match(/Meta/);
console.log('\nMatch "Meta":', match);
