
export interface MakeTemplate {
    id: string;
    title: string;
    description: string;
    category: 'SEO' | 'Social Media' | 'Productivity' | 'Research';
    complexity: 'Básico' | 'Intermedio' | 'Avanzado';
    tools: string[]; // e.g. ['OpenAI', 'WordPress', 'Gmail']
    videoUrl?: string; // YouTube embed ID or URL
    downloadUrl: string; // Link to blueprint JSON
    tags: string[];
}

export const makeTemplates: MakeTemplate[] = [
    {
        id: 'seo-auto-publish-wp',
        title: 'Publicación Automática SEO en WordPress',
        description: 'Genera artículos optimizados con IA (GPT-4/Claude) y publícalos directamente en tu WordPress como borrador o publicados, incluyendo imagen destacada (DALL-E 3).',
        category: 'SEO',
        complexity: 'Intermedio',
        tools: ['OpenAI', 'WordPress', 'Google Sheets'],
        videoUrl: 'https://www.youtube.com/embed/placeholder',
        downloadUrl: '#',
        tags: ['wordpress', 'blogging', 'auto-blogging']
    },
    {
        id: 'social-media-scheduler',
        title: 'Planificador y Publicador de Redes Sociales',
        description: 'Transforma una idea o enlace en 5 posts para Twitter, LinkedIn y Facebook. Programa la publicación automática en los mejores horarios.',
        category: 'Social Media',
        complexity: 'Básico',
        tools: ['OpenAI', 'Twitter API', 'LinkedIn API', 'Notion'],
        videoUrl: 'https://www.youtube.com/embed/placeholder',
        downloadUrl: '#',
        tags: ['social media', 'content repurposing']
    },
    {
        id: 'newsletter-automation',
        title: 'Curación y Envío de Newsletter Semanal',
        description: 'Recopila noticias de RSS feeds, resúmelas con IA y crea un borrador de newsletter listo para enviar en tu plataforma (Mailchimp/Brevo).',
        category: 'Productivity',
        complexity: 'Avanzado',
        tools: ['RSS', 'OpenAI', 'Mailchimp/Brevo'],
        videoUrl: 'https://www.youtube.com/embed/placeholder',
        downloadUrl: '#',
        tags: ['newsletter', 'email marketing']
    },
    {
        id: 'content-research-pipeline',
        title: 'Pipeline de Investigación de Contenidos',
        description: 'Analiza top 10 resultados de Google para una keyword, extrae puntos clave y genera un briefing detallado para redactores.',
        category: 'Research',
        complexity: 'Intermedio',
        tools: ['Google SERP API', 'OpenAI', 'Google Docs'],
        videoUrl: 'https://www.youtube.com/embed/placeholder',
        downloadUrl: '#',
        tags: ['research', 'briefing', 'seo']
    },
    {
        id: 'lead-magnet-delivery',
        title: 'Entrega Automática de Lead Magnets + Secuencia',
        description: 'Cuando alguien se registra en un form, envía el PDF y añade al usuario a una secuencia de nutrición personalizada según sus respuestas.',
        category: 'Productivity',
        complexity: 'Básico',
        tools: ['Typeform', 'Gmail', 'ActiveCampaign'],
        videoUrl: 'https://www.youtube.com/embed/placeholder',
        downloadUrl: '#',
        tags: ['leads', 'funnels']
    }
];
