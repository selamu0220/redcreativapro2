const fs = require('fs');
const path = require('path');

const BRAND_TERMS = [
  'Red Creativa Pro',
  'redcreativa.pro',
  'redcreativa',
  'escritor ia',
  'red creativa',
  'RedCreativa'
];

const MENTION_SOURCES = {
  googleSearch: {
    operators: [
      '"Red Creativa Pro" -site:redcreativa.pro',
      'redcreativa.pro mentions',
      '"Red Creativa" marketing IA',
      '"escritor ia" "red creativa"',
      '"inteligencia artificial" marketing español'
    ],
    frequency: 'Daily'
  },
  socialMedia: {
    twitter: {
      searchTerms: [
        '@RedCreativa',
        'Red Creativa Pro',
        '#RedCreativa'
      ],
      monitoring: 'TweetDeck o手动'
    },
    linkedin: {
      searchTerms: [
        'Red Creativa Pro',
        'Company mentions'
      ],
      monitoring: 'LinkedIn Alerts'
    },
    instagram: {
      searchTerms: [
        '@redcreativa.pro',
        '#RedCreativaPro'
      ],
      monitoring: 'Business account insights'
    }
  },
  forums: {
    reddit: {
      subreddits: [
        'r/marketing',
        'r/ArtificialInteligence',
        'r/SEO',
        'r/Entrepreneur',
        'r/smallbusiness',
        'r/digitalmarketing',
        'r/automation',
        'r/tech'
      ],
      searchUrl: 'https://www.reddit.com/search/?q=Red%20Creativa%20Pro'
    },
    quora: {
      searchUrl: 'https://www.quora.com/search?q=Red%20Creativa%20Pro'
    },
    forums: [
      'https://www.forocochese.com/',
      'https://www.misanet.org/',
      'https://www.buscontabilidad.com/',
      'https://www.emprendedorex.com/'
    ]
  },
  blogs: {
    searchEngine: [
      'site:wordpress.com "Red Creativa Pro"',
      'site:blogspot.com "Red Creativa Pro"',
      'site:medium.com "Red Creativa Pro"',
      '"Red Creativa" -redcreativa.pro'
    ],
    contentChecker: true
  },
  news: {
    googleNews: {
      searchTerms: BRAND_TERMS,
      alertUrl: 'https://news.google.com/alerts'
    },
    spanishNews: [
      'https://www.20minutos.es/',
      'https://www.elconfidencial.com/',
      'https://www.elespanol.com/',
      'https://www.abc.es/',
      'https://www.elmundo.es/'
    ]
  }
};

const OUTREACH_TEMPLATES = {
  twitter: {
    subject: 'Thanks for the mention!',
    template: `Hey @{username}!

Thanks for mentioning {brand} in your tweet about {topic}! 🙌

Really appreciate the shoutout! 

If you ever want to collaborate or have any questions about AI marketing, feel free to reach out!

Best,
{author}`
  },
  linkedin: {
    subject: 'Gracias por la mención',
    template: `Hola {name},

Vi tu post sobre {topic} y me encantó tu perspectiva.

Gracias por mencionar a {brand} - ¡mucho aprecio!

Si tienes un blog o website, me encantaría que añadieras un enlace para que tus lectores puedan encontrar más recursos sobre IA y marketing: {link}

Felicitaciones por el contenido,

{author}`
  },
  blog: {
    subject: 'Quick question about your article',
    template: `Hi {name},

I just read your excellent article "{articleTitle}" - really insightful content on {topic}!

I noticed you mentioned {brand} - thanks for the reference! 

If you're open to it, I'd love if you could add a link to help your readers find more resources:

🔗 {link}

In return, I'd be happy to:
- Share your article with our audience
- Collaborate on future content
- Feature you in our newsletter

Let me know what you think!

Best,
{author}`
  },
  email: {
    subject: 'Thank you for the {platform} mention!',
    template: `Hola {name},

Gracias por mencionar a {brand} en tu {platform} post/article sobre {topic}.

Apreciamos mucho el reconocimiento! 🙏

Si tienes un website o blog, sería genial si pudieras añadir un enlace para que tus lectores puedan encontrar más información:

📎 {link}

Como muestra de agradecimiento, me gustaría:
- Compartir tu contenido con nuestra audiencia de +10K suscriptores
- Colaborar en contenido futuro
- Mentecionar tu trabajo en nuestra newsletter

¿Te parece bien?

Un saludo,
{author}`
  }
};

const MENTION_TRACKER_SCHEMA = {
  columns: [
    'ID',
    'Source',
    'URL',
    'Brand Term Used',
    'Date Found',
    'Platform',
    'Author Name',
    'Author Contact',
    'Has Link',
    'Link Status',
    'Sent Outreach',
    'Outreach Date',
    'Response',
    'Link Added',
    'Sentiment',
    'Authority (DR)',
    'Traffic',
    'Notes',
    'Follow Up Date'
  ],
  statuses: [
    'New',
    'Outreach Sent',
    'Follow Up 1',
    'Follow Up 2',
    'Link Added',
    'No Response',
    'Declined',
    'Not Relevant'
  ]
};

