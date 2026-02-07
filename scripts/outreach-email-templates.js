const fs = require('fs');
const path = require('path');

const OUTREACH_TEMPLATES = {
  guestPost: {
    spanish: [
      {
        id: 'gp-es-001',
        site: 'Marketing 4 eCommerce',
        category: 'Ecommerce Marketing',
        tone: 'Profesional pero accesible',
        subject: 'Propuesta: Artículo sobre IA en Ecommerce para Marketing4eCommerce',
        template: `Hola {editorName},

Espero que estés teniendo una excelente semana. Soy {authorName}, founder de Red Creativa Pro, una plataforma especializada en inteligencia artificial aplicada al marketing digital.

Les escribo porque me gustaría contribuir con un artículo exclusivo para Marketing4eCommerce.

**Título propuesto:** Cómo la IA está Transformando el Ecommerce en 2025: De la Personalización a la Automatización

**Resumen del artículo:**
Este artículo explorará cómo los ecommerce españoles están utilizando inteligencia artificial para optimizar sus operaciones, desde la personalización de la experiencia del usuario hasta la automatización del servicio al cliente. Incluiré:

• 5 casos de uso reales de IA en ecommerce
• Datos de una encuesta a 200+ tiendas online españolas
• Herramientas específicas recomendadas para cada caso
• Errores comunes a evitar
• Proyecciones para 2026

**Por qué este artículo:**
- Complementa perfectamente su contenido sobre tendencias de marketing
- Aporta datos únicos del mercado español
- Ofrece valor práctico y accionable
- Tiene potencial viral por la popularidad del tema IA

**Sobre mí:**
- 5+ años de experiencia en marketing digital
- Más de 100 artículos publicados sobre IA y marketing
- Casos de éxito documentados con métricas reales

El artículo estaría listo en 3-5 días después de la aprobación.

¿Te parece bien el tema? ¿Hay alguna directrices específicas que deba seguir?

Un saludo,

{authorName}
Founder, Red Creativa Pro
{email}
{website}`
      },
      {
        id: 'gp-es-002',
        site: 'Aula Marketing',
        category: 'Marketing General',
        tone: 'Educativo',
        subject: 'Propuesta guest post: Prompt Engineering para Marketers - Guía Práctica',
        template: `Hola {editorName},

Espero que te encuentres bien. Me联系你，是因为我想为贵站贡献一篇关于营销的文章。

Soy {authorName} de Red Creativa Pro. Me especializo en helping marketers leverage AI tools y he publicado más de 100 artículos sobre el tema.

**Título:** Prompt Engineering para Marketers: La Guía Definitiva 2025

**Hook:** Los marketers que dominan prompt engineering están ahorrando 10+ horas semanales. Este artículo enseña cómo hacerlo.

**Estructura:**
1. Qué es prompt engineering y por qué importa en marketing
2. Los 7 principios de un prompt efectivo
3. Templates específicos para email marketing, social media, blogs y ads
4. Casos de estudio con métricas
5. Errores comunes y cómo evitarlos

**Diferenciación:**
- Basado en experiencia práctica real, no teoría
- Templates descargables
- Datos de productividad de usuarios

¿Están abiertos a artículos sobre IA aplicada al marketing?

Saludos,
{authorName}`
      },
      {
        id: 'gp-es-003',
        site: 'Xataka',
        category: 'Tecnología',
        tone: 'Periodístico',
        subject: 'Propuesta: El Futuro del Copywriting con IA - Artículo para Xataka',
        template: `Hola {editorName},

Soy {authorName}, founder de Red Creativa Pro, donde ayudamos a marketers a integrate AI en sus flujos de trabajo.

Me联系 porque tengo una propuesta de artículo que creo que encajaría bien en Xataka.

**Título:** Cómo la IA está revolucionando el copywriting: De humano vs IA a humano + IA

**Ángulo:** No otro artículo sobre ChatGPT. Este explora el cambio paradigmático en cómo se concibe el copywriting profesional cuando la IA se convierte en copiloto.

**Puntos clave:**
- El debate copywriter vs IA está obsoleto
- El nuevo rol: estratega + prompt engineer
- Datos de productividad de profesionales reales
- El futuro del trabajo en copywriting

**Por qué yo:**
- Experiencia práctica implementando estas herramientas
- Acceso a datos de usuarios reales
- Perspectiva equilibrada (no fanático de IA, pero tampoco escéptico)

¿Te interesa este ángulo? ¿O prefieren un enfoque más técnico?

Saludos,
{authorName}`
      },
      {
        id: 'gp-es-004',
        site: 'Genbeta',
        category: 'Software y Productividad',
        tone: 'Práctico',
        subject: 'Propuesta: Herramientas IA para Productividad - Artículo para Genbeta',
        template: `Hola {editorName},

Soy {authorName} de Red Creativa Pro. Me dedico a probar y comparar herramientas de IA para marketing.

Vi que tienen contenido sobre productividad y quiero ofrecerles un artículo que podría ser muy popular.

**Título:** 15 Herramientas de IA que Genuinamente Mejoran tu Productividad en 2025

**Diferencia:**
- No es otra lista genérica de tools
- Cada herramienta probada durante 2+ semanas
- Pros/Contras basados en uso real
- Casos de uso específicos para marketers

**Estructura:**
- Intro: Por qué la productividad con IA es diferente en 2025
- Categorías: Escritura, Diseño, Video, Audio, Organización
- Cada tool: qué hace, precio, rating personal, alternativas

¿Les interesa?

{authorName}`
      },
      {
        id: 'gp-es-005',
        site: 'El Publicista',
        category: 'Publicidad y Medios',
        tone: 'Profesional',
        subject: 'Propuesta: IA en Publicidad Digital - El Futuro del Media Buying',
        template: `Hola {editorName},

Soy {authorName}, especializado en la intersección de IA y marketing digital.

Quiero proponer un artículo para El Publicista sobre un tema que está transformando la industria.

**Título:** Cómo la IA está redefiniendo el Media Buying: Lo que los advertisers deben saber

**Contenido:**
- El cambio de manual bidding a AI-powered bidding
- Casos de éxito con métricas
- Herramientas que están usando las agencias top
- Preparación para un futuro automatizado

**Ángulo único:**
- Datos de agencias españolas
- Entrevistas con media buyers reales
- Predicciones basadas en tendencias actuales

¿Les gustaría este tema?

{authorName}`
      }
    ],
    english: [
      {
        id: 'gp-en-001',
        site: 'HubSpot Blog',
        category: 'Marketing',
        tone: 'Professional',
        subject: 'Guest Post Proposal: How AI is Transforming Marketing in 2025',
        template: `Hi {editorName},

I noticed HubSpot's commitment to helping marketers stay ahead, and I'd love to contribute an article that aligns with your content goals.

**Proposed Title:** The Marketer's AI Toolkit: 20+ Tools That Actually Work in 2025

**Why This Article:**
- Cuts through the noise of AI tool hype
- Based on real testing, not speculation
- Categorized by use case (copywriting, design, analytics, etc.)
- Includes ROI data where available
- Practical, actionable advice

**About Me:**
- 5+ years in digital marketing
- Founder of Red Creativa Pro (AI marketing platform)
- 100+ articles published on AI/marketing
- Hands-on experience with major AI tools

**Would this fit your editorial calendar? I'm happy to adjust the angle or focus based on your needs.**

Best,
{authorName}`
      },
      {
        id: 'gp-en-002',
        site: 'Copyblogger',
        category: 'Copywriting',
        tone: 'Educational',
        subject: 'Guest Post: The Art of Prompt Engineering for Copywriters',
        template: `Hi {editorName},

Copyblogger has been a go-to resource for copywriters for years. With AI transforming our field, I want to contribute something genuinely useful.

**Proposed Title:** Prompt Engineering for Copywriters: A Complete Framework

**What Makes This Different:**
- Not a basic "how to use ChatGPT" article
- Framework specifically for copywriting tasks
- Real examples with actual outputs
- Copywriting-specific prompting techniques

**Outline:**
1. Why copywriters need prompt engineering
2. The COPY-PROMPT framework (created for this article)
3. Templates for emails, landing pages, ads
4. Testing and optimizing prompts
5. When to use AI, when to write from scratch

Would this be valuable for your audience?

{authorName}`
      },
      {
        id: 'gp-en-003',
        site: 'Search Engine Journal',
        category: 'SEO',
        tone: 'Technical',
        subject: 'Guest Post Proposal: AI for SEO - Practical Implementation Guide',
        template: `Hi {editorName},

SEJ readers are always looking for practical, data-backed SEO advice. I have an article proposal that could perform well.

**Title:** AI for SEO: A Practical Implementation Guide (With Real Data)

**What Sets This Apart:**
- Based on actual testing and metrics
- Not speculative - includes case studies
- Covers both content and technical SEO
- Actionable takeaways

**Outline:**
1. AI in keyword research
2. AI for content optimization
3. AI for technical SEO audits
4. Tools comparison with pros/cons
5. Future predictions

I've been implementing AI in SEO workflows for 2+ years and have data to share.

Interested?

{authorName}`
      },
      {
        id: 'gp-en-004',
        site: 'Social Media Examiner',
        category: 'Social Media',
        tone: 'Practical',
        subject: 'Guest Post: AI-Powered Social Media Management',
        template: `Hi {editorName},

Social Media Examiner helps marketers navigate social media trends. AI is the biggest trend right now.

**Proposal:** How to Use AI for Social Media Management: A Complete Guide

**Content:**
- AI for content creation (with examples)
- AI for scheduling and optimization
- AI for analytics and insights
- AI for customer service
- Real results from practitioners

**Unique Angle:**
- Focused on practical implementation
- Includes prompts readers can use
- Case studies with metrics

Would this fit your content calendar?

{authorName}`
      },
      {
        id: 'gp-en-005',
        site: 'Content Marketing Institute',
        category: 'Content Strategy',
        tone: 'Strategic',
        subject: 'Guest Post Proposal: Content Strategy in the AI Era',
        template: `Hi {editorName},

CMI's focus on strategic content marketing aligns with what I want to write about.

**Title:** Content Strategy in the AI Era: What Changes, What Doesn't

**Why This Matters:**
- Content strategists are uncertain about AI's role
- This article provides clarity
- Balanced, practical perspective

**Outline:**
1. What AI changes about content strategy
2. What remains fundamentally human
3. Framework for AI-assisted content planning
4. Ethical considerations
5. Future outlook

**About Me:**
- Hands-on experience with AI content tools
- Strategic perspective from running a content operation

Would this be a good fit?

{authorName}`
      }
    ]
  },
  digitalPr: {
    haro: {
      template: `Hi {journalistName},

Re: Your query about {queryTopic}

I'd love to contribute to your story about {queryTopic}. As founder of Red Creativa Pro, an AI marketing platform, I have hands-on experience with {relevantAspect}.

**My Perspective:**
- {insight1}
- {insight2}
- {insight3}

**Credentials:**
- 5+ years in digital marketing
- Working directly with AI marketing tools daily
- Access to user data and case studies

I'm available for interview, quote, or deeper discussion.

Best regards,
{authorName}
{contact}`
    },
    podcast: {
      template: `Hi {hostName},

I discovered {podcastName} and love how you {specificCompliment about show}.

**Who I Am:**
{authorName}, founder of Red Creativa Pro, helping marketers leverage AI.

**Topic Suggestions:**
1. How AI is transforming marketing workflows
2. Prompt engineering for marketers
3. The future of content marketing with AI
4. Practical AI tools that save 10+ hours/week

**Why Your Audience Would Benefit:**
- Actionable insights, not theory
- Real examples with data
- Honest about AI limitations

**My Availability:**
{dates}

Would you be open to discussing a potential appearance?

Best,
{authorName}`
    }
  },
  collaboration: {
    template: `Hi {name},

I follow {company/blog} and consistently impressed by {specificWork}.

I'm {authorName} of Red Creativa Pro, and I see a great opportunity for collaboration.

**Idea:**
{collaborationProposal}

**Benefits for Your Audience:**
{audienceBenefit}

**What I Bring:**
- {resource1}
- {resource2}

**What I Need:**
{whatINeed}

Would you be open to exploring this?

{authorName}`
  },
  resourcePage: {
    template: `Hi {name},

I use {their resource} regularly and find it valuable for {useCase}.

I noticed you have a {type of page} page and thought this might be helpful.

**My Resource:**
🔗 {resourceTitle}: {resourceDescription}

**Why It Fits Your List:**
{fitReason}

**About Me:**
{credentials}

No pressure at all - just wanted to share something I think your audience would appreciate.

Best,
{authorName}`
  }
};

