#!/usr/bin/env node

/**
 * Internal Linking Optimization Script
 * Generates strategic internal links across all blog articles
 */

const fs = require('fs');
const path = require('path');

console.log('🔗 Starting Internal Linking Optimization...\n');

const BLOG_DIR = 'app/blog';

// Get all blog posts with metadata
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
        const metadata = extractMetadata(content, dir);
        if (metadata) {
          posts.push({
            slug: dir,
            ...metadata,
            content: content
          });
        }
      }
    }
    
    return posts;
  } catch (error) {
    console.error('Error reading blog posts:', error.message);
    return [];
  }
}

// Extract metadata from blog post
function extractMetadata(content, slug) {
  const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
  const descriptionMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
  const keywordsMatch = content.match(/keywords:\s*['"`]([^'"`]+)['"`]/);
  
  if (!titleMatch) return null;
  
  return {
    title: titleMatch[1],
    description: descriptionMatch ? descriptionMatch[1] : '',
    keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [],
    url: `/blog/${slug}`
  };
}

// Calculate content similarity based on keywords and topics
function calculateSimilarity(post1, post2) {
  const keywords1 = new Set([...post1.keywords, ...extractTopicsFromTitle(post1.title)]);
  const keywords2 = new Set([...post2.keywords, ...extractTopicsFromTitle(post2.title)]);
  
  const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
  const union = new Set([...keywords1, ...keywords2]);
  
  return intersection.size / union.size;
}

// Extract topics from title
function extractTopicsFromTitle(title) {
  const topics = [];
  const lowerTitle = title.toLowerCase();
  
  // Common topics in our niche
  const topicKeywords = {
    'ia': ['ia', 'inteligencia artificial', 'ai', 'artificial intelligence'],
    'escritura': ['escritura', 'escribir', 'redaccion', 'writing', 'redactor'],
    'contenido': ['contenido', 'content', 'textos', 'articulos'],
    'marketing': ['marketing', 'ventas', 'comercial', 'business'],
    'seo': ['seo', 'posicionamiento', 'google', 'search'],
    'automatizacion': ['automatizar', 'automatico', 'automation'],
    'herramientas': ['herramientas', 'tools', 'software', 'plataforma'],
    'email': ['email', 'correo', 'mail', 'newsletter'],
    'copywriting': ['copywriting', 'copy', 'persuasivo', 'ventas'],
    'chatgpt': ['chatgpt', 'gpt', 'openai'],
    'prompts': ['prompts', 'prompt', 'plantillas']
  };
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      topics.push(topic);
    }
  }
  
  return topics;
}

// Find related posts for internal linking
function findRelatedPosts(targetPost, allPosts, maxLinks = 5) {
  const related = allPosts
    .filter(post => post.slug !== targetPost.slug)
    .map(post => ({
      ...post,
      similarity: calculateSimilarity(targetPost, post)
    }))
    .filter(post => post.similarity > 0.1) // Minimum similarity threshold
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxLinks);
  
  return related;
}

// Generate anchor text for internal links
function generateAnchorText(targetPost, linkingPost) {
  const targetTopics = extractTopicsFromTitle(targetPost.title);
  const linkingTopics = extractTopicsFromTitle(linkingPost.title);
  
  // Find common topics
  const commonTopics = targetTopics.filter(topic => linkingTopics.includes(topic));
  
  // Generate contextual anchor text
  const anchorTexts = [
    targetPost.title.split(':')[0].trim(),
    targetPost.title.split('|')[0].trim(),
    `${commonTopics[0] || 'IA'} para ${targetTopics[1] || 'escritura'}`,
    `Guía de ${targetTopics[0] || targetPost.title.split(' ')[0]}`,
    `Cómo ${targetPost.title.toLowerCase().includes('como') ? targetPost.title.split('como')[1]?.trim() : 'usar ' + targetTopics[0]}`,
    targetPost.title.length > 50 ? targetPost.title.substring(0, 47) + '...' : targetPost.title
  ];
  
  // Return the most appropriate anchor text
  return anchorTexts.find(text => text && text.length > 10 && text.length < 60) || targetPost.title;
}

// Create internal links section
function createInternalLinksSection(relatedPosts, currentPost) {
  if (relatedPosts.length === 0) return '';
  
  const linksHtml = relatedPosts.map(post => {
    const anchorText = generateAnchorText(post, currentPost);
    return `                  <li>• <a href="${post.url}" className="text-blue-600 hover:underline">${anchorText}</a></li>`;
  }).join('\n');
  
  return `
              <div>
                <h3 className="font-semibold mb-2">📚 Artículos Relacionados</h3>
                <ul className="text-sm text-gray-600 space-y-1">
${linksHtml}
                </ul>
              </div>`;
}

// Update blog post with internal links
function updateBlogPostWithLinks(post, allPosts) {
  const relatedPosts = findRelatedPosts(post, allPosts);
  
  if (relatedPosts.length === 0) {
    console.log(`⚠️  No related posts found for ${post.slug}`);
    return false;
  }
  
  const pagePath = path.join(BLOG_DIR, post.slug, 'page.tsx');
  let content = fs.readFileSync(pagePath, 'utf8');
  
  // Check if internal links already exist
  if (content.includes('📚 Artículos Relacionados')) {
    // Update existing links
    const existingLinksRegex = /<div>\s*<h3[^>]*>📚 Artículos Relacionados<\/h3>[\s\S]*?<\/div>/;
    const newLinksSection = createInternalLinksSection(relatedPosts, post);
    
    if (existingLinksRegex.test(content)) {
      content = content.replace(existingLinksRegex, newLinksSection.trim());
      console.log(`🔄 Updated links for ${post.slug} (${relatedPosts.length} links)`);
    } else {
      console.log(`➡️  ${post.slug}: Links section format not recognized`);
      return false;
    }
  } else {
    // Add new links section
    const newLinksSection = createInternalLinksSection(relatedPosts, post);
    
    // Find the "Próximos Pasos" section or similar
    const nextStepsRegex = /(.*<h3 className="font-semibold mb-2">🚀 Herramientas Recomendadas<\/h3>[\s\S]*?<\/div>)/;
    
    if (nextStepsRegex.test(content)) {
      content = content.replace(nextStepsRegex, `$1${newLinksSection}`);
      console.log(`✅ Added links to ${post.slug} (${relatedPosts.length} links)`);
    } else {
      // Fallback: add before closing article tag
      const articleEndRegex = /(\s*<\/article>)/;
      if (articleEndRegex.test(content)) {
        const linksSection = `
        <section className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Artículos Relacionados</h2>
          <div className="grid md:grid-cols-2 gap-4">
${createInternalLinksSection(relatedPosts, post)}
          </div>
        </section>$1`;
        
        content = content.replace(articleEndRegex, linksSection);
        console.log(`✅ Added fallback links to ${post.slug} (${relatedPosts.length} links)`);
      } else {
        console.log(`⚠️  Could not add links to ${post.slug}: No suitable location found`);
        return false;
      }
    }
  }
  
  fs.writeFileSync(pagePath, content);
  
  return {
    post: post.slug,
    linksAdded: relatedPosts.length,
    links: relatedPosts.map(p => ({
      url: p.url,
      title: p.title,
      similarity: Math.round(p.similarity * 100)
    }))
  };
}

// Analyze internal linking opportunities
function analyzeInternalLinkingOpportunities(posts) {
  const opportunities = [];
  
  for (const post of posts) {
    const related = findRelatedPosts(post, posts, 10);
    
    opportunities.push({
      post: post.slug,
      title: post.title,
      topics: extractTopicsFromTitle(post.title),
      relatedCount: related.length,
      avgSimilarity: related.length > 0 ? 
        Math.round((related.reduce((sum, p) => sum + p.similarity, 0) / related.length) * 100) : 0,
      topRelated: related.slice(0, 3).map(p => ({
        slug: p.slug,
        similarity: Math.round(p.similarity * 100)
      }))
    });
  }
  
  return opportunities.sort((a, b) => b.relatedCount - a.relatedCount);
}

// Main execution
async function main() {
  const allPosts = getAllBlogPosts();
  console.log(`📊 Found ${allPosts.length} blog posts for internal linking\n`);
  
  if (allPosts.length < 2) {
    console.log('❌ Need at least 2 posts for internal linking');
    return;
  }
  
  // Analyze opportunities
  console.log('🔍 Analyzing internal linking opportunities...\n');
  const opportunities = analyzeInternalLinkingOpportunities(allPosts);
  
  // Show top opportunities
  console.log('🎯 Top Internal Linking Opportunities:');
  opportunities.slice(0, 5).forEach(opp => {
    console.log(`   ${opp.post}: ${opp.relatedCount} related posts (avg similarity: ${opp.avgSimilarity}%)`);
  });
  console.log('');
  
  // Update posts with internal links
  console.log('🔗 Adding internal links to posts...\n');
  
  const results = [];
  let updated = 0;
  let totalLinks = 0;
  
  for (const post of allPosts) {
    const result = updateBlogPostWithLinks(post, allPosts);
    if (result) {
      results.push(result);
      updated++;
      totalLinks += result.linksAdded;
    }
  }
  
  // Summary
  console.log('\n📊 INTERNAL LINKING SUMMARY');
  console.log('============================');
  console.log(`Total posts: ${allPosts.length}`);
  console.log(`Posts updated: ${updated}`);
  console.log(`Total internal links added: ${totalLinks}`);
  console.log(`Average links per post: ${Math.round((totalLinks / updated) * 10) / 10}`);
  
  // Topic analysis
  const topicCounts = {};
  allPosts.forEach(post => {
    extractTopicsFromTitle(post.title).forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });
  
  console.log('\nTopic distribution:');
  Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .forEach(([topic, count]) => {
      console.log(`  ${topic}: ${count} posts`);
    });
  
  // Link density analysis
  const linkDensity = results.map(r => r.linksAdded);
  const avgLinkDensity = linkDensity.reduce((sum, count) => sum + count, 0) / linkDensity.length;
  const maxLinks = Math.max(...linkDensity);
  const minLinks = Math.min(...linkDensity);
  
  console.log(`\nLink density: ${minLinks}-${maxLinks} links per post (avg: ${Math.round(avgLinkDensity * 10) / 10})`);
  
  // Save detailed report
  const reportPath = 'internal-linking-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalPosts: allPosts.length,
      postsUpdated: updated,
      totalLinksAdded: totalLinks,
      avgLinksPerPost: Math.round((totalLinks / updated) * 10) / 10,
      topicDistribution: topicCounts,
      linkDensity: {
        min: minLinks,
        max: maxLinks,
        avg: Math.round(avgLinkDensity * 10) / 10
      }
    },
    opportunities: opportunities.slice(0, 20),
    results: results
  }, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  console.log('\n🎉 Internal Linking Optimization completed!');
  console.log('\n🚀 SEO Benefits:');
  console.log('• Improved crawlability and indexation');
  console.log('• Better PageRank distribution');
  console.log('• Enhanced user engagement and session duration');
  console.log('• Stronger topical authority signals');
}

main().catch(console.error);