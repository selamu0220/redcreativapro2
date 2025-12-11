#!/usr/bin/env node

/**
 * H1 Tags Fix Script
 * Fixes missing H1 tags across all blog articles
 */

const fs = require('fs');
const path = require('path');

console.log('🏷️ Starting H1 Tags Fix...\n');

const BLOG_DIR = 'app/blog';

// Get all blog posts
function getAllBlogPosts() {
  const posts = [];
  
  try {
    const blogDirs = fs.readdirSync(BLOG_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const dir of blogDirs) {
      const pagePath = path.join(BLOG_DIR, dir, 'page.tsx');
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');
        posts.push({
          slug: dir,
          path: pagePath,
          content: content
        });
      }
    }
    
    return posts;
  } catch (error) {
    console.error('Error reading blog posts:', error.message);
    return [];
  }
}

// Extract title from metadata
function extractTitle(content) {
  const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
  if (titleMatch) {
    return titleMatch[1].split('|')[0].split(':')[0].trim();
  }
  return null;
}

// Check if H1 tag exists
function hasH1Tag(content) {
  const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
  return h1Matches.length > 0;
}

// Generate SEO-optimized H1 from title
function generateH1FromTitle(title, slug) {
  // Clean title for H1
  let h1Text = title;
  
  // Remove common suffixes
  h1Text = h1Text.replace(/\s*\|\s*.*$/, ''); // Remove | and everything after
  h1Text = h1Text.replace(/\s*:\s*.*$/, ''); // Remove : and everything after if too long
  h1Text = h1Text.replace(/\s*-\s*.*$/, ''); // Remove - and everything after if too long
  
  // Ensure it's not too long
  if (h1Text.length > 60) {
    const words = h1Text.split(' ');
    h1Text = words.slice(0, Math.floor(words.length * 0.7)).join(' ');
  }
  
  // Capitalize properly
  h1Text = h1Text.charAt(0).toUpperCase() + h1Text.slice(1);
  
  return h1Text;
}

