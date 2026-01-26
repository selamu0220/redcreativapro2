
const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

const pattern = 'trae-api-us.mchost.guru';
const results = [];

walkDir(process.cwd(), (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(pattern)) {
      results.push(filePath);
    }
  }
});

console.log('Files containing the unstable domain:');
results.forEach(r => console.log(r));
