#!/usr/bin/env node

/**
 * SEO Mass Optimization Script
 * Applies SEO optimizations to all existing blog articles
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting SEO Mass Optimization...\n');

// Configuration
const BLOG_DIR = 'app/blog';
const BACKUP_DIR = 'seo-optimization-backup';

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
}

// Get all blog directories
function getAllBlogPosts() {
  try {
    const blogDirs = fs.readdirSync(BLOG_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`📊 Found ${blogDirs.length} blog posts to optimize`);
    return blogDirs;
  } catch (error) {
    console.error('❌ Error reading blog directory:', error.message);
    return [];
  }
}

// Analyze current meta description
function analyzeMetaDescription(content) {
  const metaMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
  if (!metaMatch) return null;
  
  const description = metaMatch[1];
  const issues = [];
  const suggestions = [];
  
  // Length check
  if (description.length < 150) {
    issues.push('Too short');
    suggestions.push('Add more descriptive content');
  } else if (description.length > 160) {
    issues.push('Too long');
    suggestions.push('Trim to 150-160 characters');
  }
  
  // Emoji check
  const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu.test(description);
  if (!hasEmojis) {
    issues.push('No emojis');
    suggestions.push('Add 1-2 relevant emojis');
  }
  
  // Action words check
  const actionWords = ['descubre', 'aprende', 'domina', 'mejora', 'optimiza', 'transforma'];
  const hasActionWords = actionWords.some(word => description.toLowerCase().includes(word));
  if (!hasActionWords) {
    issues.push('No action words');
    suggestions.push('Add action verbs like "descubre", "aprende", "mejora"');
  }
  
  return {
    current: description,
    length: description.length,
    issues,
    suggestions,
    score: calculateScore(description)
  };
}

function calculateScore(description) {
  let score = 0;
  
  // Length score (0-40 points)
  if (description.length >= 150 && description.length <= 160) {
    score += 40;
  } else {
    score += Math.max(0, 40 - Math.abs(description.length - 155) * 2);
  }
  
  // Emoji score (0-20 points)
  const emojiCount = (description.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
  score += Math.min(20, emojiCount * 10);
  
  // Action words score (0-20 points)
  const actionWords = ['descubre', 'aprende', 'domina', 'mejora', 'optimiza', 'transforma'];
  const actionWordCount = actionWords.filter(word => description.toLowerCase().includes(word)).length;
  score += Math.min(20, actionWordCount * 10);
  
  // Symbols score (0-20 points)
  const symbols = ['★', '✓', '→', '▶', '◆', '⚡', '🎯', '💎'];
  const symbolCount = symbols.filter(symbol => description.includes(symbol)).length;
  score += Math.min(20, symbolCount * 10);
  
  return Math.round(score);
}

// Generate optimized meta description
function generateOptimizedDescription(originalDescription, postTitle) {
  // Extract key concepts from title
  const titleWords = postTitle.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Select appropriate emojis based on content
  const emojiCategories = {
    ia: ['🤖', '🧠', '⚡'],
    escritura: ['✍️', '📝', '✨'],
    marketing: ['📈', '💰', '🎯'],
    automatizar: ['🚀', '⚡', '🔧'],
    seo: ['📊', '🎯', '⚡'],
    contenido: ['📝', '✨', '📚']
  };
  
  let selectedEmojis = ['💡', '✨']; // Default emojis
  
  // Select emojis based on title content
  for (const [category, emojis] of Object.entries(emojiCategories)) {
    if (titleWords.some(word => word.includes(category))) {
      selectedEmojis = emojis.slice(0, 2);
      break;
    }
  }
  
  // Action words to use
  const actionWords = ['Descubre', 'Aprende', 'Domina', 'Mejora'];
  const selectedAction = actionWords[Math.floor(Math.random() * actionWords.length)];
  
  // Build optimized description
  let optimized = originalDescription;
  
  // Add action word at the beginning if not present
  if (!actionWords.some(word => optimized.toLowerCase().startsWith(word.toLowerCase()))) {
    optimized = `${selectedAction} ${optimized.toLowerCase()}`;
  }
  
  // Add emojis
  if (!optimized.includes(selectedEmojis[0])) {
    optimized = `${selectedEmojis[0]} ${optimized}`;
  }
  
  // Add symbols for emphasis
  optimized = optimized.replace(/,/g, ' ★').replace(/ y /g, ' ✓ ');
  
  // Ensure optimal length
  if (optimized.length > 160) {
    optimized = optimized.substring(0, 157) + '...';
  } else if (optimized.length < 150) {
    optimized += ` ${selectedEmojis[1]} ¡Paso a paso!`;
  }
  
  return optimized;
}

// Process single blog post
function processBlogPost(postDir) {
  const pagePath = path.join(BLOG_DIR, postDir, 'page.tsx');
  
  if (!fs.existsSync(pagePath)) {
    console.log(`⚠️  Skipping ${postDir}: page.tsx not found`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    // Create backup
    const backupPath = path.join(BACKUP_DIR, `${postDir}-page.tsx`);
    fs.writeFileSync(backupPath, content);
    
    // Analyze current meta description
    const analysis = analyzeMetaDescription(content);
    if (!analysis) {
      console.log(`⚠️  Skipping ${postDir}: No meta description found`);
      return null;
    }
    
    // Extract title for context
    const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
    const postTitle = titleMatch ? titleMatch[1] : postDir;
    
    // Generate optimized description
    const optimizedDescription = generateOptimizedDescription(analysis.current, postTitle);
    const newScore = calculateScore(optimizedDescription);
    
    // Update the file
    const updatedContent = content.replace(
      /description:\s*['"`]([^'"`]+)['"`]/,
      `description: '${optimizedDescription}'`
    );
    
    fs.writeFileSync(pagePath, updatedContent);
    
    return {
      post: postDir,
      title: postTitle,
      before: {
        description: analysis.current,
        length: analysis.length,
        score: analysis.score,
        issues: analysis.issues
      },
      after: {
        description: optimizedDescription,
        length: optimizedDescription.length,
        score: newScore
      },
      improvement: newScore - analysis.score
    };
    
  } catch (error) {
    console.error(`❌ Error processing ${postDir}:`, error.message);
    return null;
  }
}

// Main execution
async function main() {
  const blogPosts = getAllBlogPosts();
  const results = [];
  let processed = 0;
  let improved = 0;
  
  console.log('\n📝 Processing blog posts...\n');
  
  for (const postDir of blogPosts) {
    const result = processBlogPost(postDir);
    if (result) {
      results.push(result);
      processed++;
      
      if (result.improvement > 0) {
        improved++;
        console.log(`✅ ${result.post}: ${result.before.score} → ${result.after.score} (+${result.improvement})`);
      } else {
        console.log(`➡️  ${result.post}: ${result.before.score} → ${result.after.score} (${result.improvement})`);
      }
    }
  }
  
  // Generate summary report
  console.log('\n📊 OPTIMIZATION SUMMARY');
  console.log('========================');
  console.log(`Total posts found: ${blogPosts.length}`);
  console.log(`Posts processed: ${processed}`);
  console.log(`Posts improved: ${improved}`);
  console.log(`Improvement rate: ${Math.round((improved / processed) * 100)}%`);
  
  // Calculate average scores
  const avgBefore = results.reduce((sum, r) => sum + r.before.score, 0) / results.length;
  const avgAfter = results.reduce((sum, r) => sum + r.after.score, 0) / results.length;
  
  console.log(`\nAverage score before: ${Math.round(avgBefore)}`);
  console.log(`Average score after: ${Math.round(avgAfter)}`);
  console.log(`Overall improvement: +${Math.round(avgAfter - avgBefore)} points`);
  
  // Save detailed report
  const reportPath = 'seo-optimization-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalPosts: blogPosts.length,
      processed,
      improved,
      improvementRate: Math.round((improved / processed) * 100),
      avgScoreBefore: Math.round(avgBefore),
      avgScoreAfter: Math.round(avgAfter),
      overallImprovement: Math.round(avgAfter - avgBefore)
    },
    results
  }, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  console.log(`💾 Backups saved to: ${BACKUP_DIR}/`);
  console.log('\n🎉 SEO Mass Optimization completed!');
}

// Run the script
main().catch(console.error);