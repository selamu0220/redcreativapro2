const fs = require('fs');
const path = require('path');

const DIGITAL_PR_PLATFORMS = {
  journalistOutreach: [
    {
      name: 'HARO (Help A Reporter Out)',
      url: 'https://www.helpareporter.com/',
      cost: 'Gratis / Premium $19/mes',
      category: 'Expert Quotes',
      description: 'Conecta periodistas con fuentes expertas. Responde a queries y obtén menciones en medios.',
      tips: [
        'Responde dentro de las primeras 2 horas',
        'Sé conciso y profesional',
        'Incluye credenciales verificables',
        'Sigue al periodista después'
      ],
      successRate: '5-10%',
      averageMentions: '2-3 por semana activa'
    },
    {
      name: 'Connectively (anteriormente Twitter/X)',
      url: 'https://connectively.com/',
      cost: 'Gratis',
      category: 'Expert Quotes',
      description: 'Plataforma de Twitter/X para queries de periodistas.',
      tips: [
        'Optimiza tu perfil con foto profesional',
        'Responde rápido',
        'Usa hashtags relevantes',
        'Mantén disponibilidad'
      ],
      successRate: '5-10%',
      averageMentions: '2-3 por semana activa'
    },
    {
      name: 'Qwoted',
      url: 'https://qwoted.com/',
      cost: 'Gratis / Pro $49/mes',
      category: 'Expert Quotes',
      description: 'Red de expertos para periodistas y creadores de contenido.',
      tips: [
        'Perfil completo con bio detallada',
        'Añadir credenciales específicas',
        'Incluir ejemplos de trabajo previo',
        'Responde a queries relevantes'
      ],
      successRate: '8-12%',
      averageMentions: '3-5 por semana activa'
    },
    {
      name: 'SourceBottle',
      url: 'https://www.sourcebottle.com/',
      cost: 'Gratis',
      category: 'Expert Quotes',
      description: 'Plataforma para bloggers y podcasters buscando expertos.',
      tips: [
        'Especialízate en tu nicho',
        'Responde con detalles únicos',
        'Ofrece ángulos diferentes',
        'Construye relaciones duraderas'
      ],
      successRate: '10-15%',
      averageMentions: '3-4 por semana activa'
    },
    {
      name: 'Terkel',
      url: 'https://terkel.io/',
      cost: 'Gratis',
      category: 'Expert Quotes',
      description: 'Red de expertos impulsada por IA para contenido de calidad.',
      tips: [
        'Perfil optimizado con palabras clave',
        'Añade casos de estudio',
        'Incluye métricas si es posible',
        'Sé selectivo con queries'
      ],
      successRate: '7-12%',
      averageMentions: '2-4 por semana activa'
    }
  ],
  pressRelease: [
    {
      name: 'PR Newswire',
      url: 'https://www.prnewswire.com/',
      cost: '$299+ por distribución',
      category: 'Press Release',
      description: 'Red de distribución de comunicados de prensa líder.',
      distribution: '800+ sitios, incluyendo Yahoo Finance, Bloomberg'
    },
    {
      name: 'Business Wire',
      url: 'https://www.businesswire.com/',
      cost: '$350+ por distribución',
      category: 'Press Release',
      description: 'Distribución premium a medios financieros.',
      distribution: 'Medios financieros, tech, healthcare'
    },
    {
      name: 'GlobeNewswire',
      url: 'https://www.globenewswire.com/',
      cost: '$200+ por distribución',
      category: 'Press Release',
      description: 'Distribución económica pero efectiva.',
      distribution: '700+ sitios globales'
    },
    {
      name: 'PRWeb',
      url: 'https://www.prweb.com/',
      cost: '$99+ por distribución',
      category: 'Press Release',
      description: 'Opción económica para startups.',
      distribution: 'Sitios de noticias y blogs'
    }
  ],
  podcastGuest: [
    {
      name: 'PodcastGuests.com',
      url: 'https://podcastguests.com/',
      cost: '$50-200/mes',
      category: 'Podcast Appearances',
      description: 'Conecta podcasters con invitados.',
      tips: [
        'Perfil destaca tu expertise',
        'Ten historias interesantes',
        'Promociona episodio después',
        'Construye relaciones'
      ]
    },
    {
      name: 'MatchMaker FM',
      url: 'https://matchmaker.fm/',
      cost: 'Gratis / Premium',
      category: 'Podcast Appearances',
      description: 'Red para podcasts de entrepreneurship.',
      tips: [
        'Especialízate en tu nicho',
        'Ofrece valor al audiencia',
        'Comparte episodio activamente',
        'Agradece al host públicamente'
      ]
    },
    {
      name: 'PodcastGuestLists',
      url: 'https://www.podcastguestlists.com/',
      cost: '$99/año',
      category: 'Podcast Appearances',
      description: 'Base de datos de podcasts buscando invitados.',
      tips: [
        'Filtra por categoría',
        'Personaliza cada pitch',
        'Incluye tema específico',
        'Sigue protocolo'
      ]
    }
  ]
};

