import { CountryCode, CurrencyCode } from '../app/lib/geo-detection'

// Payment method types supported across Latin America
export type PaymentMethodType = 
  | 'card'           // Credit/Debit cards (universal)
  | 'oxxo'           // OXXO convenience stores (Mexico)
  | 'spei'           // SPEI bank transfers (Mexico)
  | 'pse'            // PSE online banking (Colombia)
  | 'efecty'         // Efecty cash payments (Colombia)
  | 'mercadopago'    // Mercado Pago (Argentina)
  | 'rapipago'       // Rapipago cash payments (Argentina)
  | 'webpay'         // Webpay (Chile)
  | 'pagoefectivo'   // PagoEfectivo (Peru)
  | 'pix'            // PIX instant payments (Brazil)
  | 'boleto'         // Boleto bancário (Brazil)
  | 'paypal'         // PayPal (international fallback)

// Payment method configuration
export interface PaymentMethod {
  type: PaymentMethodType
  name: string
  displayName: Record<string, string> // Multi-language display names
  description: Record<string, string> // Multi-language descriptions
  icon: string
  processingTime: string
  fees: {
    fixed?: number
    percentage?: number
    currency: CurrencyCode
  }
  limits: {
    min: number
    max: number
    currency: CurrencyCode
  }
  supportedCurrencies: CurrencyCode[]
  countries: CountryCode[]
  isActive: boolean
  priority: number // Lower number = higher priority
  metadata: Record<string, any>
}

// Payment processing result
export interface PaymentResult {
  success: boolean
  transactionId?: string
  paymentMethodUsed: PaymentMethodType
  amount: number
  currency: CurrencyCode
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  redirectUrl?: string
  errorCode?: string
  errorMessage?: string
  metadata?: Record<string, any>
}

// Payment adapter interface for different providers
export interface PaymentAdapter {
  readonly name: string
  readonly supportedMethods: PaymentMethodType[]
  readonly supportedCountries: CountryCode[]
  
  // Core payment operations
  processPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata?: Record<string, any>
  ): Promise<PaymentResult>
  
  // Validation methods
  validatePaymentMethod(method: PaymentMethod, country: CountryCode): boolean
  validateAmount(amount: number, currency: CurrencyCode, method: PaymentMethod): boolean
  
  // Configuration methods
  isAvailable(country: CountryCode): boolean
  getRequiredFields(method: PaymentMethodType): string[]
}

