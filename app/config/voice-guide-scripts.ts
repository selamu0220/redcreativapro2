// Scripts de voz contextuales para el sistema de guía de voz
// Cada página tiene explicaciones detalladas y específicas

export interface VoiceScript {
  title: string;
  intro: string;
  sections: string[];
  quickHelp: string;
  tips?: string[];
}

export const VOICE_GUIDE_SCRIPTS: Record<string, VoiceScript> = {
  // Página Principal
  '/': {
    title: 'Página Principal - Red Creativa Pro',
    intro: 'Bienvenido a Red Creativa Pro, tu plataforma integral de inteligencia artificial para crear contenido profesional. Desde aquí puedes acceder a todas nuestras herramientas especializadas.',
    quickHelp: 'Usa el menú superior para navegar entre herramientas, o presiona F1 en cualquier momento para obtener ayuda.',
    sections: [
      'El menú de navegación superior te da acceso directo a Dashboard, Escritor IA, Correos IA, Prompts y Configuración.',
      'La sección de bienvenida muestra un resumen de las capacidades de la plataforma.',
      'Los accesos rápidos te permiten ir directamente a las herramientas más populares.',
      'El área de estadísticas muestra tu uso actual de tokens y créditos disponibles.',
      'Las notificaciones te mantienen informado sobre actualizaciones y límites de uso.'
    ],
    tips: [
      'Comienza explorando el Dashboard para familiarizarte con la interfaz.',
      'Cada herramienta tiene su propia guía de voz contextual.',
      'Usa Ctrl+H para reproducir la introducción de cualquier página.'
    ]
  },

  // Dashboard
  '/dashboard': {
    title: 'Dashboard - Panel de Control',
    intro: 'Estás en el Dashboard, tu centro de control principal. Aquí puedes monitorear tu actividad, acceder rápidamente a herramientas y gestionar tus proyectos.',
    quickHelp: 'El dashboard te ofrece una vista general de tu cuenta y acceso rápido a todas las funcionalidades.',
    sections: [
      'El panel de estadísticas muestra tu consumo de tokens, créditos restantes y límites de tu plan actual.',
      'Los accesos rápidos te llevan directamente a Escritor IA, Correos IA y otras herramientas principales.',
      'El historial reciente lista tus últimas generaciones y proyectos para acceso rápido.',
      'Las métricas de uso te ayudan a entender qué herramientas utilizas más frecuentemente.',
      'El área de notificaciones te informa sobre actualizaciones, límites alcanzados y nuevas funcionalidades.'
    ],
    tips: [
      'Revisa regularmente tus estadísticas para optimizar el uso de créditos.',
      'Usa los accesos rápidos para ahorrar tiempo en navegación.',
      'El historial te permite retomar proyectos anteriores fácilmente.'
    ]
  },

  // Escritor IA
  '/escritor-ia': {
    title: 'Escritor IA - Generación de Contenido',
    intro: 'Bienvenido al Escritor IA, tu asistente inteligente para crear contenido escrito de alta calidad. Esta herramienta puede generar artículos, blogs, copy publicitario y mucho más.',
    quickHelp: 'Selecciona un tipo de contenido, proporciona instrucciones claras y deja que la IA genere contenido profesional.',
    sections: [
      'El selector de tipo de contenido te permite elegir entre artículos, blogs, copy publicitario, descripciones de productos y más.',
      'El área de instrucciones es donde describes qué quieres que escriba la IA - sé específico para mejores resultados.',
      'Los parámetros avanzados te permiten ajustar el tono, estilo, longitud y nivel de creatividad del contenido.',
      'El botón de generar inicia el proceso de creación - la IA analizará tus instrucciones y creará contenido personalizado.',
      'El editor de resultados te permite revisar, editar y refinar el contenido generado antes de guardarlo o exportarlo.',
      'Las opciones de exportación incluyen copiar al portapapeles, descargar como documento o guardar en tu biblioteca de contenido.'
    ],
    tips: [
      'Proporciona contexto específico sobre tu audiencia objetivo para mejores resultados.',
      'Usa palabras clave relevantes en tus instrucciones para contenido SEO-optimizado.',
      'Experimenta con diferentes tonos y estilos para encontrar tu voz de marca.',
      'Guarda los prompts exitosos como plantillas para uso futuro.'
    ]
  },



  // Gestión de Prompts
  '/prompts': {
    title: 'Gestión de Prompts - Plantillas Inteligentes',
    intro: 'Esta es tu biblioteca de prompts, donde puedes crear, organizar y reutilizar plantillas de instrucciones para obtener resultados consistentes de la IA.',
    quickHelp: 'Los prompts son plantillas reutilizables que te ayudan a obtener resultados consistentes y de alta calidad.',
    sections: [
      'El catálogo de prompts muestra todas tus plantillas organizadas por categorías como marketing, ventas, educación, etc.',
      'El editor de prompts te permite crear nuevas plantillas con variables personalizables y parámetros específicos.',
      'El sistema de etiquetas te ayuda a organizar y encontrar rápidamente los prompts que necesitas.',
      'La función de prueba te permite validar tus prompts antes de guardarlos en tu biblioteca.',
      'Las opciones de compartir te permiten colaborar con tu equipo o contribuir a la comunidad.',
      'La importación y exportación facilita el respaldo y transferencia de tus colecciones de prompts.'
    ],
    tips: [
      'Crea prompts específicos para diferentes tipos de contenido que generas frecuentemente.',
      'Usa variables en tus prompts para hacerlos más flexibles y reutilizables.',
      'Organiza tus prompts con etiquetas descriptivas para encontrarlos fácilmente.',
      'Prueba y refina tus prompts regularmente para mejorar su efectividad.'
    ]
  },

  // Configuración
  '/ajustes': {
    title: 'Configuración - Personalización',
    intro: 'Estás en la sección de configuración donde puedes personalizar tu experiencia, gestionar tu cuenta y ajustar las preferencias de la IA.',
    quickHelp: 'Aquí puedes personalizar todos los aspectos de tu experiencia en Red Creativa Pro.',
    sections: [
      'Las preferencias de cuenta te permiten actualizar tu información personal, contraseña y configuración de seguridad.',
      'La configuración de IA incluye parámetros por defecto para creatividad, longitud y estilo de las generaciones.',
      'Las opciones de idioma y región personalizan la interfaz y el contenido generado según tu ubicación.',
      'La gestión de suscripción te permite ver tu plan actual, uso de créditos y opciones de actualización.',
      'Las configuraciones de notificaciones controlan qué alertas recibes y cómo las recibes.',
      'Las preferencias de interfaz te permiten personalizar el tema, diseño y accesibilidad de la plataforma.'
    ],
    tips: [
      'Ajusta los parámetros por defecto de IA según tu estilo de trabajo preferido.',
      'Configura notificaciones para mantenerte informado sin ser interrumpido.',
      'Revisa regularmente tu uso de créditos para optimizar tu plan de suscripción.',
      'Personaliza la interfaz para mejorar tu productividad y comodidad.'
    ]
  },

  // Plantillas
  '/plantillas': {
    title: 'Plantillas - Contenido Prediseñado',
    intro: 'Explora nuestra biblioteca de plantillas prediseñadas para acelerar tu proceso creativo. Encuentra plantillas para marketing, ventas, educación y más.',
    quickHelp: 'Las plantillas te dan un punto de partida sólido para diferentes tipos de contenido.',
    sections: [
      'El catálogo de plantillas está organizado por industria y tipo de contenido para facilitar la búsqueda.',
      'La vista previa te permite examinar las plantillas antes de usarlas en tus proyectos.',
      'Las opciones de personalización te permiten adaptar las plantillas a tu marca y necesidades específicas.',
      'El sistema de favoritos te ayuda a guardar las plantillas que más utilizas para acceso rápido.',
      'La función de crear plantilla te permite convertir tu contenido exitoso en plantillas reutilizables.',
      'Las opciones de compartir te permiten contribuir plantillas a la comunidad o colaborar con tu equipo.'
    ],
    tips: [
      'Usa plantillas como punto de partida y personalízalas según tu marca.',
      'Guarda como favoritas las plantillas que funcionan bien para tu negocio.',
      'Crea tus propias plantillas basadas en contenido que ha tenido éxito.',
      'Explora plantillas de diferentes industrias para inspirarte.'
    ]
  },



  // Historial
  '/historial': {
    title: 'Historial de Generaciones',
    intro: 'Revisa todo tu historial de contenido generado, reutiliza proyectos anteriores y analiza tu productividad.',
    quickHelp: 'El historial te permite acceder a todo tu contenido anterior y analizar patrones de uso.',
    sections: [
      'La línea de tiempo muestra cronológicamente todas tus generaciones con filtros por fecha y tipo.',
      'Las opciones de búsqueda te permiten encontrar rápidamente contenido específico por palabras clave.',
      'Los filtros avanzados te ayudan a segmentar por herramienta utilizada, tipo de contenido o proyecto.',
      'Las opciones de reutilización te permiten usar contenido anterior como base para nuevas generaciones.',
      'Las estadísticas de productividad muestran tendencias en tu uso de la plataforma.'
    ]
  },

  // Estadísticas
  '/estadisticas': {
    title: 'Estadísticas y Analytics',
    intro: 'Analiza tu uso de la plataforma, rendimiento del contenido y optimiza tu estrategia de contenido.',
    quickHelp: 'Las estadísticas te ayudan a entender y optimizar tu uso de Red Creativa Pro.',
    sections: [
      'El dashboard de métricas muestra tu uso de tokens, herramientas más utilizadas y tendencias temporales.',
      'Los análisis de contenido revelan qué tipos de generaciones son más exitosas para ti.',
      'Las métricas de productividad te ayudan a identificar patrones y optimizar tu flujo de trabajo.',
      'Los reportes personalizables te permiten crear vistas específicas según tus necesidades.',
      'Las comparativas temporales muestran tu evolución y crecimiento en el uso de la plataforma.'
    ]
  },

  // Suscripción
  '/suscripcion': {
    title: 'Gestión de Suscripción',
    intro: 'Administra tu plan de suscripción, revisa tu uso actual y explora opciones de actualización.',
    quickHelp: 'Gestiona todos los aspectos de tu suscripción y facturación desde aquí.',
    sections: [
      'El resumen del plan muestra tu suscripción actual, créditos disponibles y fecha de renovación.',
      'El historial de uso detalla cómo has utilizado tus créditos durante el período actual.',
      'Las opciones de actualización te muestran planes superiores con más funcionalidades y créditos.',
      'La gestión de facturación te permite actualizar métodos de pago y descargar facturas.',
      'Las configuraciones de renovación te permiten controlar la renovación automática de tu suscripción.'
    ]
  }
};

