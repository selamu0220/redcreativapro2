const fs = require('fs');
const path = require('path');

const GUEST_POST_SITES = {
  spanish: [
    {
      name: 'Marketing 4 eCommerce',
      url: 'https://marketing4ecommerce.net/',
      dr: 65,
      traffic: '500K+',
      guestPost: {
        price: 0,
        guidelines: 'Enviar propuesta por email',
        responseTime: '1-2 semanas',
        topics: ['Ecommerce', 'Marketing Digital', 'Redes Sociales'],
        anchorAllowed: 'Natural en el bio'
      }
    },
    {
      name: 'Xataka',
      url: 'https://www.xataka.com/',
      dr: 85,
      traffic: '5M+',
      guestPost: {
        price: 0,
        guidelines: 'Registro como blogger',
        responseTime: 'Variable',
        topics: ['Tecnología', 'IA', 'Marketing Digital'],
        anchorAllowed: 'Sí en contenido'
      }
    },
    {
      name: 'Genbeta',
      url: 'https://www.genbeta.com/',
      dr: 80,
      traffic: '2M+',
      guestPost: {
        price: 0,
        guidelines: 'Plataforma de autores',
        responseTime: '1 semana',
        topics: ['Software', 'IA', 'Productividad'],
        anchorAllowed: 'Sí en contenido'
      }
    },
    {
      name: 'Aula Marketing',
      url: 'https://aulademarketing.com/',
      dr: 45,
      traffic: '100K+',
      guestPost: {
        price: 0,
        guidelines: 'Formulario de contacto',
        responseTime: '3-5 días',
        topics: ['Marketing', 'Branding', 'SEO'],
        anchorAllowed: 'Sí, contextual'
      }
    },
    {
      name: 'El Publicista',
      url: 'https://elpublicista.es/',
      dr: 50,
      traffic: '150K+',
      guestPost: {
        price: 0,
        guidelines: 'Email editorial@elpublicista.es',
        responseTime: '1 semana',
        topics: ['Publicidad', 'Marketing', 'Medios'],
        anchorAllowed: 'En bio'
      }
    },
    {
      name: 'Marketing Directo',
      url: 'https://www.marketingdirecto.com/',
      dr: 55,
      traffic: '300K+',
      guestPost: {
        price: 0,
        guidelines: 'Propuesta por email',
        responseTime: '2 semanas',
        topics: ['Marketing', 'Digital', 'Advertising'],
        anchorAllowed: 'Contextual'
      }
    },
    {
      name: 'PuroMarketing',
      url: 'https://www.puromarketing.com/',
      dr: 48,
      traffic: '200K+',
      guestPost: {
        price: 0,
        guidelines: 'Formulario web',
        responseTime: '1 semana',
        topics: ['Marketing', 'Tecnología', 'Business'],
        anchorAllowed: 'Sí'
      }
    },
    {
      name: 'Club del Marketing',
      url: 'https://clubdelmarketing.com/',
      dr: 35,
      traffic: '50K+',
      guestPost: {
        price: 0,
        guidelines: 'Email directo',
        responseTime: '3 días',
        topics: ['Marketing', 'Ventas', 'Emprendimiento'],
        anchorAllowed: 'Sí'
      }
    },
    {
      name: 'Blogpymes',
      url: 'https://blogpymes.com/',
      dr: 40,
      traffic: '80K+',
      guestPost: {
        price: 0,
        guidelines: 'Formulario contacto',
        responseTime: '5 días',
        topics: ['Pymes', 'Marketing', 'Tecnología'],
        anchorAllowed: 'Sí'
      }
    },
    {
      name: 'Ecommerce Nation',
      url: 'https://ecommercenation.com/',
      dr: 42,
      traffic: '100K+',
      guestPost: {
        price: 0,
        guidelines: 'Email pitch',
        responseTime: '1 semana',
        topics: ['Ecommerce', 'Marketing Digital', 'Ventas'],
        anchorAllowed: 'Sí'
      }
    }
  ],
  english: [
    {
      name: 'Neil Patel',
      url: 'https://neilpatel.com/',
      dr: 92,
      traffic: '10M+',
      guestPost: {
        price: 500,
        guidelines: 'Plataforma Ubersuggest',
        responseTime: 'Variable',
        topics: ['SEO', 'Marketing', 'Growth'],
        anchorAllowed: 'Sí, con costo'
      }
    },
    {
      name: 'HubSpot Blog',
      url: 'https://blog.hubspot.com/',
      dr: 93,
      traffic: '15M+',
      guestPost: {
        price: 0,
        guidelines: 'Partner program',
        responseTime: '2-4 semanas',
        topics: ['Marketing', 'Sales', 'CRM'],
        anchorAllowed: 'En bio'
      }
    },
    {
      name: 'Copyblogger',
      url: 'https://copyblogger.com/',
      dr: 87,
      traffic: '2M+',
      guestPost: {
        price: 0,
        guidelines: 'Email editorial',
        responseTime: 'Variable',
        topics: ['Copywriting', 'Content Marketing'],
        anchorAllowed: 'Sí'
      }
    },
    {
      name: 'Search Engine Journal',
      url: 'https://www.searchenginejournal.com/',
      dr: 85,
      traffic: '3M+',
      guestPost: {
        price: 0,
        guidelines: 'Guidelines page',
        responseTime: '2 semanas',
        topics: ['SEO', 'PPC', 'Marketing'],
        anchorAllowed: 'Sí'
      }
    },
    {
      name: 'Social Media Examiner',
      url: 'https://www.socialmediaexaminer.com/',
      dr: 84,
      traffic: '2M+',
      guestPost: {
        price: 0,
        guidelines: 'Submission form',
        responseTime: '3 semanas',
        topics: ['Social Media', 'Marketing'],
        anchorAllowed: 'En bio'
      }
    },
    {
      name: 'Content Marketing Institute',
      url: 'https://contentmarketinginstitute.com/',
      dr: 86,
      traffic: '1.5M+',
      guestPost: {
        price: 0,
        guidelines: 'Guest post guidelines',
        responseTime: 'Variable',
        topics: ['Content Marketing', 'Strategy'],
        anchorAllowed: 'Sí'
      }
    },
    {
      name: 'Buffer Blog',
      url: 'https://buffer.com/blog',
      dr: 80,
      traffic: '1M+',
      guestPost: {
        price: 0,
        guidelines: 'Email pitch',
        responseTime: '2 semanas',
        topics: ['Social Media', 'Marketing'],
        anchorAllowed: 'Sí'
      }
    },
    {
      name: 'Backlinko',
      url: 'https://backlinko.com/',
      dr: 82,
      traffic: '500K+',
      guestPost: {
        price: 0,
        guidelines: 'Very selective',
        responseTime: 'Variable',
        topics: ['SEO', 'Link Building'],
        anchorAllowed: 'Sí'
      }
    },
    {
      name: 'Ahrefs Blog',
      url: 'https://ahrefs.com/blog/',
      dr: 88,
      traffic: '2M+',
      guestPost: {
        price: 0,
        guidelines: 'Email',
        responseTime: 'Variable',
        topics: ['SEO', 'Marketing', 'Data'],
        anchorAllowed: 'Sí'
      }
    },
    {
      name: 'Semrush Blog',
      url: 'https://www.semrush.com/blog/',
      dr: 87,
      traffic: '3M+',
      guestPost: {
        price: 0,
        guidelines: 'Guest post program',
        responseTime: '2 semanas',
        topics: ['SEO', 'Marketing', 'Tools'],
        anchorAllowed: 'Sí'
      }
    }
  ]
};

