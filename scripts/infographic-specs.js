const fs = require('fs');
const path = require('path');

const INFOGRAPHIC_SPECS = {
  timeline: {
    id: 'infographic-001',
    title: 'Evolución del Marketing con IA 2018-2026',
    format: 'Vertical Timeline',
    dimensions: {
      width: 1080,
      height: 1920,
      aspectRatio: '9:16'
    },
    sections: [
      {
        year: '2018',
        title: 'Los Primeros Pasos',
        events: [
          'GPT-1 lançado por OpenAI',
          'First AI copywriting tools',
          'Limited adoption en marketing',
          'Experimentación early adopters'
        ],
        stats: {
          companiesUsingAI: '5%',
          avgSavings: '2 horas/semana'
        },
        color: '#E8E8E8'
      },
      {
        year: '2020',
        title: 'El Despertar',
        events: [
          'GPT-3 revoluciona el mercado',
          'Jasper (anteriormente Jarvis) lanza',
          'Primeras herramientas especializadas',
          'COVID acelera adopción digital'
        ],
        stats: {
          companiesUsingAI: '15%',
          avgSavings: '5 horas/semana'
        },
        color: '#B8D4E8'
      },
      {
        year: '2022',
        title: 'La Revolución',
        events: [
          'ChatGPT lanzamiento público',
          'DALL-E 2 democratiza imágenes AI',
          'Microsoft invierte en OpenAI',
          'Buzz mediático masivo'
        ],
        stats: {
          companiesUsingAI: '35%',
          avgSavings: '10 horas/semana'
        },
        color: '#7BAFD4'
      },
      {
        year: '2024',
        title: 'Consolidación',
        events: [
          'GPT-4 y modelos multimodales',
          'Integración en herramientas existentes',
          'Especialización por industria',
          'Debate sobre regulación'
        ],
        stats: {
          companiesUsingAI: '58%',
          avgSavings: '15 horas/semana'
        },
        color: '#4A90C2'
      },
      {
        year: '2025',
        title: 'Presente',
        events: [
          'IA en workflows de marketing',
          'Prompt engineering como skill',
          'ROI demostrable',
          'Adopción mainstream'
        ],
        stats: {
          companiesUsingAI: '72%',
          avgSavings: '20 horas/semana'
        },
        color: '#2C6DA8'
      },
      {
        year: '2026',
        title: 'Predicciones',
        events: [
          '100% herramientas tendrán AI',
          'Personalización completa',
          'Automatización end-to-end',
          'AI + humano collaboration'
        ],
        stats: {
          companiesUsingAI: '85%',
          avgSavings: '25+ horas/semana'
        },
        color: '#1B4F72'
      }
    ],
    design: {
      style: 'Modern, Clean, Data-Driven',
      palette: ['#1B4F72', '#2C6DA8', '#4A90C2', '#7BAFD4', '#B8D4E8', '#E8E8E8'],
      typography: {
        headings: 'Montserrat Bold',
        body: 'Open Sans Regular',
        years: 'Montserrat ExtraBold'
      },
      elements: [
        'Timeline central con círculos',
        'Iconos por año',
        'Gráficos de barras comparativas',
        'Stats highlight con badges',
        'CTA final con QR code'
      ]
    },
    tools: ['Canva Pro', 'Figma', 'Adobe Illustrator'],
    estimatedTime: '4-6 horas',
    backlinkTarget: '15-25'
  },
  anatomyPrompt: {
    id: 'infographic-002',
    title: 'Anatomía del Prompt Perfecto',
    format: 'Educational Diagram',
    dimensions: {
      width: 1200,
      height: 2400,
      aspectRatio: '1:2'
    },
    sections: [
      {
        name: 'CONTEXTO',
        position: 'top',
        description: 'Background information',
        elements: [
          'Industry/Topic',
          'Target audience', 
          'Current situation',
          'Desired outcome'
        ],
        icon: '📋',
        example: 'Para una tienda de ecommerce de moda que vende a mujeres 25-45 años...'
      },
      {
        name: 'ROL',
        position: 'after_context',
        description: 'Who AI should be',
        elements: [
          'Expert persona',
          'Years of experience',
          'Specialization',
          'Communication style'
        ],
        icon: '👤',
        example: 'Actúa como un copywriter profesional con 10 años en ecommerce...'
      },
      {
        name: 'TAREA',
        position: 'after_rol',
        description: 'What to accomplish',
        elements: [
          'Specific action',
          'Format needed',
          'Length/Summary',
          'Key deliverables'
        ],
        icon: '🎯',
        example: 'Escribe 5 variations de subject line para email de lanzamiento...'
      },
      {
        name: 'RESTRICCIONES',
        position: 'after_task',
        description: 'Boundaries',
        elements: [
          'What to avoid',
          'Tone requirements',
          'Format rules',
          'Limitations'
        ],
        icon: '🚫',
        example: 'No uses emojis, máximo 60 caracteres, tono urgente pero no desesperado...'
      },
      {
        name: 'EJEMPLOS',
        position: 'after_constraints',
        description: 'Reference material',
        elements: [
          'Good example',
          'Bad example',
          'Style reference',
          'Output format'
        ],
        icon: '💡',
        example: 'Bueno: "No te lo pierdas - 50% OFF hoy" | Malo: "Hola, tenemos descuento..."'
      },
      {
        name: 'ITERACIÓN',
        position: 'after_examples',
        description: 'Refinement loop',
        elements: [
          'First draft',
          'Feedback point',
          'Refinement',
          'Final output'
        ],
        icon: '🔄',
        example: 'Revisa y mejora el output basándote en los criterios de éxito'
      }
    ],
    formula: 'CONTEXTO + ROL + TAREA + RESTRICCIONES + EJEMPLOS = RESULTADO',
    design: {
      style: 'Infographic Educational',
      palette: ['#6C5CE7', '#A29BFE', '#DFE6E9', '#2D3436'],
      typography: {
        headings: 'Poppins Bold',
        body: 'Poppins Regular',
        formula: 'Montserrat Black'
      },
      elements: [
        'Building blocks visual',
        'Connection arrows',
        'Example callouts',
        'Template section at bottom',
        'QR code to full guide'
      ]
    },
    tools: ['Canva Pro', 'Figma', 'Piktochart'],
    estimatedTime: '3-4 horas',
    backlinkTarget: '10-15'
  },
  comparison: {
    id: 'infographic-003',
    title: 'Marketing Tradicional vs Marketing con IA',
    format: 'Comparison Table',
    dimensions: {
      width: 1200,
      height: 1200,
      aspectRatio: '1:1'
    },
    sections: [
      {
        category: 'CREACIÓN DE CONTENIDO',
        traditional: {
          time: '4-8 horas por artículo',
          cost: '$100-300',
          output: '1-2 piezas',
          quality: 'Variable'
        },
        ai: {
          time: '1-2 horas por artículo',
          cost: '$20-50',
          output: '5-10 variaciones',
          quality: 'Consistente'
        },
        improvement: '80% tiempo ahorrado'
      },
      {
        category: 'EMAIL MARKETING',
        traditional: {
          time: '3-5 horas por campaign',
          cost: '$50-150',
          personalization: 'Limitada',
          testing: 'Slow'
        },
        ai: {
          time: '1 hora por campaign',
          cost: '$10-30',
          personalization: 'Escala',
          testing: 'Automático'
        },
        improvement: '70% tiempo ahorrado'
      },
      {
        category: 'ANÁLISIS DE DATOS',
        traditional: {
          time: '10-20 horas/semana',
          cost: '$200-500',
          insights: 'Manual',
          frequency: 'Mensual'
        },
        ai: {
          time: '2-5 horas/semana',
          cost: '$50-100',
          insights: 'Automático',
          frequency: 'Real-time'
        },
        improvement: '75% tiempo ahorrado'
      },
      {
        category: 'DISEÑO GRÁFICO',
        traditional: {
          time: '4-10 horas por diseño',
          cost: '$100-400',
          variations: 'Pocas',
          revisions: 'Slow'
        },
        ai: {
          time: '1-2 horas por diseño',
          cost: '$20-50',
          variations: 'Muchas',
          revisions: 'Rápido'
        },
        improvement: '85% tiempo ahorrado'
      }
    ],
    design: {
      style: 'Side-by-Side Comparison',
      palette: ['#00B894', '#E17055', '#2D3436', '#636E72'],
      typography: {
        headings: 'Oswald Bold',
        body: 'Open Sans',
        metrics: 'Roboto Mono'
      },
      elements: [
        'Split screen design',
        'Green checkmarks (AI)',
        'Time/cost comparisons',
        'Before/After stats',
        'CTA section'
      ]
    },
    tools: ['Canva Pro', 'Venngage', 'Piktochart'],
    estimatedTime: '2-3 horas',
    backlinkTarget: '15-20'
  },
  checklist: {
    id: 'infographic-004',
    title: 'Checklist: Implementación de IA en Marketing',
    format: 'Action Checklist',
    dimensions: {
      width: 1080,
      height: 1920,
      aspectRatio: '9:16'
    },
    sections: [
      {
        phase: 'FASE 1: PREPARACIÓN',
        steps: [
          'Definir objetivos claros',
          'Auditar procesos actuales',
          'Identificar oportunidades',
          'Establecer KPIs',
          'Asignar presupuesto'
        ],
        icon: '📋'
      },
      {
        phase: 'FASE 2: HERRAMIENTAS',
        steps: [
          'Investigar opciones',
          'Probar versiones gratuitas',
          'Evaluar ROI potencial',
          'Seleccionar stack inicial',
          'Configurar integraciones'
        ],
        icon: '🛠️'
      },
      {
        phase: 'FASE 3: IMPLEMENTACIÓN',
        steps: [
          'Capacitar al equipo',
          'Crear workflows',
          'Establecer protocolos',
          'Piloto con un proyecto',
          'Recopilar feedback'
        ],
        icon: '🚀'
      },
      {
        phase: 'FASE 4: OPTIMIZACIÓN',
        steps: [
          'Medir resultados',
          'Ajustar prompts',
          'Escal successful projects',
          'Automatizar procesos',
          'Documentar aprendizajes'
        ],
        icon: '📈'
      },
      {
        phase: 'FASE 5: ESCALADO',
        steps: [
          'Expandir uso',
          'Integrar más herramientas',
          'Training avanzado',
          'Establecer best practices',
          'Share successes'
        ],
        icon: '📊'
      }
    ],
    design: {
      style: 'Checklist Visual',
      palette: ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055'],
      typography: {
        headings: 'Poppins Bold',
        body: 'Poppins Regular',
        checkmarks: 'FontAwesome'
      },
      elements: [
        'Progress bar',
        'Checkboxes con animación',
        'Icons por fase',
        'Notes sections',
        'QR code a recursos'
      ]
    },
    tools: ['Canva Pro', 'Figma'],
    estimatedTime: '2-3 horas',
    backlinkTarget: '10-15'
  }
};

