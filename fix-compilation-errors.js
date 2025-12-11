#!/usr/bin/env node

/**
 * Fix Compilation Errors Script
 * Fixes syntax errors preventing build
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing compilation errors...\n');

const BLOG_DIR = 'app/blog';

// Get all blog posts with potential errors
function getBlogPosts() {
  const posts = [];
  
  try {
    const blogDirs = fs.readdirSync(BLOG_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const dir of blogDirs) {
      const pagePath = path.join(BLOG_DIR, dir, 'page.tsx');
      if (fs.existsSync(pagePath)) {
        posts.push({
          slug: dir,
          path: pagePath
        });
      }
    }
    
    return posts;
  } catch (error) {
    console.error('Error reading blog posts:', error.message);
    return [];
  }
}

// Fix common syntax errors
function fixSyntaxErrors(content, slug) {
  let fixed = content;
  let changes = [];
  
  // Fix 1: Missing comma in metadata
  if (fixed.includes("description: '") && fixed.includes("alternates:")) {
    const descRegex = /(description:\s*['"`][^'"`]+['"`])\s*\n\s*(alternates:)/g;
    if (descRegex.test(fixed)) {
      fixed = fixed.replace(descRegex, '$1,\n  $2');
      changes.push('Added missing comma after description');
    }
  }
  
  // Fix 2: Unterminated strings in JSON
  const jsonStringRegex = /"text":\s*"([^"]*<[^>]*className="[^"]*)[^"]*"/g;
  if (jsonStringRegex.test(fixed)) {
    fixed = fixed.replace(jsonStringRegex, (match, content) => {
      // Replace problematic HTML in JSON strings
      const cleanContent = content.replace(/<[^>]*>/g, '').substring(0, 100);
      return `"text": "${cleanContent}..."`;
    });
    changes.push('Fixed unterminated strings in JSON');
  }
  
  // Fix 3: HTML in JSON strings
  const htmlInJsonRegex = /"text":\s*"[^"]*<h[0-9][^>]*>[^"]*"/g;
  if (htmlInJsonRegex.test(fixed)) {
    fixed = fixed.replace(htmlInJsonRegex, (match) => {
      const cleanText = match.replace(/<[^>]*>/g, '').replace(/"/g, '').replace('text:', '').trim();
      return `"text": "${cleanText.substring(0, 150)}..."`;
    });
    changes.push('Removed HTML from JSON strings');
  }
  
  // Fix 4: Duplicate H1 tags
  const h1Regex = /<h1[^>]*>.*?<\/h1>/gi;
  const h1Matches = fixed.match(h1Regex) || [];
  if (h1Matches.length > 1) {
    // Keep only the first H1, remove duplicates
    let firstH1Found = false;
    fixed = fixed.replace(h1Regex, (match) => {
      if (!firstH1Found) {
        firstH1Found = true;
        return match;
      }
      return ''; // Remove duplicate H1s
    });
    changes.push(`Removed ${h1Matches.length - 1} duplicate H1 tags`);
  }
  
  // Fix 5: Malformed schema steps
  const schemaStepRegex = /"name":\s*"[^"]*<\/h[0-9]>"/g;
  if (schemaStepRegex.test(fixed)) {
    fixed = fixed.replace(schemaStepRegex, (match) => {
      const cleanName = match.replace(/<[^>]*>/g, '').replace(/"/g, '').replace('name:', '').trim();
      return `"name": "${cleanName}"`;
    });
    changes.push('Fixed malformed schema step names');
  }
  
  // Fix 6: Missing Head import
  if (fixed.includes('<Head>') && !fixed.includes("import Head from 'next/head'")) {
    const importRegex = /(import.*from ['"]next\/metadata['"];?\n)/;
    if (importRegex.test(fixed)) {
      fixed = fixed.replace(importRegex, "$1import Head from 'next/head';\n");
      changes.push('Added missing Head import');
    }
  }
  
  // Fix 7: Undefined combinedSchema variable
  if (fixed.includes('combinedSchema') && !fixed.includes('const combinedSchema')) {
    const schemaRegex = /(const howToSchema = \{[\s\S]*?\};)/;
    if (schemaRegex.test(fixed)) {
      fixed = fixed.replace(schemaRegex, '$1\n\nconst combinedSchema = [articleSchema, faqSchema, howToSchema];');
      changes.push('Added missing combinedSchema definition');
    }
  }
  
  // Fix 8: Malformed JSX attributes
  const jsxAttrRegex = /className="[^"]*text-2xl[^"]*text-3xl[^"]*text-4xl[^"]*"/g;
  if (jsxAttrRegex.test(fixed)) {
    fixed = fixed.replace(jsxAttrRegex, 'className="text-4xl font-bold mb-4"');
    changes.push('Fixed malformed JSX className attributes');
  }
  
  // Fix 9: Incomplete JSX tags
  const incompleteTagRegex = /<Link[^>]*className="[^"]*bg$/gm;
  if (incompleteTagRegex.test(fixed)) {
    fixed = fixed.replace(incompleteTagRegex, '<Link href="/correos-ia" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"');
    changes.push('Fixed incomplete JSX tags');
  }
  
  return { fixed, changes };
}

// Process single blog post
function fixBlogPost(post) {
  try {
    const content = fs.readFileSync(post.path, 'utf8');
    const { fixed, changes } = fixSyntaxErrors(content, post.slug);
    
    if (changes.length > 0) {
      // Create backup
      const backupDir = 'compilation-fix-backup';
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const backupPath = path.join(backupDir, `${post.slug}-page.tsx`);
      fs.writeFileSync(backupPath, content);
      
      // Write fixed content
      fs.writeFileSync(post.path, fixed);
      
      return {
        slug: post.slug,
        changes: changes,
        fixed: true
      };
    }
    
    return {
      slug: post.slug,
      changes: [],
      fixed: false
    };
    
  } catch (error) {
    console.error(`❌ Error processing ${post.slug}:`, error.message);
    return {
      slug: post.slug,
      changes: [],
      fixed: false,
      error: error.message
    };
  }
}

// Main execution
async function main() {
  const posts = getBlogPosts();
  console.log(`📊 Checking ${posts.length} blog posts for compilation errors...\n`);
  
  const results = [];
  let fixed = 0;
  let totalChanges = 0;
  
  for (const post of posts) {
    const result = fixBlogPost(post);
    results.push(result);
    
    if (result.fixed) {
      fixed++;
      totalChanges += result.changes.length;
      console.log(`✅ ${result.slug}: Fixed ${result.changes.length} issues`);
      result.changes.forEach(change => {
        console.log(`   - ${change}`);
      });
    } else if (result.error) {
      console.log(`❌ ${result.slug}: Error - ${result.error}`);
    } else {
      console.log(`➡️  ${result.slug}: No issues found`);
    }
  }
  
  // Summary
  console.log('\n📊 COMPILATION FIX SUMMARY');
  console.log('===========================');
  console.log(`Total posts checked: ${posts.length}`);
  console.log(`Posts fixed: ${fixed}`);
  console.log(`Total changes applied: ${totalChanges}`);
  
  if (fixed > 0) {
    console.log(`\n💾 Backups saved to: compilation-fix-backup/`);
  }
  
  // Save report
  const reportPath = 'compilation-fix-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalPosts: posts.length,
      postsFixed: fixed,
      totalChanges
    },
    results
  }, null, 2));
  
  console.log(`📄 Report saved to: ${reportPath}`);
  
  if (fixed > 0) {
    console.log('\n🎉 Compilation errors fixed! Try building again.');
  } else {
    console.log('\n✅ No compilation errors found.');
  }
}

main().catch(console.error);