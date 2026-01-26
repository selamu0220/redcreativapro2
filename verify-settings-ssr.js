
const { saveSettings, loadSettings, clearSettings } = require('./app/lib/settings-manager.ts');

console.log('Testing settings-manager in Node.js environment (no window/localStorage)...');

try {
  const settings = loadSettings();
  console.log('loadSettings returned:', settings);
  
  saveSettings({ provider: 'openai' });
  console.log('saveSettings executed without error');
  
  clearSettings();
  console.log('clearSettings executed without error');
  
  console.log('SUCCESS: settings-manager is SSR safe');
} catch (error) {
  console.error('FAILURE:', error);
  process.exit(1);
}
