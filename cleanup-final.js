const fs = require('fs');
const path = require('path');

const basePath = __dirname;

const dirsToRemove = [
  'stagehand-demo',
  'redcreativapro',
  'seo-optimization-backup',
  'h1-fix-backup',
  'compilation-fix-backup',
  'data-backup',
  'brevo-minimal',
  'android',
  'convex',
  'trigger',
  'docs',
  'my-strapi-project'
];

console.log('Removing unused directories...\n');

let removed = 0;
for (const dir of dirsToRemove) {
  const fullPath = path.join(basePath, dir);
  if (fs.existsSync(fullPath)) {
    console.log('Removing:', dir);
    try {
      fs.rmSync(fullPath, { recursive: true, force: true, maxRetries: 5 });
      removed++;
      console.log('  Done');
    } catch (e) {
      console.log('  Error:', e.message);
    }
  }
}

console.log('\nRemoved', removed, 'directories');