// Country-specific payment method configurations
const PAYMENT_METHOD_CONFIGS: Record<PaymentMethodType, PaymentMethod> = {
  card: {
    type: 'card',
    name: 'Credit/Debit Card',
    displayName: {
      es: 'Tarjeta de Crédito/Débito',
      pt: 'Cartão de Crédito/Débito',
      en: 'Credit/Debit Card'
    },
    description: {
      es: 'Paga con tu tarjeta de crédito o débito',
      pt: 'Pague com seu cartão de crédito ou débito',
      en: 'Pay with your credit or debit card'
    },
    icon: 'credit-card',
    processingTime: 'instant',
    fees: {
      percentage: 2.9,
      currency: 'USD'
    },
    limits: {
      min: 1,
      max: 10000,
      currency: 'USD'
    },
    supportedCurrencies: ['USD', 'MXN', 'COP', 'ARS', 'CLP', 'PEN', 'BRL'],
    countries: ['MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR', 'US'],
    isActive: true,
    priority: 1,
    metadata: {
      stripeEnabled: true,
      requiresVerification: true
    }
  },
  
  oxxo: {
    type: 'oxxo',
    name: 'OXXO',
    displayName: {
      es: 'OXXO',
      pt: 'OXXO',
      en: 'OXXO'
    },
    description: {
      es: 'Paga en efectivo en cualquier tienda OXXO',
      pt: 'Pague em dinheiro em qualquer loja OXXO',
      en: 'Pay cash at any OXXO store'
    },
    icon: 'oxxo',
    processingTime: '1-3 days',
    fees: {
      fixed: 15,
      currency: 'MXN'
    },
    limits: {
      min: 50,
      max: 10000,
      currency: 'MXN'
    },
    supportedCurrencies: ['MXN'],
    countries: ['MX'],
    isActive: true,
    priority: 2,
    metadata: {
      stripeEnabled: true,
      requiresVoucher: true,
      expirationHours: 72
    }
  },
  
  spei: {
    type: 'spei',
    name: 'SPEI',
    displayName: {
      es: 'Transferencia SPEI',
      pt: 'Transferência SPEI',
      en: 'SPEI Transfer'
    },
    description: {
      es: 'Transferencia bancaria instantánea',
      pt: 'Transferência bancária instantânea',
      en: 'Instant bank transfer'
    },
    icon: 'bank-transfer',
    processingTime: 'instant',
    fees: {
      fixed: 5,
      currency: 'MXN'
    },
    limits: {
      min: 100,
      max: 50000,
      currency: 'MXN'
    },
    supportedCurrencies: ['MXN'],
    countries: ['MX'],
    isActive: true,
    priority: 3,
    metadata: {
      stripeEnabled: true,
      requiresBankAccount: true
    }
  },
  
  pse: {
    type: 'pse',
    name: 'PSE',
    displayName: {
      es: 'PSE - Pagos Seguros en Línea',
      pt: 'PSE - Pagamentos Seguros Online',
      en: 'PSE - Secure Online Payments'
    },
    description: {
      es: 'Paga directamente desde tu banco en línea',
      pt: 'Pague diretamente do seu banco online',
      en: 'Pay directly from your online bank'
    },
    icon: 'pse',
    processingTime: 'instant',
    fees: {
      percentage: 1.5,
      currency: 'COP'
    },
    limits: {
      min: 5000,
      max: 50000000,
      currency: 'COP'
    },
    supportedCurrencies: ['COP'],
    countries: ['CO'],
    isActive: true,
    priority: 2,
    metadata: {
      stripeEnabled: true,
      requiresBankSelection: true
    }
  },
  
  efecty: {
    type: 'efecty',
    name: 'Efecty',
    displayName: {
      es: 'Efecty',
      pt: 'Efecty',
      en: 'Efecty'
    },
    description: {
      es: 'Paga en efectivo en puntos Efecty',
      pt: 'Pague em dinheiro nos pontos Efecty',
      en: 'Pay cash at Efecty locations'
    },
    icon: 'efecty',
    processingTime: '1-2 days',
    fees: {
      fixed: 3000,
      currency: 'COP'
    },
    limits: {
      min: 10000,
      max: 2000000,
      currency: 'COP'
    },
    supportedCurrencies: ['COP'],
    countries: ['CO'],
    isActive: true,
    priority: 3,
    metadata: {
      stripeEnabled: false,
      requiresVoucher: true,
      expirationHours: 48
    }
  },
  
  mercadopago: {
    type: 'mercadopago',
    name: 'Mercado Pago',
    displayName: {
      es: 'Mercado Pago',
      pt: 'Mercado Pago',
      en: 'Mercado Pago'
    },
    description: {
      es: 'Paga con tu cuenta de Mercado Pago',
      pt: 'Pague com sua conta do Mercado Pago',
      en: 'Pay with your Mercado Pago account'
    },
    icon: 'mercadopago',
    processingTime: 'instant',
    fees: {
      percentage: 3.5,
      currency: 'ARS'
    },
    limits: {
      min: 100,
      max: 500000,
      currency: 'ARS'
    },
    supportedCurrencies: ['ARS'],
    countries: ['AR'],
    isActive: true,
    priority: 2,
    metadata: {
      stripeEnabled: false,
      requiresAccount: true,
      externalProvider: true
    }
  },
  
  rapipago: {
    type: 'rapipago',
    name: 'Rapipago',
    displayName: {
      es: 'Rapipago',
      pt: 'Rapipago',
      en: 'Rapipago'
    },
    description: {
      es: 'Paga en efectivo en locales Rapipago',
      pt: 'Pague em dinheiro nas lojas Rapipago',
      en: 'Pay cash at Rapipago locations'
    },
    icon: 'rapipago',
    processingTime: '1-3 days',
    fees: {
      fixed: 50,
      currency: 'ARS'
    },
    limits: {
      min: 200,
      max: 100000,
      currency: 'ARS'
    },
    supportedCurrencies: ['ARS'],
    countries: ['AR'],
    isActive: true,
    priority: 3,
    metadata: {
      stripeEnabled: false,
      requiresVoucher: true,
      expirationHours: 72
    }
  },
  
  webpay: {
    type: 'webpay',
    name: 'Webpay',
    displayName: {
      es: 'Webpay',
      pt: 'Webpay',
      en: 'Webpay'
    },
    description: {
      es: 'Paga con Webpay de Transbank',
      pt: 'Pague com Webpay da Transbank',
      en: 'Pay with Transbank Webpay'
    },
    icon: 'webpay',
    processingTime: 'instant',
    fees: {
      percentage: 2.5,
      currency: 'CLP'
    },
    limits: {
      min: 1000,
      max: 5000000,
      currency: 'CLP'
    },
    supportedCurrencies: ['CLP'],
    countries: ['CL'],
    isActive: true,
    priority: 2,
    metadata: {
      stripeEnabled: false,
      requiresRedirect: true,
      externalProvider: true
    }
  },
  
  pagoefectivo: {
    type: 'pagoefectivo',
    name: 'PagoEfectivo',
    displayName: {
      es: 'PagoEfectivo',
      pt: 'PagoEfectivo',
      en: 'PagoEfectivo'
    },
    description: {
      es: 'Paga en efectivo en agentes autorizados',
      pt: 'Pague em dinheiro em agentes autorizados',
      en: 'Pay cash at authorized agents'
    },
    icon: 'pagoefectivo',
    processingTime: '1-2 days',
    fees: {
      percentage: 2.0,
      currency: 'PEN'
    },
    limits: {
      min: 10,
      max: 5000,
      currency: 'PEN'
    },
    supportedCurrencies: ['PEN'],
    countries: ['PE'],
    isActive: true,
    priority: 2,
    metadata: {
      stripeEnabled: false,
      requiresVoucher: true,
      expirationHours: 48
    }
  },
  
  pix: {
    type: 'pix',
    name: 'PIX',
    displayName: {
      es: 'PIX',
      pt: 'PIX',
      en: 'PIX'
    },
    description: {
      es: 'Pago instantáneo con PIX',
      pt: 'Pagamento instantâneo com PIX',
      en: 'Instant payment with PIX'
    },
    icon: 'pix',
    processingTime: 'instant',
    fees: {
      percentage: 1.0,
      currency: 'BRL'
    },
    limits: {
      min: 1,
      max: 20000,
      currency: 'BRL'
    },
    supportedCurrencies: ['BRL'],
    countries: ['BR'],
    isActive: true,
    priority: 2,
    metadata: {
      stripeEnabled: true,
      requiresQRCode: true,
      expirationMinutes: 30
    }
  },
  
  boleto: {
    type: 'boleto',
    name: 'Boleto Bancário',
    displayName: {
      es: 'Boleto Bancário',
      pt: 'Boleto Bancário',
      en: 'Bank Slip'
    },
    description: {
      es: 'Paga con boleto bancário',
      pt: 'Pague com boleto bancário',
      en: 'Pay with bank slip'
    },
    icon: 'boleto',
    processingTime: '1-3 days',
    fees: {
      fixed: 3.5,
      currency: 'BRL'
    },
    limits: {
      min: 5,
      max: 50000,
      currency: 'BRL'
    },
    supportedCurrencies: ['BRL'],
    countries: ['BR'],
    isActive: true,
    priority: 3,
    metadata: {
      stripeEnabled: true,
      requiresPDF: true,
      expirationDays: 3
    }
  },
  
  paypal: {
    type: 'paypal',
    name: 'PayPal',
    displayName: {
      es: 'PayPal',
      pt: 'PayPal',
      en: 'PayPal'
    },
    description: {
      es: 'Paga con tu cuenta de PayPal',
      pt: 'Pague com sua conta PayPal',
      en: 'Pay with your PayPal account'
    },
    icon: 'paypal',
    processingTime: 'instant',
    fees: {
      percentage: 3.4,
      fixed: 0.30,
      currency: 'USD'
    },
    limits: {
      min: 1,
      max: 10000,
      currency: 'USD'
    },
    supportedCurrencies: ['USD', 'MXN', 'BRL'],
    countries: ['MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR', 'US'],
    isActive: true,
    priority: 4,
    metadata: {
      stripeEnabled: false,
      requiresAccount: true,
      externalProvider: true
    }
  }
}

