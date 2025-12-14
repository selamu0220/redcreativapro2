import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseClient } from '../../../lib/db';
import { authGuard } from '../../../lib/auth/AuthenticationGuard';
import { paymentSessionManager } from '../../../lib/auth/PaymentSessionManager';
import { auditLogger } from '../../../lib/audit/AuditLogger';
import { conflictDetectionService } from '../../../lib/subscription/ConflictDetectionService';
import { isDevMode, createMockCheckoutSession } from './dev-mode';
import { geoDetectionService, CountryCode, CurrencyCode } from '../../../lib/geo-detection';
import { currencyService } from '../../../../lib/currency-service';
import { paymentAdapterManager } from '../../../../lib/payment-adapter-manager';

// Configuración de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});


function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY no está configurado');
  }
  
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

// Helper function to map localization locale to Stripe supported locale
function mapToStripeLocale(locale: string): string {
  const stripeLocaleMap: Record<string, string> = {
    'es-MX': 'es',
    'es-CO': 'es',
    'es-AR': 'es',
    'es-CL': 'es',
    'es-PE': 'es',
    'es-EC': 'es',
    'pt-BR': 'pt-BR',
    'en-US': 'en',
    'es': 'es',
    'pt': 'pt-BR',
    'en': 'en'
  };
  
  return stripeLocaleMap[locale] || 'es';
}

// Helper function to get fallback payment configuration for unsupported regions
function getFallbackPaymentConfig(country: CountryCode, currency: CurrencyCode): {
  paymentMethods: string[];
  currency: CurrencyCode;
  locale: string;
} {
  // Define fallback configurations for different regions
  const fallbackConfigs: Record<string, { paymentMethods: string[]; currency: CurrencyCode; locale: string }> = {
    // Latin America fallbacks
    'LATAM': {
      paymentMethods: ['card'],
      currency: 'USD',
      locale: 'es'
    },
    // Brazil specific fallback
    'BR': {
      paymentMethods: ['card', 'pix', 'boleto_bancario'],
      currency: 'BRL',
      locale: 'pt-BR'
    },
    // Mexico specific fallback
    'MX': {
      paymentMethods: ['card', 'oxxo', 'spei'],
      currency: 'MXN',
      locale: 'es-MX'
    },
    // Colombia specific fallback
    'CO': {
      paymentMethods: ['card', 'pse'],
      currency: 'COP',
      locale: 'es-CO'
    },
    // Default international fallback
    'INTERNATIONAL': {
      paymentMethods: ['card'],
      currency: 'USD',
      locale: 'en'
    }
  };

  // Return country-specific fallback if available
  if (fallbackConfigs[country]) {
    return fallbackConfigs[country];
  }

  // Return regional fallback for Latin American countries
  const latinAmericaCountries = ['MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR'];
  if (latinAmericaCountries.includes(country)) {
    return fallbackConfigs['LATAM'];
  }

  // Return international fallback for all other countries
  return fallbackConfigs['INTERNATIONAL'];
}

// Helper function to validate and filter Stripe payment methods
function validateStripePaymentMethods(
  methods: string[], 
  currency: CurrencyCode, 
  country: CountryCode
): string[] {
  const validMethods = methods.filter(method => {
    switch (method) {
      case 'card':
        return true; // Cards are universally supported
      case 'oxxo':
      case 'spei':
        return currency === 'MXN' && country === 'MX';
      case 'pse':
        return currency === 'COP' && country === 'CO';
      case 'pix':
      case 'boleto_bancario':
        return currency === 'BRL' && country === 'BR';
      case 'pagoefectivo':
        return currency === 'PEN' && country === 'PE';
      default:
        return false;
    }
  });

  // Always ensure card is included as fallback
  if (!validMethods.includes('card')) {
    validMethods.unshift('card');
  }

  return validMethods;
}

