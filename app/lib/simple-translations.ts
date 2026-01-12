import { useState, useEffect } from 'react';

// Multi-language translation system
export type SupportedLanguage = 'es' | 'en' | 'fr' | 'pt' | 'it' | 'de' | 'zh';

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
    subscription: 'Suscripción',
    logout: 'Cerrar Sesión',
    register: 'Registrarse',
    navigation: 'Navegación',
    'navigation.navigation': 'Navegación',
    'navigation.openMenu': 'Abrir menú',
    'navigation.closeMenu': 'Cerrar menú',
    'navigation.swipeLeftToClose': 'Desliza a la izquierda para cerrar',

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
    writeToSeeAnalysis: 'Escribe algo para ver el análisis SEO.',

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
    seeAllTools: 'Ver todas las herramientas',

    // Social Proof Section
    realCase: 'Caso Real',
    notMagicMethod: 'Esto No es Magia, Es Método',
    realResultUsing: 'Resultado real usando Red Creativa Pro consistentemente durante 60 días.',
    growthResults: 'Resultados de crecimiento',
    consistentUse: 'Uso Consistente = Resultados',
    daysWritingAI: '60 Días Escribiendo con Asistencia de IA',
    testimonialQuote: '"Escribí 12 artículos usando Red Creativa Pro. El proceso fue más rápido, el SEO mejoró, y los artículos mantuvieron mi estilo."',
    articles: 'Artículos',
    days: 'Días',
    fasterTimes: 'Más Rápido',
    seoAutomated: 'Automatizado',
    selaCreator: 'Sela (Creador)',
    creatorAndDev: 'Creador & Developer',
    readyNextSuccess: '¿Listo para ser el próximo caso de éxito?',
    joinFirst100: 'Únete a los primeros 100 usuarios fundadores y comparte tu historia en Trustpilot.',
    leaveReview: 'Dejar tu reseña',
    onlyPlacesAvailable: 'Solo 38 plazas disponibles para el Plan Elite con Traffic Accelerator.',

    // Creator Story Section
    storyBehindCode: 'La historia detrás del código',
    collaborativeProject: 'Este es un proyecto colaborativo diseñado para crecer juntos. He creado este espacio para que sea nuestro, donde cada mejora cuenta.',
    constantEvolution: 'Red Creativa Pro está en constante evolución. Si quieres proponer cambios, mejorar el software o simplemente charlar, escríbeme a',
    openSource: 'Código Abierto',
    openSourceDesc: 'Este proyecto es de código abierto. Puedes revisar el código, aprender cómo está construido o contribuir en GitHub.',
    viewGithubRepo: 'Ver repositorio en GitHub',
    supportProject: 'Apoya el proyecto',
    supportProjectDesc: 'Si valoras el esfuerzo y quieres ayudarme a mantener los servidores y seguir estudiando, puedes apoyar económicamente.',
    viewSupportWays: 'Ver formas de apoyo',
    creatorQuote: '"Empecé esto en mi habitación con un café y muchas ganas de crear algo útil para todos."',
    theCreator: 'El Creador',
    creatorDev: 'Creador & Dev',

    // Final CTA Section
    bePartOfThis: 'Forma parte de esto',
    notCorporateSoftware: 'No estás comprando un software corporativo. Estás uniéndote a un equipo que busca simplificar el marketing para humanos.',
    joinUsFree: 'Únete a nosotros gratis',
    writeToMe: 'Escríbeme a @sela_gb',

    // Footer  
    indieProjectFooter: 'UN PROYECTO INDEPENDIENTE',
    madeWithLove: 'MADE WITH',
    inSpain: 'IN SPAIN',
    privacy: 'Privacidad',
    terms: 'Términos',
    trustpilot: 'Trustpilot',

    // Dashboard Extended
    goodMorning: 'Buenos días',
    goodAfternoon: 'Buenas tardes',
    goodEvening: 'Buenas noches',
    welcomeData: 'Bienvenido a tu espacio de trabajo',
    getPremium: 'Obtener Premium',
    premium: 'Premium',

    start: 'Empezar',
    seeMore: 'Ver más',
    quickStats: 'Estadísticas Rápidas',
    generatedTexts: 'Textos generados (30d)',
    sentEmails: 'Correos creados (30d)',
    usedPrompts: 'Prompts usados (30d)',
    recentActivity: 'Actividad Reciente',
    noActivity: 'No hay actividad reciente',
    startCreating: 'Comienza creando tu primer contenido para ver tu actividad aquí',
    createFirstContent: 'Crear primer contenido',
    guestTrialActive: 'Prueba activa',
    usingTrialVersion: 'Estás usando la versión de prueba',
    timeRemaining: 'Tiempo restante',
    minutes: 'minutos',
    tutorialVideo: 'Tutorial de Red Creativa Pro',

    promptEngineering: 'Ingeniería de prompts',
    premadeResources: 'Recursos prediseñados',
    smartEmailMarketing: 'Email marketing inteligente',
    generateContentAI: 'Genera contenido con IA',
    highQualityContent: 'Crea contenido de alta calidad usando inteligencia artificial de última generación.',
    emailCampaigns: 'Crea campañas de email marketing personalizadas y efectivas con IA.',
    professionalTemplates: 'Accede a plantillas profesionales optimizadas para diversos casos de uso.',
    expertPrompts: 'Colección de prompts expertos para obtener los mejores resultados de la IA.',

    // AI Writer Extended
    advancedAI: 'IA Avanzada',
    advancedAIWriter: 'Escritor IA Avanzado',
    googleDocsStyle: 'Editor estilo Google Docs con IA',
    professionalEditorDesc: 'Editor profesional con páginas múltiples, análisis SEO en tiempo real, exportación a PDF/DOCX/TXT y mejora automática con IA.',
    tryWithoutAccount: 'Prueba el editor sin crear cuenta',
    tryWithoutAccountDesc: 'Puedes escribir y ver todas las funciones del editor. Para usar la IA y mejorar tu texto, necesitarás iniciar sesión.',
    loginToUseAI: 'Iniciar Sesión para usar IA',
    documentPages: 'Páginas del Documento',
    newPage: 'Nueva Página',
    words: 'palabras',
    autoAgent: 'Agente Automático',
    autoAgentDesc: 'Mejora automática cada cierto tiempo (Shortcut: Shift+1)',
    activateAgent: 'Activar Agente',
    active: 'Activo',
    inactive: 'Inactivo',
    interval: 'Intervalo',
    creativity: 'Creatividad',
    creativityDesc: 'Controla el nivel de creatividad de la IA',
    level: 'Nivel',
    conservative: 'Conservador',
    balanced: 'Equilibrado',
    creative: 'Creativo',
    readyToImprove: 'Listo para mejorar • Shift+1 para modo automático',
    needMoreWords: 'Necesitas palabras más',
    exportDoc: 'Exportar Documento',
    downloadFormats: 'Descarga tu documento en diferentes formatos',
    realTimeAnalysis: 'Análisis en tiempo real de tu contenido',
    paragraphs: 'Párrafos',
    readingTime: 'Tiempo lectura',
    keywords: 'Keywords',
    suggestions: 'Sugerencias',
    clean: 'Limpiar',
    improveWithAI: 'Mejorar con IA',

    // Plans Extended
    whyAreYouHere: '¿Por Qué Estás Aquí?',
    triedTool: 'En serio, ¿ya probaste la herramienta o solo vienes a ver precios? 🤔',
    goToTryFree: 'Ir a Probar Gratis',
    writeToSela: 'Escribirle a Sela',
    ifYouInsist: 'Pero Si Insistes en Pagar...',
    supportOptions: 'Estas son las formas en las que puedes apoyar el proyecto. Pero en serio, primero úsalo gratis.',
    buyMeCoffee: 'Invítame un Café',
    keepStudying: 'Para que siga estudiando y mejorando esto',
    halfCoffee: '½ café / 1 euro',
    accessToAll: 'Acceso a TODO',
    nameInList: 'Tu nombre en la lista de apoyadores',
    directAccessCreator: 'Acceso directo al creador para sugerir cambios',
    serverMaintenance: 'Ayudas a mantener los servidores',
    goodVibes: 'Buenas vibras ✨',
    supportMonthly: 'Apoyar Mensualmente',
    believeInThis: 'Creo en Esto',
    annualSupport: 'Apoyo anual + te ayudo personalmente',
    discount: 'DESCUENTO',
    tenCoffees: 'El precio de 10 cafés al año',
    everythingPrevious: 'Todo del plan anterior',
    discountVsMonthly: '17% de descuento vs. mensual',
    directAccessFeedback: 'Acceso directo al creador para decirle qué cambiar en el producto',
    monthlyMeetingReal: 'Reunión mensual conmigo (en serio)',
    technicalSeoHelp: 'Te ayudo con SEO técnico si me escribes',
    supportIndieProject: 'Apoyas un proyecto independiente 🚀',
    supportAnnually: 'Apoyar Anualmente',
    bestWayToSupport: '💬 La Mejor Forma de Apoyar',
    useTool: 'Más que dinero, lo que realmente ayuda es que uses la herramienta',
    tellMeImprovements: 'me cuentes qué mejorar',
    recommendIt: 'que se lo recomiendes a otros periodistas',
    writeSuggestions: 'Escribirme sugerencias',
    leaveTrustpilot: 'Dejar reseña en Trustpilot',
    indieProjectFooter2: 'Proyecto indie para periodistas profesionales.',

    // Anti-Stupidity Section
    realWarning: 'Advertencia Real',
    aiDoesntMakeStupid: 'Esta IA NO te vuelve estúpido',
    adaptsNotReplaces: 'Se adapta a ti. No te reemplaza.',
    otherAIs: 'Otras IAs',
    writeForYou: 'Escriben por ti',
    yourVoiceDisappears: 'Tu voz desaparece',
    genericContent: 'Contenido genérico',
    googlePenalizes: 'Google te penaliza',
    becomeDependant: 'Te vuelves dependiente',
    loseSkill: 'Pierdes tu habilidad',
    learnsYourStyle: 'Aprende TU estilo',
    soundsLikeYouImproved: 'Suena a ti, pero mejorado',
    uniqueContent: 'Contenido único',
    minimalDetection: 'Detección mínima',
    youKeepWriting: 'Tú sigues escribiendo',
    aiOnlyAssists: 'La IA solo asiste',
    differencInHow: 'La diferencia está en cómo la usas',
    dontGenerateForYou: 'No generamos contenido por ti.',
    improveWhatYouWrote: 'Mejoramos lo que YA escribiste.',
    brainKeepsWorking: 'Tu cerebro sigue trabajando. La IA solo te ahorra tiempo en corrección, formato y SEO.',
    tryNowFree: 'Probarlo Ahora (Es Gratis)',

    // Stats section
    trafficGrowthStat: 'Crecimiento en tráfico',
    conversionStat: 'Conversión',
    roiStat: 'ROI',
    responseStat: 'Respuesta',

    // Testimonials
    fasterTimes3x: 'Más Rápido',
    seoAutomatedShort: 'Automatizado',
    articlesCount: 'Artículos',
    daysCount: 'Días',

    // Creator Story / Support section (additional)
    placeAvailableCount: 'Solo 38 plazas disponibles para el Plan Elite con Traffic Accelerator.',

    // Footer short texts
    privacyShort: 'Privacidad',
    termsShort: 'Términos',
    trustpilotShort: 'Trustpilot',

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
    subscription: 'Subscription',
    logout: 'Log Out',
    register: 'Sign Up',

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
    writeToSeeAnalysis: 'Write something to see SEO analysis.',

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
    seeAllTools: 'See all tools',

    // Social Proof Section
    realCase: 'Real Case',
    notMagicMethod: 'This Is Not Magic, It is Method',
    realResultUsing: 'Real result using Red Creativa Pro consistently for 60 days.',
    growthResults: 'Growth results',
    consistentUse: 'Consistent Use = Results',
    daysWritingAI: '60 Days Writing with AI Assistance',
    testimonialQuote: '"I wrote 12 articles using Red Creativa Pro. The process was faster, SEO improved, and the articles maintained my style."',
    articles: 'Articles',
    days: 'Days',
    fasterTimes: 'Faster',
    seoAutomated: 'Automated',
    selaCreator: 'Sela (Creator)',
    creatorAndDev: 'Creator & Developer',
    readyNextSuccess: 'Ready to be the next success story?',
    joinFirst100: 'Join the first 100 founding users and share your story on Trustpilot.',
    leaveReview: 'Leave your review',
    onlyPlacesAvailable: 'Only 38 spots available for the Elite Plan with Traffic Accelerator.',

    // Creator Story Section
    storyBehindCode: 'The story behind the code',
    collaborativeProject: 'This is a collaborative project designed to grow together. I created this space to be ours, where every improvement counts.',
    constantEvolution: 'Red Creativa Pro is constantly evolving. If you want to propose changes, improve the software or just chat, write to me at',
    openSource: 'Open Source',
    openSourceDesc: 'This project is open source. You can review the code, learn how it is built or contribute on GitHub.',
    viewGithubRepo: 'View GitHub repository',
    supportProject: 'Support the project',
    supportProjectDesc: 'If you value the effort and want to help me keep the servers running and continue studying, you can support financially.',
    viewSupportWays: 'View support options',
    creatorQuote: '"I started this in my room with a coffee and a strong desire to create something useful for everyone."',
    theCreator: 'The Creator',
    creatorDev: 'Creator & Dev',

    // Final CTA Section
    bePartOfThis: 'Be part of this',
    notCorporateSoftware: 'You are not buying corporate software. You are joining a team that seeks to simplify marketing for humans.',
    joinUsFree: 'Join us for free',
    writeToMe: 'Write to me at @sela_gb',

    // Footer  
    indieProjectFooter: 'AN INDEPENDENT PROJECT',
    madeWithLove: 'MADE WITH',
    inSpain: 'IN SPAIN',
    privacy: 'Privacy',
    terms: 'Terms',
    trustpilot: 'Trustpilot',

    // Dashboard Extended
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    welcomeData: 'Welcome to your workspace',
    getPremium: 'Get Premium',
    premium: 'Premium',

    start: 'Start',
    seeMore: 'See more',
    quickStats: 'Quick Stats',
    generatedTexts: 'Texts generated (30d)',
    sentEmails: 'Emails created (30d)',
    usedPrompts: 'Prompts used (30d)',
    recentActivity: 'Recent Activity',
    noActivity: 'No recent activity',
    startCreating: 'Start creating your first content to see your activity here',
    createFirstContent: 'Create first content',
    guestTrialActive: 'Trial active',
    usingTrialVersion: 'You are using the trial version',
    timeRemaining: 'Time remaining',
    minutes: 'minutes',
    tutorialVideo: 'Red Creativa Pro Tutorial',

    promptEngineering: 'Prompt engineering',
    premadeResources: 'Premade resources',
    smartEmailMarketing: 'Smart email marketing',
    generateContentAI: 'Generate content with AI',
    highQualityContent: 'Create high-quality content using state-of-the-art artificial intelligence.',
    emailCampaigns: 'Create personalized and effective email marketing campaigns with AI.',
    professionalTemplates: 'Access professional templates optimized for various use cases.',
    expertPrompts: 'Collection of expert prompts to get the best results from AI.',

    // AI Writer Extended
    advancedAI: 'Advanced AI',
    advancedAIWriter: 'Advanced AI Writer',
    googleDocsStyle: 'Google Docs style editor with AI',
    professionalEditorDesc: 'Professional editor with multiple pages, real-time SEO analysis, PDF/DOCX/TXT export and automatic AI improvement.',
    tryWithoutAccount: 'Try editor without account',
    tryWithoutAccountDesc: 'You can write and see all editor features. To use AI and improve your text, you will need to sign in.',
    loginToUseAI: 'Sign In to use AI',
    documentPages: 'Document Pages',
    newPage: 'New Page',
    words: 'words',
    autoAgent: 'Auto Agent',
    autoAgentDesc: 'Automatic improvement every few seconds (Shortcut: Shift+1)',
    activateAgent: 'Activate Agent',
    active: 'Active',
    inactive: 'Inactive',
    interval: 'Interval',
    creativity: 'Creativity',
    creativityDesc: 'Control AI creativity level',
    level: 'Level',
    conservative: 'Conservative',
    balanced: 'Balanced',
    creative: 'Creative',
    readyToImprove: 'Ready to improve • Shift+1 for auto mode',
    needMoreWords: 'You need more words',
    exportDoc: 'Export Document',
    downloadFormats: 'Download your document in different formats',
    realTimeAnalysis: 'Real-time analysis of your content',
    paragraphs: 'Paragraphs',
    readingTime: 'Reading time',
    keywords: 'Keywords',
    suggestions: 'Suggestions',
    clean: 'Clean',
    improveWithAI: 'Improve with AI',

    // Plans Extended
    whyAreYouHere: 'Why Are You Here?',
    triedTool: 'Seriously, have you tried the tool yet or are you just here to see prices? 🤔',
    goToTryFree: 'Go Try For Free',
    writeToSela: 'Write to Sela',
    ifYouInsist: 'But If You Insist on Paying...',
    supportOptions: 'These are the ways you can support the project. But seriously, use it for free first.',
    buyMeCoffee: 'Buy Me a Coffee',
    keepStudying: 'So I can keep studying and improving this',
    halfCoffee: '½ coffee / 1 euro',
    accessToAll: 'Access to EVERYTHING',
    nameInList: 'Your name on the supporters list',
    directAccessCreator: 'Direct access to creator to suggest changes',
    serverMaintenance: 'Helps maintain servers',
    goodVibes: 'Good vibes ✨',
    supportMonthly: 'Support Monthly',
    believeInThis: 'I Believe in This',
    annualSupport: 'Annual support + I help you personally',
    discount: 'DISCOUNT',
    tenCoffees: 'The price of 10 coffees a year',
    everythingPrevious: 'Everything from previous plan',
    discountVsMonthly: '17% discount vs. monthly',
    directAccessFeedback: 'Direct access to creator to tell me what to change in the product',
    monthlyMeetingReal: 'Monthly meeting with me (seriously)',
    technicalSeoHelp: 'I help you with technical SEO if you message me',
    supportIndieProject: 'Support an indie project 🚀',
    supportAnnually: 'Support Annually',
    bestWayToSupport: '💬 The Best Way to Support',
    useTool: 'More than money, what really helps is that you use the tool',
    tellMeImprovements: 'tell me what to improve',
    recommendIt: 'recommend it to other journalists',
    writeSuggestions: 'Write suggestions',
    leaveTrustpilot: 'Leave review on Trustpilot',
    indieProjectFooter2: 'Indie project for professional journalists.',

    // Anti-Stupidity Section
    realWarning: 'Real Warning',
    aiDoesntMakeStupid: 'This AI does NOT make you stupid',
    adaptsNotReplaces: 'It adapts to you. It doesn\'t replace you.',
    otherAIs: 'Other AIs',
    writeForYou: 'Write for you',
    yourVoiceDisappears: 'Your voice disappears',
    genericContent: 'Generic content',
    googlePenalizes: 'Google penalizes you',
    becomeDependant: 'You become dependent',
    loseSkill: 'You lose your skill',
    learnsYourStyle: 'Learns YOUR style',
    soundsLikeYouImproved: 'Sounds like you, but improved',
    uniqueContent: 'Unique content',
    minimalDetection: 'Minimal detection',
    youKeepWriting: 'You keep writing',
    aiOnlyAssists: 'AI only assists',
    differencInHow: 'The difference is in how you use it',
    dontGenerateForYou: 'We don\'t generate content for you.',
    improveWhatYouWrote: 'We improve what you ALREADY wrote.',
    brainKeepsWorking: 'Your brain keeps working. AI only saves you time on correction, formatting, and SEO.',
    tryNowFree: 'Try It Now (It\'s Free)',

    // Stats section
    trafficGrowthStat: 'Traffic growth',
    conversionStat: 'Conversion',
    roiStat: 'ROI',
    responseStat: 'Response',

    // Testimonials
    fasterTimes3x: 'Faster',
    seoAutomatedShort: 'Automated',
    articlesCount: 'Articles',
    daysCount: 'Days',

    // Creator Story / Support section (additional)
    placeAvailableCount: 'Only 38 spots available for the Elite Plan with Traffic Accelerator.',

    // Footer short texts
    privacyShort: 'Privacy',
    termsShort: 'Terms',
    trustpilotShort: 'Trustpilot'

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
  const customTranslations = translations as any;
  return customTranslations[lang]?.[key] || translations.es[key];
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