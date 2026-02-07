#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BRAND_KEYWORDS = [
  'Red Creativa Pro',
  'redcreativa.pro',
  'redcreativa',
  'escritor ia',
  'inteligencia artificial marketing',
  'ai writer',
  'chatgpt marketing',
  'ia copywriting',
  'automatizacion marketing ia',
  'herramientas ia marketing',
  'prompt engineering marketing',
  'ai content marketing',
  'escritura automatizada',
  'copywriting ia'
];

const MONITORING_CONFIG = {
  platforms: {
    googleAlerts: {
      enabled: true,
      keywords: BRAND_KEYWORDS,
      frequency: 'realtime',
      deliveryMethod: 'email'
    },
    twitter: {
      enabled: true,
      hashtags: [
        '#IA',
        '#MarketingDigital',
        '#AI',
        '#Copywriting',
        '#Automatizacion',
        '#MarketingIA',
        '#InteligenciaArtificial',
        '#ChatGPT',
        '#PromptEngineering'
      ]
    },
    linkedin: {
      enabled: true,
      keywords: BRAND_KEYWORDS
    },
    reddit: {
      enabled: true,
      subreddits: [
        'r/marketing',
        'r/ArtificialInteligence',
        'r/SEO',
        'r/digitalmarketing',
        'r/Entrepreneur',
        'r/smallbusiness',
        'r/automation',
        'r/machinelearning',
        'r/technology'
      ]
    },
    quora: {
      enabled: true,
      topics: [
        'Artificial Intelligence',
        'Digital Marketing',
        'Copywriting',
        'Marketing',
        'Technology',
        'Machine Learning',
        'Content Marketing'
      ]
    }
  },
  mentionTracking: {
    unlinkedMentions: true,
    sentimentAnalysis: true,
    authorityScoring: true
  },
  alerts: {
    newBacklinks: true,
    brandMentions: true,
    negativeSentiment: true,
    competitorMentions: true
  }
};

function generateGoogleAlertsConfig() {
  const alerts = BRAND_KEYWORDS.map(keyword => ({
    keyword,
    settings: {
      howOften: 'As it happens',
      sources: 'All sources',
      language: 'Spanish',
      regions: 'Spanish-speaking countries',
      delivery: 'Email'
    }
  }));

  return {
    platform: 'Google Alerts',
    setup: 'https://www.google.com/alerts',
    alerts,
    instructions: [
      '1. Go to https://www.google.com/alerts',
      '2. Create alert for each keyword',
      '3. Configure as shown above',
      '4. Create separate alerts for English keywords',
      '5. Set delivery email to your main email'
    ]
  };
}

function generateMentionOutreachTemplate() {
  const templates = {
    twitter: {
      subject: 'Brand Mention on Twitter',
      template: `Hey @{username}!

Thanks for mentioning {brand} in your tweet about {topic}!

If you have a blog or resource, would love to be featured there too. 
Happy to return the favor!

Best,
{author}`
    },
    linkedin: {
      subject: 'Thanks for the mention!',
      template: `Hi {name},

I noticed your recent post about {topic} where you mentioned {brand}.

Really appreciate the shoutout! If you have a blog or want to collaborate 
on something related to AI marketing, I'd love to connect.

Best regards,
{author}`
    },
    blog: {
      subject: 'Quick question about your article',
      template: `Hi {name},

I just read your excellent article "{articleTitle}" about {topic}.

I noticed you mentioned {brand} - thanks for the reference! 

If possible, would you mind adding a link to help readers find us? 
Here's the link: {link}

Happy to return the favor with a guest post or collaboration!

Best,
{author}`
    },
    general: {
      subject: 'Thank you for the mention!',
      template: `Hi {name},

Thanks for mentioning {brand} in your {platform} post about {topic}.

I really appreciate it! If you're open to it, I'd love if you could 
add a link to help readers find us: {link}

In return, I'd be happy to:
- Share your content with our audience
- Collaborate on a guest post
- Feature you in our newsletter

Let me know what works for you!

Best,
{author}`
    }
  };

  return templates;
}