const GUESTOGRAPHIC_CAMPAIGN = {
  description: 'Create custom infographics for other sites',
  strategy: [
    {
      step: 1,
      name: 'Identify Target Sites',
      action: 'Find blogs that mention similar topics',
      criteria: ['DR 30+', 'Active in last 3 months', 'Related niche']
    },
    {
      step: 2,
      name: 'Create Custom Version',
      action: 'Customize infographic for each site',
      customizations: ['Their colors', 'Their logo', 'Their specific angle']
    },
    {
      step: 3,
      name: 'Offer as Exclusive',
      action: 'Present as first-look content',
      pitch: 'We created this specifically for your audience'
    },
    {
      step: 4,
      name: 'Include Attribution',
      action: 'Design attribution into the infographic',
      options: ['Small logo watermark', 'Credit line bottom', 'Creator mention']
    },
    {
      step: 5,
      name: 'Follow Up',
      action: 'Confirm placement',
      tracking: 'Check if published, thank them'
    }
  ],
  emailTemplate: {
    subject: 'Exclusive infographic for {siteName}: {topic}',
    body: `Hi {name},

I've been following {siteName} for a while and love your content about {topic}.

We recently created an infographic that I think your readers would absolutely love:

📊 {title}
🔗 {link}

{description}

**Why I thought of you:**
{reason}

**Exclusive for your readers:**
{customFeature}

**Includes:**
✓ High-res PNG and PDF
✓ Web-optimized version
✓ Editable source file
✓ Spanish and English versions

Happy to share it exclusively with your audience!

Best,
{author}`
  },
  successMetrics: {
    acceptanceRate: '30-40%',
    averageLinks: '5-10 per campaign',
    bestPerforming: 'Data visualizations and comparisons'
  }
};

