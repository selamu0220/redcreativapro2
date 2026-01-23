import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BLUEPRINTS = [
    // Content Automation
    {
        id: 'bp_content_1',
        title: 'WordPress Auto-Publisher Pro',
        description: 'Publica artículos optimizados directamente en WordPress. Gestiona imágenes destacadas, categorías, tags y estado (Borrador/Publicado).',
        tool: 'make',
        category: 'content',
        difficulty: 'Intermedio',
        tags: ['WordPress', 'SEO', 'Image Optimization'],
        timeSaved: '2h / artículo',
        downloadUrl: '#',
        tutorialUrl: '#'
    },
    {
        id: 'bp_content_2',
        title: 'Social Media Multi-Repurposer',
        description: 'Transforma un nuevo post del blog en: Hilo de Twitter, Post de LinkedIn (Carrusel PDF) y Caption de Instagram.',
        tool: 'make',
        category: 'content',
        difficulty: 'Avanzado',
        tags: ['GPT-4', 'LinkedIn', 'Twitter/X'],
        timeSaved: '4h / semana',
        downloadUrl: '#',
        tutorialUrl: '#'
    },
    // Lead Generation
    {
        id: 'bp_lead_1',
        title: 'Inbound Lead Enricher',
        description: 'Cuando entra un lead (Typeform/Webflow), busca su perfil en LinkedIn, analiza su empresa y lo puntúa antes de enviarlo al CRM.',
        tool: 'make',
        category: 'lead-gen',
        difficulty: 'Intermedio',
        tags: ['Clearbit', 'LinkedIn', 'CRM'],
        timeSaved: '15min / lead',
        downloadUrl: '#',
        tutorialUrl: '#'
    },
    {
        id: 'bp_lead_2',
        title: 'Instant Email Follow-up AI',
        description: 'Analiza la consulta del formulario de contacto y redacta una respuesta personalizada en <2 min usando la base de conocimiento de la empresa.',
        tool: 'make',
        category: 'lead-gen',
        difficulty: 'Avanzado',
        tags: ['OpenAI', 'Gmail', 'Context'],
        timeSaved: '10min / email',
        downloadUrl: '#',
        tutorialUrl: '#'
    },
    // Operations & SEO
    {
        id: 'bp_ops_1',
        title: 'GSC Keyword Rank Tracker',
        description: 'Monitoriza cambios bruscos en posiciones (Google Search Console) y alerta en Slack. Genera informes semanales automáticos.',
        tool: 'make',
        category: 'operations',
        difficulty: 'Principante',
        tags: ['GSC', 'Slack', 'Reporting'],
        timeSaved: '1h / día',
        downloadUrl: '#',
        tutorialUrl: '#'
    },
    {
        id: 'bp_ops_2',
        title: 'Client Onboarding Automator',
        description: 'Crea carpetas en Drive, canal de Slack, proyecto en Asana y envía contrato HelloSign al cerrar un nuevo cliente.',
        tool: 'make',
        category: 'operations',
        difficulty: 'Intermedio',
        tags: ['Drive', 'Slack', 'Contract'],
        timeSaved: '3h / cliente',
        downloadUrl: '#',
        tutorialUrl: '#'
    }
];

export async function GET() {
    // In the future, fetch from Appwrite Databases
    return NextResponse.json(BLUEPRINTS);
}
