
import React from 'react'
import { notFound } from 'next/navigation'
import { CountryCode } from '@/app/lib/legal-compliance'

interface TermsOfServicePageProps {
  params: Promise<{
    country: string;
  }>;
}

const SUPPORTED_COUNTRIES: CountryCode[] = ['BR', 'AR', 'MX', 'CO', 'CL', 'PE', 'EC', 'US', 'ES']

export default async function TermsOfServicePage({ params }: TermsOfServicePageProps) {
  const { country } = await params;
  
  if (!country) {
    notFound()
  }

  const countryCode = country.toUpperCase() as CountryCode

  // Validate country code
  if (!SUPPORTED_COUNTRIES.includes(countryCode)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-fade-in-up">
          <CountrySpecificTerms country={countryCode} />
        </div>
      </div>
    </div>
  )
}

interface CountrySpecificTermsProps {
  country: CountryCode
}

function CountrySpecificTerms({ country }: CountrySpecificTermsProps) {
  const termsConfig = getTermsConfig(country)

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <nav className="text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground transition-colors">
          Inicio
        </a>
        <span className="mx-2">/</span>
        <span>Términos de Servicio - {getCountryName(country)}</span>
      </nav>

      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          {termsConfig.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: {new Date().toLocaleDateString(termsConfig.locale)}
        </p>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Jurisdicción:</strong> {termsConfig.jurisdiction}
          </p>
        </div>
      </div>

      {/* Terms content */}
      <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
        {termsConfig.sections.map((section, index) => (
          <section key={index} className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.content.map((paragraph, pIndex) => (
                <p key={pIndex}>{paragraph}</p>
              ))}
              {section.list && (
                <ul className="list-disc pl-6 space-y-2">
                  {section.list.map((item, lIndex) => (
                    <li key={lIndex}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Country-specific legal information */}
      <CountryLegalInfo country={country} />
    </div>
  )
}

interface CountryLegalInfoProps {
  country: CountryCode
}

function CountryLegalInfo({ country }: CountryLegalInfoProps) {
  const legalInfo = {
    BR: {
      consumerRights: 'Código de Defesa do Consumidor (CDC)',
      ecommerceRegulation: 'Marco Civil da Internet',
      disputeResolution: 'Procon e Poder Judiciário Brasileiro',
      contactInfo: 'legal.br@redcreativapro.com'
    },
    MX: {
      consumerRights: 'Ley Federal de Protección al Consumidor',
      ecommerceRegulation: 'Ley de Comercio Electrónico',
      disputeResolution: 'PROFECO y tribunales mexicanos',
      contactInfo: 'legal.mx@redcreativapro.com'
    },
    AR: {
      consumerRights: 'Ley de Defensa del Consumidor',
      ecommerceRegulation: 'Ley de Comercio Electrónico',
      disputeResolution: 'COPREC y tribunales argentinos',
      contactInfo: 'legal.ar@redcreativapro.com'
    },
    CO: {
      consumerRights: 'Estatuto del Consumidor',
      ecommerceRegulation: 'Ley de Comercio Electrónico',
      disputeResolution: 'SIC y tribunales colombianos',
      contactInfo: 'legal.co@redcreativapro.com'
    }
  }

  const info = legalInfo[country as keyof typeof legalInfo]

  if (!info) {
    return (
      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Información Legal
        </h3>
        <p className="text-muted-foreground">
          Para consultas legales: legal@redcreativapro.com
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Marco Legal Aplicable
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <strong className="text-foreground">Derechos del Consumidor:</strong>
            <p className="text-muted-foreground">{info.consumerRights}</p>
          </div>
          <div>
            <strong className="text-foreground">Comercio Electrónico:</strong>
            <p className="text-muted-foreground">{info.ecommerceRegulation}</p>
          </div>
          <div>
            <strong className="text-foreground">Resolución de Disputas:</strong>
            <p className="text-muted-foreground">{info.disputeResolution}</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Contacto Legal
        </h3>
        <p className="text-muted-foreground mb-2">
          Para consultas legales específicas de su jurisdicción:
        </p>
        <p className="text-foreground font-medium">
          📧 {info.contactInfo}
        </p>
      </div>
    </div>
  )
}

function getTermsConfig(country: CountryCode) {
  const baseTerms = {
    title: 'Términos de Servicio',
    locale: 'es-ES',
    jurisdiction: 'Legislación aplicable',
    sections: [
      {
        title: '1. Aceptación de los Términos',
        content: [
          'Al acceder y utilizar Red Creativa Pro, usted acepta estar sujeto a estos Términos de Servicio y todas las leyes y regulaciones aplicables.',
          'Si no está de acuerdo con alguno de estos términos, no debe utilizar este servicio.'
        ]
      },
      {
        title: '2. Descripción del Servicio',
        content: [
          'Red Creativa Pro es una plataforma de inteligencia artificial que proporciona herramientas para la generación de contenido, redacción de emails y chat con prompts personalizados.'
        ]
      },
      {
        title: '3. Registro y Cuenta de Usuario',
        content: [
          'Para utilizar ciertos servicios, debe crear una cuenta proporcionando información precisa y completa.',
          'Usted es responsable de mantener la confidencialidad de su cuenta y contraseña.'
        ]
      },
      {
        title: '4. Uso Aceptable',
        content: [
          'Usted se compromete a utilizar el servicio únicamente para fines legales y de acuerdo con estos términos.'
        ],
        list: [
          'Utilizar el servicio para actividades ilegales o no autorizadas',
          'Intentar acceder a sistemas o datos no autorizados',
          'Interferir con el funcionamiento del servicio',
          'Transmitir contenido ofensivo, difamatorio o que infrinja derechos de terceros'
        ]
      },
      {
        title: '5. Propiedad Intelectual',
        content: [
          'El contenido generado por usted utilizando nuestras herramientas de IA le pertenece.',
          'Sin embargo, nos reservamos el derecho de utilizar datos agregados y anonimizados para mejorar nuestros servicios.'
        ]
      },
      {
        title: '6. Limitación de Responsabilidad',
        content: [
          'Red Creativa Pro no será responsable de daños directos, indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de usar el servicio.'
        ]
      }
    ]
  }

  // Country-specific customizations
  switch (country) {
    case 'BR':
      return {
        ...baseTerms,
        title: 'Termos de Serviço',
        locale: 'pt-BR',
        jurisdiction: 'Legislação brasileira e foro da comarca de São Paulo',
        sections: [
          ...baseTerms.sections,
          {
            title: '7. Direitos do Consumidor',
            content: [
              'Este serviço está sujeito ao Código de Defesa do Consumidor brasileiro.',
              'Você tem direito a arrependimento em até 7 dias para compras online.',
              'Em caso de defeito no servicio, você tem direito a reparo, substituição ou reembolso.'
            ]
          },
          {
            title: '8. Resolução de Conflitos',
            content: [
              'Tentaremos resolver qualquer disputa através de negociação direta.',
              'Caso não seja possível, a disputa será resolvida pelos tribunais brasileiros.'
            ]
          }
        ]
      }

    case 'MX':
      return {
        ...baseTerms,
        jurisdiction: 'Legislación mexicana y tribunales de la Ciudad de México',
        sections: [
          ...baseTerms.sections,
          {
            title: '7. Derechos del Consumidor',
            content: [
              'Este servicio está sujeto a la Ley Federal de Protección al Consumidor.',
              'Usted tiene derecho a la devolución en los términos establecidos por PROFECO.',
              'Puede presentar quejas ante PROFECO en caso de problemas con el servicio.'
            ]
          },
          {
            title: '8. Facturación',
            content: [
              'Todos los pagos incluyen IVA según la legislación mexicana.',
              'Se emitirán facturas electrónicas conforme a los requerimientos del SAT.'
            ]
          }
        ]
      }

    case 'AR':
      return {
        ...baseTerms,
        jurisdiction: 'Legislación argentina y tribunales de la Ciudad Autónoma de Buenos Aires',
        sections: [
          ...baseTerms.sections,
          {
            title: '7. Derechos del Consumidor',
            content: [
              'Este servicio está sujeto a la Ley de Defensa del Consumidor argentina.',
              'Usted tiene derecho a la resolución del contrato en caso de incumplimiento.',
              'Puede recurrir a COPREC para la resolución alternativa de conflictos.'
            ]
          },
          {
            title: '8. Moneda y Pagos',
            content: [
              'Los precios se expresan en pesos argentinos.',
              'Los pagos están sujetos a las regulaciones cambiarias vigentes.'
            ]
          }
        ]
      }

    case 'CO':
      return {
        ...baseTerms,
        jurisdiction: 'Legislación colombiana y tribunales de Bogotá D.C.',
        sections: [
          ...baseTerms.sections,
          {
            title: '7. Derechos del Consumidor',
            content: [
              'Este servicio está sujeto al Estatuto del Consumidor colombiano.',
              'Usted tiene derecho a la garantía y post-venta según la ley.',
              'Puede presentar quejas ante la SIC en caso de problemas.'
            ]
          },
          {
            title: '8. Impuestos',
            content: [
              'Los precios incluyen IVA según la legislación colombiana.',
              'Se aplicarán las retenciones fiscales que correspondan por ley.'
            ]
          }
        ]
      }

    default:
      return {
        ...baseTerms,
        sections: [
          ...baseTerms.sections,
          {
            title: '7. Modificaciones',
            content: [
              'Nos reservamos el derecho de modificar estos términos en cualquier momento.',
              'Las modificaciones entrarán en vigor inmediatamente después de su publicación.'
            ]
          },
          {
            title: '8. Contacto',
            content: [
              'Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos en: legal@redcreativapro.com'
            ]
          }
        ]
      }
  }
}

function getCountryName(country: CountryCode): string {
  const countryNames = {
    BR: 'Brasil',
    MX: 'México',
    AR: 'Argentina',
    CO: 'Colombia',
    CL: 'Chile',
    PE: 'Perú',
    EC: 'Ecuador',
    US: 'Estados Unidos',
    ES: 'España'
  }

  return countryNames[country] || country
}

// Generate static params for supported countries
export async function generateStaticParams() {
  return SUPPORTED_COUNTRIES.map((country) => ({
    country: country.toLowerCase(),
  }))
}

// Generate metadata for each country
export async function generateMetadata({ params }: TermsOfServicePageProps) {
  const { country } = await params;
  
  // Handle undefined country during build
  if (!country) {
    return {
      title: 'Términos de Servicio',
      description: 'Términos y condiciones de uso',
    }
  }

  const countryCode = country.toUpperCase() as CountryCode
  const countryName = getCountryName(countryCode)

  return {
    title: `Términos de Servicio - ${countryName}`,
    description: `Términos y condiciones de uso específicos para ${countryName}. Cumple con las regulaciones locales de comercio electrónico y protección al consumidor.`,
    robots: 'index, follow',
  }
}