const EXPERT_PROFILE_TEMPLATE = {
  personal: {
    name: 'Selamu García Bravo',
    title: 'Founder & AI Marketing Expert',
    company: 'Red Creativa Pro',
    location: 'España',
    languages: ['Español', 'English']
  },
  expertise: [
    'Inteligencia Artificial',
    'Marketing Digital',
    'Automatización de Marketing',
    'Copywriting con IA',
    'Prompt Engineering',
    'Content Marketing',
    'Email Marketing',
    'SEO',
    'Growth Marketing'
  ],
  credentials: [
    '5+ años en marketing digital',
    'Experiencia práctica con herramientas IA',
    'Casos de éxito documentados',
    '100+ artículos publicados'
  ],
  talkingPoints: [
    'Cómo la IA está transformando el marketing digital',
    'Prompt engineering para marketers',
    'Automatización de flujos de trabajo',
    'Herramientas IA gratuitas para marketing',
    'Casos de uso real de IA en marketing',
    'Errores comunes al usar IA en marketing',
    'ROI de implementar IA en marketing',
    'El futuro del trabajo en marketing'
  ],
  sampleQuotes: [
    '"La IA no reemplaza a los marketeros, los marketeros que usan IA reemplazan a los que no la usan."',
    '"El prompt engineering es la nueva habilidad fundamental para profesionales del marketing."',
    '"Automatizar el 80% del trabajo repetitivo te permite enfocarte en el 20% que realmente importa."'
  ]
};

const PITCH_EMAIL_TEMPLATES = {
  haro: {
    subject: 'Re: Query - {queryTitle}',
    body: `Hola {journalistName},

Vi tu query sobre {queryTopic} y me gustaría contribuir con mi perspectiva como founder de Red Creativa Pro, especializada en IA y marketing digital.

**Sobre mí:**
- 5+ años de experiencia en marketing digital
- Experiencia práctica implementando soluciones de IA para agencias y empresas
- Casos de éxito documentados en automatización de marketing

**Lo que puedo aportar:**
- {specificInsight}
- {anotherInsight}
- {dataPoint}

Estoy disponible para una entrevista, cita, o cualquier formato que necesites.

Gracias por la oportunidad de contribuir,

{authorName}
Founder, Red Creativa Pro
[Email] | [LinkedIn] | [Website]`
  },
  podcast: {
    subject: 'Guest Proposal: AI Marketing Expert for {podcastName}',
    body: `Hola {hostName},

Soy {authorName} de Red Creativa Pro, y me gustaría proponer una aparición como invitado en {podcastName}.

**Por qué tu audiencia se beneficiará:**
- {benefit1}
- {benefit2}
- {benefit3}

**Temas que puedo cubrir:**
{topic1}
{topic2}
{topic3}

**Sobre mí:**
{credentials}

Tengo disponibilidad {dates}.

¿Te gustaría que te envíe más información?

Saludos,
{authorName}`
  },
  collaboration: {
    subject: 'Colaboración: {partnershipType} - Red Creativa Pro',
    body: `Hola {name},

Vi tu trabajo en {company/brand} y me impresionó {specificWork}.

Soy {authorName}, founder de Red Creativa Pro, plataforma especializada en IA y marketing digital.

**Propuesta de colaboración:**
{t collaborationType}

**Cómo beneficiamos a ambas partes:**
{benefit}

¿Te gustaría agendar una llamada de 15 minutos para discutir?

Saludos,
{authorName}`
  }
};

const MEDIA_CONTACT_DATABASE = {
  spanish: [
    { name: 'Xataka', email: 'contacto@xataka.com', beat: 'Tecnología', dr: 85 },
    { name: 'Genbeta', email: 'redaccion@genbeta.com', beat: 'Software', dr: 80 },
    { name: 'Marketing 4 eCommerce', email: 'hola@marketing4ecommerce.net', beat: 'Ecommerce', dr: 65 },
    { name: 'Marketing Directo', email: 'redaccion@marketingdirecto.com', beat: 'Marketing', dr: 55 },
    { name: 'El Español', email: 'colaboradores@elspanol.com', beat: 'Tecnología', dr: 78 },
    { name: '20 Minutos', email: 'redaccion@20minutos.com', beat: 'General', dr: 82 }
  ],
  international: [
    { name: 'TechCrunch', email: 'tips@techcrunch.com', beat: 'Technology', dr: 94 },
    { name: 'The Verge', email: 'tips@theverge.com', beat: 'Technology', dr: 93 },
    { name: 'Wired', email: 'wired_edit@wired.com', beat: 'Technology', dr: 94 },
    { name: 'Forbes', email: 'forbes.com/about-us', beat: 'Business', dr: 95 },
    { name: 'Business Insider', email: 'tips@businessinsider.com', beat: 'Business', dr: 92 }
  ]
};