const GUEST_POST_PITCH_TEMPLATE = {
  subject: 'Propuesta de artículo: {topic} para {site}',
  body: `Hola {editorName},

Espero que estés teniendo un buen día. Soy {author} de Red Creativa Pro, una plataforma especializada en IA y marketing digital.

Me 联系，是因为我想为贵网站贡献一篇高质量的文章。我注意到贵站在{topic}领域有很高的影响力，我想分享一些有价值的内容。

**Título propuesto:** {proposedTitle}

**Resumen:** {summary}

**Puntos principales:**
1. {point1}
2. {point2}
3. {point3}

**为什么这篇文章适合贵站：**
- Complementa su contenido existente sobre {relatedTopic}
- Aporta datos/insights únicos basados en nuestra experiencia
- Ofrece valor práctico para sus lectores

**Sobre mí:**
- Autor en {authorBio}
- {credentials}
- {previousWork}

Estoy abierto a ajustar el tema o el enfoque según las necesidades editoriales.

Gracias por su tiempo,

{author}
{contact}
`
};

const OUTREACH_TRACKER = {
  columns: [
    'Site Name',
    'URL', 
    'Contact Email',
    'Status',
    'Date Contacted',
    'Response',
    'Topic Sent',
    'Published Date',
    'Backlink URL',
    'DR',
    'Notes'
  ],
  statusOptions: [
    'Not Contacted',
    'Email Sent',
    'Follow Up 1',
    'Follow Up 2',
    'Accepted',
    'Rejected',
    'Published',
    'No Response'
  ],
  templates: {
    initial: GUEST_POST_PITCH_TEMPLATE,
    followUp1: {
      subject: 'Re: Propuesta de artículo - {site}',
      body: `Hola {editorName},

Solo quería hacer seguimiento a mi email anterior sobre la propuesta de artículo "{title}".

Entiendo que están ocupados, pero me encantaría contribuir con contenido de valor para sus lectores.

¿Hay alguna información adicional que necesiten o algún tema que prefieran?

Gracias,
{author}`
    },
    followUp2: {
      subject: 'Último seguimiento - Propuesta guest post',
      body: `Hola {editorName},

Entiendo que quizás no sea el momento adecuado. Quería compartir que tenemos otros artículos готовы sobre{topic} que podrían interesarles.

Si en el futuro necesitan colaboradores, no duden en contactarme.

¡Éxito con {site}!

{author}`
    }
  }
};

