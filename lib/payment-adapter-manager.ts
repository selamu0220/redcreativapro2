import { PaymentAdapter, PaymentMethod, PaymentResult, PaymentMethodType, paymentMethodService } from './payment-adapter'
import { CountryCode, CurrencyCode } from '../app/lib/geo-detection'
import { StripePaymentAdapter } from './payment-adapters/stripe-adapter'
import { ExternalPaymentAdapter } from './payment-adapters/external-adapter'

// Payment adapter selection strategy
export type AdapterSelectionStrategy = 'priority' | 'cost' | 'reliability' | 'speed'

// Payment processing options
export interface PaymentProcessingOptions {
  country: CountryCode
  currency: CurrencyCode
  amount: number
  preferredMethods?: PaymentMethodType[]
  fallbackToInternational?: boolean
  strategy?: AdapterSelectionStrategy
  metadata?: Record<string, any>
}

// Payment processing result with adapter info
export interface PaymentProcessingResult extends PaymentResult {
  adapterUsed: string
  availableAlternatives: PaymentMethod[]
  processingTime: number
}

/**
 * Payment Adapter Manager
 * Coordinates between different payment adapters and provides unified payment processing
 */
export class PaymentAdapterManager {
  private adapters: Map<string, PaymentAdapter>
  private adapterPriority: string[]

  constructor() {
    this.adapters = new Map()
    this.adapterPriority = ['stripe', 'external'] // Stripe first, then external providers

    this.initializeAdapters()
  }

  /**
   * Initialize payment adapters
   */
  private initializeAdapters(): void {
    try {
      // Initialize Stripe adapter
      try {
        const stripeAdapter = new StripePaymentAdapter()
        this.adapters.set('stripe', stripeAdapter)
      } catch (error) {
        console.warn('Stripe adapter initialization failed (optional):', error)
      }

      // Initialize external adapter
      try {
        const externalAdapter = new ExternalPaymentAdapter()
        this.adapters.set('external', externalAdapter)
      } catch (error) {
        console.warn('External adapter initialization failed (optional):', error)
      }

      console.log('Payment adapters initialized successfully (partial)')
    } catch (error) {
      console.error('Failed to initialize payment adapters system:', error)
      // Do not throw, allow app to start with limited payment functionality
    }
  }

  /**
   * Get available payment methods for country and amount
   */
  getAvailablePaymentMethods(options: PaymentProcessingOptions): PaymentMethod[] {
    const { country, currency, amount, preferredMethods } = options

    // Get base methods for country
    let availableMethods = paymentMethodService.getAvailableMethodsForCountry(country)

    // Filter by preferred methods if specified
    if (preferredMethods && preferredMethods.length > 0) {
      availableMethods = availableMethods.filter(method =>
        preferredMethods.includes(method.type)
      )
    }

    // Filter by amount limits and currency support
    availableMethods = availableMethods.filter(method => {
      const adapter = this.getAdapterForMethod(method.type)
      return adapter &&
        adapter.validateAmount(amount, currency, method) &&
        method.supportedCurrencies.includes(currency)
    })

    // Add fallback methods if enabled
    if (options.fallbackToInternational !== false) {
      const fallbackMethods = paymentMethodService.getFallbackMethods()
      availableMethods.push(...fallbackMethods.filter(method =>
        !availableMethods.some(existing => existing.type === method.type)
      ))
    }

    return availableMethods
  }

