const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const RSS_FEEDS = {
  marketing: [
    {
      name: 'Marketing 4 eCommerce Blog',
      url: 'https://marketing4ecommerce.net/feed/',
      category: 'Ecommerce Marketing',
      priority: 'high',
      keywords: ['ia', 'inteligencia artificial', 'ai', 'chatgpt', 'automatizacion', 'marketing digital']
    },
    {
      name: 'Marketing Directo',
      url: 'https://www.marketingdirecto.com/feed/',
      category: 'Marketing General',
      priority: 'high',
      keywords: ['ia', 'inteligencia artificial', 'ai', 'marketing automation']
    },
    {
      name: 'Aula Marketing',
      url: 'https://aulademarketing.com/feed/',
      category: 'Marketing Education',
      priority: 'medium',
      keywords: ['ia', 'ai', 'herramientas', 'automatizacion']
    },
    {
      name: 'PuroMarketing',
      url: 'https://www.puromarketing.com/feed/',
      category: 'Marketing',
      priority: 'medium',
      keywords: ['ia', 'inteligencia artificial', 'digital']
    }
  ],
  technology: [
    {
      name: 'Xataka',
      url: 'https://www.xataka.com/rss',
      category: 'Tecnología',
      priority: 'high',
      keywords: ['ia', 'inteligencia artificial', 'ai', 'machine learning', 'chatgpt']
    },
    {
      name: 'Genbeta',
      url: 'https://www.genbeta.com/feed',
      category: 'Software',
      priority: 'high',
      keywords: ['ia', 'inteligencia artificial', 'software', 'automatizacion']
    },
    {
      name: 'El Androide Libre',
      url: 'https://www.elandroidelibre.com/feed/',
      category: 'Mobile',
      priority: 'low',
      keywords: ['ia', 'inteligencia artificial', 'apps']
    }
  ],
  seo: [
    {
      name: 'Search Engine Land',
      url: 'https://searchengineland.com/feed',
      category: 'SEO News',
      priority: 'medium',
      keywords: ['ai', 'artificial intelligence', 'machine learning', 'seo']
    },
    {
      name: 'Search Engine Journal',
      url: 'https://www.searchenginejournal.com/feed/',
      category: 'SEO',
      priority: 'high',
      keywords: ['ai', 'chatgpt', 'content ai', 'automation']
    },
    {
      name: 'Ahrefs Blog',
      url: 'https://ahrefs.com/blog/feed/',
      category: 'SEO Tools',
      priority: 'high',
      keywords: ['ai', 'machine learning', 'content']
    }
  ],
  aiSpecific: [
    {
      name: 'MIT Technology Review',
      url: 'https://www.technologyreview.com/feed/',
      category: 'AI Research',
      priority: 'high',
      keywords: ['artificial intelligence', 'ai', 'machine learning', 'neural']
    },
    {
      name: 'OpenAI Blog',
      url: 'https://openai.com/blog/rss.xml',
      category: 'AI Company',
      priority: 'high',
      keywords: ['gpt', 'language models', 'ai']
    },
    {
      name: 'Google AI Blog',
      url: 'http://googleaiblog.blogspot.com/atom.xml',
      category: 'AI Company',
      priority: 'medium',
      keywords: ['google ai', 'machine learning', 'deep learning']
    }
  ],
  international: [
    {
      name: 'HubSpot Blog',
      url: 'https://blog.hubspot.com/blog/rss.xml',
      category: 'Marketing',
      priority: 'high',
      keywords: ['ai', 'artificial intelligence', 'marketing automation']
    },
    {
      name: 'Copyblogger',
      url: 'https://copyblogger.com/feed/',
      category: 'Copywriting',
      priority: 'high',
      keywords: ['ai', 'chatgpt', 'content marketing']
    },
    {
      name: 'Social Media Examiner',
      url: 'https://www.socialmediaexaminer.com/feed/',
      category: 'Social Media',
      priority: 'medium',
      keywords: ['ai', 'automation', 'tools']
    }
  ]
};

