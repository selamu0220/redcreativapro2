const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'blogs', 'herramientas-ia-gratuitas-2025', 'post.md');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Total de líneas:', lines.length);
console.log('\nPrimeras 15 líneas:');
lines.slice(0, 15).forEach((line, i) => {
  const display = line.replace(/\*/g, '\\*');
  console.log(`${i + 1}: [${line.length} chars] "${display}"`);
});

console.log('\n\nProbando diferentes regex:');
lines.slice(0, 15).forEach((line, i) => {
  // Regex 1: Original
  const match1 = line.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
  if (match1) console.log(`Línea ${i + 1} MATCH1: "${match1[1]}" = "${match1[2].substring(0, 50)}..."`);
  
  // Regex 2: Sin anclaje de inicio
  const match2 = line.match(/\*\*(.+?)\*\*:\s*(.+)/);
  if (match2 && !match1) console.log(`Línea ${i + 1} MATCH2: "${match2[1]}"`);
  
  // Regex 3: Solo buscar ** al inicio
  if (line.startsWith('**')) {
    console.log(`Línea ${i + 1} startsWith **: "${line.substring(0, 60)}..."`);
  }
});

console.log('\n\nVerificando encoding:');
const sample = lines[2];
console.log('Sample line 3:', sample);
console.log('Char codes:', [...sample].map(c => c.charCodeAt(0)).slice(0, 20));

console.log('\n\nProbando regex más flexible:');
lines.slice(0, 15).forEach((line, i) => {
  // Regex 4: Con optional whitespace al inicio
  const match4 = line.match(/^\s*\*\*(.+?)\*\*:\s*(.+)$/);
  if (match4) {
    console.log(`Línea ${i + 1} MATCH4: "${match4[1]}" = "${match4[2].substring(0, 50)}"`);
  }
});