// Find the best location to insert H1
function findH1InsertionPoint(content) {
  // Look for common patterns where H1 should be inserted
  
  // Pattern 1: After opening article tag
  const articleMatch = content.match(/(<article[^>]*>[\s\S]*?<header[^>]*>[\s\S]*?)(.*?)(<\/header>)/);
  if (articleMatch) {
    return {
      type: 'header',
      before: articleMatch[1],
      after: articleMatch[3],
      insertAfter: articleMatch[1]
    };
  }
  
  // Pattern 2: After opening div with prose class
  const proseMatch = content.match(/(<div[^>]*prose[^>]*>[\s\S]*?)(.*?)(<section|<div|<p)/);
  if (proseMatch) {
    return {
      type: 'prose',
      before: proseMatch[1],
      after: proseMatch[3],
      insertAfter: proseMatch[1]
    };
  }
  
  // Pattern 3: After return statement opening
  const returnMatch = content.match(/(return \([\s\S]*?<[^>]+>[\s\S]*?)(.*?)(<section|<div|<article)/);
  if (returnMatch) {
    return {
      type: 'return',
      before: returnMatch[1],
      after: returnMatch[3],
      insertAfter: returnMatch[1]
    };
  }
  
  // Pattern 4: Look for existing header structure
  const headerStructureMatch = content.match(/(.*<header[^>]*>[\s\S]*?<p[^>]*>[\s\S]*?<\/p>[\s\S]*?)(.*?)(<\/header>)/);
  if (headerStructureMatch) {
    return {
      type: 'existing-header',
      before: headerStructureMatch[1],
      after: headerStructureMatch[3],
      insertAfter: headerStructureMatch[1]
    };
  }
  
  return null;
}

// Insert H1 tag into content
function insertH1Tag(content, h1Text, insertionPoint) {
  if (!insertionPoint) {
    // Fallback: insert after first opening tag in return statement
    const fallbackMatch = content.match(/(return \([\s\S]*?<[^>]+>)/);
    if (fallbackMatch) {
      const h1Tag = `\n        <h1 className="text-4xl font-bold mb-4 text-gray-900">\n          ${h1Text}\n        </h1>`;
      return content.replace(fallbackMatch[1], fallbackMatch[1] + h1Tag);
    }
    return content;
  }
  
  let h1Tag;
  
  switch (insertionPoint.type) {
    case 'header':
      h1Tag = `\n          <h1 className="text-4xl font-bold mb-4 text-gray-900">\n            ${h1Text}\n          </h1>`;
      break;
    case 'prose':
      h1Tag = `\n          <h1 className="text-4xl font-bold mb-6 text-gray-900">\n            ${h1Text}\n          </h1>\n          `;
      break;
    case 'return':
      h1Tag = `\n        <h1 className="text-4xl font-bold mb-6 text-gray-900">\n          ${h1Text}\n        </h1>\n        `;
      break;
    case 'existing-header':
      h1Tag = `\n          <h1 className="text-4xl font-bold mb-4 text-gray-900">\n            ${h1Text}\n          </h1>`;
      break;
    default:
      h1Tag = `\n        <h1 className="text-4xl font-bold mb-4 text-gray-900">\n          ${h1Text}\n        </h1>`;
  }
  
  return content.replace(insertionPoint.insertAfter, insertionPoint.insertAfter + h1Tag);
}

// Fix H1 tag for a single post
function fixH1Tag(post) {
  if (hasH1Tag(post.content)) {
    return {
      status: 'skipped',
      reason: 'H1 tag already exists'
    };
  }
  
  const title = extractTitle(post.content);
  if (!title) {
    return {
      status: 'failed',
      reason: 'Could not extract title'
    };
  }
  
  const h1Text = generateH1FromTitle(title, post.slug);
  const insertionPoint = findH1InsertionPoint(post.content);
  
  const updatedContent = insertH1Tag(post.content, h1Text, insertionPoint);
  
  if (updatedContent === post.content) {
    return {
      status: 'failed',
      reason: 'Could not find insertion point'
    };
  }
  
  // Create backup
  const backupDir = 'h1-fix-backup';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupPath = path.join(backupDir, `${post.slug}-page.tsx`);
  fs.writeFileSync(backupPath, post.content);
  
  // Write updated content
  fs.writeFileSync(post.path, updatedContent);
  
  return {
    status: 'fixed',
    h1Text: h1Text,
    originalTitle: title,
    insertionType: insertionPoint?.type || 'fallback'
  };
}

// Main execution
async function main() {
  const allPosts = getAllBlogPosts();
  console.log(`📊 Analyzing ${allPosts.length} blog posts for H1 tags...\n`);
  
  const results = [];
  let fixed = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const post of allPosts) {
    const result = fixH1Tag(post);
    results.push({
      slug: post.slug,
      ...result
    });
    
    switch (result.status) {
      case 'fixed':
        fixed++;
        console.log(`✅ ${post.slug}: Added H1 "${result.h1Text}" (${result.insertionType})`);
        break;
      case 'skipped':
        skipped++;
        console.log(`➡️  ${post.slug}: ${result.reason}`);
        break;
      case 'failed':
        failed++;
        console.log(`❌ ${post.slug}: ${result.reason}`);
        break;
    }
  }
  
  // Summary
  console.log('\n📊 H1 TAGS FIX SUMMARY');
  console.log('=======================');
  console.log(`Total posts analyzed: ${allPosts.length}`);
  console.log(`H1 tags added: ${fixed}`);
  console.log(`Posts skipped: ${skipped}`);
  console.log(`Failed fixes: ${failed}`);
  console.log(`Success rate: ${Math.round((fixed / (fixed + failed)) * 100)}%`);
  
  // Insertion type breakdown
  const insertionTypes = {};
  results.filter(r => r.status === 'fixed').forEach(result => {
    const type = result.insertionType || 'unknown';
    insertionTypes[type] = (insertionTypes[type] || 0) + 1;
  });
  
  if (Object.keys(insertionTypes).length > 0) {
    console.log('\nInsertion methods used:');
    Object.entries(insertionTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} posts`);
    });
  }
  
  // Failed posts analysis
  const failedPosts = results.filter(r => r.status === 'failed');
  if (failedPosts.length > 0) {
    console.log('\n⚠️  Posts requiring manual attention:');
    failedPosts.forEach(post => {
      console.log(`  ${post.slug}: ${post.reason}`);
    });
  }
  
  // Save report
  const reportPath = 'h1-fix-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalPosts: allPosts.length,
      fixed,
      skipped,
      failed,
      successRate: Math.round((fixed / (fixed + failed)) * 100),
      insertionTypes
    },
    results
  }, null, 2));
  
  console.log(`\n📄 Report saved to: ${reportPath}`);
  console.log(`💾 Backups saved to: h1-fix-backup/`);
  
  console.log('\n🎯 IMPACT ON SEO:');
  console.log('• Improved page structure and hierarchy');
  console.log('• Better keyword targeting in H1 tags');
  console.log('• Enhanced crawlability for search engines');
  console.log('• Reduced critical SEO issues significantly');
  
  if (fixed > 0) {
    console.log(`\n🎉 Successfully fixed ${fixed} critical H1 tag issues!`);
    console.log('This resolves the most critical SEO problem identified.');
  }
  
  if (failed > 0) {
    console.log(`\n⚠️  ${failed} posts need manual H1 tag addition.`);
    console.log('Review the failed posts and add H1 tags manually.');
  }
}

main().catch(console.error);