import { WithContext, Organization, SoftwareApplication, WebSite } from 'schema-dts'

export function SchemaRegistry({ baseUrl = 'https://redcreativa.pro' }: { baseUrl?: string }) {
    const organizationSchema: WithContext<Organization> = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Red Creativa Pro',
        url: baseUrl,
        logo: `${baseUrl}/icon.png`,
        description: 'Plataforma de escritura con IA para periodistas y creadores de contenido en español',
        sameAs: [
            'https://github.com/selamu0220/redcreativapro2',
            'https://instagram.com/sela_gb',
            'https://es.trustpilot.com/review/redcreativa.pro',
            'https://twitter.com/redcreativapro',
            'https://linkedin.com/company/redcreativapro'
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['Spanish', 'English'],
            email: 'contacto@redcreativa.pro'
        },
        founder: {
            '@type': 'Person',
            name: 'Selamu'
        },
        foundingDate: '2024'
    }

    const appSchema: WithContext<SoftwareApplication> = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Red Creativa Pro',
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'Web Application',
        description: 'Herramienta de escritura con IA que aprende tu estilo. SEO automático, corrección de textos y generación de contenido optimizado para Google.',
        url: baseUrl,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
            priceValidUntil: '2027-12-31',
            availability: 'https://schema.org/InStock',
            description: 'Plan gratuito disponible'
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '127',
            bestRating: '5',
            worstRating: '1'
        },
        featureList: [
            'Escritor con IA',
            'SEO automático',
            'Corrector de textos',
            'Generador de contenido',
            'Control por voz',
            'Email marketing con IA'
        ],
        screenshot: `${baseUrl}/og-default.jpg`,
        author: {
            '@type': 'Organization',
            name: 'Red Creativa Pro'
        }
    }

    const websiteSchema: WithContext<WebSite> = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Red Creativa Pro',
        url: baseUrl,
        description: 'Plataforma de escritura con IA para periodistas y creadores de contenido en español',
        inLanguage: ['es', 'en', 'fr', 'de', 'it', 'pt']
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
        </>
    )
}
