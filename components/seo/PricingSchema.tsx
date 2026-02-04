/**
 * Pricing Schema Component
 * 
 * Generates structured data for Product and AggregateRating schemas
 * to improve SEO and rich results in Google Search
 */

import { Product, AggregateRating, Offer, WithContext } from 'schema-dml'

interface PricingSchemaProps {
    baseUrl?: string
}

export function PricingSchema({ baseUrl = 'https://redcreativa.pro' }: PricingSchemaProps) {
    const productSchema: WithContext<Product> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Red Creativa Pro',
        description: 'Herramienta de escritura con IA que aprende tu estilo. SEO automático, modo stealth para indetectabilidad, y generación de contenido optimizado para Google.',
        image: `${baseUrl}/og-default.jpg`,
        brand: {
            '@type': 'Brand',
            name: 'Red Creativa Pro'
        },
        offers: [
            {
                '@type': 'Offer',
                name: 'Plan Gratuito',
                price: '0',
                priceCurrency: 'EUR',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                url: `${baseUrl}/planes`,
                description: '5 artículos al mes, corrección básica, exportación de texto'
            } as Offer,
            {
                '@type': 'Offer',
                name: 'Plan Pro Mensual',
                price: '1',
                priceCurrency: 'EUR',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                url: `${baseUrl}/planes`,
                description: 'Artículos ilimitados, modo stealth, SEO avanzado, soporte prioritario'
            } as Offer,
            {
                '@type': 'Offer',
                name: 'Plan Pro Anual',
                price: '10',
                priceCurrency: 'EUR',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                url: `${baseUrl}/planes`,
                description: 'Artículos ilimitados, modo stealth, SEO avanzado - 2 meses gratis'
            } as Offer
        ],
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '127',
            bestRating: '5',
            worstRating: '1'
        } as AggregateRating,
        review: [
            {
                '@type': 'Review',
                author: {
                    '@type': 'Person',
                    name: 'María García'
                },
                datePublished: '2025-12-15',
                reviewBody: 'Increíble herramienta para periodistas. Me ahorra horas de trabajo cada semana.',
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue: '5',
                    bestRating: '5'
                }
            },
            {
                '@type': 'Review',
                author: {
                    '@type': 'Person',
                    name: 'Carlos Rodríguez'
                },
                datePublished: '2025-11-20',
                reviewBody: 'El modo stealth es genial. Mis textos pasan desapercibidos como si los hubiera escrito yo mismo.',
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue: '5',
                    bestRating: '5'
                }
            }
        ]
    }

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: '¿Puedo cancelar mi suscripción en cualquier momento?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de control. No hay contratos ni compromisos de permanencia.'
                }
            },
            {
                '@type': 'Question',
                name: '¿Qué métodos de pago aceptan?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express) a través de Stripe, nuestra pasarela de pago segura.'
                }
            },
            {
                '@type': 'Question',
                name: '¿Qué incluye el plan gratuito?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'El plan gratuito incluye 5 artículos al mes, corrección básica de textos, y exportación en formato de texto plano. Es perfecto para probar la herramienta.'
                }
            },
            {
                '@type': 'Question',
                name: '¿Cómo funciona el modo stealth?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'El modo stealth humaniza tu texto para que pase desapercibido ante detectores de IA, manteniendo tu voz y estilo personal.'
                }
            }
        ]
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    )
}