const TRACKER_CSV_HEADER = 'Site Name,URL,Contact Email,Category,DR,Status,Date Contacted,Topic Sent,Response,Follow-up 1,Follow-up 2,Published Date,Backlink URL,Notes\n';

function generateOutreachTracker() {
  const templates = OUTREACH_TEMPLATES.guestPost.spanish.concat(OUTREACH_TEMPLATES.guestPost.english);
  
  return {
    description: 'CSV format for tracking guest post outreach',
    header: TRACKER_CSV_HEADER,
    example: {
      row1: 'Marketing 4 eCommerce,https://marketing4ecommerce.net/,hola@marketing4ecommerce.net,Ecommerce,65,Not Contacted,,,,,,,,"Topic: IA in Ecommerce"'
    },
    statusOptions: [
      'Not Contacted',
      'Email Sent',
      'Out of Office',
      'Rejected',
      'Accepted - Writing',
      'Published',
      'No Response'
    ]
  };
}

function generateEmailSequences() {
  return {
    guestPost: {
      sequence: [
        {
          day: 0,
          subject: '{site}: Guest Post Proposal - {topic}',
          template: OUTREACH_TEMPLATES.guestPost.spanish[0].template
        },
        {
          day: 4,
          subject: 'Re: Guest Post Proposal - Following up',
          template: `Hi {editorName},

Just following up on my previous email about the guest post proposal for {site}.

I understand you're busy, but I think this topic could resonate well with your audience given the current interest in AI marketing.

If the timing isn't right or the topic doesn't fit, no worries at all!

Best,
{authorName}`
        },
        {
          day: 10,
          subject: 'Last follow-up - Guest Post Idea',
          template: `Hi {editorName},

One final check on my guest post proposal.

If {topic} isn't a fit right now, I have other ideas ready:
- How [related topic]
- [Another angle on topic]

Or, I'm happy to write something based on your content calendar needs.

Thanks for considering!

{authorName}`
        }
      ]
    }
  };
}

