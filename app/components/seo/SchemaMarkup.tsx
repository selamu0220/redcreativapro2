'use client'

import { useEffect } from 'react'

interface OrganizationSchema {
  name: string
  url: string
  logo?: string
  description?: string
  contactPoint?: {
    telephone?: string
    email?: string
    contactType: string
  }
  sameAs?: string[]
}

interface WebsiteSchema {
  name: string
  url: string
  description?: string
  potentialAction?: {
    target: string
    queryInput: string
  }
}

interface BreadcrumbSchema {
  items: Array<{
    name: string
    url: string
    position: number
  }>
}

interface ArticleSchema {
  headline: string
  description: string
  author: {
    name: string
    type?: string
  }
  datePublished: string
  dateModified?: string
  image?: string
  url: string
}

interface LocalBusinessSchema {
  name: string
  description: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  telephone?: string
  url: string
  openingHours?: string[]
  geo?: {
    latitude: number
    longitude: number
  }
}

interface SchemaMarkupProps {
  organization?: OrganizationSchema
  website?: WebsiteSchema
  breadcrumb?: BreadcrumbSchema
  article?: ArticleSchema
  localBusiness?: LocalBusinessSchema
  customSchema?: Record<string, any>
}

export default function SchemaMarkup({
  organization,
  website,
  breadcrumb,
  article,
  localBusiness,
  customSchema
}: SchemaMarkupProps) {
  
  useEffect(() => {
    const schemas: any[] = []

    // Organization Schema
    if (organization) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: organization.name,
        url: organization.url,
        logo: organization.logo,
        description: organization.description,
        contactPoint: organization.contactPoint ? {
          '@type': 'ContactPoint',
          telephone: organization.contactPoint.telephone,
          email: organization.contactPoint.email,
          contactType: organization.contactPoint.contactType
        } : undefined,
        sameAs: organization.sameAs
      })
    }

    // Website Schema
    if (website) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: website.name,
        url: website.url,
        description: website.description,
        potentialAction: website.potentialAction ? {
          '@type': 'SearchAction',
          target: website.potentialAction.target,
          'query-input': website.potentialAction.queryInput
        } : undefined
      })
    }

    // Breadcrumb Schema
    if (breadcrumb && breadcrumb.items.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumb.items.map(item => ({
          '@type': 'ListItem',
          position: item.position,
          name: item.name,
          item: item.url
        }))
      })
    }

    // Article Schema
    if (article) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.headline,
        description: article.description,
        author: {
          '@type': article.author.type || 'Person',
          name: article.author.name
        },
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        image: article.image,
        url: article.url
      })
    }

    // Local Business Schema
    if (localBusiness) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: localBusiness.name,
        description: localBusiness.description,
        address: {
          '@type': 'PostalAddress',
          streetAddress: localBusiness.address.streetAddress,
          addressLocality: localBusiness.address.addressLocality,
          addressRegion: localBusiness.address.addressRegion,
          postalCode: localBusiness.address.postalCode,
          addressCountry: localBusiness.address.addressCountry
        },
        telephone: localBusiness.telephone,
        url: localBusiness.url,
        openingHours: localBusiness.openingHours,
        geo: localBusiness.geo ? {
          '@type': 'GeoCoordinates',
          latitude: localBusiness.geo.latitude,
          longitude: localBusiness.geo.longitude
        } : undefined
      })
    }

    // Custom Schema
    if (customSchema) {
      schemas.push(customSchema)
    }

    // Remove existing schema scripts
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]')
    existingSchemas.forEach(script => {
      if (script.getAttribute('data-schema-component') === 'true') {
        script.remove()
      }
    })

    // Add new schema scripts
    schemas.forEach((schema, index) => {
      if (schema && Object.keys(schema).length > 0) {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.setAttribute('data-schema-component', 'true')
        script.textContent = JSON.stringify(schema, null, 0)
        document.head.appendChild(script)
      }
    })

    // Cleanup function
    return () => {
      const schemaScripts = document.querySelectorAll('script[data-schema-component="true"]')
      schemaScripts.forEach(script => script.remove())
    }
  }, [organization, website, breadcrumb, article, localBusiness, customSchema])

  return null // This component doesn't render anything visible
}

// Utility function to generate schema for SEO projects
export function generateSEOProjectSchema(project: {
  name: string
  domain: string
  description?: string
  target_keywords?: string[]
  business_type?: string
}) {
  const baseUrl = `https://${project.domain}`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: project.name,
    url: baseUrl,
    description: project.description || `${project.name} - Professional ${project.business_type || 'Business'} Services`,
    keywords: project.target_keywords?.join(', '),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
}

// Utility function to generate FAQ schema
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// Utility function to generate Service schema
export function generateServiceSchema(service: {
  name: string
  description: string
  provider: string
  areaServed?: string
  offers?: {
    price?: string
    priceCurrency?: string
    availability?: string
  }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: service.provider
    },
    areaServed: service.areaServed,
    offers: service.offers ? {
      '@type': 'Offer',
      price: service.offers.price,
      priceCurrency: service.offers.priceCurrency || 'USD',
      availability: service.offers.availability || 'https://schema.org/InStock'
    } : undefined
  }
}
