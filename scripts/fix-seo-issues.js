#!/usr/bin/env node

/**
 * SEO Issues Fix Script
 * Identifies and fixes common SEO problems across the site
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting SEO Issues Fix...\n');

const BLOG_DIR = 'app/blog';
const ISSUES_FOUND = [];
const FIXES_APPLIED = [];

// SEO Issue Types
const SEO_ISSUES = {
  MISSING_META_DESCRIPTION: 'missing_meta_description',
  SHORT_META_DESCRIPTION: 'short_meta_description',
  LONG_META_DESCRIPTION: 'long_meta_description',
  DUPLICATE_TITLE: 'duplicate_title',
  MISSING_KEYWORDS: 'missing_keywords',
  NO_H1_TAG: 'no_h1_tag',
  MULTIPLE_H1_TAGS: 'multiple_h1_tags',
  MISSING_ALT_TEXT: 'missing_alt_text',
  BROKEN_INTERNAL_LINKS: 'broken_internal_links',
  MISSING_CANONICAL: 'missing_canonical',
  POOR_URL_STRUCTURE: 'poor_url_structure',
  MISSING_SCHEMA: 'missing_schema',
  THIN_CONTENT: 'thin_content'
};

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

// Check meta description issues
function checkMetaDescription(post) {
  const issues = [];
  const descriptionMatch = post.content.match(/description:\s*['"`]([^'"`]+)['"`]/);
  
  if (!descriptionMatch) {
    issues.push({
      type: SEO_ISSUES.MISSING_META_DESCRIPTION,
      severity: 'high',
      message: 'Missing meta description'
    });
  } else {
    const description = descriptionMatch[1];
    if (description.length < 120) {
      issues.push({
        type: SEO_ISSUES.SHORT_META_DESCRIPTION,
        severity: 'medium',
        message: `Meta description too short (${description.length} chars)`,
        current: description
      });
    } else if (description.length > 160) {
      issues.push({
        type: SEO_ISSUES.LONG_META_DESCRIPTION,
        severity: 'medium',
        message: `Meta description too long (${description.length} chars)`,
        current: description
      });
    }
  }
  
  return issues;
}

// Check title issues
function checkTitle(post, allPosts) {
  const issues = [];
  const titleMatch = post.content.match(/title:\s*['"`]([^'"`]+)['"`]/);
  
  if (titleMatch) {
    const title = titleMatch[1];
    
    // Check for duplicate titles
    const duplicates = allPosts.filter(p => 
      p.slug !== post.slug && 
      p.content.match(/title:\s*['"`]([^'"`]+)['"`]/)?.[1] === title
    );
    
    if (duplicates.length > 0) {
      issues.push({
        type: SEO_ISSUES.DUPLICATE_TITLE,
        severity: 'high',
        message: `Duplicate title found in: ${duplicates.map(p => p.slug).join(', ')}`,
        current: title
      });
    }
  }
  
  return issues;
}

// Check H1 tag issues
function checkH1Tags(post) {
  const issues = [];
  const h1Matches = post.content.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
  
  if (h1Matches.length === 0) {
    issues.push({
      type: SEO_ISSUES.NO_H1_TAG,
      severity: 'high',
      message: 'No H1 tag found'
    });
  } else if (h1Matches.length > 1) {
    issues.push({
      type: SEO_ISSUES.MULTIPLE_H1_TAGS,
      severity: 'medium',
      message: `Multiple H1 tags found (${h1Matches.length})`
    });
  }
  
  return issues;
}

// Check keywords
function checkKeywords(post) {
  const issues = [];
  const keywordsMatch = post.content.match(/keywords:\s*['"`]([^'"`]+)['"`]/);
  
  if (!keywordsMatch) {
    issues.push({
      type: SEO_ISSUES.MISSING_KEYWORDS,
      severity: 'medium',
      message: 'Missing keywords meta tag'
    });
  }
  
  return issues;
}

// Check canonical URL
function checkCanonical(post) {
  const issues = [];
  const canonicalMatch = post.content.match(/canonical:\s*['"`]([^'"`]+)['"`]/);
  
  if (!canonicalMatch) {
    issues.push({
      type: SEO_ISSUES.MISSING_CANONICAL,
      severity: 'medium',
      message: 'Missing canonical URL'
    });
  }
  
  return issues;
}

// Check schema markup
function checkSchema(post) {
  const issues = [];
  const hasSchema = post.content.includes('@context') || post.content.includes('articleSchema');
  
  if (!hasSchema) {
    issues.push({
      type: SEO_ISSUES.MISSING_SCHEMA,
      severity: 'medium',
      message: 'Missing structured data/schema markup'
    });
  }
  
  return issues;
}

// Check content length
function checkContentLength(post) {
  const issues = [];
  
  // Estimate content length (rough approximation)
  const contentSections = post.content.match(/<section|<div.*prose|<article/gi) || [];
  const textContent = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  const wordCount = textContent.split(' ').length;
  
  if (wordCount < 300) {
    issues.push({
      type: SEO_ISSUES.THIN_CONTENT,
      severity: 'high',
      message: `Content appears thin (estimated ${wordCount} words)`
    });
  }
  
  return issues;
}

// Check URL structure
function checkUrlStructure(post) {
  const issues = [];
  const slug = post.slug;
  
  // Check for SEO-friendly URL patterns
  if (slug.length > 60) {
    issues.push({
      type: SEO_ISSUES.POOR_URL_STRUCTURE,
      severity: 'low',
      message: `URL too long (${slug.length} chars)`
    });
  }
  
  if (!/^[a-z0-9-]+$/.test(slug)) {
    issues.push({
      type: SEO_ISSUES.POOR_URL_STRUCTURE,
      severity: 'medium',
      message: 'URL contains non-SEO-friendly characters'
    });
  }
  
  return issues;
}

// Fix missing meta description
function fixMissingMetaDescription(post) {
  const titleMatch = post.content.match(/title:\s*['"`]([^'"`]+)['"`]/);
  if (!titleMatch) return false;
  
  const title = titleMatch[1];
  const slug = post.slug;
  
  // Generate a basic meta description
  const description = `✨ Descubre ${title.toLowerCase()} ★ Guía completa con ejemplos prácticos ✓ Técnicas profesionales → ¡Resultados garantizados!`;
  
  // Insert meta description after title
  const updatedContent = post.content.replace(
    /(title:\s*['"`][^'"`]+['"`],?\s*)/,
    `$1\n  description: '${description}',`
  );
  
  if (updatedContent !== post.content) {
    fs.writeFileSync(post.path, updatedContent);
    return { description };
  }
  
  return false;
}

// Fix missing keywords
function fixMissingKeywords(post) {
  const titleMatch = post.content.match(/title:\s*['"`]([^'"`]+)['"`]/);
  if (!titleMatch) return false;
  
  const title = titleMatch[1].toLowerCase();
  const slug = post.slug;
  
  // Generate keywords based on title and slug
  const keywords = [
    ...title.split(' ').filter(word => word.length > 3),
    ...slug.split('-').filter(word => word.length > 2),
    'IA', 'inteligencia artificial', 'escritura', 'contenido'
  ].slice(0, 10).join(', ');
  
  // Insert keywords after description or title
  const descriptionRegex = /(description:\s*['"`][^'"`]+['"`],?\s*)/;
  const titleRegex = /(title:\s*['"`][^'"`]+['"`],?\s*)/;
  
  let updatedContent = post.content;
  
  if (descriptionRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(
      descriptionRegex,
      `$1\n  keywords: '${keywords}',`
    );
  } else if (titleRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(
      titleRegex,
      `$1\n  keywords: '${keywords}',`
    );
  }
  
  if (updatedContent !== post.content) {
    fs.writeFileSync(post.path, updatedContent);
    return { keywords };
  }
  
  return false;
}

// Fix missing canonical URL
function fixMissingCanonical(post) {
  const canonicalUrl = `https://redcreativa.pro/blog/${post.slug}`;
  
  // Insert canonical after description/keywords
  const metaRegex = /((?:description|keywords):\s*['"`][^'"`]+['"`],?\s*)/;
  
  if (metaRegex.test(post.content)) {
    const updatedContent = post.content.replace(
      metaRegex,
      `$1\n  alternates: { canonical: '${canonicalUrl}' },`
    );
    
    if (updatedContent !== post.content) {
      fs.writeFileSync(post.path, updatedContent);
      return { canonicalUrl };
    }
  }
  
  return false;
}

// Apply automatic fixes
function applyFixes(post, issues) {
  const fixes = [];
  
  for (const issue of issues) {
    let fix = null;
    
    switch (issue.type) {
      case SEO_ISSUES.MISSING_META_DESCRIPTION:
        fix = fixMissingMetaDescription(post);
        if (fix) {
          fixes.push({
            type: issue.type,
            action: 'Added meta description',
            details: fix
          });
        }
        break;
        
      case SEO_ISSUES.MISSING_KEYWORDS:
        fix = fixMissingKeywords(post);
        if (fix) {
          fixes.push({
            type: issue.type,
            action: 'Added keywords',
            details: fix
          });
        }
        break;
        
      case SEO_ISSUES.MISSING_CANONICAL:
        fix = fixMissingCanonical(post);
        if (fix) {
          fixes.push({
            type: issue.type,
            action: 'Added canonical URL',
            details: fix
          });
        }
        break;
    }
  }
  
  return fixes;
}

// Analyze single post
function analyzePost(post, allPosts) {
  const issues = [
    ...checkMetaDescription(post),
    ...checkTitle(post, allPosts),
    ...checkH1Tags(post),
    ...checkKeywords(post),
    ...checkCanonical(post),
    ...checkSchema(post),
    ...checkContentLength(post),
    ...checkUrlStructure(post)
  ];
  
  return issues;
}

// Main execution
async function main() {
  const allPosts = getAllBlogPosts();
  console.log(`📊 Analyzing ${allPosts.length} blog posts for SEO issues...\n`);
  
  const results = [];
  let totalIssues = 0;
  let totalFixes = 0;
  
  // Analyze each post
  for (const post of allPosts) {
    const issues = analyzePost(post, allPosts);
    const fixes = applyFixes(post, issues);
    
    if (issues.length > 0) {
      results.push({
        slug: post.slug,
        issues: issues,
        fixes: fixes
      });
      
      totalIssues += issues.length;
      totalFixes += fixes.length;
      
      // Log issues and fixes
      const highIssues = issues.filter(i => i.severity === 'high').length;
      const mediumIssues = issues.filter(i => i.severity === 'medium').length;
      const lowIssues = issues.filter(i => i.severity === 'low').length;
      
      console.log(`${highIssues > 0 ? '🔴' : mediumIssues > 0 ? '🟡' : '🟢'} ${post.slug}:`);
      console.log(`   Issues: ${issues.length} (${highIssues}H, ${mediumIssues}M, ${lowIssues}L) | Fixes: ${fixes.length}`);
      
      if (fixes.length > 0) {
        fixes.forEach(fix => {
          console.log(`   ✅ ${fix.action}`);
        });
      }
    } else {
      console.log(`✅ ${post.slug}: No issues found`);
    }
  }
  
  // Summary by issue type
  const issueTypeCounts = {};
  const fixTypeCounts = {};
  
  results.forEach(result => {
    result.issues.forEach(issue => {
      issueTypeCounts[issue.type] = (issueTypeCounts[issue.type] || 0) + 1;
    });
    
    result.fixes.forEach(fix => {
      fixTypeCounts[fix.type] = (fixTypeCounts[fix.type] || 0) + 1;
    });
  });
  
  console.log('\n📊 SEO ISSUES ANALYSIS SUMMARY');
  console.log('===============================');
  console.log(`Total posts analyzed: ${allPosts.length}`);
  console.log(`Posts with issues: ${results.length}`);
  console.log(`Total issues found: ${totalIssues}`);
  console.log(`Total fixes applied: ${totalFixes}`);
  console.log(`Fix rate: ${Math.round((totalFixes / totalIssues) * 100)}%`);
  
  console.log('\n🔍 Issues by type:');
  Object.entries(issueTypeCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      const fixed = fixTypeCounts[type] || 0;
      console.log(`  ${type}: ${count} found, ${fixed} fixed`);
    });
  
  // Severity breakdown
  const severityCounts = { high: 0, medium: 0, low: 0 };
  results.forEach(result => {
    result.issues.forEach(issue => {
      severityCounts[issue.severity]++;
    });
  });
  
  console.log('\n⚠️  Issues by severity:');
  console.log(`  High: ${severityCounts.high}`);
  console.log(`  Medium: ${severityCounts.medium}`);
  console.log(`  Low: ${severityCounts.low}`);
  
  // Posts needing attention
  const criticalPosts = results.filter(r => 
    r.issues.some(i => i.severity === 'high')
  ).length;
  
  console.log(`\n🚨 Posts needing immediate attention: ${criticalPosts}`);
  
  // Save detailed report
  const reportPath = 'seo-issues-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalPosts: allPosts.length,
      postsWithIssues: results.length,
      totalIssues,
      totalFixes,
      fixRate: Math.round((totalFixes / totalIssues) * 100),
      issueTypeCounts,
      fixTypeCounts,
      severityCounts,
      criticalPosts
    },
    results: results
  }, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Review high-severity issues manually');
  console.log('2. Create missing content for thin pages');
  console.log('3. Fix duplicate titles');
  console.log('4. Add missing H1 tags');
  console.log('5. Implement remaining schema markup');
  
  console.log('\n🎉 SEO Issues Analysis completed!');
}

main().catch(console.error);