function generateMonitoringReport() {
  return {
    reportType: 'Off-Page SEO Monitoring Report',
    generatedAt: new Date().toISOString(),
    brandKeywords: BRAND_KEYWORDS,
    monitoringPlatforms: Object.keys(MONITORING_CONFIG.platforms),
    dailyTasks: {
      morning: [
        'Check Google Alerts email',
        'Review Twitter mentions',
        'Check LinkedIn notifications',
        'Review Reddit replies'
      ],
      afternoon: [
        'Check Quora answers',
        'Monitor hashtag activity',
        'Respond to brand mentions',
        'Log new opportunities'
      ],
      evening: [
        'Compile daily mention report',
        'Identify outreach opportunities',
        'Plan next day outreach'
      ]
    },
    weeklyTasks: [
      'Full audit of all mentions',
      'Send outreach emails',
      'Update competitor monitoring',
      'Review backlink acquisition',
      'Analyze sentiment trends',
      'Report on progress'
    ],
    monthlyTasks: [
      'Full backlink profile analysis',
      'Competitor backlink comparison',
      'Strategy adjustment',
      'ROI calculation',
      'Goal review and update'
    ]
  };
}

function createMonitoringDashboard() {
  return {
    widgets: [
      {
        name: 'Brand Mentions Today',
        source: 'Google Alerts + Social',
        metrics: ['count', 'sentiment', 'platform']
      },
      {
        name: 'New Backlinks',
        source: 'Ahrefs API / Manual',
        metrics: ['count', 'domain_rating', 'anchor_text']
      },
      {
        name: 'Unlinked Mentions',
        source: 'Brand24 / Manual Search',
        metrics: ['count', 'contact_status', 'link_added']
      },
      {
        name: 'Guest Post Pitches',
        source: 'Outreach Tracker',
        metrics: ['sent', 'replied', 'accepted', 'published']
      },
      {
        name: 'Digital PR Mentions',
        source: 'HARO / Connectively',
        metrics: ['queries_answered', 'mentions_earned', 'media_outlets']
      },
      {
        name: 'Social Signals',
        source: 'Social Platforms',
        metrics: ['shares', 'mentions', 'engagement']
      }
    ],
    kpis: {
      daily: [
        'New brand mentions: 5+',
        'New backlinks: 1-2',
        'Outreach emails sent: 10+'
      ],
      weekly: [
        'New backlinks: 5-10',
        'Brand mentions: 30+',
        'Guest posts published: 1-2',
        'Media mentions: 2-5'
      ],
      monthly: [
        'New backlinks: 20-40',
        'Domain Rating increase: +5-10',
        'Brand mentions: 100+',
        'Guest posts: 5-10',
        'Media features: 5-10'
      ]
    }
  };
}

function main() {
  console.log('🚀 OFF-PAGE SEO MONITORING SETUP');
  console.log('================================\n');

  const output = {
    config: MONITORING_CONFIG,
    googleAlertsSetup: generateGoogleAlertsConfig(),
    outreachTemplates: generateMentionOutreachTemplate(),
    monitoringReport: generateMonitoringReport(),
    dashboard: createMonitoringDashboard()
  };

  const outputPath = path.join(__dirname, '..', 'data', 'offpage-seo-monitor.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log('✅ Files created:');
  console.log(`   - ${outputPath}`);
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Set up Google Alerts: https://www.google.com/alerts');
  console.log('2. Create Twitter alerts for @mentions');
  console.log('3. Set up Brand24 or Mention for comprehensive monitoring');
  console.log('4. Register at HARO: https://www.helpareporter.com/');
  console.log('5. Register at Connectively: https://connectively.com/');
  console.log('6. Start daily monitoring routine');
  console.log('\n📊 KPIs to Track:');
  console.log('   - Daily: 5+ brand mentions, 1-2 new backlinks');
  console.log('   - Weekly: 20-40 new backlinks, 100+ brand mentions');
  console.log('   - Monthly: DR +5-10 points');
}

main();