const GUEST_POSTING_STRATEGY = {
  phase1: {
    name: 'High Authority, Free',
    duration: 'Semanas 1-4',
    targets: GUEST_POST_SITES.spanish.filter(s => s.guestPost.price === 0).slice(0, 10),
    goals: {
      posts: 5,
      backlinks: 5,
      drTarget: '50+'
    }
  },
  phase2: {
    name: 'International Expansion',
    duration: 'Semanas 5-8',
    targets: GUEST_POST_SITES.english.filter(e => e.guestPost.price === 0).slice(0, 10),
    goals: {
      posts: 5,
      backlinks: 5,
      drTarget: '70+'
    }
  },
  phase3: {
    name: 'Paid Opportunities',
    duration: 'Semanas 9-12',
    targets: [...GUEST_POST_SITES.spanish, ...GUEST_POST_SITES.english]
      .filter(s => s.guestPost.price > 0 && s.dr >= 60)
      .slice(0, 5),
    budget: 500,
    goals: {
      posts: 3,
      backlinks: 3,
      drTarget: '80+'
    }
  }
};

const ARTICLE_IDEAS = {
  iaMarketing: [
    'Cómo la IA está transformando el copywriting en 2025',
    '5 herramientas de IA que todo marketer debe usar',
    'Prompt engineering para emails de marketing',
    'Automatización de redes sociales con IA',
    'Cómo crear contenido SEO con ChatGPT',
    'IA para análisis de competencia',
    'Personalización de contenido con machine learning',
    'El futuro del email marketing con IA'
  ],
  productivity: [
    'Cómo aumentar tu productividad 10x con IA',
    'Automatiza el 80% de tu trabajo de marketing',
    'Herramientas IA para freelancers',
    'Cómo gestionar múltiples clientes con IA',
    'Workflow de marketing automatizado',
    'IA para gestión de proyectos',
    'Herramientas de productividad para marketers'
  ],
  business: [
    'Cómo escalar tu agencia de marketing',
    'IA para optimización de conversiones',
    'Customer journey con IA',
    'Predictive analytics para marketing',
    'IA en el análisis de mercado',
    'Automatización de embudos de venta'
  ]
};

function main() {
  console.log('🎯 GUEST POSTING STRATEGY & SITE DATABASE');
  console.log('==========================================\n');

  const output = {
    database: GUEST_POST_SITES,
    strategy: GUEST_POSTING_STRATEGY,
    pitchTemplates: GUEST_POST_PITCH_TEMPLATE,
    outreachTracker: OUTREACH_TRACKER,
    articleIdeas: ARTICLE_IDEAS,
    actionPlan: {
      week1: [
        'Contactar 5 sitios de fase 1',
        'Personalizar plantillas',
        'Enviar pitches iniciales',
        'Crear 2 artículos de respaldo'
      ],
      week2: [
        'Follow up con sitios sin respuesta',
        'Contactar 5 sitios adicionales',
        'Responder a accepts',
        'Escribir artículo accepted #1'
      ],
      week3: [
        'Publicar artículo #1',
        'Follow up semana 1',
        'Contactar fase 2 sitios',
        'Escribir artículo accepted #2'
      ],
      week4: [
        'Publicar artículo #2',
        'Evaluar resultados fase 1',
        'Planificar fase 2',
        'Contactar sitios pagados'
      ]
    },
    kpis: {
      daily: ['Pitches sent: 3-5', 'Follow ups: 5-10'],
      weekly: ['New guest posts: 2-3', 'Backlinks acquired: 2-3'],
      monthly: ['Guest posts: 8-12', 'Backlinks: 8-12', 'DR increase: +5-10']
    }
  };

  const outputPath = path.join(__dirname, '..', 'data', 'guest-posting-strategy.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log('✅ Files created:');
  console.log(`   - ${outputPath}`);
  console.log('\n📊 DATABASE SUMMARY:');
  console.log(`   Spanish Sites: ${GUEST_POST_SITES.spanish.length}`);
  console.log(`   English Sites: ${GUEST_POST_SITES.english.length}`);
  console.log(`   Total Targets: ${GUEST_POST_SITES.spanish.length + GUEST_POST_SITES.english.length}`);
  console.log('\n🎯 PRIORITY TARGETS:');
  [...GUEST_POST_SITES.spanish, ...GUEST_POST_SITES.english]
    .filter(s => s.dr >= 50 && s.guestPost.price === 0)
    .sort((a, b) => b.dr - a.dr)
    .slice(0, 5)
    .forEach((site, i) => {
      console.log(`   ${i+1}. ${site.name} (DR: ${site.dr}) - FREE`);
    });
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Crear cuenta/correo profesional');
  console.log('2. Personalizar plantilla de pitch');
  console.log('3. Start contacting phase 1 sites');
  console.log('4. Track everything in spreadsheet');
  console.log('5. Follow up persistently');
}

main();