const AUTOMATED_MONITORING_SETUP = {
  googleAlerts: {
    setupUrl: 'https://www.google.com/alerts',
    keywords: [
      { term: 'Red Creativa Pro', frequency: 'As it happens', language: 'all' },
      { term: 'redcreativa.pro', frequency: 'As it happens', language: 'all' },
      { term: 'escritor ia', frequency: 'Daily', language: 'spanish' },
      { term: 'marketing ia españa', frequency: 'Daily', language: 'spanish' },
      { term: 'inteligencia artificial marketing', frequency: 'Daily', language: 'spanish' }
    ]
  },
  twitterMonitoring: {
    tool: 'TweetDeck',
    url: 'https://tweetdeck.twitter.com/',
    columns: [
      { type: 'search', term: '@RedCreativa' },
      { type: 'search', term: '#RedCreativa' },
      { type: 'search', term: 'Red Creativa Pro' }
    ]
  },
  linkedinAlerts: {
    setupUrl: 'https://www.linkedin.com/alerts',
    keywords: ['Red Creativa Pro', 'redcreativa']
  },
  mentionTools: {
    brand24: {
      url: 'https://brand24.com/',
      cost: '$49+/mes',
      features: ['Real-time monitoring', 'Sentiment analysis', 'Reach metrics']
    },
    mention: {
      url: 'https://mention.com/',
      cost: '$29+/mes',
      features: ['Social listening', 'Web monitoring', 'Competitor tracking']
    },
    talkwalker: {
      url: 'https://www.talkwalker.com/',
      cost: '$600+/mes',
      features: ['AI-powered', 'Enterprise', 'Full analytics']
    }
  }
};

const CAMPAIGN_ANALYTICS = {
  metrics: {
    daily: [
      'Total mentions found',
      'Mentions with link',
      'Mentions without link',
      'Outreach emails sent',
      'Responses received'
    ],
    weekly: [
      'Mentions trend',
      'Link conversion rate',
      'Response rate',
      'New domains reached',
      'Authority distribution'
    ],
    monthly: [
      'Total mentions',
      'Backlinks acquired',
      'DR improvement',
      'Referral traffic',
      'Brand awareness score'
    ]
  },
  targets: {
    week1: {
      mentionsFound: 20,
      outreachSent: 10,
      linksAcquired: 3,
      domainsReached: 5
    },
    month1: {
      mentionsFound: 100,
      outreachSent: 50,
      linksAcquired: 15,
      domainsReached: 25,
      drIncrease: '+3'
    },
    month3: {
      mentionsFound: 300,
      outreachSent: 150,
      linksAcquired: 50,
      domainsReached: 75,
      drIncrease: '+10'
    }
  }
};

function generateMentionReport() {
  return {
    timestamp: new Date().toISOString(),
    campaign: 'Unlinked Brand Mentions - Red Creativa Pro',
    sources: MENTION_SOURCES,
    outreachTemplates: OUTREACH_TEMPLATES,
    trackerSchema: MENTION_TRACKER_SCHEMA,
    monitoringSetup: AUTOMATED_MONITORING_SETUP,
    analytics: CAMPAIGN_ANALYTICS,
    nextActions: [
      {
        priority: 1,
        action: 'Set up Google Alerts for all brand terms',
        url: 'https://www.google.com/alerts',
        status: 'pending'
      },
      {
        priority: 2,
        action: 'Create TweetDeck columns for Twitter monitoring',
        url: 'https://tweetdeck.twitter.com/',
        status: 'pending'
      },
      {
        priority: 3,
        action: 'Set up LinkedIn brand alerts',
        url: 'https://www.linkedin.com/alerts',
        status: 'pending'
      },
      {
        priority: 4,
        action: 'Search Reddit for brand mentions',
        url: 'https://www.reddit.com/search/?q=Red%20Creativa%20Pro',
        status: 'pending'
      },
      {
        priority: 5,
        action: 'Check Quora for questions/mentions',
        url: 'https://www.quora.com/search?q=Red%20Creativa%20Pro',
        status: 'pending'
      }
    ]
  };
}

function main() {
  console.log('🔍 UNLINKED BRAND MENTIONS FINDER');
  console.log('==================================\n');

  const report = generateMentionReport();

  const outputPath = path.join(__dirname, '..', 'data', 'brand-mentions-strategy.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log('✅ Files created:');
  console.log(`   - ${outputPath}`);
  console.log('\n📊 MONITORING SOURCES:');
  console.log('   Google Alerts: ' + AUTOMATED_MONITORING_SETUP.googleAlerts.keywords.length + ' keywords');
  console.log('   Twitter: ' + AUTOMATED_MONITORING_SETUP.twitterMonitoring.columns.length + ' columns');
  console.log('   LinkedIn: ' + AUTOMATED_MONITORING_SETUP.linkedinAlerts.keywords.length + ' alerts');
  console.log('   Reddit: ' + MENTION_SOURCES.forums.reddit.subreddits.length + ' subreddits');
  console.log('\n🎯 FIRST SEARCH QUERIES:');
  BRAND_TERMS.forEach((term, i) => {
    console.log(`   ${i+1}. "${term}"`);
  });
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Go to Google Alerts and set up all brand terms');
  console.log('2. Create TweetDeck account for Twitter monitoring');
  console.log('3. Set up LinkedIn brand alerts');
  console.log('4. Check Reddit manually for first mentions');
  console.log('5. Create spreadsheet using tracker schema');
  console.log('6. Start outreach within 24 hours of finding mentions');
}

main();
