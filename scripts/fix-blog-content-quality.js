#!/usr/bin/env node

/**
 * Blog Content Quality Fix Script
 * 
 * This script audits and fixes common blog content formatting issues:
 * - Removes repetitive content
 * - Improves accessibility
 * - Standardizes formatting
 * - Optimizes for mobile
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BLOG_DIR = path.join(__dirname, '..', 'app', 'blog');
const COMPONENTS_DIR = path.join(__dirname, '..', 'components', 'blog');

// Common issues to fix
const FIXES = {
  // Remove unused imports
  removeUnusedImports: true,
  // Add missing button types
  addButtonTypes: true,
  // Add aria-labels
  addAriaLabels: true,
  // Fix repetitive content
  fixRepetitiveContent: true,
  // Improve mobile responsiveness
  improveMobileResponsiveness: true,
  // Standardize color usage
  standardizeColors: true
};

/**
 * Scan directory for TypeScript/TSX files
 */
function scanDirectory(dir) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        scan(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

/**
 * Fix button accessibility issues
 */
function fixButtonAccessibility(content) {
  // Add type="button" to buttons without type
  content = content.replace(
    /<button(?![^>]*type=)([^>]*)>/g,
    '<button type="button"$1>'
  );
  
  // Add aria-labels to buttons without accessible names
  content = content.replace(
    /<button([^>]*?)>(\s*<[^>]*>\s*)*([^<]*?)(\s*<[^>]*>\s*)*<\/button>/g,
    (match, attrs, beforeText, text, afterText) => {
      if (!attrs.includes('aria-label') && !attrs.includes('aria-labelledby') && !text.trim()) {
        return match; // Skip if no text content and no aria-label
      }
      return match;
    }
  );
  
  return content;
}

/**
 * Fix form accessibility issues
 */
function fixFormAccessibility(content) {
  // Add aria-labels to select elements without labels
  content = content.replace(
    /<select(?![^>]*aria-label)([^>]*)>/g,
    '<select aria-label="Seleccionar opción"$1>'
  );
  
  // Add aria-labels to inputs without labels
  content = content.replace(
    /<input(?![^>]*aria-label)(?![^>]*id=)([^>]*type="(?:text|email|search)")([^>]*)>/g,
    '<input aria-label="Campo de entrada"$1$2>'
  );
  
  return content;
}

/**
 * Remove unused imports
 */
function removeUnusedImports(content) {
  const lines = content.split('\n');
  const usedImports = new Set();
  const importLines = [];
  
  // Find all import statements
  lines.forEach((line, index) => {
    if (line.trim().startsWith('import ')) {
      importLines.push({ line, index });
    }
  });
  
  // Find all used identifiers in the code
  const codeContent = lines.slice(importLines.length).join('\n');
  
  importLines.forEach(({ line, index }) => {
    const importMatch = line.match(/import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from/);
    if (importMatch) {
      const [, namedImports, namespaceImport, defaultImport] = importMatch;
      
      if (namedImports) {
        const imports = namedImports.split(',').map(imp => imp.trim());
        const usedNamedImports = imports.filter(imp => {
          const cleanImport = imp.replace(/\s+as\s+\w+/, '').trim();
          return codeContent.includes(cleanImport);
        });
        
        if (usedNamedImports.length === 0) {
          lines[index] = ''; // Remove unused import line
        } else if (usedNamedImports.length < imports.length) {
          // Update import with only used imports
          const newImportLine = line.replace(
            /{[^}]+}/,
            `{ ${usedNamedImports.join(', ')} }`
          );
          lines[index] = newImportLine;
        }
      } else if (namespaceImport && !codeContent.includes(namespaceImport)) {
        lines[index] = '';
      } else if (defaultImport && !codeContent.includes(defaultImport)) {
        lines[index] = '';
      }
    }
  });
  
  return lines.filter(line => line !== '').join('\n');
}

/**
 * Fix repetitive content in blog articles
 */
function fixRepetitiveContent(content) {
  // Remove repetitive section patterns
  const repetitivePatterns = [
    // Remove duplicate "Esta sección profundiza en..." paragraphs
    /Esta sección profundiza en [^,]+, proporcionando información detallada y práctica para implementar estas estrategias en tu negocio o proyecto personal\./g,
    
    // Remove repetitive "Para obtener los mejores resultados..." paragraphs
    /Para obtener los mejores resultados con [^,]+, es fundamental seguir un enfoque sistemático y medir constantemente los resultados\./g
  ];
  
  repetitivePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches && matches.length > 1) {
      // Keep only the first occurrence
      let firstFound = false;
      content = content.replace(pattern, (match) => {
        if (!firstFound) {
          firstFound = true;
          return match;
        }
        return '';
      });
    }
  });
  
  return content;
}