// Country-specific payment method availability
const COUNTRY_PAYMENT_METHODS: Record<CountryCode, PaymentMethodType[]> = {
  MX: ['card', 'oxxo', 'spei', 'paypal'],
  CO: ['card', 'pse', 'efecty', 'paypal'],
  AR: ['card', 'mercadopago', 'rapipago', 'paypal'],
  CL: ['card', 'webpay', 'paypal'],
  PE: ['card', 'pagoefectivo', 'paypal'],
  EC: ['card', 'paypal'],
  BR: ['card', 'pix', 'boleto', 'paypal'],
  US: ['card', 'paypal'],
  UNKNOWN: ['card', 'paypal']
}

/**
 * Payment Method Selection Service
 * Manages payment method availability and selection logic
 */
export class PaymentMethodService {
  
  /**
   * Get available payment methods for a specific country
   */
  getAvailableMethodsForCountry(country: CountryCode): PaymentMethod[] {
    const methodTypes = COUNTRY_PAYMENT_METHODS[country] || COUNTRY_PAYMENT_METHODS.UNKNOWN
    
    return methodTypes
      .map(type => PAYMENT_METHOD_CONFIGS[type])
      .filter(method => method.isActive && method.countries.includes(country))
      .sort((a, b) => a.priority - b.priority)
  }

