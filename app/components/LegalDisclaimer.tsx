'use client'

import React from 'react'
import { useLocalization } from '@/app/contexts/LocalizationContext'
import { CountryCode } from '@/app/lib/legal-compliance'

interface LegalDisclaimerProps {
  context: 'footer' | 'checkout' | 'registration' | 'subscription'
  className?: string
  showFullDisclaimer?: boolean
}

/**
 * Legal Disclaimer Component
 * Shows country-specific legal disclaimers based on context and user location
 */
export function LegalDisclaimer({
  context,
  className = '',
  showFullDisclaimer = false
}: LegalDisclaimerProps) {
  const { country } = useLocalization()
  const disclaimer = getLegalDisclaimer(country as any, context)

  if (!disclaimer) {
    return null
  }

  return (
    <div className={`text-xs text-muted-foreground ${className}`}>
      {showFullDisclaimer ? (
        <div className="space-y-2">
          <p className="font-medium text-foreground">{disclaimer.title}</p>
          <div className="space-y-1">
            {disclaimer.content.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
          {disclaimer.links && (
            <div className="flex flex-wrap gap-4 mt-3">
              {disclaimer.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="text-blue-600 hover:text-blue-800 underline"
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                >
                  {link.text}
                </a>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {disclaimer.content.slice(0, 1).map((text, index) => (
            <p key={index}>{text}</p>
          ))}
          {disclaimer.links && disclaimer.links.length > 0 && (
            <span className="ml-1">
              <a
                href={disclaimer.links[0].url}
                className="text-blue-600 hover:text-blue-800 underline"
                target={disclaimer.links[0].external ? '_blank' : undefined}
                rel={disclaimer.links[0].external ? 'noopener noreferrer' : undefined}
              >
                Ver más
              </a>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface LegalDisclaimerConfig {
  title: string
  content: string[]
  links?: {
    text: string
    url: string
    external?: boolean
  }[]
}

function getLegalDisclaimer(
  country: CountryCode,
  context: 'footer' | 'checkout' | 'registration' | 'subscription'
): LegalDisclaimerConfig | null {
  const disclaimers = {
    // Brazil - LGPD compliance
    BR: {
      footer: {
        title: 'Proteção de Dados - LGPD',
        content: [
          'Este site coleta e processa dados pessoais em conformidade com a LGPD.',
          'Seus dados são protegidos e utilizados apenas para os fins descritos em nossa Política de Privacidade.'
        ],
        links: [
          { text: 'Política de Privacidade', url: '/privacy-policy/br' },
          { text: 'Seus Direitos', url: '/privacy-policy/br#direitos' }
        ]
      },
      checkout: {
        title: 'Aviso de Privacidade - Pagamento',
        content: [
          'Ao processar seu pagamento, coletaremos dados pessoais necessários para a transação.',
          'Seus dados de pagamento são processados de forma segura e não são armazenados em nossos servidores.',
          'Você tem direito de acessar, corrigir ou excluir seus dados a qualquer momento.'
        ],
        links: [
          { text: 'Política de Privacidade', url: '/privacy-policy/br' },
          { text: 'Contato DPO', url: 'mailto:dpo@redcreativapro.com' }
        ]
      },
      registration: {
        title: 'Consentimento LGPD',
        content: [
          'Ao criar sua conta, você consente com o tratamento de seus dados pessoais.',
          'Utilizaremos seus dados para prestação do serviço e comunicações relacionadas.',
          'Você pode revogar seu consentimento a qualquer momento.'
        ],
        links: [
          { text: 'Política de Privacidade', url: '/privacy-policy/br' }
        ]
      },
      subscription: {
        title: 'Direitos do Consumidor - CDC',
        content: [
          'Você tem direito de arrependimento em até 7 dias após a contratação.',
          'Em caso de defeito no serviço, você tem direito a reparo, substituição ou reembolso.',
          'Para exercer seus direitos, entre em contato conosco.'
        ],
        links: [
          { text: 'Termos de Serviço', url: '/terms-of-service/br' },
          { text: 'Suporte', url: 'mailto:suporte@redcreativapro.com' }
        ]
      }
    },

    // Mexico - LFPDPPP compliance
    MX: {
      footer: {
        title: 'Aviso de Privacidad - LFPDPPP',
        content: [
          'Somos responsables del tratamiento de sus datos personales conforme a la LFPDPPP.',
          'Sus datos son utilizados únicamente para los fines descritos en nuestro Aviso de Privacidad.'
        ],
        links: [
          { text: 'Aviso de Privacidad', url: '/privacy-policy/mx' },
          { text: 'Derechos ARCO', url: '/privacy-policy/mx#arco' }
        ]
      },
      checkout: {
        title: 'Tratamiento de Datos - Pago',
        content: [
          'Al procesar su pago, trataremos datos personales necesarios para la transacción.',
          'Sus datos de pago son procesados de forma segura por nuestros proveedores certificados.',
          'Puede ejercer sus derechos ARCO contactándonos.'
        ],
        links: [
          { text: 'Aviso de Privacidad', url: '/privacy-policy/mx' },
          { text: 'Contacto ARCO', url: 'mailto:datos.personales@redcreativapro.com' }
        ]
      },
      registration: {
        title: 'Consentimiento de Datos',
        content: [
          'Al registrarse, otorga su consentimiento para el tratamiento de datos personales.',
          'Sus datos serán utilizados para la prestación del servicio contratado.',
          'Puede revocar su consentimiento en cualquier momento.'
        ],
        links: [
          { text: 'Aviso de Privacidad', url: '/privacy-policy/mx' }
        ]
      },
      subscription: {
        title: 'Derechos del Consumidor - PROFECO',
        content: [
          'Tiene derecho a la devolución según los términos establecidos por PROFECO.',
          'Todos los precios incluyen IVA según la legislación mexicana.',
          'Puede presentar quejas ante PROFECO en caso de problemas.'
        ],
        links: [
          { text: 'Términos de Servicio', url: '/terms-of-service/mx' },
          { text: 'PROFECO', url: 'https://www.profeco.gob.mx/', external: true }
        ]
      }
    },

    // Argentina - PDPA compliance
    AR: {
      footer: {
        title: 'Protección de Datos Personales',
        content: [
          'Tratamos sus datos personales conforme a la Ley 25.326 de Protección de Datos.',
          'Sus datos están protegidos y son utilizados únicamente para los fines autorizados.'
        ],
        links: [
          { text: 'Política de Privacidad', url: '/privacy-policy/ar' },
          { text: 'Sus Derechos', url: '/privacy-policy/ar#derechos' }
        ]
      },
      checkout: {
        title: 'Tratamiento de Datos - Pago',
        content: [
          'Al procesar su pago, trataremos datos personales necesarios para la transacción.',
          'Sus datos son procesados conforme a la legislación argentina de protección de datos.',
          'Puede ejercer sus derechos contactándonos.'
        ],
        links: [
          { text: 'Política de Privacidad', url: '/privacy-policy/ar' },
          { text: 'Contacto', url: 'mailto:privacidad@redcreativapro.com' }
        ]
      },
      registration: {
        title: 'Autorización de Datos',
        content: [
          'Al registrarse, autoriza el tratamiento de sus datos personales.',
          'Sus datos serán utilizados para la prestación del servicio.',
          'Puede revocar su autorización en cualquier momento.'
        ],
        links: [
          { text: 'Política de Privacidad', url: '/privacy-policy/ar' }
        ]
      },
      subscription: {
        title: 'Derechos del Consumidor',
        content: [
          'Tiene derecho a la resolución del contrato en caso de incumplimiento.',
          'Los precios se expresan en pesos argentinos.',
          'Puede recurrir a COPREC para resolución de conflictos.'
        ],
        links: [
          { text: 'Términos de Servicio', url: '/terms-of-service/ar' },
          { text: 'COPREC', url: 'https://www.coprec.gob.ar/', external: true }
        ]
      }
    },

    // Colombia - Law 1581 compliance
    CO: {
      footer: {
        title: 'Tratamiento de Datos - Ley 1581',
        content: [
          'Tratamos sus datos personales conforme a la Ley 1581 de 2012.',
          'Sus datos están protegidos y son utilizados únicamente con su autorización.'
        ],
        links: [
          { text: 'Política de Tratamiento', url: '/privacy-policy/co' },
          { text: 'Sus Derechos', url: '/privacy-policy/co#derechos' }
        ]
      },
      checkout: {
        title: 'Autorización de Datos - Pago',
        content: [
          'Al procesar su pago, trataremos datos personales con su autorización.',
          'Sus datos de pago son procesados de forma segura.',
          'Puede ejercer sus derechos de habeas data contactándonos.'
        ],
        links: [
          { text: 'Política de Tratamiento', url: '/privacy-policy/co' },
          { text: 'Habeas Data', url: 'mailto:habeasdata@redcreativapro.com' }
        ]
      },
      registration: {
        title: 'Autorización de Tratamiento',
        content: [
          'Al registrarse, otorga autorización para el tratamiento de datos personales.',
          'Sus datos serán utilizados para la prestación del servicio.',
          'Puede revocar su autorización en cualquier momento.'
        ],
        links: [
          { text: 'Política de Tratamiento', url: '/privacy-policy/co' }
        ]
      },
      subscription: {
        title: 'Derechos del Consumidor - SIC',
        content: [
          'Tiene derecho a la garantía según el Estatuto del Consumidor.',
          'Los precios incluyen IVA según la legislación colombiana.',
          'Puede presentar quejas ante la SIC.'
        ],
        links: [
          { text: 'Términos de Servicio', url: '/terms-of-service/co' },
          { text: 'SIC', url: 'https://www.sic.gov.co/', external: true }
        ]
      }
    }
  }

  const countryDisclaimers = disclaimers[country as keyof typeof disclaimers]
  if (!countryDisclaimers) {
    // Default disclaimer for unsupported countries
    return {
      title: 'Aviso Legal',
      content: [
        'Este sitio web cumple con las regulaciones locales de protección de datos y comercio electrónico.',
        'Para más información, consulte nuestra Política de Privacidad y Términos de Servicio.'
      ],
      links: [
        { text: 'Política de Privacidad', url: '/politica-privacidad' },
        { text: 'Términos de Servicio', url: '/terminos-servicio' }
      ]
    }
  }

  return countryDisclaimers[context] || null
}

/**
 * Simplified Legal Footer Component
 * For use in page footers with minimal space
 */
export function LegalFooterDisclaimer({ className = '' }: { className?: string }) {
  return (
    <LegalDisclaimer
      context="footer"
      className={className}
      showFullDisclaimer={false}
    />
  )
}

/**
 * Checkout Legal Notice Component
 * For use in checkout flows with full disclosure
 */
export function CheckoutLegalNotice({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
      <LegalDisclaimer
        context="checkout"
        showFullDisclaimer={true}
      />
    </div>
  )
}

/**
 * Registration Legal Notice Component
 * For use in registration forms
 */
export function RegistrationLegalNotice({ className = '' }: { className?: string }) {
  return (
    <div className={`p-3 bg-gray-50 rounded border ${className}`}>
      <LegalDisclaimer
        context="registration"
        showFullDisclaimer={true}
      />
    </div>
  )
}

/**
 * Subscription Legal Notice Component
 * For use in subscription/payment flows
 */
export function SubscriptionLegalNotice({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 bg-yellow-50 rounded-lg border border-yellow-200 ${className}`}>
      <LegalDisclaimer
        context="subscription"
        showFullDisclaimer={true}
      />
    </div>
  )
}

export default LegalDisclaimer