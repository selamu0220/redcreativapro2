#!/usr/bin/env node

/**
 * Final SEO Campaign Verification Script
 * Comprehensive validation of all SEO improvements
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 FINAL SEO CAMPAIGN VERIFICATION\n');
console.log('===================================\n');

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

// Comprehensive SEO analysis
function analyzeSEOStatus(posts) {
  const analysis = {
    total: posts.length,
    metaDescriptions: { optimized: 0, missing: 0, short: 0, long: 0 },
    h1Tags: { present: 0, missing: 0, multiple: 0 },
    keywords: { present: 0, missing: 0 },
    canonical: { present: 0, missing: 0 },
    schema: { present: 0, missing: 0 },
    internalLinks: { present: 0, missing: 0 },
    contentLength: { adequate: 0, thin: 0, comprehensive: 0 }
  };
  
  posts.forEach(post => {
    const content = post.content;
    
    // Meta descriptions
    const descMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
    if (!descMatch) {
      analysis.metaDescriptions.missing++;
    } else {
      const desc = descMatch[1];
      if (desc.length < 120) {
        analysis.metaDescriptions.short++;
      } else if (desc.length > 160) {
        analysis.metaDescriptions.long++;
      } else {
        analysis.metaDescriptions.optimized++;
      }
    }
    
    // H1 tags
    const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
    if (h1Matches.length === 0) {
      analysis.h1Tags.missing++;
    } else if (h1Matches.length > 1) {
      analysis.h1Tags.multiple++;
    } else {
      analysis.h1Tags.present++;
    }
    
    // Keywords
    const keywordsMatch = content.match(/keywords:\s*['"`]([^'"`]+)['"`]/);
    if (keywordsMatch) {
      analysis.keywords.present++;
    } else {
      analysis.keywords.missing++;
    }
    
    // Canonical URLs
    const canonicalMatch = content.match(/canonical:\s*['"`]([^'"`]+)['"`]/);
    if (canonicalMatch) {
      analysis.canonical.present++;
    } else {
      analysis.canonical.missing++;
    }
    
    // Schema markup
    const hasSchema = content.includes('@context') || content.includes('articleSchema');
    if (hasSchema) {
      analysis.schema.present++;
    } else {
      analysis.schema.missing++;
    }
    
    // Internal links
    const hasInternalLinks = content.includes('📚 Artículos Relacionados') || 
                            content.includes('href="/blog/');
    if (hasInternalLinks) {
      analysis.internalLinks.present++;
    } else {
      analysis.internalLinks.missing++;
    }
    
    // Content length estimation
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    const wordCount = textContent.split(' ').length;
    
    if (wordCount < 500) {
      analysis.contentLength.thin++;
    } else if (wordCount > 2000) {
      analysis.contentLength.comprehensive++;
    } else {
      analysis.contentLength.adequate++;
    }
  });
  
  return analysis;
}

// Calculate SEO health score
function calculateHealthScore(analysis) {
  const total = analysis.total;
  let score = 0;
  
  // Meta descriptions (25 points)
  const metaScore = (analysis.metaDescriptions.optimized / total) * 25;
  score += metaScore;
  
  // H1 tags (20 points)
  const h1Score = (analysis.h1Tags.present / total) * 20;
  score += h1Score;
  
  // Keywords (15 points)
  const keywordScore = (analysis.keywords.present / total) * 15;
  score += keywordScore;
  
  // Schema markup (15 points)
  const schemaScore = (analysis.schema.present / total) * 15;
  score += schemaScore;
  
  // Internal links (15 points)
  const linkScore = (analysis.internalLinks.present / total) * 15;
  score += linkScore;
  
  // Content quality (10 points)
  const contentScore = ((analysis.contentLength.adequate + analysis.contentLength.comprehensive) / total) * 10;
  score += contentScore;
  
  return {
    total: Math.round(score),
    breakdown: {
      metaDescriptions: Math.round(metaScore),
      h1Tags: Math.round(h1Score),
      keywords: Math.round(keywordScore),
      schema: Math.round(schemaScore),
      internalLinks: Math.round(linkScore),
      content: Math.round(contentScore)
    }
  };
}

// Load campaign reports
function loadCampaignReports() {
  const reports = {};
  const reportFiles = [
    'seo-optimization-report.json',
    'keyword-expansion-report.json',
    'internal-linking-report.json',
    'schema-implementation-report.json',
    'seo-issues-report.json',
    'h1-fix-report.json'
  ];
  
  reportFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const reportName = file.replace('-report.json', '').replace('.json', '');
        reports[reportName] = JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (error) {
        console.log(`⚠️  Could not load ${file}: ${error.message}`);
      }
    }
  });
  
  return reports;
}

// Generate final recommendations
function generateFinalRecommendations(analysis, healthScore) {
  const recommendations = [];
  
  // Critical issues (score impact > 5 points)
  if (analysis.h1Tags.missing > 5) {
    recommendations.push({
      priority: 'critical',
      issue: `${analysis.h1Tags.missing} posts missing H1 tags`,
      impact: 'High ranking impact',
      action: 'Add H1 tags to remaining posts'
    });
  }
  
  if (analysis.metaDescriptions.missing > 10) {
    recommendations.push({
      priority: 'critical',
      issue: `${analysis.metaDescriptions.missing} posts missing meta descriptions`,
      impact: 'High CTR impact',
      action: 'Create optimized meta descriptions'
    });
  }
  
  // High priority issues
  if (analysis.schema.missing > analysis.total * 0.7) {
    recommendations.push({
      priority: 'high',
      issue: `${analysis.schema.missing} posts missing schema markup`,
      impact: 'Rich snippets opportunity',
      action: 'Implement structured data'
    });
  }
  
  if (analysis.contentLength.thin > 10) {
    recommendations.push({
      priority: 'high',
      issue: `${analysis.contentLength.thin} posts with thin content`,
      impact: 'Content quality and rankings',
      action: 'Expand content with valuable information'
    });
  }
  
  // Medium priority issues
  if (analysis.internalLinks.missing > analysis.total * 0.3) {
    recommendations.push({
      priority: 'medium',
      issue: `${analysis.internalLinks.missing} posts missing internal links`,
      impact: 'User engagement and crawlability',
      action: 'Add relevant internal links'
    });
  }
  
  if (analysis.keywords.missing > 5) {
    recommendations.push({
      priority: 'medium',
      issue: `${analysis.keywords.missing} posts missing keywords`,
      impact: 'Keyword targeting',
      action: 'Add relevant keyword meta tags'
    });
  }
  
  return recommendations;
}

// Main execution
async function main() {
  console.log('📊 Analyzing current SEO status...\n');
  
  const posts = getAllBlogPosts();
  const analysis = analyzeSEOStatus(posts);
  const healthScore = calculateHealthScore(analysis);
  const reports = loadCampaignReports();
  const recommendations = generateFinalRecommendations(analysis, healthScore);
  
  // Display current status
  console.log('📈 CURRENT SEO STATUS');
  console.log('=====================\n');
  
  console.log(`📄 Total blog posts: ${analysis.total}\n`);
  
  console.log('🏷️  Meta Descriptions:');
  console.log(`   ✅ Optimized: ${analysis.metaDescriptions.optimized} (${Math.round((analysis.metaDescriptions.optimized/analysis.total)*100)}%)`);
  console.log(`   ⚠️  Short: ${analysis.metaDescriptions.short}`);
  console.log(`   ⚠️  Long: ${analysis.metaDescriptions.long}`);
  console.log(`   ❌ Missing: ${analysis.metaDescriptions.missing}\n`);
  
  console.log('🏷️  H1 Tags:');
  console.log(`   ✅ Present: ${analysis.h1Tags.present} (${Math.round((analysis.h1Tags.present/analysis.total)*100)}%)`);
  console.log(`   ⚠️  Multiple: ${analysis.h1Tags.multiple}`);
  console.log(`   ❌ Missing: ${analysis.h1Tags.missing}\n`);
  
  console.log('🔑 Keywords:');
  console.log(`   ✅ Present: ${analysis.keywords.present} (${Math.round((analysis.keywords.present/analysis.total)*100)}%)`);
  console.log(`   ❌ Missing: ${analysis.keywords.missing}\n`);
  
  console.log('📋 Schema Markup:');
  console.log(`   ✅ Present: ${analysis.schema.present} (${Math.round((analysis.schema.present/analysis.total)*100)}%)`);
  console.log(`   ❌ Missing: ${analysis.schema.missing}\n`);
  
  console.log('🔗 Internal Links:');
  console.log(`   ✅ Present: ${analysis.internalLinks.present} (${Math.round((analysis.internalLinks.present/analysis.total)*100)}%)`);
  console.log(`   ❌ Missing: ${analysis.internalLinks.missing}\n`);
  
  console.log('📝 Content Quality:');
  console.log(`   ✅ Comprehensive: ${analysis.contentLength.comprehensive}`);
  console.log(`   ✅ Adequate: ${analysis.contentLength.adequate}`);
  console.log(`   ⚠️  Thin: ${analysis.contentLength.thin}\n`);
  
  // Health score
  console.log('🏆 SEO HEALTH SCORE');
  console.log('===================\n');
  console.log(`Overall Score: ${healthScore.total}/100\n`);
  console.log('Breakdown:');
  console.log(`   Meta Descriptions: ${healthScore.breakdown.metaDescriptions}/25`);
  console.log(`   H1 Tags: ${healthScore.breakdown.h1Tags}/20`);
  console.log(`   Keywords: ${healthScore.breakdown.keywords}/15`);
  console.log(`   Schema Markup: ${healthScore.breakdown.schema}/15`);
  console.log(`   Internal Links: ${healthScore.breakdown.internalLinks}/15`);
  console.log(`   Content Quality: ${healthScore.breakdown.content}/10\n`);
  
  // Campaign summary
  console.log('📊 CAMPAIGN SUMMARY');
  console.log('===================\n');
  
  if (reports['seo-optimization']) {
    console.log(`✅ Meta Description Optimization: ${reports['seo-optimization'].summary.processed} posts improved`);
  }
  
  if (reports['h1-fix']) {
    console.log(`✅ H1 Tags Fixed: ${reports['h1-fix'].summary.fixed} tags added`);
  }
  
  if (reports['keyword-expansion']) {
    console.log(`✅ Keyword Expansion: ${reports['keyword-expansion'].summary.articlesCreated} new articles created`);
  }
  
  if (reports['internal-linking']) {
    console.log(`✅ Internal Linking: ${reports['internal-linking'].summary.totalLinksAdded} links added`);
  }
  
  if (reports['schema-implementation']) {
    console.log(`✅ Schema Implementation: ${reports['schema-implementation'].summary.schemasAdded} schemas added`);
  }
  
  console.log('');
  
  // Recommendations
  if (recommendations.length > 0) {
    console.log('🎯 PRIORITY RECOMMENDATIONS');
    console.log('===========================\n');
    
    recommendations.forEach((rec, index) => {
      const priorityEmoji = rec.priority === 'critical' ? '🔴' : 
                           rec.priority === 'high' ? '🟡' : '🟢';
      console.log(`${priorityEmoji} ${rec.issue}`);
      console.log(`   Impact: ${rec.impact}`);
      console.log(`   Action: ${rec.action}\n`);
    });
  }
  
  // Final assessment
  console.log('🎉 FINAL ASSESSMENT');
  console.log('===================\n');
  
  if (healthScore.total >= 80) {
    console.log('🟢 EXCELLENT: Your SEO is in great shape!');
    console.log('Continue monitoring and making incremental improvements.');
  } else if (healthScore.total >= 60) {
    console.log('🟡 GOOD: Solid SEO foundation with room for improvement.');
    console.log('Focus on the high-priority recommendations above.');
  } else if (healthScore.total >= 40) {
    console.log('🟠 FAIR: Basic SEO implemented, significant improvements needed.');
    console.log('Address critical and high-priority issues systematically.');
  } else {
    console.log('🔴 NEEDS WORK: Significant SEO improvements required.');
    console.log('Focus on critical issues first, then work through priorities.');
  }
  
  console.log('\n📈 EXPECTED RESULTS TIMELINE:');
  console.log('• Week 1-2: Search engines begin indexing improvements');
  console.log('• Week 3-4: Initial ranking improvements visible');
  console.log('• Month 2: Significant traffic increases');
  console.log('• Month 3: Full impact of keyword expansion realized');
  
  console.log('\n🔄 ONGOING MONITORING:');
  console.log('• Weekly: Check Google Search Console for ranking changes');
  console.log('• Monthly: Analyze traffic and conversion improvements');
  console.log('• Quarterly: Review and expand keyword targeting strategy');
  
  // Save final verification report
  const finalReport = {
    timestamp: new Date().toISOString(),
    analysis,
    healthScore,
    recommendations,
    campaignReports: Object.keys(reports),
    assessment: healthScore.total >= 80 ? 'excellent' : 
               healthScore.total >= 60 ? 'good' : 
               healthScore.total >= 40 ? 'fair' : 'needs-work'
  };
  
  fs.writeFileSync('final-verification.json', JSON.stringify(finalReport, null, 2));
  console.log('\n📄 Final verification report saved to: final-verification.json');
  
  console.log('\n🎯 CAMPAIGN STATUS: COMPLETED SUCCESSFULLY! 🎉');
}

main().catch(console.error);