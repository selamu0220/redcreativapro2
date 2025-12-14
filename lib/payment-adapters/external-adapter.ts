import { BasePaymentAdapter } from './base-adapter'
import { PaymentMethod, PaymentResult, PaymentMethodType } from '../payment-adapter'
import { CountryCode, CurrencyCode } from '../../app/lib/geo-detection'

/**
 * External Payment Adapter
 * Handles payment methods that require external providers (Mercado Pago, Webpay, etc.)
 */
export class ExternalPaymentAdapter extends BasePaymentAdapter {
  readonly name = 'external'
  readonly supportedMethods: PaymentMethodType[] = [
    'mercadopago',
    'rapipago',
    'webpay',
    'pagoefectivo',
    'efecty',
    'paypal'
  ]
  readonly supportedCountries: CountryCode[] = [
    'MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR', 'US'
  ]

  /**
   * Process payment using external providers
   */
  async processPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata?: Record<string, any>
  ): Promise<PaymentResult> {
    try {
      // Validate inputs
      if (!this.validatePaymentMethod(method, metadata?.country)) {
        return this.createErrorResult(
          method.type,
          amount,
          currency,
          'INVALID_METHOD',
          'Payment method not supported for this country'
        )
      }

      if (!this.validateAmount(amount, currency, method)) {
        return this.createErrorResult(
          method.type,
          amount,
          currency,
          'INVALID_AMOUNT',
          'Amount is outside allowed limits'
        )
      }

      // Validate required metadata
      const requiredFields = this.getRequiredMetadataFields(method.type)
      if (!this.validateMetadata(metadata || {}, requiredFields)) {
        return this.createErrorResult(
          method.type,
          amount,
          currency,
          'MISSING_METADATA',
          `Required fields missing: ${requiredFields.join(', ')}`
        )
      }

      // Process based on payment method type
      const result = await this.processExternalPayment(method, amount, currency, metadata!)
      
      this.logPaymentAttempt(method.type, amount, currency, result.success, result.errorCode)
      return result

    } catch (error) {
      console.error('External payment processing error:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const result = this.createErrorResult(
        method.type,
        amount,
        currency,
        'PROCESSING_ERROR',
        errorMessage
      )
      
      this.logPaymentAttempt(method.type, amount, currency, false, 'PROCESSING_ERROR')
      return result
    }
  }

  /**
   * Process payment through external providers
   */
  private async processExternalPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    switch (method.type) {
      case 'mercadopago':
        return this.processMercadoPagoPayment(method, amount, currency, metadata)
      
      case 'rapipago':
        return this.processRapipagoPayment(method, amount, currency, metadata)
      
      case 'webpay':
        return this.processWebpayPayment(method, amount, currency, metadata)
      
      case 'pagoefectivo':
        return this.processPagoEfectivoPayment(method, amount, currency, metadata)
      
      case 'efecty':
        return this.processEfectyPayment(method, amount, currency, metadata)
      
      case 'paypal':
        return this.processPayPalPayment(method, amount, currency, metadata)
      
      default:
        return this.createErrorResult(
          method.type,
          amount,
          currency,
          'UNSUPPORTED_METHOD',
          'Payment method not supported by external adapter'
        )
    }
  }

  /**
   * Process Mercado Pago payment (Argentina)
   */
  private async processMercadoPagoPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    // In production, integrate with Mercado Pago API
    // For now, simulate the process
    
    const transactionId = this.generateTransactionId('mp')
    const redirectUrl = this.generateMercadoPagoUrl(transactionId, amount, currency, metadata)

    return this.createSuccessResult(
      method.type,
      amount,
      currency,
      transactionId,
      'pending',
      redirectUrl,
      {
        provider: 'mercadopago',
        externalTransactionId: transactionId,
        requiresRedirect: true
      }
    )
  }

  /**
   * Process Rapipago payment (Argentina)
   */
  private async processRapipagoPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    // Generate voucher for cash payment
    const transactionId = this.generateTransactionId('rp')
    const voucherData = this.generateRapipagoVoucher(transactionId, amount, currency, metadata)

    return this.createSuccessResult(
      method.type,
      amount,
      currency,
      transactionId,
      'pending',
      undefined,
      {
        provider: 'rapipago',
        voucher: voucherData,
        expirationHours: 72,
        requiresVoucher: true
      }
    )
  }

  /**
   * Process Webpay payment (Chile)
   */
  private async processWebpayPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    // In production, integrate with Transbank Webpay API
    const transactionId = this.generateTransactionId('wp')
    const redirectUrl = this.generateWebpayUrl(transactionId, amount, currency, metadata)

    return this.createSuccessResult(
      method.type,
      amount,
      currency,
      transactionId,
      'pending',
      redirectUrl,
      {
        provider: 'webpay',
        externalTransactionId: transactionId,
        requiresRedirect: true
      }
    )
  }

  /**
   * Process PagoEfectivo payment (Peru)
   */
  private async processPagoEfectivoPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    // Generate voucher for cash payment
    const transactionId = this.generateTransactionId('pe')
    const voucherData = this.generatePagoEfectivoVoucher(transactionId, amount, currency, metadata)

    return this.createSuccessResult(
      method.type,
      amount,
      currency,
      transactionId,
      'pending',
      undefined,
      {
        provider: 'pagoefectivo',
        voucher: voucherData,
        expirationHours: 48,
        requiresVoucher: true
      }
    )
  }

  /**
   * Process Efecty payment (Colombia)
   */
  private async processEfectyPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    // Generate voucher for cash payment
    const transactionId = this.generateTransactionId('ef')
    const voucherData = this.generateEfectyVoucher(transactionId, amount, currency, metadata)

    return this.createSuccessResult(
      method.type,
      amount,
      currency,
      transactionId,
      'pending',
      undefined,
      {
        provider: 'efecty',
        voucher: voucherData,
        expirationHours: 48,
        requiresVoucher: true
      }
    )
  }

  /**
   * Process PayPal payment (International)
   */
  private async processPayPalPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    // In production, integrate with PayPal API
    const transactionId = this.generateTransactionId('pp')
    const redirectUrl = this.generatePayPalUrl(transactionId, amount, currency, metadata)

    return this.createSuccessResult(
      method.type,
      amount,
      currency,
      transactionId,
      'pending',
      redirectUrl,
      {
        provider: 'paypal',
        externalTransactionId: transactionId,
        requiresRedirect: true
      }
    )
  }

  /**
   * Get required metadata fields for each payment method
   */
  private getRequiredMetadataFields(methodType: PaymentMethodType): string[] {
    const fieldMap: Record<PaymentMethodType, string[]> = {
      mercadopago: ['customerEmail', 'country'],
      rapipago: ['customerName', 'customerEmail', 'documentNumber', 'country'],
      webpay: ['customerName', 'customerEmail', 'country'],
      pagoefectivo: ['customerName', 'customerEmail', 'documentNumber', 'country'],
      efecty: ['customerName', 'customerEmail', 'documentNumber', 'country'],
      paypal: ['customerEmail', 'country'],
      // Other methods not supported by this adapter
      card: [],
      oxxo: [],
      spei: [],
      pse: [],
      pix: [],
      boleto: []
    }

    return fieldMap[methodType] || []
  }

  /**
   * Generate Mercado Pago redirect URL
   */
  private generateMercadoPagoUrl(
    transactionId: string,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): string {
    // In production, use actual Mercado Pago API to create preference
    const baseUrl = 'https://www.mercadopago.com.ar/checkout/v1/redirect'
    const params = new URLSearchParams({
      pref_id: transactionId,
      amount: amount.toString(),
      currency: currency,
      email: metadata.customerEmail
    })
    
    return `${baseUrl}?${params.toString()}`
  }

  /**
   * Generate Rapipago voucher data
   */
  private generateRapipagoVoucher(
    transactionId: string,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Record<string, any> {
    return {
      voucherNumber: transactionId,
      barcode: `*${transactionId}*`,
      amount: amount,
      currency: currency,
      customerName: metadata.customerName,
      customerDocument: metadata.documentNumber,
      expirationDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      instructions: {
        es: 'Presenta este código en cualquier local Rapipago para completar tu pago',
        en: 'Present this code at any Rapipago location to complete your payment'
      }
    }
  }

  /**
   * Generate Webpay redirect URL
   */
  private generateWebpayUrl(
    transactionId: string,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): string {
    // In production, use actual Transbank Webpay API
    const baseUrl = 'https://webpay3gint.transbank.cl/webpayserver/initTransaction'
    const params = new URLSearchParams({
      TBK_ORDEN_COMPRA: transactionId,
      TBK_MONTO: Math.round(amount).toString(),
      TBK_ID_SESION: transactionId
    })
    
    return `${baseUrl}?${params.toString()}`
  }

  /**
   * Generate PagoEfectivo voucher data
   */
  private generatePagoEfectivoVoucher(
    transactionId: string,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Record<string, any> {
    return {
      voucherNumber: transactionId,
      cip: transactionId.substr(-8), // Last 8 digits as CIP
      amount: amount,
      currency: currency,
      customerName: metadata.customerName,
      customerDocument: metadata.documentNumber,
      expirationDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      instructions: {
        es: 'Presenta este CIP en cualquier agente PagoEfectivo para completar tu pago',
        en: 'Present this CIP at any PagoEfectivo agent to complete your payment'
      }
    }
  }

  /**
   * Generate Efecty voucher data
   */
  private generateEfectyVoucher(
    transactionId: string,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Record<string, any> {
    return {
      voucherNumber: transactionId,
      referenceCode: transactionId.substr(-10), // Last 10 digits as reference
      amount: amount,
      currency: currency,
      customerName: metadata.customerName,
      customerDocument: metadata.documentNumber,
      expirationDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      instructions: {
        es: 'Presenta este código de referencia en cualquier punto Efecty para completar tu pago',
        en: 'Present this reference code at any Efecty location to complete your payment'
      }
    }
  }

  /**
   * Generate PayPal redirect URL
   */
  private generatePayPalUrl(
    transactionId: string,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): string {
    // In production, use actual PayPal API to create payment
    const baseUrl = 'https://www.paypal.com/cgi-bin/webscr'
    const params = new URLSearchParams({
      cmd: '_xclick',
      business: process.env.PAYPAL_BUSINESS_EMAIL || 'business@example.com',
      item_name: 'Subscription Payment',
      amount: amount.toString(),
      currency_code: currency,
      custom: transactionId,
      return: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id=${transactionId}`,
      cancel_return: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`
    })
    
    return `${baseUrl}?${params.toString()}`
  }

  /**
   * Check payment status for external providers
   */
  async getPaymentStatus(transactionId: string, provider: string): Promise<{
    status: string
    amount?: number
    currency?: string
  }> {
    // In production, check status with respective provider APIs
    // For now, return pending status
    return {
      status: 'pending'
    }
  }

  /**
   * Cancel external payment
   */
  async cancelPayment(transactionId: string, provider: string): Promise<boolean> {
    // In production, cancel with respective provider APIs
    console.log(`Cancelling payment ${transactionId} with provider ${provider}`)
    return true
  }
}