export async function POST(request: NextRequest) {
  const requestId = `create_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Verificar si estamos en modo desarrollo
    if (isDevMode()) {
      console.log('🔧 Modo desarrollo detectado - usando sesión simulada');
      const { userEmail, priceId } = await request.json();
      
      if (!priceId || !userEmail) {
        return NextResponse.json(
          { error: 'Price ID and user email are required' },
          { status: 400 }
        );
      }
      
      const mockSession = createMockCheckoutSession(userEmail, priceId);
      return NextResponse.json(mockSession);
    }

    // Requirement 1.1: Verify user authentication before payment operations
    console.log('🔐 Starting secure subscription creation...');
    
    let userIdentity;
    try {
      userIdentity = await authGuard.requireAuthentication();
      console.log('✅ User authenticated:', userIdentity.email);
      
      // Log successful authentication
      await auditLogger.logAuthenticationEvent('subscription_auth_success', {
        userId: userIdentity.userId,
        email: userIdentity.email,
        requestId
      }, {
        userId: userIdentity.userId,
        email: userIdentity.email,
        sessionId: userIdentity.sessionId,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        requestId
      });
    } catch (authError) {
      console.error('❌ Authentication failed:', authError);
      
      // Log authentication failure
      await auditLogger.logSecurityEvent('subscription_auth_failed', {
        error: authError instanceof Error ? authError.message : 'Unknown error',
        requestId
      }, {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        requestId
      }, 'high');
      
      return NextResponse.json(
        { error: 'Authentication required for subscription operations' },
        { status: 401 }
      );
    }

    // Inicializar Stripe y Supabase
    const stripe = getStripeClient();
    const supabase = getSupabaseClient();
    
    // Check if Supabase client is available
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    console.log('🔑 Stripe configurado correctamente');
    
    const { priceId, userEmail, planName, successUrl, cancelUrl } = await request.json();

    // Requirement 2.1: Verify email matches authenticated user
    if (userEmail && userEmail !== userIdentity.email) {
      console.error('❌ Email mismatch:', { provided: userEmail, authenticated: userIdentity.email });
      return NextResponse.json(
        { error: 'Email does not match authenticated user' },
        { status: 403 }
      );
    }

    // Use authenticated user's email
    const authenticatedEmail = userIdentity.email;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    console.log('🛒 Creating secure checkout session for:', { priceId, email: authenticatedEmail, planName });

    // Requirement 1.1: Detect user location and get localization configuration
    console.log('🌍 Detecting user location for localization...');
    let geoResult;
    let localizationConfig;
    let detectedCountry: CountryCode = 'UNKNOWN';
    let targetCurrency: CurrencyCode = 'USD';
    let availablePaymentMethods: string[] = [];

    try {
      geoResult = await geoDetectionService.detectCountry(request);
      localizationConfig = geoResult.config;
      detectedCountry = geoResult.country;
      targetCurrency = localizationConfig.currency;
      availablePaymentMethods = localizationConfig.paymentMethods;

      console.log('✅ Location detected:', {
        country: detectedCountry,
        currency: targetCurrency,
        confidence: geoResult.confidence,
        source: geoResult.source,
        paymentMethods: availablePaymentMethods
      });

      // Log geo-detection for analytics
      await auditLogger.logSystemEvent('geo_detection_success', {
        country: detectedCountry,
        currency: targetCurrency,
        confidence: geoResult.confidence,
        source: geoResult.source,
        email: authenticatedEmail,
        requestId
      });

    } catch (geoError) {
      console.warn('⚠️ Geo-detection failed, using defaults:', geoError);
      
      // Use default configuration for Mexico (largest Spanish market)
      localizationConfig = geoDetectionService.getLocalizationConfig('MX');
      detectedCountry = 'MX';
      targetCurrency = 'MXN';
      availablePaymentMethods = ['card']; // Fallback to card only

      await auditLogger.logSystemEvent('geo_detection_failed', {
        error: geoError instanceof Error ? geoError.message : 'Unknown error',
        fallbackCountry: detectedCountry,
        email: authenticatedEmail,
        requestId
      });
    }

    // Requirement 1.2: Convert price to local currency if needed
    let convertedAmount = 0;
    let originalAmount = 0;
    let exchangeRate = 1;
    let priceConversionInfo = null;

    try {
      // Get the original price from Stripe
      const priceObject = await stripe.prices.retrieve(priceId);
      originalAmount = priceObject.unit_amount ? priceObject.unit_amount / 100 : 0;
      const originalCurrency = (priceObject.currency?.toUpperCase() || 'USD') as CurrencyCode;

      console.log('💰 Converting price:', {
        originalAmount,
        originalCurrency,
        targetCurrency,
        country: detectedCountry
      });

      if (originalCurrency !== targetCurrency && originalAmount > 0) {
        // Convert currency using currency service
        convertedAmount = await currencyService.convertPrice(originalAmount, originalCurrency, targetCurrency);
        exchangeRate = convertedAmount / originalAmount;

        priceConversionInfo = {
          originalAmount,
          originalCurrency,
          convertedAmount,
          targetCurrency,
          exchangeRate,
          conversionTimestamp: new Date().toISOString()
        };

        console.log('✅ Price converted:', priceConversionInfo);

        // Log currency conversion
        await auditLogger.logSystemEvent('currency_conversion_success', {
          ...priceConversionInfo,
          email: authenticatedEmail,
          requestId
        });

      } else {
        convertedAmount = originalAmount;
        console.log('ℹ️ No currency conversion needed');
      }

    } catch (conversionError) {
      console.warn('⚠️ Currency conversion failed, using original price:', conversionError);
      convertedAmount = originalAmount;

      await auditLogger.logSystemEvent('currency_conversion_failed', {
        error: conversionError instanceof Error ? conversionError.message : 'Unknown error',
        originalAmount,
        targetCurrency,
        email: authenticatedEmail,
        requestId
      });
    }

    // Requirement 1.3: Get country-specific payment methods
    let regionalPaymentMethods: string[] = [];
    try {
      const paymentOptions = paymentAdapterManager.getAvailablePaymentMethods({
        country: detectedCountry,
        currency: targetCurrency,
        amount: convertedAmount || originalAmount,
        fallbackToInternational: true
      });

      regionalPaymentMethods = paymentOptions.map(method => method.type);
      
      console.log('💳 Available payment methods for', detectedCountry, ':', regionalPaymentMethods);

      // Log payment method selection
      await auditLogger.logSystemEvent('payment_methods_selected', {
        country: detectedCountry,
        currency: targetCurrency,
        availableMethods: regionalPaymentMethods,
        email: authenticatedEmail,
        requestId
      });

    } catch (paymentMethodError) {
      console.warn('⚠️ Payment method selection failed, using card only:', paymentMethodError);
      regionalPaymentMethods = ['card'];

      await auditLogger.logSystemEvent('payment_method_selection_failed', {
        error: paymentMethodError instanceof Error ? paymentMethodError.message : 'Unknown error',
        fallbackMethods: regionalPaymentMethods,
        email: authenticatedEmail,
        requestId
      });
    }

    // Check for subscription conflicts before proceeding
    try {
      const conflictResult = await conflictDetectionService.detectSubscriptionConflicts(authenticatedEmail);
      if (conflictResult.hasConflicts) {
        const highSeverityConflicts = conflictResult.conflicts.filter(c => c.severity === 'high');
        if (highSeverityConflicts.length > 0) {
          console.warn('⚠️ High severity subscription conflicts detected:', highSeverityConflicts);
          
          await auditLogger.logSecurityEvent('subscription_conflict_blocked_payment', {
            email: authenticatedEmail,
            conflicts: conflictResult.conflicts.length,
            highSeverityConflicts: highSeverityConflicts.length,
            requestId
          }, {
            userId: userIdentity.userId,
            email: authenticatedEmail,
            requestId
          }, 'high');

          return NextResponse.json(
            { error: 'Subscription conflicts detected. Please contact support.' },
            { status: 409 }
          );
        }
      }
    } catch (conflictError) {
      console.error('❌ Error checking subscription conflicts:', conflictError);
      // Continue with payment but log the error
      await auditLogger.logSystemEvent('conflict_detection_error', {
        email: authenticatedEmail,
        error: conflictError instanceof Error ? conflictError.message : 'Unknown error',
        requestId
      });
    }

    // Create payment session for tracking
    let paymentSession;
    try {
      paymentSession = await paymentSessionManager.createPaymentSession(
        planName || 'premium',
        0, // Amount will be determined by Stripe price
        'EUR'
      );
      console.log('✅ Payment session created:', paymentSession.sessionId);
    } catch (sessionError) {
      console.error('❌ Failed to create payment session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to initialize payment session' },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    let customer: Stripe.Customer;
    
    // Check if user exists in our database
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq('email', authenticatedEmail)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle null results properly
    
    // Type assertion to help TypeScript understand the structure
    type UserRecord = {
      id: string;
      stripe_customer_id: string | null;
    } | null;
    
    const typedUser = existingUser as UserRecord;
    
    if (typedUser && typedUser.stripe_customer_id) {
      // Retrieve existing customer
      try {
        customer = await stripe.customers.retrieve(typedUser.stripe_customer_id) as Stripe.Customer;
        if ((customer as any).deleted) {
          throw new Error('Customer was deleted');
        }
      } catch (error) {
        console.log('Creating new customer as existing one was not found');
        customer = await stripe.customers.create({
          email: authenticatedEmail,
          metadata: {
            userEmail: authenticatedEmail,
            userId: typedUser.id,
            sessionId: userIdentity.sessionId,
            paymentSessionId: paymentSession.sessionId
          }
        });
        
        // Update user with new customer ID
        const updateData: any = { stripe_customer_id: customer.id };
        const { error: updateError } = await (supabase as any)
          .from('users')
          .update(updateData)
          .eq('id', typedUser.id);
      }
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: authenticatedEmail,
        metadata: {
          userEmail: authenticatedEmail,
          userId: typedUser?.id || userIdentity.userId,
          sessionId: userIdentity.sessionId,
          paymentSessionId: paymentSession.sessionId
        }
      });
      
      // Update user with customer ID if user exists
      if (typedUser) {
        const updateData: any = { stripe_customer_id: customer.id };
        await (supabase as any)
          .from('users')
          .update(updateData)
          .eq('id', typedUser.id);
      }
    }

    // Determine if this is a one-time payment (lifetime) or subscription
    const price = await stripe.prices.retrieve(priceId);
    const isLifetime = price.type === 'one_time';

    // Configure payment method types based on detected country and available methods
    let stripePaymentMethods: string[] = ['card']; // Default to card
    
    // Map regional payment methods to Stripe payment method types
    // Only include methods that Stripe actually supports
    const stripePaymentMethodMapping: Record<string, string> = {
      'oxxo': 'oxxo',
      'spei': 'spei', 
      'pse': 'pse',
      'pix': 'pix',
      'boleto': 'boleto_bancario',
      'pagoefectivo': 'pagoefectivo',
      'card': 'card'
      // Note: efecty, mercadopago, webpay, rapipago are not directly supported by Stripe
      // These would need external payment processor integration
    };

    // Filter and map regional payment methods to Stripe-supported methods
    if (regionalPaymentMethods.length > 0) {
      const mappedMethods = regionalPaymentMethods
        .map(method => stripePaymentMethodMapping[method])
        .filter(method => method !== undefined);
      
      if (mappedMethods.length > 0) {
        stripePaymentMethods = [...new Set([...mappedMethods, 'card'])]; // Always include card as fallback
      }
    }

    // Validate and filter payment methods using helper function
    let validatedMethods = validateStripePaymentMethods(stripePaymentMethods, targetCurrency, detectedCountry);
    
    // If no regional methods are supported, use fallback configuration
    if (validatedMethods.length === 1 && validatedMethods[0] === 'card') {
      console.log('⚠️ No regional payment methods supported, checking fallback configuration...');
      
      const fallbackConfig = getFallbackPaymentConfig(detectedCountry, targetCurrency);
      
      // Use fallback payment methods if they're different from current selection
      if (fallbackConfig.paymentMethods.length > 1 || fallbackConfig.paymentMethods[0] !== 'card') {
        const fallbackValidated = validateStripePaymentMethods(
          fallbackConfig.paymentMethods, 
          fallbackConfig.currency, 
          detectedCountry
        );
        
        if (fallbackValidated.length > validatedMethods.length) {
          stripePaymentMethods = fallbackValidated;
          targetCurrency = fallbackConfig.currency;
          
          console.log('✅ Using fallback configuration:', {
            methods: stripePaymentMethods,
            currency: targetCurrency,
            locale: fallbackConfig.locale
          });
          
          // Log fallback usage for analytics
          await auditLogger.logSystemEvent('payment_fallback_applied', {
            originalMethods: validatedMethods,
            fallbackMethods: stripePaymentMethods,
            originalCurrency: localizationConfig?.currency,
            fallbackCurrency: targetCurrency,
            country: detectedCountry,
            email: authenticatedEmail,
            requestId
          });
        } else {
          stripePaymentMethods = validatedMethods;
        }
      } else {
        stripePaymentMethods = validatedMethods;
      }
    } else {
      stripePaymentMethods = validatedMethods;
    }

    console.log('💳 Configured Stripe payment methods:', stripePaymentMethods, 'for currency:', targetCurrency);

    // Format pricing information for display
    let formattedPricing = '';
    if (priceConversionInfo) {
      const originalFormatted = currencyService.formatCurrency(
        originalAmount, 
        priceConversionInfo.originalCurrency, 
        'en-US'
      );
      const convertedFormatted = currencyService.formatCurrency(
        convertedAmount, 
        targetCurrency, 
        localizationConfig?.locale || 'es'
      );
      formattedPricing = `${originalFormatted} → ${convertedFormatted}`;
    } else {
      formattedPricing = currencyService.formatCurrency(
        originalAmount, 
        targetCurrency, 
        localizationConfig?.locale || 'es'
      );
    }

    // Create enhanced metadata with localization information
    const enhancedMetadata = {
      userEmail: authenticatedEmail,
      priceId: priceId,
      userId: userIdentity.userId,
      sessionId: userIdentity.sessionId,
      paymentSessionId: paymentSession.sessionId,
      planName: planName || 'premium',
      // Localization metadata
      detectedCountry: detectedCountry,
      targetCurrency: targetCurrency,
      geoConfidence: geoResult?.confidence?.toString() || '0',
      geoSource: geoResult?.source || 'fallback',
      availablePaymentMethods: regionalPaymentMethods.join(','),
      stripePaymentMethods: stripePaymentMethods.join(','),
      // Currency conversion metadata
      originalAmount: originalAmount.toString(),
      convertedAmount: convertedAmount.toString(),
      exchangeRate: exchangeRate.toString(),
      currencyConversionApplied: (priceConversionInfo !== null).toString(),
      formattedPricing: formattedPricing,
      // Localization config
      locale: localizationConfig?.locale || 'es',
      timezone: localizationConfig?.timezone || 'UTC',
      language: localizationConfig?.language || 'es',
      // Payment method configuration
      fallbackApplied: (validatedMethods.length === 1 && validatedMethods[0] === 'card').toString(),
      regionalMethodsCount: regionalPaymentMethods.length.toString(),
      stripeMethodsCount: stripePaymentMethods.length.toString()
    };

    // Create checkout session configuration with localization enhancements
    const checkoutSessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      payment_method_types: stripePaymentMethods,
      mode: isLifetime ? 'payment' : 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/planes?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/planes?canceled=true`,
      metadata: enhancedMetadata,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      // Set locale for Stripe Checkout UI
      locale: mapToStripeLocale(localizationConfig?.locale || 'es') as Stripe.Checkout.SessionCreateParams.Locale,
      // Configure automatic tax calculation if available
      automatic_tax: {
        enabled: true,
      },
    };

    // Add currency-specific configuration for better regional support
    if (targetCurrency !== 'USD' && priceConversionInfo) {
      // Note: Stripe checkout sessions use the currency from the price object
      // Currency conversion is handled through metadata and display formatting
      // We cannot override the price currency in the checkout session
      
      // Add custom fields for regional payment methods that require additional info
      if (stripePaymentMethods.includes('oxxo') || stripePaymentMethods.includes('spei')) {
        checkoutSessionConfig.custom_fields = [
          {
            key: 'customer_name',
            label: {
              type: 'custom',
              custom: localizationConfig?.language === 'es' ? 'Nombre completo' : 'Full name'
            },
            type: 'text',
            optional: false
          }
        ];
      }
      
      // Add phone number collection for cash payment methods
      if (stripePaymentMethods.some(method => ['oxxo', 'boleto_bancario', 'pagoefectivo'].includes(method))) {
        checkoutSessionConfig.phone_number_collection = {
          enabled: true
        };
      }
    }

    // Add payment method options for specific regional methods
    const paymentMethodOptions: Stripe.Checkout.SessionCreateParams.PaymentMethodOptions = {};
    
    if (stripePaymentMethods.includes('oxxo')) {
      paymentMethodOptions.oxxo = {
        expires_after_days: 3 // OXXO vouchers expire after 3 days
      };
    }
    
    if (stripePaymentMethods.includes('boleto_bancario')) {
      paymentMethodOptions.boleto = {
        expires_after_days: 3 // Boleto expires after 3 days
      };
    }
    
    if (stripePaymentMethods.includes('pagoefectivo')) {
      paymentMethodOptions.pagoefectivo = {
        expires_after_days: 2 // PagoEfectivo expires after 2 days
      };
    }

    if (Object.keys(paymentMethodOptions).length > 0) {
      checkoutSessionConfig.payment_method_options = paymentMethodOptions;
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(checkoutSessionConfig);

    console.log('✅ Checkout session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    
    // Manejo específico para errores de autenticación de Stripe
    if (error instanceof Error) {
      if (error.message.includes('Invalid API Key provided') || 
          error.message.includes('Invalid API Key') ||
          error.message.includes('No API key provided')) {
        return NextResponse.json(
          { 
            error: 'Servicio de pago no configurado. Contacta al administrador.',
            code: 'STRIPE_NOT_CONFIGURED',
            details: 'Las claves de Stripe no están configuradas correctamente'
          },
          { status: 503 }
        );
      }
    }
    
    // Manejo mejorado de errores con más detalles
    let errorMessage = 'Error desconocido';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Detectar tipos específicos de errores
      if (error.message.includes('Invalid API Key') || 
          error.message.includes('No API key provided')) {
        errorCode = 'STRIPE_AUTH_ERROR';
        errorMessage = 'Error de autenticación con Stripe. Verifica las claves API.';
      } else if (error.message.includes('STRIPE_SECRET_KEY')) {
        errorCode = 'STRIPE_CONFIG_ERROR';
        errorMessage = 'Configuración de Stripe incompleta.';
      } else if (error.message.includes('Supabase')) {
        errorCode = 'DATABASE_ERROR';
        errorMessage = 'Error de conexión con la base de datos.';
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Error al crear sesión de pago',
        code: errorCode,
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}