  /**
   * Get payment method configuration by type
   */
  getPaymentMethod(type: PaymentMethodType): PaymentMethod | null {
    return PAYMENT_METHOD_CONFIGS[type] || null
  }

  /**
   * Validate if payment method is available for country
   */
  validatePaymentMethod(method: PaymentMethod, country: CountryCode): boolean {
    return method.countries.includes(country) && 
           method.isActive &&
           COUNTRY_PAYMENT_METHODS[country]?.includes(method.type)
  }

  /**
   * Validate payment amount against method limits
   */
  validateAmount(amount: number, currency: CurrencyCode, method: PaymentMethod): boolean {
    // Check if currency is supported
    if (!method.supportedCurrencies.includes(currency)) {
      return false
    }

    // Convert limits to target currency if needed
    const limits = method.limits
    if (limits.currency === currency) {
      return amount >= limits.min && amount <= limits.max
    }

    // For different currencies, we'd need currency conversion
    // For now, assume USD as base and apply basic conversion
    // In production, this should use the currency service
    return amount >= 1 && amount <= 10000
  }

  /**
   * Get recommended payment method for country and amount
   */
  getRecommendedMethod(
    country: CountryCode, 
    amount: number, 
    currency: CurrencyCode
  ): PaymentMethod | null {
    const availableMethods = this.getAvailableMethodsForCountry(country)
    
    // Find the highest priority method that supports the amount
    for (const method of availableMethods) {
      if (this.validateAmount(amount, currency, method)) {
        return method
      }
    }

    return null
  }

