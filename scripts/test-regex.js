const line = '**Meta Título:** Mejores Herramientas IA';

console.log('Testing line:', line);
console.log('Length:', line.length);
console.log('Starts with **:', line.startsWith('**'));

const match1 = line.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
console.log('Match1:', match1);

const match2 = line.match(/^\*\*([^*]+)\*\*:\s*(.+)$/);
console.log('Match2:', match2);

const match3 = line.match(/\*\*(.+?)\*\*:\s*(.+)/);
console.log('Match3:', match3);
