// Scripts de tutorial completo para el sistema de guía de voz
// Proporciona explicaciones paso a paso de toda la aplicación

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  duration?: number;
  page?: string;
  element?: string;
}

export interface TutorialScript {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  totalDuration: number;
}

export const TUTORIAL_SCRIPTS: Record<string, TutorialScript> = {
  onboarding: {
    id: 'onboarding',
    title: 'Tutorial de Bienvenida - Red Creativa Pro',
    description: 'Una introducción completa a todas las funcionalidades de la plataforma',
    totalDuration: 600, // 10 minutos
    steps: [
      {
        id: 'welcome',
        title: 'Bienvenida',
        content: 'Bienvenido a Red Creativa Pro, tu plataforma integral de inteligencia artificial para crear contenido profesional. En los próximos minutos, te guiaré a través de todas las herramientas y funcionalidades disponibles.',
        duration: 15
      },
      {
        id: 'navigation',
        title: 'Navegación Principal',
        content: 'La barra de navegación superior es tu punto de acceso a todas las herramientas. Encontrarás Dashboard para el panel de control, Escritor IA para generar contenido, Correos IA para emails, Prompts para plantillas, y Configuración para personalizar tu experiencia.',
        duration: 25,
        page: '/'
      },
      {
        id: 'dashboard-overview',
        title: 'Dashboard - Tu Centro de Control',
        content: 'El Dashboard es tu centro de control principal. Aquí puedes monitorear tu uso de tokens, ver estadísticas de actividad, acceder rápidamente a herramientas populares, y revisar tu historial reciente. Es el punto de partida ideal para cualquier sesión de trabajo.',
        duration: 30,
        page: '/dashboard'
      },
      {
        id: 'escritor-ia-intro',
        title: 'Escritor IA - Generación de Contenido',
        content: 'El Escritor IA es tu asistente para crear contenido escrito de alta calidad. Puedes generar artículos, blogs, copy publicitario, descripciones de productos y mucho más. Solo necesitas seleccionar el tipo de contenido y proporcionar instrucciones claras.',
        duration: 35,
        page: '/escritor-ia'
      },
      {
        id: 'escritor-ia-process',
        title: 'Proceso de Generación en Escritor IA',
        content: 'El proceso es simple: primero selecciona el tipo de contenido, luego describe qué quieres en el área de instrucciones, ajusta los parámetros como tono y longitud, y finalmente haz clic en generar. La IA analizará tus instrucciones y creará contenido personalizado que puedes editar y exportar.',
        duration: 40,
        page: '/escritor-ia'
      },
      {
        id: 'correos-ia-intro',
        title: 'Correos IA - Marketing por Email',
        content: 'Correos IA está especializado en crear emails profesionales y efectivos. Desde newsletters hasta campañas de marketing, esta herramienta genera mensajes persuasivos adaptados a tu audiencia específica.',
        duration: 30,
        page: '/correos-ia'
      },
      {
        id: 'correos-ia-features',
        title: 'Características de Correos IA',
        content: 'Puedes elegir entre diferentes tipos de email como promocional, informativo, o de seguimiento. Define tu audiencia objetivo, especifica el objetivo del mensaje, ajusta el tono, y la IA generará tanto el contenido como líneas de asunto atractivas para mejorar las tasas de apertura.',
        duration: 35,
        page: '/correos-ia'
      },
      {
        id: 'prompts-intro',
        title: 'Gestión de Prompts - Plantillas Inteligentes',
        content: 'La sección de Prompts es tu biblioteca de plantillas reutilizables. Aquí puedes crear, organizar y guardar instrucciones que te dan resultados consistentes. Es especialmente útil para contenido que generas frecuentemente.',
        duration: 30,
        page: '/prompts'
      },
      {
        id: 'prompts-management',
        title: 'Organización de Prompts',
        content: 'Puedes organizar tus prompts por categorías, usar etiquetas para encontrarlos rápidamente, probar nuevas plantillas antes de guardarlas, y compartir prompts exitosos con tu equipo. También puedes importar y exportar colecciones completas.',
        duration: 35,
        page: '/prompts'
      },
      {
        id: 'settings-overview',
        title: 'Configuración - Personalización',
        content: 'En Configuración puedes personalizar completamente tu experiencia. Ajusta las preferencias de IA, gestiona tu cuenta y suscripción, configura notificaciones, y personaliza la interfaz según tus necesidades.',
        duration: 30,
        page: '/ajustes'
      },
      {
        id: 'voice-guide-features',
        title: 'Sistema de Guía de Voz',
        content: 'Este sistema de guía de voz está disponible en toda la plataforma. Puedes presionar F1 en cualquier página para obtener ayuda contextual, usar el botón flotante para acceso rápido, y configurar la voz y velocidad según tus preferencias.',
        duration: 25
      },
      {
        id: 'keyboard-shortcuts',
        title: 'Atajos de Teclado',
        content: 'Para mayor eficiencia, usa estos atajos: F1 para ayuda contextual, Ctrl+H para reproducir la introducción de la página actual, Espacio para pausar o reanudar audio, y Escape para detener la reproducción. Estos atajos funcionan en toda la plataforma.',
        duration: 30
      },
      {
        id: 'tips-best-practices',
        title: 'Consejos y Mejores Prácticas',
        content: 'Para obtener los mejores resultados: sé específico en tus instrucciones, incluye contexto sobre tu audiencia, experimenta con diferentes tonos y estilos, guarda los prompts exitosos como plantillas, y revisa regularmente tus estadísticas para optimizar el uso de créditos.',
        duration: 40
      },
      {
        id: 'conclusion',
        title: 'Conclusión',
        content: 'Ahora conoces todas las herramientas principales de Red Creativa Pro. Recuerda que cada sección tiene su propia guía de voz contextual, y puedes acceder a ayuda en cualquier momento. ¡Comienza a crear contenido profesional con inteligencia artificial!',
        duration: 25
      }
    ]
  },

  quickStart: {
    id: 'quick-start',
    title: 'Inicio Rápido - Primeros Pasos',
    description: 'Una guía rápida para comenzar a usar las herramientas principales',
    totalDuration: 180, // 3 minutos
    steps: [
      {
        id: 'quick-welcome',
        title: 'Inicio Rápido',
        content: 'Bienvenido al tutorial de inicio rápido. En solo 3 minutos aprenderás lo esencial para comenzar a crear contenido con Red Creativa Pro.',
        duration: 10
      },
      {
        id: 'quick-dashboard',
        title: 'Dashboard Rápido',
        content: 'El Dashboard muestra tu información clave: créditos disponibles, herramientas populares, y accesos rápidos. Es tu punto de partida para cualquier tarea.',
        duration: 20,
        page: '/dashboard'
      },
      {
        id: 'quick-content-creation',
        title: 'Crear Contenido Rápidamente',
        content: 'Para crear contenido: ve a Escritor IA, selecciona el tipo de contenido, describe qué necesitas, y haz clic en generar. En segundos tendrás contenido profesional listo para usar.',
        duration: 30,
        page: '/escritor-ia'
      },
      {
        id: 'quick-email-creation',
        title: 'Emails Rápidos',
        content: 'Para emails efectivos: usa Correos IA, elige el tipo de email, define tu audiencia y objetivo, y genera mensajes persuasivos con líneas de asunto optimizadas.',
        duration: 25,
        page: '/correos-ia'
      },
      {
        id: 'quick-templates',
        title: 'Usar Plantillas',
        content: 'Los Prompts te ahorran tiempo. Crea plantillas para contenido que generas frecuentemente, úsalas como punto de partida, y personalízalas según cada proyecto.',
        duration: 25,
        page: '/prompts'
      },
      {
        id: 'quick-help',
        title: 'Obtener Ayuda',
        content: 'Recuerda: presiona F1 en cualquier página para ayuda contextual, usa el botón flotante de voz para explicaciones rápidas, y explora cada sección para descubrir todas las funcionalidades.',
        duration: 20
      },
      {
        id: 'quick-conclusion',
        title: 'Listo para Comenzar',
        content: '¡Perfecto! Ya conoces lo básico. Comienza creando tu primer contenido y descubre el poder de la inteligencia artificial para tu trabajo creativo.',
        duration: 15
      }
    ]
  },

  advanced: {
    id: 'advanced',
    title: 'Funcionalidades Avanzadas',
    description: 'Aprende técnicas avanzadas para maximizar tu productividad',
    totalDuration: 420, // 7 minutos
    steps: [
      {
        id: 'advanced-intro',
        title: 'Funcionalidades Avanzadas',
        content: 'En este tutorial avanzado aprenderás técnicas profesionales para maximizar tu productividad y obtener resultados excepcionales con Red Creativa Pro.',
        duration: 15
      },
      {
        id: 'advanced-prompting',
        title: 'Técnicas Avanzadas de Prompting',
        content: 'Para prompts efectivos: usa estructura clara con contexto, audiencia, tarea y formato deseado. Incluye ejemplos específicos, define el tono exacto, y especifica la longitud. Los prompts detallados generan mejores resultados.',
        duration: 45
      },
      {
        id: 'advanced-parameters',
        title: 'Optimización de Parámetros',
        content: 'Ajusta la creatividad según el tipo de contenido: alta para contenido creativo, media para marketing, baja para contenido técnico. Experimenta con diferentes combinaciones de tono, estilo y longitud para encontrar tu configuración ideal.',
        duration: 40
      },
      {
        id: 'advanced-workflows',
        title: 'Flujos de Trabajo Eficientes',
        content: 'Crea flujos optimizados: usa plantillas para contenido recurrente, combina herramientas para proyectos complejos, aprovecha el historial para iterar sobre contenido exitoso, y organiza tus prompts por categorías y proyectos.',
        duration: 50
      },
      {
        id: 'advanced-integration',
        title: 'Integración con Otras Herramientas',
        content: 'Maximiza la eficiencia integrando con tu flujo de trabajo existente: exporta contenido a tus herramientas favoritas, usa las opciones de formato para diferentes plataformas, y aprovecha las integraciones de email marketing.',
        duration: 35
      },
      {
        id: 'advanced-analytics',
        title: 'Análisis y Optimización',
        content: 'Usa las estadísticas para mejorar: revisa qué tipos de contenido generas más, identifica patrones en tu uso de tokens, analiza la efectividad de diferentes prompts, y ajusta tu estrategia basándote en los datos.',
        duration: 40
      },
      {
        id: 'advanced-collaboration',
        title: 'Colaboración en Equipo',
        content: 'Para equipos: comparte prompts exitosos, establece estándares de marca consistentes, usa etiquetas para organizar proyectos colaborativos, y aprovecha las opciones de exportación para workflows de revisión.',
        duration: 35
      },
      {
        id: 'advanced-troubleshooting',
        title: 'Solución de Problemas',
        content: 'Si los resultados no son los esperados: revisa la especificidad de tus instrucciones, ajusta los parámetros de creatividad, prueba diferentes enfoques de prompting, y usa ejemplos concretos para guiar a la IA.',
        duration: 30
      },
      {
        id: 'advanced-conclusion',
        title: 'Maestría Alcanzada',
        content: 'Ahora dominas las técnicas avanzadas de Red Creativa Pro. Continúa experimentando, refinando tus prompts, y explorando nuevas combinaciones para mantener tu ventaja creativa.',
        duration: 20
      }
    ]
  }
};

// Función helper para obtener la duración total de un tutorial
export function getTutorialDuration(tutorialId: string): number {
  const tutorial = TUTORIAL_SCRIPTS[tutorialId];
  return tutorial ? tutorial.totalDuration : 0;
}

// Función helper para obtener un paso específico
export function getTutorialStep(tutorialId: string, stepId: string): TutorialStep | undefined {
  const tutorial = TUTORIAL_SCRIPTS[tutorialId];
  return tutorial?.steps.find(step => step.id === stepId);
}

// Función helper para obtener todos los IDs de tutorial disponibles
export function getAvailableTutorials(): string[] {
  return Object.keys(TUTORIAL_SCRIPTS);
}