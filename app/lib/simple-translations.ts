import { useState, useEffect } from 'react';

// Multi-language translation system
export type SupportedLanguage = 'es' | 'en' | 'fr' | 'pt' | 'it' | 'de';

const translations = {
  es: {
    // Navigation
    tutorial: '📺 Tutorial',
    campaigns: '🤖 Campañas IA',
    membership: '💎 Membresía',
    blog: 'Blog',
    creator: 'Creador',
    login: 'Iniciar Sesión',
    demo: 'Ver Demo',
    dashboard: 'Panel de Control',
    settings: 'Configuración',
    prompts: 'Prompts',
    templates: 'Plantillas',
    contact: 'Contacto',
    plans: 'Planes',

    // Hero section
    betaAccess: 'VERSION BETA - Acceso anticipado disponible',
    mainTitle: 'Red Creativa Pro',
    subtitle: 'Plataforma Hispana de Marketing con IA',
    poweredBy: 'Potenciado por IA',
    description: 'Crea contenido, gestiona campañas y automatiza tu marketing con herramientas de inteligencia artificial diseñadas específicamente para el mercado hispanohablante.',

    // CTA buttons
    joinPlatform: '🚀 Unirse a Red Creativa Pro',
    noCreditCard: 'Sin tarjeta de crédito',
    immediateAccess: 'Acceso inmediato',
    cancelAnytime: 'Cancela cuando quieras',
    meetCreator: 'Conoce al creador',

    // AI Tools section
    aiTools: 'Herramientas Potenciadas por IA',
    aiToolsDesc: 'Descubre el poder de la inteligencia artificial aplicada al marketing y la creación de contenido',
    aiWriter: 'Escritor IA',
    aiWriterDesc: 'Genera contenido de alta calidad para blogs, redes sociales y campañas de marketing',
    aiEmails: 'Correos IA',
    aiEmailsDesc: 'Crea campañas de email marketing personalizadas y efectivas',
    promptChat: 'Chat con Prompts',
    promptChatDesc: 'Interactúa con IA usando prompts optimizados para mejores resultados',
    contactManagement: 'Gestión de Contactos',
    contactManagementDesc: 'Organiza y segmenta tu base de datos de clientes de manera inteligente',

    // About creator section
    aboutCreator: 'Sobre el Creador',
    creatorTitle: 'Conoce a Sela, el Creador',
    creatorDesc: 'Estudiante de Humanidades que decidió crear herramientas que realmente ahorren tiempo',
    personalEntrepreneurship: 'Emprendimiento Personal',
    personalEntrepreneurshipDesc: 'No soy una gran empresa. Soy una persona real que cree en crear herramientas útiles. Cada función está pensada desde la experiencia real de uso.',
    directAccess: 'Acceso Directo',
    directAccessDesc: 'Puedes hablar directamente conmigo. Tu feedback impulsa las mejoras. Construimos juntos la herramienta que realmente necesitas.',
    myPhilosophy: 'Mi Filosofía',
    philosophyDesc: '"Creo que las herramientas deben demostrar su valor antes de pedir dinero. Prueba Red Creativa Pro, explora todas sus funciones, y solo si realmente te ayuda a ser más productivo, entonces considera apoyar el proyecto."',
    readFullStory: 'Leer Mi Historia Completa',
    contactDirectly: 'Contactar Directamente',
    supportEntrepreneur: 'Cuando te suscribes, apoyas directamente a un emprendedor independiente',

    // Instagram DM Widget
    haveQuestions: '¿Tienes dudas?',
    sendDM: 'Envía un DM',
    dmWidgetDescription: 'Envía un mensaje directo al creador de Red Creativa Pro. Respuesta rápida garantizada.',
    closeWidget: 'Cerrar',

    // Dashboard
    welcome: 'Bienvenido',
    quickActions: 'Acciones Rápidas',
    recentDocuments: 'Documentos Recientes',
    statistics: 'Estadísticas',
    loading: 'Cargando...',
    loadingDashboard: 'Cargando dashboard...',
    verifyingAccess: 'Verificando acceso...',

    // Escritor IA
    aiWriterTitle: 'Escritor IA',
    generateContent: 'Generar Contenido',
    contentType: 'Tipo de Contenido',
    writeHere: 'Escribe aquí...',
    generate: 'Generar',
    improve: 'Mejorar',
    translate: 'Traducir',
    shorten: 'Acortar',
    expand: 'Expandir',
    save: 'Guardar',
    export: 'Exportar',
    copy: 'Copiar',
    clear: 'Limpiar',

    // Correos IA
    emailGenerator: 'Generador de Correos',
    emailSubject: 'Asunto del Correo',
    emailBody: 'Cuerpo del Correo',
    generateEmail: 'Generar Correo',

    // Forms
    name: 'Nombre',
    email: 'Correo Electrónico',
    message: 'Mensaje',
    send: 'Enviar',
    submit: 'Enviar',
    cancel: 'Cancelar',

    // Messages
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',

    // Footer
    allRightsReserved: 'Todos los derechos reservados',
    privacyPolicy: 'Política de Privacidad',
    termsOfService: 'Términos de Servicio',
    cookiePolicy: 'Política de Cookies',
    legalNotice: 'Aviso Legal',

    // Common
    home: 'Inicio',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    download: 'Descargar',
    upload: 'Subir',
    yes: 'Sí',
    no: 'No',

    // Homepage Hero
    forJournalists: 'Para Periodistas',
    freeForever: '100% Gratis siempre',
    heroTitle1: 'IA Para Periodistas',
    heroTitle2: 'Que Saben Escribir',
    heroDescription: 'Escribe 3x más rápido con IA que aprende tu estilo (no lo reemplaza). SEO automático. Detección reducida al mínimo.',
    indieProject: '👋 Proyecto indie hecho con cariño. Todo funciona gratis. Si escribes profesionalmente y te sirve, úsalo. Si quieres apoyar el desarrollo, genial.',
    fasterProof: 'Más Rápido',
    seoProof: 'SEO Integrado',
    styleProof: 'Estilo Único',
    tryFree: 'Probar Gratis',
    seeHowItWorks: 'Ver cómo funciona',
    noCard: 'Sin tarjeta',
    allIncluded: 'Todo incluido',
    useForever: 'Úsalo para siempre',

    // Plans Page
    pricingPlans: 'Planes y Precios',
    chooseYourPlan: 'Elige Tu Plan',
    freePlan: 'Plan Gratuito',
    monthlyPlan: 'Plan Mensual Pro',
    yearlyPlan: 'Plan Anual Elite',
    freePlanDesc: 'Prueba sin riesgo. Perfecto para descubrir si Red Creativa Pro es para ti.',
    monthlyPlanDesc: 'Perfecto para periodistas que quieren contenido irresistible con IA que aprende tu estilo.',
    yearlyPlanDesc: 'Máximo ahorro + estrategia de tráfico hecha por ti para periodistas serios.',
    perMonth: '/mes',
    perYear: '/año',
    forever: 'siempre',
    startFree: 'Empezar Gratis',
    startNow: 'Empezar ahora',
    maximizeTraffic: 'Maximizar Tráfico',
    popular: 'Más Popular',

    // Writer IA Page
    writingAssistant: 'Asistente de Escritura',
    writeYourText: 'Escribe tu texto aquí',
    improveMyText: 'Mejorar mi texto',
    analyzing: 'Analizando...',
    improving: 'Mejorando...',
    seoScore: 'Puntuación SEO',
    readability: 'Legibilidad',
    wordCount: 'Palabras',
    charactersCount: 'Caracteres',
    exportDocument: 'Exportar Documento',
    newDocument: 'Nuevo Documento',

    // Contact Page
    contactUs: 'Contáctanos',
    getInTouch: 'Ponte en Contacto',
    yourName: 'Tu Nombre',
    yourEmail: 'Tu Email',
    yourMessage: 'Tu Mensaje',
    sendMessage: 'Enviar Mensaje',
    sending: 'Enviando...',
    messageSent: 'Mensaje Enviado',

    // Footer
    aboutUs: 'Sobre Nosotros',
    features: 'Características',
    pricing: 'Precios',
    resources: 'Recursos',
    support: 'Soporte',
    followUs: 'Síguenos',

    // Homepage Value Sections
    howItWorks: 'Cómo Funciona',
    valueFormula: 'La Fórmula del Valor',
    noEmptyPromises: 'No vendemos promesas vacías. Aquí está exactamente qué obtienes, cómo lo garantizamos y cuánto tiempo te lleva.',
    dreamOutcome: 'Resultado Aspiracional',
    more: 'Más',
    organicReach: 'Alcance orgánico',
    optimizedContent: 'Contenido optimizado que posiciona mejor en buscadores.',
    highProbability: 'Probabilidad Alta',
    support121: '1 a 1',
    monthlyMeeting: 'Reunión mensual personalizada',
    annualPlanSEO: 'Plan Anual: SEO técnico incluido',
    realSupport: 'Asistencia real',
    minimalTime: 'Tiempo Mínimo',
    fast: 'Rápido',
    writeInMinutes: 'Escribe en minutos',
    aiAssists: 'IA asiste mientras escribes',
    publishWhenReady: 'Publicación: Cuando estés listo',
    minimalEffort: 'Esfuerzo Mínimo',
    auto: 'Auto',
    automaticOptimization: 'Optimización automática',
    seoWhileWriting: 'SEO mientras escribes',
    styleAdapted: 'Estilo adaptado a ti',
    annualPlanTechnical: 'Plan Anual: hacemos lo técnico',
    satisfactionGuarantee: 'Garantía de Satisfacción',
    trial30Days: 'Prueba 30 días. Si no te gusta cómo funciona, te devolvemos el 100%. Sin preguntas.',
    cancelAnytime: 'Cancela cuando quieras',
    trafficGrowth: 'Crecimiento en tráfico',
    conversion: 'Conversión',
    response: 'Respuesta',
    strategyAndSEO: 'Estrategia y SEO',
    dominateSearchEngines: 'Domina los buscadores',
    withDataNotGuesses: 'con datos, no conjeturas.',
    seoToolsDesc: 'Nuestras herramientas de análisis SEO identifican oportunidades de tráfico que tu competencia está ignorando. Analizamos la intención de búsqueda real para que cada contenido que publiques tenga un propósito claro.',
    intentAnalysis: 'Análisis de Intención',
    understandWhy: 'Entiende por qué tus clientes buscan lo que buscan.',
    localSEO: 'SEO Local',
    optimizePresence: 'Optimiza tu presencia para mercados específicos en LATAM y España.',
    tools: 'Herramientas',
    everythingInOnePlace: 'Todo lo que necesitas en un solo lugar',
    toolsDesc: 'Desde la generación de contenido hasta el análisis SEO, todas las herramientas que necesitas para hacer crecer tu negocio.',
    writerIA: 'Escritor IA',
    writerIADesc: 'Genera contenido de calidad en segundos con IA entrenada en español.',
    emailMarketing: 'Email Marketing',
    emailMarketingDesc: 'Crea campañas de email personalizadas que convierten.',
    seoAnalysis: 'Análisis SEO',
    seoAnalysisDesc: 'Optimiza tu contenido para aparecer en los primeros resultados.',
    seeAllTools: 'Ver todas las herramientas'
  },
  en: {
    // Navigation
    tutorial: '📺 Tutorial',
    campaigns: '🤖 AI Campaigns',
    membership: '💎 Membership',
    blog: 'Blog',
    creator: 'Creator',
    login: 'Sign In',
    demo: 'View Demo',
    dashboard: 'Dashboard',
    settings: 'Settings',
    prompts: 'Prompts',
    templates: 'Templates',
    contact: 'Contact',
    plans: 'Plans',

    // Hero section
    betaAccess: 'BETA VERSION - Early access available',
    mainTitle: 'Red Creativa Pro',
    subtitle: 'Hispanic AI Marketing Platform',
    poweredBy: 'Powered by AI',
    description: 'Create content, manage campaigns and automate your marketing with artificial intelligence tools designed specifically for the Spanish-speaking market.',

    // CTA buttons
    joinPlatform: '🚀 Join Red Creativa Pro',
    noCreditCard: 'No credit card required',
    immediateAccess: 'Immediate access',
    cancelAnytime: 'Cancel anytime',
    meetCreator: 'Meet the creator',

    // AI Tools section
    aiTools: 'AI-Powered Tools',
    aiToolsDesc: 'Discover the power of artificial intelligence applied to marketing and content creation',
    aiWriter: 'AI Writer',
    aiWriterDesc: 'Generate high-quality content for blogs, social media and marketing campaigns',
    aiEmails: 'AI Emails',
    aiEmailsDesc: 'Create personalized and effective email marketing campaigns',
    promptChat: 'Prompt Chat',
    promptChatDesc: 'Interact with AI using optimized prompts for better results',
    contactManagement: 'Contact Management',
    contactManagementDesc: 'Organize and segment your customer database intelligently',

    // About creator section
    aboutCreator: 'About the Creator',
    creatorTitle: 'Meet Sela, the Creator',
    creatorDesc: 'Humanities student who decided to create tools that really save time',
    personalEntrepreneurship: 'Personal Entrepreneurship',
    personalEntrepreneurshipDesc: 'I\'m not a big company. I\'m a real person who believes in creating useful tools. Every feature is designed from real usage experience.',
    directAccess: 'Direct Access',
    directAccessDesc: 'You can talk directly to me. Your feedback drives improvements. We build together the tool you really need.',
    myPhilosophy: 'My Philosophy',
    philosophyDesc: '"I believe tools should prove their value before asking for money. Try Red Creativa Pro, explore all its features, and only if it really helps you be more productive, then consider supporting the project."',
    readFullStory: 'Read My Full Story',
    contactDirectly: 'Contact Directly',
    supportEntrepreneur: 'When you subscribe, you directly support an independent entrepreneur',

    // Instagram DM Widget
    haveQuestions: 'Have questions?',
    sendDM: 'Send a DM',
    dmWidgetDescription: 'Send a direct message to the creator of Red Creativa Pro. Fast response guaranteed.',
    closeWidget: 'Close',

    // Dashboard
    welcome: 'Welcome',
    quickActions: 'Quick Actions',
    recentDocuments: 'Recent Documents',
    statistics: 'Statistics',
    loading: 'Loading...',
    loadingDashboard: 'Loading dashboard...',
    verifyingAccess: 'Verifying access...',

    // Escritor IA
    aiWriterTitle: 'AI Writer',
    generateContent: 'Generate Content',
    contentType: 'Content Type',
    writeHere: 'Write here...',
    generate: 'Generate',
    improve: 'Improve',
    translate: 'Translate',
    shorten: 'Shorten',
    expand: 'Expand',
    save: 'Save',
    export: 'Export',
    copy: 'Copy',
    clear: 'Clear',

    // Correos IA
    emailGenerator: 'Email Generator',
    emailSubject: 'Email Subject',
    emailBody: 'Email Body',
    generateEmail: 'Generate Email',

    // Forms
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send',
    submit: 'Submit',
    cancel: 'Cancel',

    // Messages
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',

    // Footer
    allRightsReserved: 'All rights reserved',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    cookiePolicy: 'Cookie Policy',
    legalNotice: 'Legal Notice',

    // Common
    home: 'Home',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    download: 'Download',
    upload: 'Upload',
    yes: 'Yes',
    no: 'No',

    // Homepage Hero
    forJournalists: 'For Journalists',
    freeForever: '100% Free forever',
    heroTitle1: 'AI For Journalists',
    heroTitle2: 'Who Know How to Write',
    heroDescription: 'Write 3x faster with AI that learns your style (doesn\'t replace it). Automatic SEO. Minimal detection.',
    indieProject: '👋 Indie project made with love. Everything works for free. If you write professionally and it helps you, use it. If you want to support development, great.',
    fasterProof: 'Faster',
    seoProof: 'Integrated SEO',
    styleProof: 'Unique Style',
    tryFree: 'Try Free',
    seeHowItWorks: 'See how it works',
    noCard: 'No card required',
    allIncluded: 'All included',
    useForever: 'Use it forever',

    // Plans Page
    pricingPlans: 'Pricing Plans',
    chooseYourPlan: 'Choose Your Plan',
    freePlan: 'Free Plan',
    monthlyPlan: 'Monthly Pro Plan',
    yearlyPlan: 'Annual Elite Plan',
    freePlanDesc: 'Risk-free trial. Perfect to discover if Red Creativa Pro is for you.',
    monthlyPlanDesc: 'Perfect for journalists who want irresistible content with AI that learns your style.',
    yearlyPlanDesc: 'Maximum savings + traffic strategy done for you for serious journalists.',
    perMonth: '/month',
    perYear: '/year',
    forever: 'forever',
    startFree: 'Start Free',
    startNow: 'Start Now',
    maximizeTraffic: 'Maximize Traffic',
    popular: 'Most Popular',

    // Writer IA Page
    writingAssistant: 'Writing Assistant',
    writeYourText: 'Write your text here',
    improveMyText: 'Improve my text',
    analyzing: 'Analyzing...',
    improving: 'Improving...',
    seoScore: 'SEO Score',
    readability: 'Readability',
    wordCount: 'Words',
    charactersCount: 'Characters',
    exportDocument: 'Export Document',
    newDocument: 'New Document',

    // Contact Page
    contactUs: 'Contact Us',
    getInTouch: 'Get in Touch',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    yourMessage: 'Your Message',
    sendMessage: 'Send Message',
    sending: 'Sending...',
    messageSent: 'Message Sent',

    // Footer
    aboutUs: 'About Us',
    features: 'Features',
    pricing: 'Pricing',
    resources: 'Resources',
    support: 'Support',
    followUs: 'Follow Us',

    // Homepage Value Sections
    howItWorks: 'How It Works',
    valueFormula: 'The Value Formula',
    noEmptyPromises: 'We don\'t sell empty promises. Here\'s exactly what you get, how we guarantee it, and how long it takes.',
    dreamOutcome: 'Aspirational Outcome',
    more: 'More',
    organicReach: 'Organic reach',
    optimizedContent: 'Optimized content that ranks better in search engines.',
    highProbability: 'High Probability',
    support121: '1 on 1',
    monthlyMeeting: 'Personalized monthly meeting',
    annualPlanSEO: 'Annual Plan: Technical SEO included',
    realSupport: 'Real assistance',
    minimalTime: 'Minimal Time',
    fast: 'Fast',
    writeInMinutes: 'Write in minutes',
    aiAssists: 'AI assists while you write',
    publishWhenReady: 'Publish: When you\'re ready',
    minimalEffort: 'Minimal Effort',
    auto: 'Auto',
    automaticOptimization: 'Automatic optimization',
    seoWhileWriting: 'SEO while you write',
    styleAdapted: 'Style adapted to you',
    annualPlanTechnical: 'Annual Plan: we do the technical work',
    satisfactionGuarantee: 'Satisfaction Guarantee',
    trial30Days: 'Try for 30 days. If you don\'t like how it works, we\'ll refund 100%. No questions asked.',
    cancelAnytime: 'Cancel anytime',
    trafficGrowth: 'Traffic growth',
    conversion: 'Conversion',
    response: 'Response',
    strategyAndSEO: 'Strategy and SEO',
    dominateSearchEngines: 'Dominate search engines',
    withDataNotGuesses: 'with data, not guesses.',
    seoToolsDesc: 'Our SEO analysis tools identify traffic opportunities your competitors are ignoring. We analyze real search intent so every piece of content you publish has a clear purpose.',
    intentAnalysis: 'Intent Analysis',
    understandWhy: 'Understand why your customers search for what they search for.',
    localSEO: 'Local SEO',
    optimizePresence: 'Optimize your presence for specific markets in LATAM and Spain.',
    tools: 'Tools',
    everythingInOnePlace: 'Everything you need in one place',
    toolsDesc: 'From content generation to SEO analysis, all the tools you need to grow your business.',
    writerIA: 'AI Writer',
    writerIADesc: 'Generate quality content in seconds with AI trained in Spanish.',
    emailMarketing: 'Email Marketing',
    emailMarketingDesc: 'Create personalized email campaigns that convert.',
    seoAnalysis: 'SEO Analysis',
    seoAnalysisDesc: 'Optimize your content to appear in top search results.',
    seeAllTools: 'See all tools'
  },
  fr: {
    // Navigation
    tutorial: '📺 Tutoriel',
    campaigns: '🤖 Campagnes IA',
    membership: '💎 Adhésion',
    blog: 'Blog',
    creator: 'Créateur',
    login: 'Se connecter',
    demo: 'Voir la démo',

    // Hero section
    betaAccess: 'VERSION BÊTA - Accès anticipé disponible',
    mainTitle: 'Red Creativa Pro',
    subtitle: 'Plateforme Marketing IA Hispanique',
    poweredBy: 'Alimenté par IA',
    description: 'Créez du contenu, gérez des campagnes et automatisez votre marketing avec des outils d\'intelligence artificielle conçus spécifiquement pour le marché hispanophone.',

    // CTA buttons
    joinPlatform: '🚀 Rejoindre Red Creativa Pro',
    noCreditCard: 'Aucune carte de crédit requise',
    immediateAccess: 'Accès immédiat',
    cancelAnytime: 'Annulez à tout moment',
    meetCreator: 'Rencontrer le créateur',

    // AI Tools section
    aiTools: 'Outils Alimentés par IA',
    aiToolsDesc: 'Découvrez la puissance de l\'intelligence artificielle appliquée au marketing et à la création de contenu',
    aiWriter: 'Rédacteur IA',
    aiWriterDesc: 'Générez du contenu de haute qualité pour les blogs, réseaux sociaux et campagnes marketing',
    aiEmails: 'Emails IA',
    aiEmailsDesc: 'Créez des campagnes d\'email marketing personnalisées et efficaces',
    promptChat: 'Chat avec Prompts',
    promptChatDesc: 'Interagissez avec l\'IA en utilisant des prompts optimisés pour de meilleurs résultats',
    contactManagement: 'Gestion des Contacts',
    contactManagementDesc: 'Organisez et segmentez intelligemment votre base de données clients',

    // About creator section
    aboutCreator: 'À propos du Créateur',
    creatorTitle: 'Rencontrez Sela, le Créateur',
    creatorDesc: 'Étudiant en Sciences Humaines qui a décidé de créer des outils qui font vraiment gagner du temps',
    personalEntrepreneurship: 'Entrepreneuriat Personnel',
    personalEntrepreneurshipDesc: 'Je ne suis pas une grande entreprise. Je suis une vraie personne qui croit en la création d\'outils utiles. Chaque fonctionnalité est conçue à partir d\'une expérience d\'utilisation réelle.',
    directAccess: 'Accès Direct',
    directAccessDesc: 'Vous pouvez me parler directement. Vos commentaires stimulent les améliorations. Nous construisons ensemble l\'outil dont vous avez vraiment besoin.',
    myPhilosophy: 'Ma Philosophie',
    philosophyDesc: '"Je crois que les outils doivent prouver leur valeur avant de demander de l\'argent. Essayez Red Creativa Pro, explorez toutes ses fonctionnalités, et seulement si cela vous aide vraiment à être plus productif, alors considérez soutenir le projet."',
    readFullStory: 'Lire Mon Histoire Complète',
    contactDirectly: 'Contacter Directement',
    supportEntrepreneur: 'Quand vous vous abonnez, vous soutenez directement un entrepreneur indépendant',

    // Instagram DM Widget
    haveQuestions: 'Des questions?',
    sendDM: 'Envoyer un DM',
    dmWidgetDescription: 'Envoyez un message direct au créateur de Red Creativa Pro. Réponse rapide garantie.',
    closeWidget: 'Fermer'
  },
  pt: {
    // Navigation
    tutorial: '📺 Tutorial',
    campaigns: '🤖 Campanhas IA',
    membership: '💎 Assinatura',
    blog: 'Blog',
    creator: 'Criador',
    login: 'Entrar',
    demo: 'Ver Demo',

    // Hero section
    betaAccess: 'VERSÃO BETA - Acesso antecipado disponível',
    mainTitle: 'Red Creativa Pro',
    subtitle: 'Plataforma de Marketing IA Hispânica',
    poweredBy: 'Alimentado por IA',
    description: 'Crie conteúdo, gerencie campanhas e automatize seu marketing com ferramentas de inteligência artificial projetadas especificamente para o mercado hispanófono.',

    // CTA buttons
    joinPlatform: '🚀 Juntar-se ao Red Creativa Pro',
    noCreditCard: 'Sem cartão de crédito necessário',
    immediateAccess: 'Acesso imediato',
    cancelAnytime: 'Cancele a qualquer momento',
    meetCreator: 'Conhecer o criador',

    // AI Tools section
    aiTools: 'Ferramentas Alimentadas por IA',
    aiToolsDesc: 'Descubra o poder da inteligência artificial aplicada ao marketing e criação de conteúdo',
    aiWriter: 'Escritor IA',
    aiWriterDesc: 'Gere conteúdo de alta qualidade para blogs, redes sociais e campanhas de marketing',
    aiEmails: 'Emails IA',
    aiEmailsDesc: 'Crie campanhas de email marketing personalizadas e eficazes',
    promptChat: 'Chat com Prompts',
    promptChatDesc: 'Interaja com IA usando prompts otimizados para melhores resultados',
    contactManagement: 'Gestão de Contatos',
    contactManagementDesc: 'Organize e segmente inteligentemente sua base de dados de clientes',

    // About creator section
    aboutCreator: 'Sobre o Criador',
    creatorTitle: 'Conheça Sela, o Criador',
    creatorDesc: 'Estudante de Humanidades que decidiu criar ferramentas que realmente economizam tempo',
    personalEntrepreneurship: 'Empreendedorismo Pessoal',
    personalEntrepreneurshipDesc: 'Não sou uma grande empresa. Sou uma pessoa real que acredita em criar ferramentas úteis. Cada funcionalidade é projetada a partir da experiência real de uso.',
    directAccess: 'Acesso Direto',
    directAccessDesc: 'Você pode falar diretamente comigo. Seu feedback impulsiona melhorias. Construímos juntos a ferramenta que você realmente precisa.',
    myPhilosophy: 'Minha Filosofia',
    philosophyDesc: '"Acredito que as ferramentas devem provar seu valor antes de pedir dinheiro. Experimente o Red Creativa Pro, explore todas as suas funcionalidades, e só se realmente te ajudar a ser mais produtivo, então considere apoiar o projeto."',
    readFullStory: 'Ler Minha História Completa',
    contactDirectly: 'Contatar Diretamente',
    supportEntrepreneur: 'Quando você se inscreve, apoia diretamente um empreendedor independente',

    // Instagram DM Widget
    haveQuestions: 'Tem dúvidas?',
    sendDM: 'Enviar um DM',
    dmWidgetDescription: 'Envie uma mensagem direta ao criador do Red Creativa Pro. Resposta rápida garantida.',
    closeWidget: 'Fechar'
  },
  it: {
    // Navigation
    tutorial: '📺 Tutorial',
    campaigns: '🤖 Campagne IA',
    membership: '💎 Abbonamento',
    blog: 'Blog',
    creator: 'Creatore',
    login: 'Accedi',
    demo: 'Vedi Demo',

    // Hero section
    betaAccess: 'VERSIONE BETA - Accesso anticipato disponibile',
    mainTitle: 'Red Creativa Pro',
    subtitle: 'Piattaforma Marketing IA Ispanica',
    poweredBy: 'Alimentato da IA',
    description: 'Crea contenuti, gestisci campagne e automatizza il tuo marketing con strumenti di intelligenza artificiale progettati specificamente per il mercato ispanofono.',

    // CTA buttons
    joinPlatform: '🚀 Unisciti a Red Creativa Pro',
    noCreditCard: 'Nessuna carta di credito richiesta',
    immediateAccess: 'Accesso immediato',
    cancelAnytime: 'Cancella in qualsiasi momento',
    meetCreator: 'Incontra il creatore',

    // AI Tools section
    aiTools: 'Strumenti Alimentati da IA',
    aiToolsDesc: 'Scopri il potere dell\'intelligenza artificiale applicata al marketing e alla creazione di contenuti',
    aiWriter: 'Scrittore IA',
    aiWriterDesc: 'Genera contenuti di alta qualità per blog, social media e campagne di marketing',
    aiEmails: 'Email IA',
    aiEmailsDesc: 'Crea campagne di email marketing personalizzate ed efficaci',
    promptChat: 'Chat con Prompt',
    promptChatDesc: 'Interagisci con l\'IA utilizzando prompt ottimizzati per risultati migliori',
    contactManagement: 'Gestione Contatti',
    contactManagementDesc: 'Organizza e segmenta intelligentemente il tuo database clienti',

    // About creator section
    aboutCreator: 'Sul Creatore',
    creatorTitle: 'Incontra Sela, il Creatore',
    creatorDesc: 'Studente di Scienze Umane che ha deciso di creare strumenti che fanno davvero risparmiare tempo',
    personalEntrepreneurship: 'Imprenditorialità Personale',
    personalEntrepreneurshipDesc: 'Non sono una grande azienda. Sono una persona reale che crede nel creare strumenti utili. Ogni funzionalità è progettata dall\'esperienza d\'uso reale.',
    directAccess: 'Accesso Diretto',
    directAccessDesc: 'Puoi parlare direttamente con me. Il tuo feedback guida i miglioramenti. Costruiamo insieme lo strumento di cui hai davvero bisogno.',
    myPhilosophy: 'La Mia Filosofia',
    philosophyDesc: '"Credo che gli strumenti debbano dimostrare il loro valore prima di chiedere soldi. Prova Red Creativa Pro, esplora tutte le sue funzionalità, e solo se ti aiuta davvero a essere più produttivo, allora considera di supportare il progetto."',
    readFullStory: 'Leggi la Mia Storia Completa',
    contactDirectly: 'Contatta Direttamente',
    supportEntrepreneur: 'Quando ti abboni, supporti direttamente un imprenditore indipendente',

    // Instagram DM Widget
    haveQuestions: 'Hai domande?',
    sendDM: 'Invia un DM',
    dmWidgetDescription: 'Invia un messaggio diretto al creatore di Red Creativa Pro. Risposta rapida garantita.',
    closeWidget: 'Chiudi'
  },
  de: {
    // Navigation
    tutorial: '📺 Tutorial',
    campaigns: '🤖 KI-Kampagnen',
    membership: '💎 Mitgliedschaft',
    blog: 'Blog',
    creator: 'Ersteller',
    login: 'Anmelden',
    demo: 'Demo ansehen',

    // Hero section
    betaAccess: 'BETA-VERSION - Früher Zugang verfügbar',
    mainTitle: 'Red Creativa Pro',
    subtitle: 'Hispanische KI-Marketing-Plattform',
    poweredBy: 'Angetrieben von KI',
    description: 'Erstellen Sie Inhalte, verwalten Sie Kampagnen und automatisieren Sie Ihr Marketing mit KI-Tools, die speziell für den spanischsprachigen Markt entwickelt wurden.',

    // CTA buttons
    joinPlatform: '🚀 Red Creativa Pro beitreten',
    noCreditCard: 'Keine Kreditkarte erforderlich',
    immediateAccess: 'Sofortiger Zugang',
    cancelAnytime: 'Jederzeit kündbar',
    meetCreator: 'Den Ersteller kennenlernen',

    // AI Tools section
    aiTools: 'KI-gestützte Tools',
    aiToolsDesc: 'Entdecken Sie die Macht der künstlichen Intelligenz im Marketing und bei der Inhaltserstellung',
    aiWriter: 'KI-Autor',
    aiWriterDesc: 'Generieren Sie hochwertige Inhalte für Blogs, soziale Medien und Marketing-Kampagnen',
    aiEmails: 'KI-E-Mails',
    aiEmailsDesc: 'Erstellen Sie personalisierte und effektive E-Mail-Marketing-Kampagnen',
    promptChat: 'Prompt-Chat',
    promptChatDesc: 'Interagieren Sie mit KI unter Verwendung optimierter Prompts für bessere Ergebnisse',
    contactManagement: 'Kontaktverwaltung',
    contactManagementDesc: 'Organisieren und segmentieren Sie Ihre Kundendatenbank intelligent',

    // About creator section
    aboutCreator: 'Über den Ersteller',
    creatorTitle: 'Lernen Sie Sela kennen, den Ersteller',
    creatorDesc: 'Geisteswissenschaftsstudent, der beschloss, Tools zu erstellen, die wirklich Zeit sparen',
    personalEntrepreneurship: 'Persönliches Unternehmertum',
    personalEntrepreneurshipDesc: 'Ich bin kein großes Unternehmen. Ich bin eine echte Person, die daran glaubt, nützliche Tools zu erstellen. Jede Funktion ist aus echter Nutzungserfahrung heraus konzipiert.',
    directAccess: 'Direkter Zugang',
    directAccessDesc: 'Sie können direkt mit mir sprechen. Ihr Feedback treibt Verbesserungen voran. Wir bauen gemeinsam das Tool, das Sie wirklich brauchen.',
    myPhilosophy: 'Meine Philosophie',
    philosophyDesc: '"Ich glaube, dass Tools ihren Wert beweisen sollten, bevor sie Geld verlangen. Probieren Sie Red Creativa Pro aus, erkunden Sie alle Funktionen, und nur wenn es Ihnen wirklich hilft, produktiver zu sein, dann erwägen Sie, das Projekt zu unterstützen."',
    readFullStory: 'Meine vollständige Geschichte lesen',
    contactDirectly: 'Direkt kontaktieren',
    supportEntrepreneur: 'Wenn Sie sich anmelden, unterstützen Sie direkt einen unabhängigen Unternehmer',

    // Instagram DM Widget
    haveQuestions: 'Haben Sie Fragen?',
    sendDM: 'DM senden',
    dmWidgetDescription: 'Senden Sie eine direkte Nachricht an den Ersteller von Red Creativa Pro. Schnelle Antwort garantiert.',
    closeWidget: 'Schließen'
  }
} as const;

export function getSimpleTranslation(key: keyof typeof translations.es, lang: SupportedLanguage = 'es') {
  return translations[lang][key] || translations.es[key];
}

export function useSimpleTranslations() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('es');
  const [isClient, setIsClient] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);

    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      try {
        // Get initial language from localStorage
        const savedLang = localStorage.getItem('simple-language') as SupportedLanguage | null;
        if (savedLang && savedLang in translations) {
          setCurrentLang(savedLang);
        }

        // Listen for language changes
        const handleLanguageChange = (event: CustomEvent) => {
          if (event.detail && event.detail in translations) {
            setCurrentLang(event.detail);
            // Force re-render of all components using this hook
            setForceUpdate(prev => prev + 1);
          }
        };

        window.addEventListener('languageChanged', handleLanguageChange as EventListener);

        return () => {
          window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
        };
      } catch (error) {
        console.warn('Error accessing localStorage for language:', error);
      }
    }
  }, []);

  const t = (key: keyof typeof translations.es) => {
    try {
      return getSimpleTranslation(key, currentLang);
    } catch (error) {
      console.warn('Translation error for key:', key, error);
      return translations.es[key] || key;
    }
  };

  return { t, currentLang, isClient, forceUpdate };
}