// Scripts para tutoriales específicos
export const TUTORIAL_SCRIPTS = {
  onboarding: {
    title: 'Tutorial de Bienvenida',
    steps: [
      'Bienvenido a Red Creativa Pro. Te guiaré a través de las funcionalidades principales.',
      'Primero, exploremos el Dashboard donde puedes ver tu actividad y acceder a todas las herramientas.',
      'El Escritor IA es perfecto para crear artículos, blogs y contenido escrito de alta calidad.',
      'Correos IA te ayuda a generar emails profesionales y campañas de marketing efectivas.',
      'En Prompts puedes crear y gestionar plantillas reutilizables para obtener resultados consistentes.',
      'Las Plantillas te ofrecen puntos de partida prediseñados para acelerar tu trabajo.',
      'Finalmente, en Configuración puedes personalizar tu experiencia según tus preferencias.'
    ]
  },

  quickStart: {
    title: 'Inicio Rápido',
    steps: [
      'Para comenzar rápidamente, ve al Escritor IA desde el menú principal.',
      'Selecciona el tipo de contenido que necesitas crear.',
      'Describe claramente qué quieres que genere la IA.',
      'Ajusta los parámetros según tus necesidades específicas.',
      'Haz clic en generar y revisa el resultado.',
      'Edita y personaliza el contenido según sea necesario.',
      'Guarda o exporta tu contenido finalizado.'
    ]
  }
};