  /**
   * Process payment with automatic adapter selection
   */
  async processPayment(
    paymentMethod: PaymentMethod,
    options: PaymentProcessingOptions
  ): Promise<PaymentProcessingResult> {
    const startTime = Date.now()

    try {
      // Validate payment method availability
      const availableMethods = this.getAvailablePaymentMethods(options)
      const isMethodAvailable = availableMethods.some(method => method.type === paymentMethod.type)

      if (!isMethodAvailable) {
        return this.createErrorResult(
          paymentMethod,
          options,
          'METHOD_NOT_AVAILABLE',
          'Payment method not available for this country/amount',
          availableMethods,
          startTime
        )
      }

      // Get appropriate adapter for payment method
      const adapter = this.getAdapterForMethod(paymentMethod.type)
      if (!adapter) {
        return this.createErrorResult(
          paymentMethod,
          options,
          'NO_ADAPTER',
          'No payment adapter available for this method',
          availableMethods,
          startTime
        )
      }

      // Validate adapter availability for country
      if (!adapter.isAvailable(options.country)) {
        return this.createErrorResult(
          paymentMethod,
          options,
          'ADAPTER_NOT_AVAILABLE',
          'Payment adapter not available for this country',
          availableMethods,
          startTime
        )
      }

      // Process payment through adapter
      const result = await adapter.processPayment(
        paymentMethod,
        options.amount,
        options.currency,
        options.metadata
      )

      // Return enhanced result
      return {
        ...result,
        adapterUsed: adapter.name,
        availableAlternatives: availableMethods.filter(method => method.type !== paymentMethod.type),
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      console.error('Payment processing error:', error)

      const availableMethods = this.getAvailablePaymentMethods(options)
      return this.createErrorResult(
        paymentMethod,
        options,
        'PROCESSING_ERROR',
        error instanceof Error ? error.message : 'Unknown error',
        availableMethods,
        startTime
      )
    }
  }

  /**
   * Process payment with fallback strategy
   */
  async processPaymentWithFallback(
    preferredMethod: PaymentMethod,
    options: PaymentProcessingOptions
  ): Promise<PaymentProcessingResult> {
    // Try preferred method first
    let result = await this.processPayment(preferredMethod, options)

    if (result.success) {
      return result
    }

    // If preferred method fails, try alternatives
    const availableMethods = this.getAvailablePaymentMethods(options)
    const alternatives = availableMethods.filter(method =>
      method.type !== preferredMethod.type &&
      method.priority <= preferredMethod.priority + 2 // Only try similar priority methods
    )

    for (const alternativeMethod of alternatives) {
      console.log(`Trying fallback payment method: ${alternativeMethod.type}`)

      result = await this.processPayment(alternativeMethod, options)

      if (result.success) {
        // Add fallback information to metadata
        result.metadata = {
          ...result.metadata,
          fallbackUsed: true,
          originalMethod: preferredMethod.type,
          fallbackMethod: alternativeMethod.type
        }
        return result
      }
    }

    // If all methods fail, return the last error
    return result
  }

  /**
   * Get recommended payment method for options
   */
  getRecommendedPaymentMethod(options: PaymentProcessingOptions): PaymentMethod | null {
    const availableMethods = this.getAvailablePaymentMethods(options)

    if (availableMethods.length === 0) {
      return null
    }

    // Apply selection strategy
    switch (options.strategy) {
      case 'cost':
        return this.selectByCost(availableMethods, options.amount, options.currency)

      case 'speed':
        return this.selectBySpeed(availableMethods)

      case 'reliability':
        return this.selectByReliability(availableMethods)

      case 'priority':
      default:
        return availableMethods[0] // Already sorted by priority
    }
  }

  /**
   * Get adapter for specific payment method
   */
  private getAdapterForMethod(methodType: PaymentMethodType): PaymentAdapter | null {
    // Check each adapter in priority order
    for (const adapterName of this.adapterPriority) {
      const adapter = this.adapters.get(adapterName)
      if (adapter && adapter.supportedMethods.includes(methodType)) {
        return adapter
      }
    }

    return null
  }

  /**
   * Select payment method by cost (lowest fees)
   */
  private selectByCost(methods: PaymentMethod[], amount: number, currency: CurrencyCode): PaymentMethod {
    return methods.reduce((best, current) => {
      const bestFee = this.calculateMethodFee(best, amount, currency)
      const currentFee = this.calculateMethodFee(current, amount, currency)
      return currentFee < bestFee ? current : best
    })
  }

  /**
   * Select payment method by speed (fastest processing)
   */
  private selectBySpeed(methods: PaymentMethod[]): PaymentMethod {
    const speedOrder = ['instant', '1-2 days', '1-3 days', 'unknown']

    return methods.reduce((best, current) => {
      const bestSpeed = speedOrder.indexOf(best.processingTime)
      const currentSpeed = speedOrder.indexOf(current.processingTime)
      return currentSpeed < bestSpeed ? current : best
    })
  }

  /**
   * Select payment method by reliability (card > digital wallets > cash)
   */
  private selectByReliability(methods: PaymentMethod[]): PaymentMethod {
    const reliabilityOrder: PaymentMethodType[] = [
      'card', 'pix', 'pse', 'spei', 'paypal', 'mercadopago', 'webpay',
      'oxxo', 'boleto', 'pagoefectivo', 'efecty', 'rapipago'
    ]

    return methods.reduce((best, current) => {
      const bestReliability = reliabilityOrder.indexOf(best.type)
      const currentReliability = reliabilityOrder.indexOf(current.type)
      return currentReliability < bestReliability ? current : best
    })
  }

  /**
   * Calculate fee for payment method
   */
  private calculateMethodFee(method: PaymentMethod, amount: number, currency: CurrencyCode): number {
    return paymentMethodService.calculateFees(method, amount, currency)
  }

  /**
   * Create error result
   */
  private createErrorResult(
    paymentMethod: PaymentMethod,
    options: PaymentProcessingOptions,
    errorCode: string,
    errorMessage: string,
    availableAlternatives: PaymentMethod[],
    startTime: number
  ): PaymentProcessingResult {
    return {
      success: false,
      paymentMethodUsed: paymentMethod.type,
      amount: options.amount,
      currency: options.currency,
      status: 'failed',
      errorCode,
      errorMessage,
      adapterUsed: 'none',
      availableAlternatives,
      processingTime: Date.now() - startTime
    }
  }

  /**
   * Get adapter statistics
   */
  getAdapterStatistics(): Record<string, any> {
    const stats: Record<string, any> = {}

    for (const [name, adapter] of this.adapters) {
      stats[name] = {
        supportedMethods: adapter.supportedMethods,
        supportedCountries: adapter.supportedCountries,
        isInitialized: true
      }
    }

    return stats
  }

  /**
   * Health check for all adapters
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {}

    for (const [name, adapter] of this.adapters) {
      try {
        // Basic availability check
        health[name] = adapter.supportedMethods.length > 0
      } catch (error) {
        console.error(`Health check failed for adapter ${name}:`, error)
        health[name] = false
      }
    }

    return health
  }

  /**
   * Add custom adapter
   */
  addAdapter(name: string, adapter: PaymentAdapter, priority?: number): void {
    this.adapters.set(name, adapter)

    if (priority !== undefined) {
      // Insert at specific priority position
      this.adapterPriority.splice(priority, 0, name)
    } else {
      // Add at end
      this.adapterPriority.push(name)
    }
  }

  /**
   * Remove adapter
   */
  removeAdapter(name: string): boolean {
    const removed = this.adapters.delete(name)
    if (removed) {
      const index = this.adapterPriority.indexOf(name)
      if (index > -1) {
        this.adapterPriority.splice(index, 1)
      }
    }
    return removed
  }
}

// Export singleton instance
export const paymentAdapterManager = new PaymentAdapterManager()

// Export utility functions
export function getPaymentMethodsForCountry(country: CountryCode): PaymentMethod[] {
  return paymentAdapterManager.getAvailablePaymentMethods({
    country,
    currency: 'USD', // Default currency for method availability
    amount: 100 // Default amount for method availability
  })
}

export function isPaymentMethodSupported(
  methodType: PaymentMethodType,
  country: CountryCode
): boolean {
  const methods = getPaymentMethodsForCountry(country)
  return methods.some(method => method.type === methodType)
}