function fetchRSSFeed(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function parseRSS(xmlData) {
  const items = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
  const linkRegex = /<link>(.*?)<\/link>|<link>(.*?)<\/link>/;
  const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/;
  const dateRegex = /<pubDate>(.*?)<\/pubDate>|<dc:date>(.*?)<\/dc:date>/;
  
  let match;
  while ((match = itemRegex.exec(xmlData)) !== null) {
    const itemXml = match[1];
    const titleMatch = titleRegex.exec(itemXml);
    const linkMatch = linkRegex.exec(itemXml);
    const descMatch = descRegex.exec(itemXml);
    const dateMatch = dateRegex.exec(itemXml);
    
    if (titleMatch && linkMatch) {
      items.push({
        title: (titleMatch[1] || titleMatch[2] || '').trim(),
        link: (linkMatch[1] || linkMatch[2] || '').trim(),
        description: (descMatch[1] || descMatch[2] || '').substring(0, 300).trim(),
        pubDate: (dateMatch[1] || dateMatch[2] || '').trim()
      });
    }
  }
  
  return items;
}

function searchInContent(content, keywords) {
  const searchText = content.toLowerCase();
  const matches = [];
  
  keywords.forEach(keyword => {
    if (searchText.includes(keyword.toLowerCase())) {
      matches.push(keyword);
    }
  });
  
  return matches;
}

async function monitorFeeds() {
  console.log('🔍 RSS FEED MONITOR - Red Creativa Pro');
  console.log('======================================\n');
  
  const allFeeds = Object.values(RSS_FEEDS).flat();
  const results = [];
  
  for (const feed of allFeeds) {
    try {
      console.log(`📡 Checking: ${feed.name}...`);
      const xmlData = await fetchRSSFeed(feed.url);
      const items = parseRSS(xmlData);
      
      const relevantItems = items.slice(0, 10).filter(item => {
        const searchContent = `${item.title} ${item.description}`.toLowerCase();
        return searchContent.includes('ia') || 
               searchContent.includes('ai') ||
               searchContent.includes('inteligencia') ||
               searchContent.includes('artificial') ||
               searchContent.includes('chatgpt');
      }).map(item => ({
        ...item,
        matchedKeywords: searchInContent(
          `${item.title} ${item.description}`,
          feed.keywords
        ),
        opportunity: 'potential_link_building'
      }));
      
      if (relevantItems.length > 0) {
        results.push({
          feed: feed.name,
          url: feed.url,
          category: feed.category,
          priority: feed.priority,
          relevantArticles: relevantItems
        });
        
        console.log(`   ✅ Found ${relevantItems.length} relevant articles\n`);
      } else {
        console.log(`   ⏭️ No relevant articles found\n`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }
  
  return results;
}

function generateOutreachForRSS(results) {
  const opportunities = [];
  
  results.forEach(feedResult => {
    feedResult.relevantArticles.forEach(article => {
      opportunities.push({
        source: feedResult.feed,
        articleTitle: article.title,
        articleUrl: article.link,
        category: feedResult.category,
        outreachType: 'comment_or_contribution',
        template: {
          subject: `Question about your article: ${article.title}`,
          body: `Hi ${feedResult.feed} Team,

I just read your article "${article.title}" and found it really insightful!

I'm ${'authorName'} from Red Creativa Pro, and we specialize in AI marketing tools.

${feedResult.category.toLowerCase().includes('marketing') 
  ? 'We have some data on AI adoption in marketing that could complement your article.' 
  : 'I thought our research on AI marketing might provide additional context.'}

Would you be interested in:
1. A quote or data point for follow-up coverage?
2. A guest post on a related topic?
3. An interview for future content?

Happy to share more details!

Best,
${'authorName'}`
        }
      });
    });
  });
  
  return opportunities;
}

const DASHBOARD_CONFIG = {
  refreshInterval: 'Every 6 hours',
  alerts: {
    newContent: true,
    keywordMatches: true,
    competitorMentions: false
  },
  keywords: [
    'inteligencia artificial',
    'ia',
    'ai',
    'artificial intelligence',
    'chatgpt',
    'machine learning',
    'deep learning',
    'automatizacion marketing',
    'marketing automation'
  ],
  filters: {
    language: ['es', 'en'],
    categories: ['marketing', 'technology', 'ai', 'seo']
  },
  notifications: {
    email: true,
    slack: false,
    discord: false
  }
};

function main() {
  console.log('Starting RSS monitoring...\n');
  
  const output = {
    feeds: RSS_FEEDS,
    dashboard: DASHBOARD_CONFIG,
    results: [],
    opportunities: []
  };
  
  monitorFeeds().then(results => {
    output.results = results;
    output.opportunities = generateOutreachForRSS(results);
    
    const outputPath = path.join(__dirname, '..', 'data', 'rss-monitor-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    
    console.log('📊 RESULTS SUMMARY');
    console.log('==================');
    console.log(`Feeds monitored: ${Object.values(RSS_FEEDS).flat().length}`);
    console.log(`Feeds with results: ${results.length}`);
    console.log(`Total opportunities: ${output.opportunities.length}\n`);
    
    console.log('📁 OUTPUT FILES');
    console.log(`   - ${outputPath}`);
    
    console.log('\n🎯 NEXT STEPS');
    console.log('1. Review generated opportunities');
    console.log('2. Personalize outreach templates');
    console.log('3. Send targeted outreach');
    console.log('4. Track responses in spreadsheet');
    
    process.exit(0);
  }).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

main();
