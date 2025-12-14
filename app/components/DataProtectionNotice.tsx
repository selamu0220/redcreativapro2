'use client'

import React, { useState } from 'react'
import { useLocalization } from '@/app/contexts/LocalizationContext'
import { CountryCode } from '@/app/lib/legal-compliance'

interface DataProtectionNoticeProps {
  context: 'data_collection' | 'data_processing' | 'data_sharing' | 'data_retention'
  className?: string
  showAsModal?: boolean
  onClose?: () => void
}

/**
 * Data Protection Notice Component
 * Shows country-specific data protection notices based on regional requirements
 */
export function DataProtectionNotice({ 
  context, 
  className = '', 
  showAsModal = false,
  onClose 
}: DataProtectionNoticeProps) {
  const { country } = useLocalization()
  const notice = getDataProtectionNotice(country, context)

  if (!notice) {
    return null
  }

  const containerClasses = showAsModal 
    ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
    : className

  const contentClasses = showAsModal
    ? 'bg-white rounded-lg shadow-xl max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'
    : 'w-full'

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {/* Header */}
        <div className={`${showAsModal ? 'p-6 border-b border-gray-200' : 'mb-4'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {notice.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {notice.subtitle}
              </p>
            </div>
            
            {showAsModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar aviso"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={`${showAsModal ? 'flex-1 overflow-y-auto p-6' : ''}`}>
          <div className="space-y-4">
            {notice.sections.map((section, index) => (
              <DataProtectionSection
                key={index}
                section={section}
              />
            ))}
          </div>

          {/* Legal basis */}
          {notice.legalBasis && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Base Legal</h4>
              <p className="text-sm text-blue-800">{notice.legalBasis}</p>
            </div>
          )}

          {/* Contact information */}
          {notice.contactInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Contacto</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Email:</strong> {notice.contactInfo.email}</p>
                {notice.contactInfo.phone && (
                  <p><strong>Teléfono:</strong> {notice.contactInfo.phone}</p>
                )}
                {notice.contactInfo.address && (
                  <p><strong>Dirección:</strong> {notice.contactInfo.address}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {showAsModal && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Este aviso cumple con las regulaciones locales de protección de datos.
              </p>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Entendido
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface DataProtectionSectionProps {
  section: {
    title: string
    content: string[]
    list?: string[]
    important?: boolean
  }
}

function DataProtectionSection({ section }: DataProtectionSectionProps) {
  return (
    <div className={`${section.important ? 'p-4 bg-yellow-50 rounded-lg border border-yellow-200' : ''}`}>
      <h4 className={`font-medium mb-2 ${section.important ? 'text-yellow-900' : 'text-gray-900'}`}>
        {section.title}
      </h4>
      <div className={`space-y-2 text-sm ${section.important ? 'text-yellow-800' : 'text-gray-700'}`}>
        {section.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        {section.list && (
          <ul className="list-disc pl-5 space-y-1 mt-2">
            {section.list.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

interface DataProtectionNoticeConfig {
  title: string
  subtitle: string
  sections: {
    title: string
    content: string[]
    list?: string[]
    important?: boolean
  }[]
  legalBasis?: string
  contactInfo?: {
    email: string
    phone?: string
    address?: string
  }
}

function getDataProtectionNotice(
  country: CountryCode, 
  context: 'data_collection' | 'data_processing' | 'data_sharing' | 'data_retention'
): DataProtectionNoticeConfig | null {
  const notices = {
    // Brazil - LGPD notices
    BR: {
      data_collection: {
        title: 'Aviso de Coleta de Dados - LGPD',
        subtitle: 'Informações sobre a coleta de seus dados pessoais',
        sections: [
          {
            title: 'Dados Coletados',
            content: [
              'Coletamos os seguintes tipos de dados pessoais:',
            ],
            list: [
              'Dados de identificação (nome, e-mail, telefone)',
              'Dados de navegação (cookies, logs de acesso)',
              'Dados de pagamento (informações de cartão, quando aplicável)',
              'Dados de uso (estatísticas de utilização das ferramentas)'
            ]
          },
          {
            title: 'Finalidade da Coleta',
            content: [
              'Seus dados são coletados para as seguintes finalidades:',
            ],
            list: [
              'Prestação dos serviços contratados',
              'Comunicação sobre produtos e serviços',
              'Cumprimento de obrigações legais',
              'Melhoria da experiência do usuário'
            ]
          },
          {
            title: 'Base Legal',
            content: [
              'A coleta de dados tem como base legal o consentimento (Art. 7º, I da LGPD) e a execução de contrato (Art. 7º, V da LGPD).'
            ],
            important: true
          }
        ],
        legalBasis: 'Lei Geral de Proteção de Dados (LGPD) - Lei nº 13.709/2018',
        contactInfo: {
          email: 'dpo@redcreativapro.com',
          address: 'Encarregado de Dados - Red Creativa Pro'
        }
      },
      data_processing: {
        title: 'Aviso de Tratamento de Dados - LGPD',
        subtitle: 'Como processamos seus dados pessoais',
        sections: [
          {
            title: 'Operações de Tratamento',
            content: [
              'Realizamos as seguintes operações com seus dados:',
            ],
            list: [
              'Coleta e armazenamento seguro',
              'Processamento para prestação de serviços',
              'Análise para melhoria dos serviços',
              'Comunicação quando necessário'
            ]
          },
          {
            title: 'Medidas de Segurança',
            content: [
              'Implementamos medidas técnicas e organizacionais para proteger seus dados:',
            ],
            list: [
              'Criptografia de dados em trânsito e em repouso',
              'Controle de acesso restrito',
              'Monitoramento de segurança 24/7',
              'Backups seguros e regulares'
            ]
          }
        ],
        legalBasis: 'Art. 46 da LGPD - Medidas de segurança',
        contactInfo: {
          email: 'dpo@redcreativapro.com'
        }
      },
      data_sharing: {
        title: 'Aviso de Compartilhamento - LGPD',
        subtitle: 'Quando e com quem compartilhamos seus dados',
        sections: [
          {
            title: 'Compartilhamento de Dados',
            content: [
              'Seus dados podem ser compartilhados nas seguintes situações:',
            ],
            list: [
              'Com processadores de pagamento (Stripe, PayPal)',
              'Com provedores de serviços de nuvem (AWS, Google Cloud)',
              'Com autoridades competentes quando exigido por lei',
              'Com seu consentimento explícito para outros fins'
            ]
          },
          {
            title: 'Transferência Internacional',
            content: [
              'Alguns de nossos fornecedores estão localizados fora do Brasil.',
              'Garantimos que essas transferências atendem aos requisitos da LGPD.'
            ],
            important: true
          }
        ],
        legalBasis: 'Art. 33 da LGPD - Transferência internacional',
        contactInfo: {
          email: 'dpo@redcreativapro.com'
        }
      },
      data_retention: {
        title: 'Aviso de Retenção de Dados - LGPD',
        subtitle: 'Por quanto tempo mantemos seus dados',
        sections: [
          {
            title: 'Períodos de Retenção',
            content: [
              'Mantemos seus dados pelos seguintes períodos:',
            ],
            list: [
              'Dados de conta: Durante a vigência do contrato + 2 anos',
              'Dados de pagamento: 5 anos (obrigação fiscal)',
              'Dados de marketing: 2 anos ou até revogação do consentimento',
              'Logs de acesso: 6 meses'
            ]
          },
          {
            title: 'Eliminação de Dados',
            content: [
              'Após o período de retenção, seus dados serão eliminados de forma segura.',
              'Você pode solicitar a eliminação antecipada exercendo seu direito de exclusão.'
            ],
            important: true
          }
        ],
        legalBasis: 'Art. 16 da LGPD - Eliminação de dados',
        contactInfo: {
          email: 'dpo@redcreativapro.com'
        }
      }
    },

    // Mexico - LFPDPPP notices
    MX: {
      data_collection: {
        title: 'Aviso de Recolección - LFPDPPP',
        subtitle: 'Información sobre la recolección de datos personales',
        sections: [
          {
            title: 'Datos Recabados',
            content: [
              'Recabamos los siguientes datos personales:',
            ],
            list: [
              'Datos de identificación (nombre, correo, teléfono)',
              'Datos de navegación (cookies, registros de acceso)',
              'Datos patrimoniales (información de pago)',
              'Datos de uso de la plataforma'
            ]
          },
          {
            title: 'Finalidades',
            content: [
              'Sus datos personales serán utilizados para:',
            ],
            list: [
              'Prestación de servicios contratados',
              'Mercadotecnia y publicidad',
              'Cumplimiento de obligaciones legales',
              'Mejora de nuestros servicios'
            ]
          }
        ],
        legalBasis: 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares',
        contactInfo: {
          email: 'datos.personales@redcreativapro.com'
        }
      },
      data_processing: {
        title: 'Aviso de Tratamiento - LFPDPPP',
        subtitle: 'Cómo tratamos sus datos personales',
        sections: [
          {
            title: 'Tratamiento de Datos',
            content: [
              'Tratamos sus datos personales de acuerdo con la LFPDPPP.',
              'Implementamos medidas de seguridad físicas, técnicas y administrativas.'
            ]
          },
          {
            title: 'Derechos ARCO',
            content: [
              'Usted puede ejercer sus derechos de:',
            ],
            list: [
              'Acceso: Conocer qué datos tenemos',
              'Rectificación: Corregir datos inexactos',
              'Cancelación: Solicitar eliminación',
              'Oposición: Oponerse al tratamiento'
            ],
            important: true
          }
        ],
        legalBasis: 'Art. 8 de la LFPDPPP',
        contactInfo: {
          email: 'datos.personales@redcreativapro.com'
        }
      },
      data_sharing: {
        title: 'Aviso de Transferencias - LFPDPPP',
        subtitle: 'Transferencias de datos personales',
        sections: [
          {
            title: 'Transferencias de Datos',
            content: [
              'Sus datos pueden ser transferidos a:',
            ],
            list: [
              'Procesadores de pago autorizados',
              'Proveedores de servicios tecnológicos',
              'Autoridades competentes cuando sea requerido',
              'Terceros con su consentimiento'
            ]
          }
        ],
        legalBasis: 'Art. 36 de la LFPDPPP - Transferencias',
        contactInfo: {
          email: 'datos.personales@redcreativapro.com'
        }
      },
      data_retention: {
        title: 'Aviso de Conservación - LFPDPPP',
        subtitle: 'Períodos de conservación de datos',
        sections: [
          {
            title: 'Conservación de Datos',
            content: [
              'Conservamos sus datos por los siguientes períodos:',
            ],
            list: [
              'Datos contractuales: 5 años',
              'Datos fiscales: 5 años',
              'Datos de marketing: 2 años',
              'Datos de navegación: 1 año'
            ]
          }
        ],
        legalBasis: 'Art. 11 de la LFPDPPP',
        contactInfo: {
          email: 'datos.personales@redcreativapro.com'
        }
      }
    }
  }

  const countryNotices = notices[country as keyof typeof notices]
  if (!countryNotices) {
    // Default notice for unsupported countries
    return {
      title: 'Aviso de Protección de Datos',
      subtitle: 'Información sobre el tratamiento de datos personales',
      sections: [
        {
          title: 'Tratamiento de Datos',
          content: [
            'Tratamos sus datos personales de acuerdo con las regulaciones locales de protección de datos.',
            'Para más información, consulte nuestra Política de Privacidad.'
          ]
        }
      ],
      contactInfo: {
        email: 'privacidad@redcreativapro.com'
      }
    }
  }

  return countryNotices[context] || null
}

/**
 * Hook for data protection notice management
 */
export function useDataProtectionNotice() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentContext, setCurrentContext] = useState<'data_collection' | 'data_processing' | 'data_sharing' | 'data_retention'>('data_collection')

  const openNotice = (context: typeof currentContext) => {
    setCurrentContext(context)
    setIsModalOpen(true)
  }

  const closeNotice = () => setIsModalOpen(false)

  return {
    isModalOpen,
    currentContext,
    openNotice,
    closeNotice,
    DataProtectionModal: () => (
      <DataProtectionNotice
        context={currentContext}
        showAsModal={true}
        onClose={closeNotice}
      />
    )
  }
}

export default DataProtectionNotice