'use client'

import React, { useState, useEffect } from 'react'
import { useLocalization } from '../contexts/LocalizationContext'
import { paymentAdapterManager } from '@/lib/payment-adapter-manager'
import { PaymentMethod, PaymentMethodType } from '@/lib/payment-adapter'
import { CountryCode } from '@/app/lib/geo-detection'
import { useTranslation } from '@/app/lib/language/context'
import { usePaymentMethods } from '../contexts/LocalizationContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  CreditCard,
  Clock,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Building,
  Smartphone,
  Banknote,
  Globe
} from 'lucide-react'

interface PaymentMethodSelectorProps {
  amount: number
  onMethodSelect: (method: PaymentMethod) => void
  selectedMethod?: PaymentMethod
  className?: string
  currency?: string // Added as optional since it was used in previous props? Check usage. 
}

interface PaymentMethodInfo extends Omit<PaymentMethod, 'description' | 'icon'> {
  icon: React.ReactNode
  description: string
  processingTime: string
  popularity: number // 1-5 scale
  successRate: number // percentage
  recommendationBadge?: string
  regionalContext?: string
}

/**
 * Enhanced Payment Method Selector with regional context and recommendations
 */
export function PaymentMethodSelector({
  amount,
  onMethodSelect,
  selectedMethod,
  className = '',
  currency: propCurrency
}: PaymentMethodSelectorProps) {
  const { country, currency: contextCurrency, formatCurrency } = useLocalization()
  const currency = propCurrency || contextCurrency
  const { t } = useTranslation('common')

  const [availableMethods, setAvailableMethods] = useState<PaymentMethodInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [recommendedMethod, setRecommendedMethod] = useState<PaymentMethodInfo | null>(null)

  useEffect(() => {
    loadPaymentMethods()
  }, [country, currency, amount])

  const loadPaymentMethods = async () => {
    setIsLoading(true)
    try {
      // Get available payment methods from adapter manager
      const methods = paymentAdapterManager.getAvailablePaymentMethods({
        country,
        currency,
        amount,
        fallbackToInternational: true
      })

      // Enhance methods with UI information and regional context
      const enhancedMethods = methods.map(method => enhancePaymentMethod(method, country))

      // Sort by popularity and success rate
      enhancedMethods.sort((a, b) => {
        // Prioritize regional methods first
        if (a.regionalContext && !b.regionalContext) return -1
        if (!a.regionalContext && b.regionalContext) return 1

        // Then by popularity and success rate
        const aScore = (a.popularity * 0.6) + (a.successRate * 0.4)
        const bScore = (b.popularity * 0.6) + (b.successRate * 0.4)
        return bScore - aScore
      })

      setAvailableMethods(enhancedMethods)

      // Set recommended method (first in sorted list)
      if (enhancedMethods.length > 0) {
        setRecommendedMethod(enhancedMethods[0])
      }
    } catch (error) {
      console.error('Error loading payment methods:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const enhancePaymentMethod = (method: PaymentMethod, country: CountryCode): PaymentMethodInfo => {
    const baseInfo = getPaymentMethodBaseInfo(method.type)
    const regionalInfo = getRegionalPaymentInfo(method.type, country)

    return {
      ...method,
      ...baseInfo,
      ...regionalInfo,
      successRate: getSuccessRateForCountry(method.type, country),
      popularity: getPopularityForCountry(method.type, country)
    }
  }

  const getPaymentMethodBaseInfo = (type: PaymentMethodType) => {
    const infoMap: Record<PaymentMethodType, {
      icon: React.ReactNode
      description: string
      processingTime: string
    }> = {
      card: {
        icon: <CreditCard className="h-5 w-5" />,
        description: 'Tarjetas de crédito y débito',
        processingTime: 'Instantáneo'
      },
      oxxo: {
        icon: <Building className="h-5 w-5 text-red-600" />,
        description: 'Pago en efectivo en tiendas OXXO',
        processingTime: '1-3 días hábiles'
      },
      spei: {
        icon: <Banknote className="h-5 w-5 text-green-600" />,
        description: 'Transferencia bancaria SPEI',
        processingTime: 'Instantáneo'
      },
      pse: {
        icon: <Building className="h-5 w-5 text-yellow-600" />,
        description: 'Débito online PSE',
        processingTime: 'Instantáneo'
      },
      pix: {
        icon: <Zap className="h-5 w-5 text-green-500" />,
        description: 'Transferencia instantánea PIX',
        processingTime: 'Instantáneo'
      },
      boleto: {
        icon: <Banknote className="h-5 w-5 text-blue-600" />,
        description: 'Boleto bancário',
        processingTime: '1-3 días hábiles'
      },
      mercadopago: {
        icon: <Smartphone className="h-5 w-5 text-blue-500" />,
        description: 'Billetera digital Mercado Pago',
        processingTime: 'Instantáneo'
      },
      efecty: {
        icon: <Building className="h-5 w-5 text-orange-600" />,
        description: 'Pago en efectivo Efecty',
        processingTime: '1-2 días hábiles'
      },
      rapipago: {
        icon: <Building className="h-5 w-5 text-red-500" />,
        description: 'Pago en efectivo Rapipago',
        processingTime: '1-2 días hábiles'
      },
      webpay: {
        icon: <CreditCard className="h-5 w-5 text-blue-700" />,
        description: 'Webpay Plus',
        processingTime: 'Instantáneo'
      },
      pagoefectivo: {
        icon: <Building className="h-5 w-5 text-purple-600" />,
        description: 'PagoEfectivo',
        processingTime: '1-2 días hábiles'
      },
      paypal: {
        icon: <Globe className="h-5 w-5 text-blue-600" />,
        description: 'PayPal',
        processingTime: 'Instantáneo'
      }
    }

    return infoMap[type] || {
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Método de pago',
      processingTime: 'Variable'
    }
  }

  const getRegionalPaymentInfo = (type: PaymentMethodType, country: CountryCode) => {
    // Regional context and recommendation badges
    const regionalMap: Record<CountryCode, Partial<Record<PaymentMethodType, {
      recommendationBadge?: string
      regionalContext?: string
    }>>> = {
      MX: {
        oxxo: {
          recommendationBadge: 'Más Popular en México',
          regionalContext: 'Disponible en +20,000 tiendas OXXO'
        },
        spei: {
          recommendationBadge: 'Transferencia Rápida',
          regionalContext: 'Sistema bancario mexicano'
        },
        card: {
          regionalContext: 'Aceptamos todas las tarjetas mexicanas'
        }
      },
      CO: {
        pse: {
          recommendationBadge: 'Más Popular en Colombia',
          regionalContext: 'Débito online con todos los bancos'
        },
        efecty: {
          recommendationBadge: 'Red Nacional',
          regionalContext: 'Disponible en toda Colombia'
        },
        card: {
          regionalContext: 'Tarjetas colombianas aceptadas'
        }
      },
      BR: {
        pix: {
          recommendationBadge: 'Más Popular en Brasil',
          regionalContext: 'Transferencia instantánea 24/7'
        },
        boleto: {
          recommendationBadge: 'Método Tradicional',
          regionalContext: 'Pago en bancos y casas lotéricas'
        },
        card: {
          regionalContext: 'Tarjetas brasileñas aceptadas'
        }
      },
      AR: {
        mercadopago: {
          recommendationBadge: 'Más Popular en Argentina',
          regionalContext: 'Billetera digital líder'
        },
        rapipago: {
          recommendationBadge: 'Red Nacional',
          regionalContext: 'Disponible en todo el país'
        },
        card: {
          regionalContext: 'Tarjetas argentinas aceptadas'
        }
      },
      CL: {
        webpay: {
          recommendationBadge: 'Más Popular en Chile',
          regionalContext: 'Sistema de pago nacional'
        },
        card: {
          regionalContext: 'Tarjetas chilenas aceptadas'
        }
      },
      PE: {
        pagoefectivo: {
          recommendationBadge: 'Más Popular en Perú',
          regionalContext: 'Red nacional de agentes'
        },
        card: {
          regionalContext: 'Tarjetas peruanas aceptadas'
        }
      },
      EC: {
        card: {
          recommendationBadge: 'Más Confiable',
          regionalContext: 'Tarjetas ecuatorianas aceptadas'
        }
      },
      US: {
        card: {
          recommendationBadge: 'Más Popular',
          regionalContext: 'Todas las tarjetas estadounidenses'
        },
        paypal: {
          recommendationBadge: 'Alternativa Popular',
          regionalContext: 'Pago seguro con PayPal'
        }
      }
    }

    const countryMethods = regionalMap[country] || {}
    return countryMethods[type] || {}
  }

  const getSuccessRateForCountry = (type: PaymentMethodType, country: CountryCode): number => {
    // Success rates based on regional data (simulated)
    const successRates: Record<CountryCode, Partial<Record<PaymentMethodType, number>>> = {
      MX: {
        oxxo: 98, spei: 96, card: 94, mercadopago: 92, paypal: 90,
        pse: 85, pix: 85, boleto: 85, efecty: 85, rapipago: 85, webpay: 85, pagoefectivo: 85
      },
      CO: {
        pse: 97, efecty: 95, card: 93, mercadopago: 90, paypal: 88,
        oxxo: 85, spei: 85, pix: 85, boleto: 85, rapipago: 85, webpay: 85, pagoefectivo: 85
      },
      BR: {
        pix: 99, boleto: 96, card: 94, mercadopago: 91, paypal: 89,
        oxxo: 85, spei: 85, pse: 85, efecty: 85, rapipago: 85, webpay: 85, pagoefectivo: 85
      },
      AR: {
        mercadopago: 97, rapipago: 95, card: 93, paypal: 90,
        oxxo: 85, spei: 85, pse: 85, pix: 85, boleto: 85, efecty: 85, webpay: 85, pagoefectivo: 85
      },
      CL: {
        webpay: 98, card: 95, mercadopago: 92, paypal: 90,
        oxxo: 85, spei: 85, pse: 85, pix: 85, boleto: 85, efecty: 85, rapipago: 85, pagoefectivo: 85
      },
      PE: {
        pagoefectivo: 96, card: 94, mercadopago: 91, paypal: 89,
        oxxo: 85, spei: 85, pse: 85, pix: 85, boleto: 85, efecty: 85, rapipago: 85, webpay: 85
      },
      EC: {
        card: 95, mercadopago: 90, paypal: 88,
        oxxo: 85, spei: 85, pse: 85, pix: 85, boleto: 85, efecty: 85, rapipago: 85, webpay: 85, pagoefectivo: 85
      },
      US: {
        card: 97, paypal: 95, mercadopago: 88,
        oxxo: 85, spei: 85, pse: 85, pix: 85, boleto: 85, efecty: 85, rapipago: 85, webpay: 85, pagoefectivo: 85
      }
    }

    return successRates[country]?.[type] || 85
  }

  const getPopularityForCountry = (type: PaymentMethodType, country: CountryCode): number => {
    // Popularity scores 1-5 based on regional usage
    const popularityScores: Record<CountryCode, Partial<Record<PaymentMethodType, number>>> = {
      MX: {
        oxxo: 5, spei: 4, card: 4, mercadopago: 3, paypal: 2,
        pse: 1, pix: 1, boleto: 1, efecty: 1, rapipago: 1, webpay: 1, pagoefectivo: 1
      },
      CO: {
        pse: 5, efecty: 4, card: 4, mercadopago: 3, paypal: 2,
        oxxo: 1, spei: 1, pix: 1, boleto: 1, rapipago: 1, webpay: 1, pagoefectivo: 1
      },
      BR: {
        pix: 5, boleto: 4, card: 4, mercadopago: 3, paypal: 2,
        oxxo: 1, spei: 1, pse: 1, efecty: 1, rapipago: 1, webpay: 1, pagoefectivo: 1
      },
      AR: {
        mercadopago: 5, rapipago: 4, card: 4, paypal: 2,
        oxxo: 1, spei: 1, pse: 1, pix: 1, boleto: 1, efecty: 1, webpay: 1, pagoefectivo: 1
      },
      CL: {
        webpay: 5, card: 4, mercadopago: 3, paypal: 2,
        oxxo: 1, spei: 1, pse: 1, pix: 1, boleto: 1, efecty: 1, rapipago: 1, pagoefectivo: 1
      },
      PE: {
        pagoefectivo: 5, card: 4, mercadopago: 3, paypal: 2,
        oxxo: 1, spei: 1, pse: 1, pix: 1, boleto: 1, efecty: 1, rapipago: 1, webpay: 1
      },
      EC: {
        card: 5, mercadopago: 3, paypal: 2,
        oxxo: 1, spei: 1, pse: 1, pix: 1, boleto: 1, efecty: 1, rapipago: 1, webpay: 1, pagoefectivo: 1
      },
      US: {
        card: 5, paypal: 4, mercadopago: 2,
        oxxo: 1, spei: 1, pse: 1, pix: 1, boleto: 1, efecty: 1, rapipago: 1, webpay: 1, pagoefectivo: 1
      }
    }

    return popularityScores[country]?.[type] || 1
  }

  const handleMethodSelect = (method: PaymentMethodInfo) => {
    onMethodSelect(method as unknown as PaymentMethod)
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded mb-3"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('payment_selector.title')}
        </h3>
        <Badge variant="outline" className="text-xs">
          {country} • {formatCurrency(amount)}
        </Badge>
      </div>

      {/* Recommended Method */}
      {recommendedMethod && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">{t('payment_selector.recommended')}</span>
          </div>
          <PaymentMethodCard
            method={method => ({ ...method, processingTimeLabel: t('payment_selector.processing_time'), successRateLabel: t('payment_selector.success_rate') })(recommendedMethod)} // Passing translation props? Or just simplify card component
            isSelected={selectedMethod?.type === recommendedMethod.type}
            isRecommended={true}
            onSelect={() => handleMethodSelect(recommendedMethod)}
            labels={{
              processingTime: t('payment_selector.processing_time'),
              successRate: t('payment_selector.success_rate')
            }}
          />
        </div>
      )}

      {/* All Methods */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">{t('payment_selector.subtitle')}</h4>
        {availableMethods.map((method) => (
          <PaymentMethodCard
            key={method.type}
            method={method}
            isSelected={selectedMethod?.type === method.type}
            isRecommended={method.type === recommendedMethod?.type}
            onSelect={() => handleMethodSelect(method)}
            labels={{
              processingTime: t('payment_selector.processing_time'),
              successRate: t('payment_selector.success_rate')
            }}
          />
        ))}
      </div>

      {/* Regional Context Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Métodos optimizados para {getCountryName(country)}
            </h4>
            <p className="text-xs text-blue-700 mt-1">
              Los métodos mostrados están ordenados por popularidad y tasa de éxito en tu región.
              Todos los pagos están protegidos con encriptación de nivel bancario.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PaymentMethodCardProps {
  method: PaymentMethodInfo
  isSelected: boolean
  isRecommended: boolean
  onSelect: () => void
  labels?: {
    processingTime: string
    successRate: string
  }
}

function PaymentMethodCard({ method, isSelected, isRecommended, onSelect, labels }: PaymentMethodCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] ${isSelected
        ? 'ring-2 ring-blue-500 border-blue-500'
        : 'border-gray-200 hover:border-gray-300'
        } ${isRecommended && !isSelected ? 'bg-yellow-50 border-yellow-200' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 flex-1">
            <div className="flex-shrink-0 mt-1 sm:mt-0 p-2 bg-gray-50 rounded-lg">
              {method.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 capitalize text-base">
                  {method.type.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                {method.recommendationBadge && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 whitespace-nowrap">
                    {method.recommendationBadge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1 leading-relaxed">{method.description}</p>
              {method.regionalContext && (
                <p className="text-xs text-blue-600 font-medium">{method.regionalContext}</p>
              )}
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pl-12 sm:pl-0 sm:ml-4 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
            {/* Processing Time */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{method.processingTime}</span>
            </div>

            {/* Success Rate */}
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600 font-medium">{method.successRate}% {labels?.successRate || 'éxito'}</span>
            </div>

            {/* Popularity Stars */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${star <= method.popularity
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {isSelected && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Método seleccionado</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getCountryName(country: CountryCode): string {
  const countryNames: Record<CountryCode, string> = {
    MX: 'México',
    CO: 'Colombia',
    BR: 'Brasil',
    AR: 'Argentina',
    CL: 'Chile',
    PE: 'Perú',
    EC: 'Ecuador',
    US: 'Estados Unidos',
    UNKNOWN: 'Desconocido'
  }

  return countryNames[country] || country
}