import { PaymentAdapter, PaymentMethod, PaymentResult, PaymentMethodType } from '../payment-adapter'
import { CountryCode, CurrencyCode } from '../../app/lib/geo-detection'

/**
 * Base Payment Adapter
 * Provides common functionality for all payment adapters
 */
export abstract class BasePaymentAdapter implements PaymentAdapter {
  abstract readonly name: string
  abstract readonly supportedMethods: PaymentMethodType[]
  abstract readonly supportedCountries: CountryCode[]

  /**
   * Process payment - must be implemented by concrete adapters
   */
  abstract processPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata?: Record<string, any>
  ): Promise<PaymentResult>

  /**
   * Validate payment method for country
   */
  validatePaymentMethod(method: PaymentMethod, country: CountryCode): boolean {
    return this.supportedMethods.includes(method.type) &&
           this.supportedCountries.includes(country) &&
           method.countries.includes(country) &&
           method.isActive
  }

  /**
   * Validate payment amount
   */
  validateAmount(amount: number, currency: CurrencyCode, method: PaymentMethod): boolean {
    if (amount <= 0) {
      return false
    }

    if (!method.supportedCurrencies.includes(currency)) {
      return false
    }

    // Check against method limits
    const limits = method.limits
    if (limits.currency === currency) {
      return amount >= limits.min && amount <= limits.max
    }

    // For different currencies, apply basic validation
    // In production, this should use currency conversion
    return amount >= 1 && amount <= 100000
  }

  /**
   * Check if adapter is available for country
   */
  isAvailable(country: CountryCode): boolean {
    return this.supportedCountries.includes(country)
  }

  /**
   * Get required fields for payment method
   */
  getRequiredFields(method: PaymentMethodType): string[] {
    const fieldMap: Record<PaymentMethodType, string[]> = {
      card: ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'],
      oxxo: ['customerName', 'customerEmail'],
      spei: ['customerName', 'customerEmail'],
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

    return fieldMap[method] || []
  }

  /**
   * Create standardized error result
   */
  protected createErrorResult(
    method: PaymentMethodType,
    amount: number,
    currency: CurrencyCode,
    errorCode: string,
    errorMessage: string
  ): PaymentResult {
    return {
      success: false,
      paymentMethodUsed: method,
      amount,
      currency,
      status: 'failed',
      errorCode,
      errorMessage
    }
  }

  /**
   * Create standardized success result
   */
  protected createSuccessResult(
    method: PaymentMethodType,
    amount: number,
    currency: CurrencyCode,
    transactionId: string,
    status: 'pending' | 'completed' = 'completed',
    redirectUrl?: string,
    metadata?: Record<string, any>
  ): PaymentResult {
    return {
      success: true,
      transactionId,
      paymentMethodUsed: method,
      amount,
      currency,
      status,
      redirectUrl,
      metadata
    }
  }

  /**
   * Validate required metadata fields
   */
  protected validateMetadata(metadata: Record<string, any>, requiredFields: string[]): boolean {
    return requiredFields.every(field => metadata && metadata[field] !== undefined)
  }

  /**
   * Generate unique transaction ID
   */
  protected generateTransactionId(prefix: string = 'txn'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `${prefix}_${timestamp}_${random}`
  }

  /**
   * Log payment attempt for monitoring
   */
  protected logPaymentAttempt(
    method: PaymentMethodType,
    amount: number,
    currency: CurrencyCode,
    success: boolean,
    errorCode?: string
  ): void {
    const logData = {
      adapter: this.name,
      method,
      amount,
      currency,
      success,
      errorCode,
      timestamp: new Date().toISOString()
    }

    console.log('Payment attempt:', logData)
    
    // In production, send to monitoring service
    // monitoringService.logPaymentAttempt(logData)
  }
}