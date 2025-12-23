

import React from 'react'
import { notFound } from 'next/navigation'
import { PrivacyNotice } from '@/app/components/PrivacyNotice'
import { CountryCode } from '@/app/lib/legal-compliance'

interface PrivacyPolicyPageProps {
  params: Promise<{
    country: string
  }>
}

const SUPPORTED_COUNTRIES: CountryCode[] = ['BR', 'AR', 'MX', 'CO', 'CL', 'PE', 'EC', 'US', 'ES']

export default async function PrivacyPolicyPage({ params }: PrivacyPolicyPageProps) {
  const { country } = await params
  // Handle undefined country during build
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
          {/* Country-specific privacy notice */}
          <PrivacyNoticeWrapper country={countryCode} />
        </div>
      </div>
    </div>
  )
}

interface PrivacyNoticeWrapperProps {
  country: CountryCode
}

function PrivacyNoticeWrapper({ country }: PrivacyNoticeWrapperProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <nav className="text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground transition-colors">
          Inicio
        </a>
        <span className="mx-2">/</span>
        <span>Política de Privacidad - {getCountryName(country)}</span>
      </nav>

      {/* Privacy notice component */}
      <PrivacyNotice className="w-full" />

      {/* Additional country-specific information */}
      <CountrySpecificInfo country={country} />
    </div>
  )
}

interface CountrySpecificInfoProps {
  country: CountryCode
}

function CountrySpecificInfo({ country }: CountrySpecificInfoProps) {
  const countryInfo = {
    BR: {
      regulationName: 'LGPD - Lei Geral de Proteção de Dados',
      authority: 'ANPD - Autoridade Nacional de Proteção de Dados',
      authorityUrl: 'https://www.gov.br/anpd/',
      contactEmail: 'dpo@redcreativapro.com'
    },
    MX: {
      regulationName: 'LFPDPPP - Ley Federal de Protección de Datos Personales',
      authority: 'INAI - Instituto Nacional de Transparencia',
      authorityUrl: 'https://home.inai.org.mx/',
      contactEmail: 'datos.personales@redcreativapro.com'
    },
    AR: {
      regulationName: 'PDPA - Ley de Protección de Datos Personales',
      authority: 'AAIP - Agencia de Acceso a la Información Pública',
      authorityUrl: 'https://www.argentina.gob.ar/aaip',
      contactEmail: 'privacidad@redcreativapro.com'
    },
    CO: {
      regulationName: 'Ley 1581 de 2012 - Protección de Datos Personales',
      authority: 'SIC - Superintendencia de Industria y Comercio',
      authorityUrl: 'https://www.sic.gov.co/',
      contactEmail: 'habeasdata@redcreativapro.com'
    }
  }

  const info = countryInfo[country as keyof typeof countryInfo]

  if (!info) {
    return (
      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Información de Contacto
        </h3>
        <p className="text-muted-foreground">
          Para consultas sobre privacidad y protección de datos:
        </p>
        <p className="text-foreground font-medium mt-2">
          privacidad@redcreativapro.com
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Regulatory information */}
      <div className="p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Marco Regulatorio
        </h3>
        <p className="text-muted-foreground mb-2">
          Esta política de privacidad cumple con:
        </p>
        <p className="text-foreground font-medium mb-4">
          {info.regulationName}
        </p>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Autoridad de Control:</strong> {info.authority}
          </p>
          <p className="text-sm">
            <a
              href={info.authorityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Sitio web oficial
            </a>
          </p>
        </div>
      </div>

      {/* Contact information */}
      <div className="p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Ejercicio de Derechos
        </h3>
        <p className="text-muted-foreground mb-4">
          Para ejercer sus derechos de protección de datos o realizar consultas:
        </p>

        <div className="space-y-2">
          <p className="text-foreground font-medium">
            📧 {info.contactEmail}
          </p>
          <p className="text-sm text-muted-foreground">
            Responderemos a su solicitud en los plazos establecidos por la ley.
          </p>
        </div>
      </div>

      {/* Data subject rights summary */}
      <DataSubjectRights country={country} />
    </div>
  )
}

interface DataSubjectRightsProps {
  country: CountryCode
}

function DataSubjectRights({ country }: DataSubjectRightsProps) {
  const rightsInfo = {
    BR: {
      title: 'Seus Direitos sob a LGPD',
      rights: [
        'Confirmação da existência de tratamento',
        'Acesso aos dados pessoais',
        'Correção de dados incompletos, inexatos ou desatualizados',
        'Anonimização, bloqueio ou eliminação de dados',
        'Portabilidade dos dados',
        'Eliminação dos dados tratados com consentimento',
        'Informação sobre compartilhamento de dados',
        'Revogação do consentimento'
      ]
    },
    MX: {
      title: 'Sus Derechos ARCO',
      rights: [
        'Acceso: Conocer qué datos personales tenemos',
        'Rectificación: Corregir datos inexactos o incompletos',
        'Cancelación: Solicitar la eliminación de sus datos',
        'Oposición: Oponerse al tratamiento de sus datos'
      ]
    },
    AR: {
      title: 'Sus Derechos de Protección de Datos',
      rights: [
        'Derecho de acceso a la información',
        'Derecho de rectificación de datos inexactos',
        'Derecho de actualización de datos',
        'Derecho de supresión cuando corresponda'
      ]
    },
    CO: {
      title: 'Sus Derechos bajo la Ley 1581',
      rights: [
        'Conocer, actualizar y rectificar datos personales',
        'Solicitar prueba de la autorización otorgada',
        'Ser informado sobre el uso de sus datos',
        'Presentar quejas ante la SIC',
        'Revocar la autorización y solicitar supresión',
        'Acceder de forma gratuita a sus datos'
      ]
    }
  }

  const info = rightsInfo[country as keyof typeof rightsInfo]

  if (!info) {
    return null
  }

  return (
    <div className="p-6 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {info.title}
      </h3>
      <ul className="space-y-2">
        {info.rights.map((right, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-green-600 mt-1">✓</span>
            <span>{right}</span>
          </li>
        ))}
      </ul>
    </div>
  )
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
export async function generateMetadata({ params }: PrivacyPolicyPageProps) {
  const { country } = await params
  // Handle undefined country during build
  if (!country) {
    return {
      title: 'Política de Privacidad',
      description: 'Política de privacidad y protección de datos',
    }
  }

  const countryCode = country.toUpperCase() as CountryCode
  const countryName = getCountryName(countryCode)

  return {
    title: `Política de Privacidad - ${countryName}`,
    description: `Política de privacidad y protección de datos específica para ${countryName}. Cumple con las regulaciones locales de protección de datos.`,
    robots: 'index, follow',
  }
}