import Stripe from 'stripe'
import { BasePaymentAdapter } from './base-adapter'
import { PaymentMethod, PaymentResult, PaymentMethodType } from '../payment-adapter'
import { CountryCode, CurrencyCode } from '../../app/lib/geo-detection'

/**
 * Stripe Payment Adapter
 * Handles Stripe-supported payment methods including regional options
 */
export class StripePaymentAdapter extends BasePaymentAdapter {
  readonly name = 'stripe'
  readonly supportedMethods: PaymentMethodType[] = [
    'card',
    'oxxo',
    'spei', 
    'pse',
    'pix',
    'boleto'
  ]
  readonly supportedCountries: CountryCode[] = [
    'MX', 'CO', 'BR', 'AR', 'CL', 'PE', 'EC', 'US'
  ]

  private stripe: Stripe

  constructor() {
    super()
    
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required')
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil'
    })
  }

  /**
   * Process payment using Stripe
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
      const result = await this.processStripePayment(method, amount, currency, metadata!)
      
      this.logPaymentAttempt(method.type, amount, currency, result.success, result.errorCode)
      return result

    } catch (error) {
      console.error('Stripe payment processing error:', error)
      
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
   * Process payment through Stripe based on method type
   */
  private async processStripePayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    switch (method.type) {
      case 'card':
        return this.processCardPayment(method, amount, currency, metadata)
      
      case 'oxxo':
        return this.processOxxoPayment(method, amount, currency, metadata)
      
      case 'spei':
        return this.processSpeiPayment(method, amount, currency, metadata)
      
      case 'pse':
        return this.processPsePayment(method, amount, currency, metadata)
      
      case 'pix':
        return this.processPixPayment(method, amount, currency, metadata)
      
      case 'boleto':
        return this.processBoletoPayment(method, amount, currency, metadata)
      
      default:
        return this.createErrorResult(
          method.type,
          amount,
          currency,
          'UNSUPPORTED_METHOD',
          'Payment method not supported by Stripe adapter'
        )
    }
  }

  /**
   * Process card payment
   */
  private async processCardPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    // Create payment intent for card payment
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
      metadata: {
        paymentMethod: method.type,
        customerEmail: metadata.customerEmail,
        country: metadata.country
      }
    })

    return this.createSuccessResult(
      method.type,
      amount,
      currency,
      paymentIntent.id,
      'pending',
      undefined,
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    )
  }

  /**
   * Process OXXO payment (Mexico)
   */
  private async processOxxoPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      payment_method_types: ['oxxo'],
      metadata: {
        paymentMethod: method.type,
        customerEmail: metadata.customerEmail,
        customerName: metadata.customerName,
        country: metadata.country
      }
    })

    return this.createSuccessResult(
      method.type,
      amount,
      currency,
      paymentIntent.id,
      'pending',
      undefined,
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        expirationHours: 72
      }
    )
  }

  /**
   * Process SPEI payment (Mexico)
   */
  private async processSpeiPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      payment_method_types: ['spei'],
      metadata: {
        paymentMethod: method.type,
        customerEmail: metadata.customerEmail,
        customerName: metadata.customerName,
        country: metadata.country
      }
    })

    return this.createSuccessResult(
      method.type,
      amount,
      currency,
      paymentIntent.id,
      'pending',
      undefined,
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    )
  }

  /**
   * Process PSE payment (Colombia)
   */
  private async processPsePayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      payment_method_types: ['pse'],
      metadata: {
        paymentMethod: method.type,
        customerEmail: metadata.customerEmail,
        customerName: metadata.customerName,
        country: metadata.country
      }
    })

    return this.createSuccessResult(
      method.type,
      amount,
      currency,
      paymentIntent.id,
      'pending',
      undefined,
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        requiresBankSelection: true
      }
    )
  }

  /**
   * Process PIX payment (Brazil)
   */
  private async processPixPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      payment_method_types: ['pix'],
      metadata: {
        paymentMethod: method.type,
        customerEmail: metadata.customerEmail,
        customerName: metadata.customerName,
        documentNumber: metadata.documentNumber,
        country: metadata.country
      }
    })

    return this.createSuccessResult(
      method.type,
      amount,
      currency,
      paymentIntent.id,
      'pending',
      undefined,
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        expirationMinutes: 30
      }
    )
  }

  /**
   * Process Boleto payment (Brazil)
   */
  private async processBoletoPayment(
    method: PaymentMethod,
    amount: number,
    currency: CurrencyCode,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      payment_method_types: ['boleto'],
      metadata: {
        paymentMethod: method.type,
        customerEmail: metadata.customerEmail,
        customerName: metadata.customerName,
        documentNumber: metadata.documentNumber,
        country: metadata.country
      }
    })

    return this.createSuccessResult(
      method.type,
      amount,
      currency,
      paymentIntent.id,
      'pending',
      undefined,
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        expirationDays: 3
      }
    )
  }

  /**
   * Get required metadata fields for each payment method
   */
  private getRequiredMetadataFields(methodType: PaymentMethodType): string[] {
    const fieldMap: Record<PaymentMethodType, string[]> = {
      card: ['customerEmail', 'country'],
      oxxo: ['customerEmail', 'customerName', 'country'],
      spei: ['customerEmail', 'customerName', 'country'],
      pse: ['customerEmail', 'customerName', 'country'],
      pix: ['customerEmail', 'customerName', 'documentNumber', 'country'],
      boleto: ['customerEmail', 'customerName', 'documentNumber', 'country'],
      // Other methods not supported by this adapter
      efecty: [],
      mercadopago: [],
      rapipago: [],
      webpay: [],
      pagoefectivo: [],
      paypal: []
    }

    return fieldMap[methodType] || []
  }

  /**
   * Create Stripe customer if needed
   */
  private async createOrGetCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    // Check if customer already exists
    const existingCustomers = await this.stripe.customers.list({
      email: email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0]
    }

    // Create new customer
    return await this.stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        createdAt: new Date().toISOString()
      }
    })
  }

  /**
   * Retrieve payment intent status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<{
    status: string
    amount: number
    currency: string
    paymentMethod?: string
  }> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
    
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency.toUpperCase(),
      paymentMethod: paymentIntent.payment_method_types[0]
    }
  }

  /**
   * Cancel payment intent
   */
  async cancelPayment(paymentIntentId: string): Promise<boolean> {
    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId)
      return true
    } catch (error) {
      console.error('Failed to cancel payment:', error)
      return false
    }
  }
}