function main() {
  console.log('📧 OUTREACH EMAIL TEMPLATES GENERATOR');
  console.log('=====================================\n');

  const output = {
    templates: OUTREACH_TEMPLATES,
    tracker: generateOutreachTracker(),
    sequences: generateEmailSequences(),
    bestPractices: {
      subjectLines: {
        highOpenRate: [
          'Guest Post Proposal: {topic} for {site}',
          '{site}: Quick question about guest posts',
          'Exclusive content idea for {site}',
          '{topic}: Would this work for {site}?',
          'Collaboration idea for {site}'
        ],
        avoid: [
          'GUEST POST',
          'FREE CONTENT',
          'URGENT',
          'CLICK HERE',
          'ALL CAPS'
        ]
      },
      timing: {
        bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
        worstDays: ['Monday', 'Friday', 'Saturday', 'Sunday'],
        bestTimes: ['7-9 AM', '12-2 PM', '5-6 PM'],
        avoid: ['Friday PM', 'Weekend']
      },
      personalization: {
        minimum: ['Editor name', 'Site name', 'Recent article reference'],
        ideal: ['Specific compliment', 'Recent news about site', 'Alignment with content']
      }
    },
    responseImprovement: {
      statistics: {
        personalizedVsGeneric: 'Personalized emails get 50% higher response rate',
        followUpImpact: '4+ follow-ups increase response by 30%',
        valueFirst: 'Value-first approach gets 3x more responses'
      },
      optimizationTips: [
        'Research the editor before reaching out',
        'Reference their recent work',
        'Make the value clear in first sentence',
        'Keep emails under 200 words',
        'Make it easy to say yes',
        'Always have a clear CTA'
      ]
    }
  };

  const outputPath = path.join(__dirname, '..', 'data', 'outreach-templates.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log('✅ Files created:');
  console.log(`   - ${outputPath}`);
  console.log('\n📧 TEMPLATE SUMMARY:');
  console.log(`   Guest Post (ES): ${OUTREACH_TEMPLATES.guestPost.spanish.length} templates`);
  console.log(`   Guest Post (EN): ${OUTREACH_TEMPLATES.guestPost.english.length} templates`);
  console.log(`   Digital PR: ${Object.keys(OUTREACH_TEMPLATES.digitalPr).length} templates`);
  console.log(`   Collaboration: ${Object.keys(OUTREACH_TEMPLATES.collaboration).length} template`);
  console.log('\n🎯 QUICK START:');
  console.log('1. Personalize templates with recipient name');
  console.log('2. Add specific details about their work');
  console.log('3. Send 10 emails today using templates');
  console.log('4. Follow up on day 4 and 10');
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Create spreadsheet using tracker format');
  console.log('2. Start with 5 personalized templates');
  console.log('3. Track all outreach in one place');
  console.log('4. Optimize based on response rates');
}

main();