function main() {
  console.log('🎨 INFOGRAPHIC SPECIFICATIONS FOR LINK BUILDING');
  console.log('==============================================\n');

  const output = {
    infographics: INFOGRAPHIC_SPECS,
    guestographicCampaign: GUESTOGRAPHIC_CAMPAIGN,
    summary: {
      totalInfographics: Object.keys(INFOGRAPHIC_SPECS).length,
      totalBacklinkTarget: Object.values(INFOGRAPHIC_SPECS)
        .reduce((sum, inf) => sum + (inf.backlinkTarget || 0), 0),
      estimatedTotalTime: '12-18 horas',
      totalEstimatedBacklinks: '50-75'
    },
    tools: [
      'Canva Pro ($12.99/mes)',
      'Figma (Free)',
      'Venngage ($19+/mes)',
      'Piktochart (Free)',
      'Adobe Illustrator ($20.99/mes)'
    ],
    bestPractices: [
      'Use brand colors consistently',
      'Include source citations',
      'Add embed code option',
      'Make it shareable',
      'Track all placements'
    ]
  };

  const outputPath = path.join(__dirname, '..', 'data', 'infographic-specs.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log('✅ Files created:');
  console.log(`   - ${outputPath}`);
  console.log('\n📊 INFOGRAPHIC SUMMARY:');
  Object.values(INFOGRAPHIC_SPECS).forEach((inf, i) => {
    console.log(`   ${i+1}. ${inf.title}`);
    console.log(`      Dimensions: ${inf.dimensions.width}x${inf.dimensions.height}`);
    console.log(`      Backlinks: ${inf.backlinkTarget}`);
    console.log(`      Time: ${inf.estimatedTime}\n`);
  });
  console.log('🎯 TOTAL BACKLINK TARGET: 50-75');
  console.log('⏱️  TOTAL TIME: 12-18 horas');
  print('\n🚀 CREATION ORDER (Priority):');
  console.log('1. Checklist: Fast to create, high value');
  console.log('2. Comparison: Easy visual, popular topic');
  console.log('3. Timeline: More complex, high authority');
  console.log('4. Anatomy Prompt: Educational, unique');
  console.log('\n🎯 GUESTOGRAPHIC CAMPAIGN:');
  console.log('   Acceptance rate: 30-40%');
  console.log('   Expected links: 5-10 per campaign');
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Create Canva/Accenture account');
  console.log('2. Start with Checklist infographic');
  console.log('3. Design in brand colors');
  console.log('4. Create embed code');
  console.log('5. Launch guestographic campaign');
}

main();