// Función para obtener el script de una página
export function getPageScript(pathname: string): VoiceScript {
  // Buscar coincidencia exacta
  if (VOICE_GUIDE_SCRIPTS[pathname]) {
    return VOICE_GUIDE_SCRIPTS[pathname];
  }

  // Buscar coincidencias parciales para rutas dinámicas
  const matchingPath = Object.keys(VOICE_GUIDE_SCRIPTS).find(path =>
    pathname.startsWith(path) && path !== '/'
  );

  if (matchingPath) {
    return VOICE_GUIDE_SCRIPTS[matchingPath];
  }

  // Script por defecto
  return {
    title: 'Red Creativa Pro',
    intro: 'Estás navegando en Red Creativa Pro. Usa las herramientas de IA para crear contenido profesional.',
    quickHelp: 'Presiona F1 para obtener ayuda contextual en cualquier momento.',
    sections: [
      'Explora el menú de navegación para acceder a diferentes herramientas.',
      'Cada sección tiene funcionalidades específicas para diferentes tipos de contenido.',
      'Usa la guía de voz para obtener ayuda contextual en cualquier momento.'
    ],
    tips: [
      'Cada página tiene su propia guía de voz contextual.',
      'Usa los atajos de teclado para navegar más eficientemente.',
      'Consulta la documentación para funcionalidades avanzadas.'
    ]
  };
}

// Función para obtener consejos rápidos
export function getQuickTips(pathname: string): string[] {
  const script = getPageScript(pathname);
  return script.tips || [];
}

// Función para obtener ayuda rápida
export function getQuickHelp(pathname: string): string {
  const script = getPageScript(pathname);
  return script.quickHelp;
}