  /**
   * Get fallback payment methods (international options)
   */
  getFallbackMethods(): PaymentMethod[] {
    return [
      PAYMENT_METHOD_CONFIGS.card,
      PAYMENT_METHOD_CONFIGS.paypal
    ].filter(method => method.isActive)
  }

  /**
   * Calculate payment fees for a method and amount
   */
  calculateFees(method: PaymentMethod, amount: number, currency: CurrencyCode): number {
    const fees = method.fees
    let totalFee = 0

    if (fees.fixed) {
      // Convert fixed fee to target currency if needed
      if (fees.currency === currency) {
        totalFee += fees.fixed
      } else {
        // In production, use currency service for conversion
        totalFee += fees.fixed // Simplified for now
      }
    }

    if (fees.percentage) {
      totalFee += (amount * fees.percentage) / 100
    }

    return Math.round(totalFee * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Get required fields for a payment method
   */
  getRequiredFields(methodType: PaymentMethodType): string[] {
    const fieldMap: Record<PaymentMethodType, string[]> = {
      card: ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'],
      oxxo: ['customerName', 'customerEmail'],
      spei: ['customerName', 'customerEmail', 'bankAccount'],
      pse: ['customerName', 'customerEmail', 'bankCode'],
      efecty: ['customerName', 'customerEmail', 'documentNumber'],
      mercadopago: ['customerEmail'],
      rapipago: ['customerName', 'customerEmail', 'documentNumber'],
      webpay: ['customerName', 'customerEmail'],
      pagoefectivo: ['customerName', 'customerEmail', 'documentNumber'],
      pix: ['customerName', 'customerEmail', 'documentNumber'],
      boleto: ['customerName', 'customerEmail', 'documentNumber', 'address'],
      paypal: ['customerEmail']
    }

    return fieldMap[methodType] || []
  }

  /**
   * Check if method requires external redirect
   */
  requiresExternalRedirect(methodType: PaymentMethodType): boolean {
    const method = PAYMENT_METHOD_CONFIGS[methodType]
    return method?.metadata?.requiresRedirect === true || 
           method?.metadata?.externalProvider === true
  }

  /**
   * Get processing time estimate for method
   */
  getProcessingTime(methodType: PaymentMethodType): string {
    return PAYMENT_METHOD_CONFIGS[methodType]?.processingTime || 'unknown'
  }

  /**
   * Get all supported payment method types
   */
  getAllSupportedMethods(): PaymentMethodType[] {
    return Object.keys(PAYMENT_METHOD_CONFIGS) as PaymentMethodType[]
  }

  /**
   * Update payment method configuration (for admin use)
   */
  updatePaymentMethod(type: PaymentMethodType, updates: Partial<PaymentMethod>): boolean {
    const method = PAYMENT_METHOD_CONFIGS[type]
    if (!method) {
      return false
    }

    Object.assign(method, updates)
    return true
  }

  /**
   * Enable/disable payment method
   */
  setPaymentMethodStatus(type: PaymentMethodType, isActive: boolean): boolean {
    const method = PAYMENT_METHOD_CONFIGS[type]
    if (!method) {
      return false
    }

    method.isActive = isActive
    return true
  }
}

// Export singleton instance
export const paymentMethodService = new PaymentMethodService()

// Export utility functions
export function getPaymentMethodIcon(type: PaymentMethodType): string {
  return PAYMENT_METHOD_CONFIGS[type]?.icon || 'payment'
}

export function getPaymentMethodDisplayName(
  type: PaymentMethodType, 
  language: string = 'es'
): string {
  const method = PAYMENT_METHOD_CONFIGS[type]
  return method?.displayName[language] || method?.displayName['es'] || method?.name || type
}

export function isStripeSupported(type: PaymentMethodType): boolean {
  return PAYMENT_METHOD_CONFIGS[type]?.metadata?.stripeEnabled === true
}

export function getPaymentMethodsByCountry(country: CountryCode): PaymentMethodType[] {
  return COUNTRY_PAYMENT_METHODS[country] || COUNTRY_PAYMENT_METHODS.UNKNOWN
}