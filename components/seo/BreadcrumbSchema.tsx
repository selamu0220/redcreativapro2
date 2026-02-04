/**
 * Breadcrumb Schema Component
 * 
 * Generates structured data for breadcrumb navigation
 * to improve site hierarchy visibility in Google Search results
 */

interface BreadcrumbItem {
    name: string
    url: string
}

interface BreadcrumbSchemaProps {
    items: BreadcrumbItem[]
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@id': item.url,
                name: item.name
            }
        }))
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

/**
 * Helper to generate breadcrumbs from URL path
 */
export function generateBreadcrumbsFromPath(
    path: string,
    baseUrl: string = 'https://redcreativa.pro',
    labels?: Record<string, string>
): BreadcrumbItem[] {
    const defaultLabels: Record<string, string> = {
        '': 'Inicio',
        'blog': 'Blog',
        'planes': 'Planes y Precios',
        'escritor-ia': 'Escritor IA',
        'corrector-textos-ia': 'Corrector de Textos',
        'correos-ia': 'Generador de Emails',
        'studio-ia': 'Studio IA',
        'prompts': 'Biblioteca de Prompts',
        'plantillas': 'Plantillas',
        'glosario': 'Glosario',
        'contactos': 'Contacto',
        'suscripcion': 'Suscripción',
        ...labels
    }

    const segments = path.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
        { name: 'Inicio', url: baseUrl }
    ]

    let currentPath = ''
    for (const segment of segments) {
        currentPath += `/${segment}`
        breadcrumbs.push({
            name: defaultLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
            url: `${baseUrl}${currentPath}`
        })
    }

    return breadcrumbs
}