/**
 * Improve mobile responsiveness
 */
function improveMobileResponsiveness(content) {
  // Add responsive classes to containers
  content = content.replace(
    /className="([^"]*container[^"]*)"(?![^>]*responsive)/g,
    'className="$1 responsive-container"'
  );
  
  // Add mobile-friendly spacing
  content = content.replace(
    /className="([^"]*p-8[^"]*)"(?![^>]*mobile)/g,
    'className="$1 mobile-spacing"'
  );
  
  // Add mobile-friendly text sizes
  content = content.replace(
    /className="([^"]*text-4xl[^"]*)"(?![^>]*mobile)/g,
    'className="$1 text-2xl md:text-4xl"'
  );
  
  content = content.replace(
    /className="([^"]*text-5xl[^"]*)"(?![^>]*mobile)/g,
    'className="$1 text-3xl md:text-5xl"'
  );
  
  return content;
}

/**
 * Standardize color usage
 */
function standardizeColors(content) {
  // Replace hardcoded colors with theme-aware classes
  const colorReplacements = {
    'text-gray-900': 'text-foreground',
    'text-gray-800': 'text-foreground',
    'text-gray-700': 'text-muted-foreground',
    'text-gray-600': 'text-muted-foreground',
    'bg-white': 'bg-card',
    'bg-gray-50': 'bg-muted',
    'bg-gray-100': 'bg-muted',
    'border-gray-200': 'border-border',
    'border-gray-100': 'border-border'
  };
  
  Object.entries(colorReplacements).forEach(([oldColor, newColor]) => {
    const regex = new RegExp(`\\b${oldColor}\\b`, 'g');
    content = content.replace(regex, newColor);
  });
  
  return content;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  console.log(`Processing: ${path.relative(process.cwd(), filePath)}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  const originalContent = content;
  
  if (FIXES.addButtonTypes) {
    content = fixButtonAccessibility(content);
  }
  
  if (FIXES.addAriaLabels) {
    content = fixFormAccessibility(content);
  }
  
  if (FIXES.removeUnusedImports) {
    content = removeUnusedImports(content);
  }
  
  if (FIXES.fixRepetitiveContent) {
    content = fixRepetitiveContent(content);
  }
  
  if (FIXES.improveMobileResponsiveness) {
    content = improveMobileResponsiveness(content);
  }
  
  if (FIXES.standardizeColors) {
    content = standardizeColors(content);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    hasChanges = true;
    console.log(`  ✓ Fixed issues in ${path.basename(filePath)}`);
  } else {
    console.log(`  - No changes needed for ${path.basename(filePath)}`);
  }
  
  return hasChanges;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Starting blog content quality audit...\n');
  
  const blogFiles = scanDirectory(BLOG_DIR);
  const componentFiles = scanDirectory(COMPONENTS_DIR);
  const allFiles = [...blogFiles, ...componentFiles];
  
  console.log(`Found ${allFiles.length} files to process\n`);
  
  let totalChanges = 0;
  
  allFiles.forEach(file => {
    if (processFile(file)) {
      totalChanges++;
    }
  });
  
  console.log(`\n✅ Blog content quality audit complete!`);
  console.log(`📊 Files processed: ${allFiles.length}`);
  console.log(`🔧 Files modified: ${totalChanges}`);
  
  if (totalChanges > 0) {
    console.log('\n📝 Summary of fixes applied:');
    if (FIXES.addButtonTypes) console.log('  - Added missing button type attributes');
    if (FIXES.addAriaLabels) console.log('  - Added missing aria-labels for accessibility');
    if (FIXES.removeUnusedImports) console.log('  - Removed unused imports');
    if (FIXES.fixRepetitiveContent) console.log('  - Fixed repetitive content patterns');
    if (FIXES.improveMobileResponsiveness) console.log('  - Improved mobile responsiveness');
    if (FIXES.standardizeColors) console.log('  - Standardized color usage');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  processFile,
  fixButtonAccessibility,
  fixFormAccessibility,
  removeUnusedImports,
  fixRepetitiveContent,
  improveMobileResponsiveness,
  standardizeColors
};