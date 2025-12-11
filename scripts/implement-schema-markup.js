#!/usr/bin/env node

/**
 * Schema Markup Implementation Script
 * Adds structured data to all blog articles
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Schema Markup Implementation...\n');

const BLOG_DIR = 'app/blog';

// Schema templates
const SCHEMA_TEMPLATES = {
  article: (data) => `
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${data.title}",
  "description": "${data.description}",
  "author": {
    "@type": "Person",
    "name": "Red Creativa",
    "url": "https://redcreativa.pro"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Red Creativa",
    "logo": {
      "@type": "ImageObject",
      "url": "https://redcreativa.pro/logo.png"
    }
  },
  "datePublished": "${data.datePublished || new Date().toISOString()}",
  "dateModified": "${data.dateModified || new Date().toISOString()}",
  "url": "https://redcreativa.pro/blog/${data.slug}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://redcreativa.pro/blog/${data.slug}"
  },
  "articleSection": "${data.category || 'IA y Escritura'}",
  "keywords": "${data.keywords || 'IA, escritura, contenido, marketing digital'}",
  "image": {
    "@type": "ImageObject",
    "url": "https://redcreativa.pro/blog/${data.slug}/og-image.jpg",
    "width": 1200,
    "height": 630
  }
};`,

  faq: (faqs) => `
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    ${faqs.map(faq => `{
      "@type": "Question",
      "name": "${faq.question}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${faq.answer}"
      }
    }`).join(',\n    ')}
  ]
};`,

  howTo: (data) => `
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "${data.title}",
  "description": "${data.description}",
  "step": [
    ${data.steps.map((step, index) => `{
      "@type": "HowToStep",
      "position": ${index + 1},
      "name": "${step.name}",
      "text": "${step.text}"
    }`).join(',\n    ')}
  ],
  "totalTime": "${data.totalTime || 'PT30M'}",
  "supply": [],
  "tool": []
};`
};

// Extract metadata from blog post
function extractMetadata(content, slug) {
  const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
  const descriptionMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
  const keywordsMatch = content.match(/keywords:\s*['"`]([^'"`]+)['"`]/);
  
  return {
    title: titleMatch ? titleMatch[1] : slug.replace(/-/g, ' '),
    description: descriptionMatch ? descriptionMatch[1] : '',
    keywords: keywordsMatch ? keywordsMatch[1] : 'IA, escritura, contenido, marketing digital',
    slug,
    category: 'IA y Escritura',
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString()
  };
}

// Extract FAQ content from article
function extractFAQs(content) {
  const faqs = [];
  
  // Look for FAQ patterns in the content
  const faqPatterns = [
    /¿([^?]+)\?[\s\S]*?(?=¿|$)/g,
    /<h[23][^>]*>¿([^?]+)\?<\/h[23]>[\s\S]*?(?=<h[23]|$)/g,
    /\*\*¿([^?]+)\?\*\*[\s\S]*?(?=\*\*¿|$)/g
  ];
  
  faqPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const question = match[1].trim();
      // Extract answer (simplified - would need more sophisticated parsing)
      const answerStart = match.index + match[0].length;
      const answerText = content.substring(answerStart, answerStart + 200).trim();
      
      if (question && answerText) {
        faqs.push({
          question: `¿${question}?`,
          answer: answerText.substring(0, 150) + '...'
        });
      }
    }
  });
  
  return faqs.slice(0, 5); // Limit to 5 FAQs
}

// Extract How-To steps from content
function extractHowToSteps(content) {
  const steps = [];
  
  // Look for numbered steps
  const stepPatterns = [
    /(\d+)\.\s*([^\n]+)/g,
    /Paso\s*(\d+):?\s*([^\n]+)/gi,
    /<h[23][^>]*>(\d+)\.\s*([^<]+)<\/h[23]>/g
  ];
  
  stepPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const stepNumber = parseInt(match[1]);
      const stepName = match[2].trim();
      
      if (stepName) {
        steps.push({
          name: stepName,
          text: stepName // Simplified - would extract full step description
        });
      }
    }
  });
  
  return steps.slice(0, 10); // Limit to 10 steps
}

// Determine content type and generate appropriate schema
function generateSchemaForContent(content, metadata) {
  const schemas = [];
  
  // Always add Article schema
  schemas.push(SCHEMA_TEMPLATES.article(metadata));
  
  // Check for FAQ content
  const faqs = extractFAQs(content);
  if (faqs.length > 0) {
    schemas.push(SCHEMA_TEMPLATES.faq(faqs));
  }
  
  // Check for How-To content
  const steps = extractHowToSteps(content);
  if (steps.length >= 3) {
    schemas.push(SCHEMA_TEMPLATES.howTo({
      title: metadata.title,
      description: metadata.description,
      steps,
      totalTime: 'PT30M'
    }));
  }
  
  return schemas;
}

// Add schema to blog post file
function addSchemaToPost(postDir) {
  const pagePath = path.join(BLOG_DIR, postDir, 'page.tsx');
  
  if (!fs.existsSync(pagePath)) {
    console.log(`⚠️  Skipping ${postDir}: page.tsx not found`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    // Check if schema already exists
    if (content.includes('articleSchema') || content.includes('@context')) {
      console.log(`➡️  ${postDir}: Schema already exists`);
      return false;
    }
    
    const metadata = extractMetadata(content, postDir);
    const schemas = generateSchemaForContent(content, metadata);
    
    // Find the export default function
    const functionMatch = content.match(/(export default function \w+\(\) \{)/);
    if (!functionMatch) {
      console.log(`⚠️  Skipping ${postDir}: No export function found`);
      return false;
    }
    
    // Insert schemas before the return statement
    const schemaCode = schemas.join('\n\n');
    const schemaScript = `
  // Structured Data for SEO
${schemaCode}

  const combinedSchema = [${schemas.map((_, i) => `${i === 0 ? 'article' : i === 1 ? 'faq' : 'howTo'}Schema`).join(', ')}];
`;
    
    // Find return statement and add schema injection
    const returnMatch = content.match(/(return \([\s\S]*?<[^>]+>)/);
    if (!returnMatch) {
      console.log(`⚠️  Skipping ${postDir}: No return statement found`);
      return false;
    }
    
    // Insert schema script tag
    const schemaTag = `
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(combinedSchema.length === 1 ? combinedSchema[0] : combinedSchema)
        }}
      />`;
    
    // Update content
    let updatedContent = content.replace(
      functionMatch[1],
      functionMatch[1] + schemaCode
    );
    
    // Add schema tag to head or after opening tag
    updatedContent = updatedContent.replace(
      returnMatch[1],
      returnMatch[1] + '\n      <Head>' + schemaTag + '\n      </Head>'
    );
    
    // Add Head import if not present
    if (!updatedContent.includes('import Head from')) {
      updatedContent = updatedContent.replace(
        /import.*from ['"]next\/metadata['"];?\n/,
        `$&import Head from 'next/head';\n`
      );
    }
    
    fs.writeFileSync(pagePath, updatedContent);
    
    return {
      post: postDir,
      schemasAdded: schemas.length,
      types: schemas.map(s => {
        if (s.includes('Article')) return 'Article';
        if (s.includes('FAQPage')) return 'FAQ';
        if (s.includes('HowTo')) return 'HowTo';
        return 'Unknown';
      })
    };
    
  } catch (error) {
    console.error(`❌ Error processing ${postDir}:`, error.message);
    return false;
  }
}

// Main execution
async function main() {
  const blogPosts = fs.readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`📊 Found ${blogPosts.length} blog posts for schema implementation\n`);
  
  const results = [];
  let processed = 0;
  let schemasAdded = 0;
  
  for (const postDir of blogPosts) {
    const result = addSchemaToPost(postDir);
    if (result) {
      results.push(result);
      processed++;
      schemasAdded += result.schemasAdded;
      
      console.log(`✅ ${result.post}: Added ${result.schemasAdded} schemas (${result.types.join(', ')})`);
    }
  }
  
  // Summary
  console.log('\n📊 SCHEMA IMPLEMENTATION SUMMARY');
  console.log('=================================');
  console.log(`Total posts found: ${blogPosts.length}`);
  console.log(`Posts processed: ${processed}`);
  console.log(`Total schemas added: ${schemasAdded}`);
  console.log(`Average schemas per post: ${Math.round((schemasAdded / processed) * 10) / 10}`);
  
  // Schema type breakdown
  const schemaTypes = {};
  results.forEach(result => {
    result.types.forEach(type => {
      schemaTypes[type] = (schemaTypes[type] || 0) + 1;
    });
  });
  
  console.log('\nSchema types added:');
  Object.entries(schemaTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  // Save report
  const reportPath = 'schema-implementation-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalPosts: blogPosts.length,
      processed,
      schemasAdded,
      avgSchemasPerPost: Math.round((schemasAdded / processed) * 10) / 10,
      schemaTypes
    },
    results
  }, null, 2));
  
  console.log(`\n📄 Report saved to: ${reportPath}`);
  console.log('\n🎉 Schema Markup Implementation completed!');
}

main().catch(console.error);