const DIGITAL_PR_CAMPAIGNS = [
  {
    name: 'Estado de la IA en Marketing 2025',
    type: 'Original Research',
    description: 'Encuesta a 500+ profesionales sobre uso de IA en marketing',
    deliverables: [
      'Reporte descargable',
      'Infografías',
      'Press release',
      'Artículos de blog',
      'Social media content'
    ],
    timeline: '4-6 semanas',
    budget: '$500-2000',
    distributionTargets: [
      'Medios tech',
      'Medios marketing',
      'Newsletters',
      'Podcasts',
      'Influencers'
    ],
    backlinksTarget: '15-25'
  },
  {
    name: 'Toolkit: Prompts IA para Marketing',
    type: 'Free Resource',
    description: 'Biblioteca de 200+ prompts optimizados para marketers',
    deliverables: [
      'PDF descargable',
      'Landing page',
      'Email sequence',
      'Social proof'
    ],
    timeline: '2-3 semanas',
    budget: '$200-500',
    distributionTargets: [
      ' Blogs marketing',
      'Foros',
      'LinkedIn',
      'Reddit'
    ],
    backlinksTarget: '20-40'
  },
  {
    name: 'Expert Series: IA en Marketing',
    type: 'Expert Commentary',
    description: 'Serie de entrevistas con expertos en IA y marketing',
    deliverables: [
      'Videos/podcasts',
      'Transcripciones',
      'Artículos',
      'Social clips'
    ],
    timeline: '6-8 semanas',
    budget: '$1000-3000',
    distributionTargets: [
      'Medios especializados',
      'YouTube channels',
      'Podcasts',
      'Newsletters'
    ],
    backlinksTarget: '10-20'
  }
];

function main() {
  console.log('🎯 DIGITAL PR & OUTREACH STRATEGY');
  console.log('==================================\n');

  const output = {
    platforms: DIGITAL_PR_PLATFORMS,
    expertProfile: EXPERT_PROFILE_TEMPLATE,
    emailTemplates: PITCH_EMAIL_TEMPLATES,
    mediaContacts: MEDIA_CONTACT_DATABASE,
    campaigns: DIGITAL_PR_CAMPAIGNS,
    actionPlan: {
      week1: [
        'Crear cuentas en HARO, Connectively, Qwoted',
        'Completar perfiles con foto y bio',
        'Configurar alertas de queries',
        'Responder 10+ queries relevantes'
      ],
      week2: [
        'Continuar responding queries',
        'Contactar 5 medios de lista',
        'Lanzar campaña: Toolkit de Prompts',
        'Medir primeros resultados'
      ],
      week3: [
        'Escalar outreach a internacionales',
        'Pitch 3 podcasts',
        'Lanzar encuesta para investigación',
        'Follow up con contacts'
      ],
      week4: [
        'Publicar investigación',
        'Pitch 5 podcasts adicionales',
        'Optimizar campañas según resultados',
        'Planificar fase 2'
      ]
    },
    kpis: {
      weekly: {
        queriesResponded: '15-25',
        mediaContacts: '5-10',
        podcastPitches: '3-5',
        mentionsEarned: '3-5'
      },
      monthly: {
        mentionsEarned: '15-25',
        backlinksFromPR: '5-10',
        podcastAppearances: '3-5',
        domainRatingBoost: '+3-5'
      }
    }
  };

  const outputPath = path.join(__dirname, '..', 'data', 'digital-pr-strategy.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log('✅ Files created:');
  console.log(`   - ${outputPath}`);
  console.log('\n📋 PLATFORMS TO REGISTER:');
  DIGITAL_PR_PLATFORMS.journalistOutreach.forEach((p, i) => {
    console.log(`   ${i+1}. ${p.name} (${p.cost})`);
  });
  console.log('\n🎯 FIRST WEEK PRIORITY:');
  console.log('1. HARO: https://www.helpareporter.com/');
  console.log('2. Connectively: https://connectively.com/');
  console.log('3. Qwoted: https://qwoted.com/');
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Crear cuentas hoy');
  console.log('2. Completar perfiles profesionales');
  console.log('3. Empezar a responder queries mañana');
  console.log('4. Mantener consistencia diaria');
}

main();
