import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUserByEmailAsync, createOrUpdateUserAsync, updateUserSubscriptionStatusAsync } from '@/lib/database';
import { paymentSessionManager } from '@/lib/auth/PaymentSessionManager';
import { geoDetectionService, CountryCode, CurrencyCode } from '@/lib/geo-detection';
import { currencyService } from '@/lib/currency-service';
import { auditLogger } from '@/lib/audit/AuditLogger';

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  // Requirement 3.2: Validate webhook signature before processing
  console.log('🔐 Processing Stripe webhook...');

  const stripe = getStripeClient();
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  // Detect geo-location for regional payment processing
  let geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null;
  try {
    const geoResult = await geoDetectionService.detectCountry(request);
    geoData = {
      country: geoResult.country,
      currency: geoResult.config.currency,
      locale: geoResult.config.locale
    };
    console.log('🌍 Geo-detection for webhook:', geoData);
  } catch (error) {
    console.warn('⚠️ Geo-detection failed for webhook, using defaults:', error);
  }

  let event: Stripe.Event;

  try {
    // Requirement 3.2: Enhanced webhook signature validation
    if (!sig) {
      console.error('❌ Missing Stripe signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    if (!endpointSecret) {
      console.error('❌ Missing webhook endpoint secret');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err: any) {
    // Requirement 3.3: Log fraud attempts
    console.error('❌ Webhook signature verification failed:', {
      error: err.message,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      bodyLength: body.length,
    });

    // This could be a fraud attempt, log it for security monitoring
    await logSecurityEvent('webhook_signature_failed', {
      error: err.message,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    // Requirement 3.1: Log all webhook events for audit trail
    await logWebhookEvent(event, 'processed', geoData);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(stripe, session, geoData);
        break;

      case 'customer.subscription.created':
        const createdSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(stripe, createdSubscription, geoData);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(stripe, updatedSubscription, geoData);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(stripe, deletedSubscription, geoData);
        break;

      case 'invoice.payment_succeeded':
        const successfulInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(stripe, successfulInvoice, geoData);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(stripe, failedInvoice, geoData);
        break;

      // Regional payment method specific events
      case 'payment_intent.succeeded':
        const successfulPaymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleRegionalPaymentSuccess(stripe, successfulPaymentIntent, geoData);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleRegionalPaymentFailure(stripe, failedPaymentIntent, geoData);
        break;

      case 'source.chargeable':
        const chargeableSource = event.data.object as Stripe.Source;
        await handleRegionalSourceChargeable(stripe, chargeableSource, geoData);
        break;

      case 'source.failed':
        const failedSource = event.data.object as Stripe.Source;
        await handleRegionalSourceFailed(stripe, failedSource, geoData);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
        await logWebhookEventWithGeoData(event, 'unhandled', geoData);
    }

    console.log('✅ Webhook processed successfully:', event.type);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);

    // Log processing errors for debugging
    await logSecurityEvent('webhook_processing_failed', {
      eventType: event.type,
      eventId: event.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session, geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null) {
  console.log('🎯 Processing checkout completion:', session.id);

  try {
    // Requirement 2.2: Verify customer email matches authenticated user
    const customerEmail = session.customer_email;
    const metadataEmail = session.metadata?.userEmail;

    if (!customerEmail) {
      console.error('❌ No customer email in checkout session');
      await logSecurityEvent('checkout_no_email', { sessionId: session.id });
      return;
    }

    // Requirement 2.3: Verify email consistency
    if (metadataEmail && customerEmail !== metadataEmail) {
      console.error('❌ Email mismatch in checkout session:', {
        customerEmail,
        metadataEmail,
        sessionId: session.id
      });

      await logSecurityEvent('checkout_email_mismatch', {
        sessionId: session.id,
        customerEmail,
        metadataEmail,
        timestamp: new Date().toISOString(),
      });

      // Requirement 2.3: Reject transaction on email discrepancy
      throw new Error('Email verification failed - transaction rejected');
    }

    // Validate payment session if available
    const paymentSessionId = session.metadata?.paymentSessionId;
    const userId = session.metadata?.userId;

    if (paymentSessionId && userId) {
      const planType = session.metadata?.planType || 'pro';
      const validation = await paymentSessionManager.validatePaymentSession(userId, planType);

      if (!validation.isValid) {
        console.error('❌ Payment session validation failed:', validation.error);
        await logSecurityEvent('invalid_payment_session', {
          sessionId: session.id,
          paymentSessionId,
          userId,
          error: validation.error,
        });

        // Don't reject the payment, but log the issue for investigation
        console.warn('⚠️ Proceeding with payment despite session validation failure');
      } else {
        // Complete the payment session
        paymentSessionManager.completePaymentSession(userId, planType);
        console.log('✅ Payment session completed successfully');
      }
    }

    // Get or create user
    let userData = await getUserByEmailAsync(customerEmail);
    if (!userData) {
      userData = await createOrUpdateUserAsync({ email: customerEmail });
    }

    // Update subscription status
    const planType = session.metadata?.planType || 'pro';
    const subscriptionStatus = planType === 'premium' ? 'premium' : 'pro';

    await updateUserSubscriptionStatusAsync(customerEmail, subscriptionStatus, {
      customerId: session.customer as string,
      subscriptionId: session.subscription as string,
      subscriptionStartDate: new Date().toISOString(),
    });

    // Enhanced audit logging with geo-location and currency conversion tracking
    const auditDetails = {
      userId: (userId || (userData as any)?.id || ''),
      email: customerEmail,
      subscriptionId: session.subscription as string,
      planType: planType,
      amount: session.amount_total,
      currency: session.currency,
      sessionId: session.id,
      timestamp: new Date().toISOString(),
      // Regional payment data
      detectedCountry: geoData?.country,
      detectedCurrency: geoData?.currency,
      locale: geoData?.locale,
      paymentMethod: session.payment_method_types?.[0],
      // Currency conversion tracking
      originalAmount: session.metadata?.originalAmount,
      originalCurrency: session.metadata?.originalCurrency,
      conversionRate: session.metadata?.conversionRate,
      conversionSource: session.metadata?.conversionSource,
      // Regional payment method tracking
      isRegionalPayment: isRegionalPaymentMethod(session.payment_method_types?.[0], geoData?.country),
      paymentMethodCategory: getPaymentMethodCategory(session.payment_method_types?.[0])
    };

    await auditLogger.logPaymentEvent('checkout_completed', auditDetails, {
      userId: auditDetails.userId,
      email: customerEmail,
      sessionId: session.id,
      ip: session.metadata?.clientIP,
      requestId: session.metadata?.requestId
    });

    // Track currency conversion if it occurred
    if (session.metadata?.originalCurrency && session.metadata?.originalCurrency !== session.currency) {
      await trackCurrencyConversion({
        sessionId: session.id,
        originalAmount: parseFloat(session.metadata.originalAmount || '0'),
        originalCurrency: session.metadata.originalCurrency as CurrencyCode,
        convertedAmount: session.amount_total || 0,
        convertedCurrency: session.currency as CurrencyCode,
        conversionRate: parseFloat(session.metadata.conversionRate || '1'),
        conversionSource: session.metadata.conversionSource || 'unknown',
        country: geoData?.country,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✅ User ${customerEmail} upgraded to ${subscriptionStatus}`);

    // Requirement 2.5: Send confirmation only to authenticated user email
    // Note: Email sending would be implemented here
    console.log(`📧 Confirmation should be sent to: ${customerEmail}`);

  } catch (error) {
    console.error('❌ Error handling checkout completion:', error);

    await logSecurityEvent('checkout_processing_failed', {
      sessionId: session.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    throw error; // Re-throw to trigger webhook retry
  }
}

async function handleSubscriptionCreated(stripe: Stripe, subscription: Stripe.Subscription, geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null) {
  console.log('🎯 Processing subscription creation:', subscription.id);

  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!customer || customer.deleted) {
      console.error('❌ Customer not found or deleted:', subscription.customer);
      await logSecurityEvent('subscription_invalid_customer', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
      });
      return;
    }

    const customerEmail = (customer as any).email;
    if (!customerEmail) {
      console.error('❌ Customer has no email:', customer.id);
      await logSecurityEvent('subscription_no_customer_email', {
        subscriptionId: subscription.id,
        customerId: customer.id,
      });
      return;
    }

    // Requirement 3.4: Check for duplicate subscriptions
    const existingSubscriptions = await checkExistingSubscriptions(customerEmail);
    if (existingSubscriptions.length > 0) {
      console.warn('⚠️ User already has active subscriptions:', {
        email: customerEmail,
        existingCount: existingSubscriptions.length,
        newSubscriptionId: subscription.id,
      });

      await logSecurityEvent('duplicate_subscription_detected', {
        email: customerEmail,
        newSubscriptionId: subscription.id,
        existingSubscriptions: existingSubscriptions.map(s => s.id),
        timestamp: new Date().toISOString(),
      });

      // Continue processing but flag for manual review
      await flagForManualReview('duplicate_subscription', {
        email: customerEmail,
        subscriptionId: subscription.id,
        existingSubscriptions,
      });
    }

    // Get or create user
    let userData = await getUserByEmailAsync(customerEmail);
    if (!userData) {
      userData = await createOrUpdateUserAsync({ email: customerEmail });
    }

    await updateUserSubscriptionStatusAsync(customerEmail, 'pro', {
      customerId: customer.id,
      subscriptionId: subscription.id,
      subscriptionStartDate: new Date().toISOString(),
    });

    // Requirement 2.4: Create audit log
    await logAuditEvent('subscription_created', {
      userId: (userData as any)?.id || '',
      email: customerEmail,
      subscriptionId: subscription.id,
      customerId: customer.id,
      planType: subscription.metadata?.planType || 'pro',
      status: subscription.status,
      timestamp: new Date().toISOString(),
    });

    console.log(`✅ Subscription created for ${customerEmail}`);
  } catch (error) {
    console.error('❌ Error handling subscription creation:', error);
    await logSecurityEvent('subscription_creation_failed', {
      subscriptionId: subscription.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Regional payment method specific handlers
async function handleRegionalPaymentSuccess(stripe: Stripe, paymentIntent: Stripe.PaymentIntent, geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null) {
  console.log('🎯 Processing regional payment success:', paymentIntent.id);

  try {
    const customer = paymentIntent.customer as string;
    const paymentMethod = paymentIntent.payment_method_types?.[0];

    // Track regional payment method usage
    const regionalPaymentDetails = {
      paymentIntentId: paymentIntent.id,
      customerId: customer,
      paymentMethod: paymentMethod,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      // Regional data
      detectedCountry: geoData?.country,
      detectedCurrency: geoData?.currency,
      locale: geoData?.locale,
      // Currency conversion tracking if available
      originalAmount: paymentIntent.metadata?.originalAmount,
      originalCurrency: paymentIntent.metadata?.originalCurrency,
      conversionRate: paymentIntent.metadata?.conversionRate,
      conversionSource: paymentIntent.metadata?.conversionSource,
      timestamp: new Date().toISOString()
    };

    await auditLogger.logPaymentEvent('regional_payment_succeeded', regionalPaymentDetails, {
      userId: paymentIntent.metadata?.userId,
      sessionId: paymentIntent.metadata?.sessionId,
      ip: paymentIntent.metadata?.clientIP,
      requestId: paymentIntent.metadata?.requestId
    });

    console.log(`✅ Regional payment succeeded: ${paymentMethod} in ${geoData?.country || 'unknown'}`);
  } catch (error) {
    console.error('❌ Error handling regional payment success:', error);
    await auditLogger.logSecurityEvent('regional_payment_processing_failed', {
      paymentIntentId: paymentIntent.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

async function handleRegionalPaymentFailure(stripe: Stripe, paymentIntent: Stripe.PaymentIntent, geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null) {
  console.log('🎯 Processing regional payment failure:', paymentIntent.id);

  try {
    const customer = paymentIntent.customer as string;
    const paymentMethod = paymentIntent.payment_method_types?.[0];
    const lastPaymentError = paymentIntent.last_payment_error;

    // Track regional payment method failures for analysis
    const failureDetails = {
      paymentIntentId: paymentIntent.id,
      customerId: customer,
      paymentMethod: paymentMethod,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      errorCode: lastPaymentError?.code,
      errorMessage: lastPaymentError?.message,
      errorType: lastPaymentError?.type,
      // Regional data
      detectedCountry: geoData?.country,
      detectedCurrency: geoData?.currency,
      locale: geoData?.locale,
      timestamp: new Date().toISOString()
    };

    await auditLogger.logPaymentEvent('regional_payment_failed', failureDetails, {
      userId: paymentIntent.metadata?.userId,
      sessionId: paymentIntent.metadata?.sessionId,
      ip: paymentIntent.metadata?.clientIP,
      requestId: paymentIntent.metadata?.requestId
    });

    console.log(`❌ Regional payment failed: ${paymentMethod} in ${geoData?.country || 'unknown'} - ${lastPaymentError?.message}`);
  } catch (error) {
    console.error('❌ Error handling regional payment failure:', error);
  }
}

async function handleRegionalSourceChargeable(stripe: Stripe, source: Stripe.Source, geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null) {
  console.log('🎯 Processing regional source chargeable:', source.id);

  try {
    // Handle regional payment sources like OXXO, PIX, PSE, etc.
    const sourceDetails = {
      sourceId: source.id,
      type: source.type,
      amount: source.amount,
      currency: source.currency,
      status: source.status,
      // Regional data
      detectedCountry: geoData?.country,
      detectedCurrency: geoData?.currency,
      locale: geoData?.locale,
      // Source-specific data
      flow: source.flow,
      usage: source.usage,
      timestamp: new Date().toISOString()
    };

    await auditLogger.logPaymentEvent('regional_source_chargeable', sourceDetails, {
      userId: source.metadata?.userId,
      sessionId: source.metadata?.sessionId,
      ip: source.metadata?.clientIP,
      requestId: source.metadata?.requestId
    });

    console.log(`✅ Regional source chargeable: ${source.type} in ${geoData?.country || 'unknown'}`);
  } catch (error) {
    console.error('❌ Error handling regional source chargeable:', error);
  }
}

async function handleRegionalSourceFailed(stripe: Stripe, source: Stripe.Source, geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null) {
  console.log('🎯 Processing regional source failed:', source.id);

  try {
    const failureDetails = {
      sourceId: source.id,
      type: source.type,
      amount: source.amount,
      currency: source.currency,
      status: source.status,
      // Regional data
      detectedCountry: geoData?.country,
      detectedCurrency: geoData?.currency,
      locale: geoData?.locale,
      timestamp: new Date().toISOString()
    };

    await auditLogger.logPaymentEvent('regional_source_failed', failureDetails, {
      userId: source.metadata?.userId,
      sessionId: source.metadata?.sessionId,
      ip: source.metadata?.clientIP,
      requestId: source.metadata?.requestId
    });

    console.log(`❌ Regional source failed: ${source.type} in ${geoData?.country || 'unknown'}`);
  } catch (error) {
    console.error('❌ Error handling regional source failure:', error);
  }
}

async function handleSubscriptionUpdated(stripe: Stripe, subscription: Stripe.Subscription, geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null) {
  console.log('Subscription updated:', subscription.id);

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (customer && !customer.deleted && (customer as any).email) {
    const status = subscription.status === 'active' ? 'pro' : 'free';

    await updateUserSubscriptionStatusAsync((customer as any).email, status, {
      customerId: customer.id,
      subscriptionId: subscription.id,
      subscriptionStartDate: subscription.status === 'active' ? new Date().toISOString() : undefined,
      subscriptionEndDate: subscription.status !== 'active' ? new Date().toISOString() : undefined,
    });

    console.log(`Subscription updated for ${(customer as any).email}: ${status}`);
  }
}

async function handleSubscriptionDeleted(stripe: Stripe, subscription: Stripe.Subscription, geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null) {
  console.log('Subscription deleted:', subscription.id);

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (customer && !customer.deleted && (customer as any).email) {
    await updateUserSubscriptionStatusAsync((customer as any).email, 'free', {
      customerId: customer.id,
      subscriptionId: undefined,
      subscriptionEndDate: new Date().toISOString(),
    });

    console.log(`Subscription cancelled for ${(customer as any).email}`);
  }
}

async function handlePaymentSucceeded(stripe: Stripe, invoice: Stripe.Invoice, geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null) {
  console.log('Payment succeeded:', invoice.id);

  if (invoice.customer_email) {
    // Get or create user
    let userData = await getUserByEmailAsync(invoice.customer_email);
    if (!userData) {
      userData = await createOrUpdateUserAsync({ email: invoice.customer_email });
    }

    await updateUserSubscriptionStatusAsync(invoice.customer_email, 'pro', {
      customerId: invoice.customer as string,
      subscriptionId: (invoice as any).subscription as string | undefined,
    });

    console.log(`Payment succeeded for ${invoice.customer_email}`);
  }
}

async function handlePaymentFailed(stripe: Stripe, invoice: Stripe.Invoice, geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null) {
  console.log('Payment failed:', invoice.id);

  if (invoice.customer_email) {
    // Don't immediately downgrade on payment failure
    // Stripe will handle retries and eventual subscription cancellation
    console.log(`Payment failed for ${invoice.customer_email} - subscription will be handled by Stripe`);
  }
}

// Security and audit logging functions
async function logWebhookEvent(event: Stripe.Event, status: string = 'processed', geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null) {
  try {
    console.log(`📝 Logging webhook event: ${event.type} (${status})`);

    // In a production environment, this would write to a database or logging service
    const logEntry = {
      eventId: event.id,
      eventType: event.type,
      status: status,
      timestamp: new Date().toISOString(),
      created: new Date(event.created * 1000).toISOString(),
      livemode: event.livemode,
      // Don't log sensitive data, just metadata
      objectId: (event.data.object as any).id,
      objectType: event.data.object.object,
    };

    // TODO: Implement actual database logging
    console.log('Webhook event logged:', logEntry);
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

async function logSecurityEvent(eventType: string, details: any) {
  try {
    console.log(`🚨 Security event: ${eventType}`);

    const securityLog = {
      eventType,
      details,
      timestamp: new Date().toISOString(),
      severity: getSeverityLevel(eventType),
    };

    // TODO: Implement actual security logging (e.g., to security monitoring service)
    console.log('Security event logged:', securityLog);

    // In production, this might trigger alerts for high-severity events
    if (securityLog.severity === 'high') {
      console.warn('🚨 HIGH SEVERITY SECURITY EVENT - Consider immediate investigation');
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

async function logAuditEvent(eventType: string, details: any) {
  try {
    console.log(`📋 Audit event: ${eventType}`);

    const auditLog = {
      eventType,
      details,
      timestamp: new Date().toISOString(),
      source: 'stripe_webhook',
    };

    // TODO: Implement actual audit logging to database
    console.log('Audit event logged:', auditLog);
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

function getSeverityLevel(eventType: string): 'low' | 'medium' | 'high' {
  const highSeverityEvents = [
    'webhook_signature_failed',
    'checkout_email_mismatch',
    'invalid_payment_session',
    'duplicate_subscription_detected',
  ];

  const mediumSeverityEvents = [
    'checkout_no_email',
    'checkout_processing_failed',
    'webhook_processing_failed',
    'subscription_invalid_customer',
    'subscription_no_customer_email',
  ];

  if (highSeverityEvents.includes(eventType)) {
    return 'high';
  } else if (mediumSeverityEvents.includes(eventType)) {
    return 'medium';
  } else {
    return 'low';
  }
}

// Additional security and validation functions
async function checkExistingSubscriptions(email: string): Promise<any[]> {
  try {
    // Get user data to find existing subscriptions
    const userData = await getUserByEmailAsync(email);
    if (!userData) {
      return [];
    }

    // In a real implementation, this would query the subscriptions table
    // For now, we'll return an empty array but log the check
    console.log(`🔍 Checking existing subscriptions for: ${email}`);

    // TODO: Implement actual database query to check for existing active subscriptions
    // const existingSubscriptions = await queryActiveSubscriptions(userData.id);

    return []; // Placeholder - would return actual subscriptions
  } catch (error) {
    console.error('Error checking existing subscriptions:', error);
    return [];
  }
}

async function flagForManualReview(reviewType: string, details: any) {
  try {
    console.log(`🚩 Flagging for manual review: ${reviewType}`);

    const reviewFlag = {
      reviewType,
      details,
      timestamp: new Date().toISOString(),
      status: 'pending_review',
      priority: getReviewPriority(reviewType),
    };

    // TODO: Implement actual manual review queue (e.g., database table or external service)
    console.log('Manual review flag created:', reviewFlag);

    // In production, this might send notifications to admin team
    if (reviewFlag.priority === 'high') {
      console.warn('🚩 HIGH PRIORITY MANUAL REVIEW REQUIRED');
    }
  } catch (error) {
    console.error('Failed to flag for manual review:', error);
  }
}

function getReviewPriority(reviewType: string): 'low' | 'medium' | 'high' {
  const highPriorityReviews = [
    'duplicate_subscription',
    'email_mismatch',
    'fraud_suspected',
  ];

  const mediumPriorityReviews = [
    'payment_anomaly',
    'subscription_conflict',
  ];

  if (highPriorityReviews.includes(reviewType)) {
    return 'high';
  } else if (mediumPriorityReviews.includes(reviewType)) {
    return 'medium';
  } else {
    return 'low';
  }
}

// Enhanced fraud detection functions
async function detectFraudulentActivity(event: Stripe.Event): Promise<boolean> {
  try {
    const fraudIndicators = [];

    // Check for rapid successive events from same customer
    if (await checkRapidEvents(event)) {
      fraudIndicators.push('rapid_events');
    }

    // Check for unusual payment patterns
    if (await checkUnusualPatterns(event)) {
      fraudIndicators.push('unusual_patterns');
    }

    // Check for suspicious metadata
    if (await checkSuspiciousMetadata(event)) {
      fraudIndicators.push('suspicious_metadata');
    }

    if (fraudIndicators.length > 0) {
      await logSecurityEvent('fraud_indicators_detected', {
        eventId: event.id,
        eventType: event.type,
        indicators: fraudIndicators,
        timestamp: new Date().toISOString(),
      });

      return fraudIndicators.length >= 2; // Flag as fraud if 2+ indicators
    }

    return false;
  } catch (error) {
    console.error('Error in fraud detection:', error);
    return false;
  }
}

async function checkRapidEvents(event: Stripe.Event): Promise<boolean> {
  // TODO: Implement check for rapid successive events
  // This would typically check if there are multiple events from the same customer
  // within a short time period (e.g., multiple subscription attempts in 5 minutes)
  return false;
}

async function checkUnusualPatterns(event: Stripe.Event): Promise<boolean> {
  // TODO: Implement pattern analysis
  // This could check for unusual amounts, currencies, or timing patterns
  return false;
}

async function checkSuspiciousMetadata(event: Stripe.Event): Promise<boolean> {
  // TODO: Implement metadata analysis
  // This could check for missing required metadata or inconsistent data
  const eventData = event.data.object as any;

  // Basic check for missing critical metadata
  if (event.type === 'checkout.session.completed') {
    const session = eventData as Stripe.Checkout.Session;
    if (!session.customer_email || !session.metadata?.userEmail) {
      return true;
    }
  }

  return false;
}


// Regional payment method utility functions
function isRegionalPaymentMethod(paymentMethod: string | undefined, country: CountryCode | undefined): boolean {
  if (!paymentMethod || !country) return false;

  const regionalMethods: Record<CountryCode, string[]> = {
    MX: ['oxxo', 'spei'],
    CO: ['pse', 'efecty'],
    AR: ['mercadopago', 'rapipago'],
    CL: ['webpay'],
    PE: ['pagoefectivo'],
    BR: ['pix', 'boleto'],
    EC: [],
    US: ['paypal'],
    UNKNOWN: []
  };

  return regionalMethods[country]?.includes(paymentMethod.toLowerCase()) || false;
}

function getPaymentMethodCategory(paymentMethod: string | undefined): string {
  if (!paymentMethod) return 'unknown';

  const categories: Record<string, string> = {
    'card': 'credit_card',
    'oxxo': 'cash_voucher',
    'spei': 'bank_transfer',
    'pse': 'bank_transfer',
    'efecty': 'cash_voucher',
    'mercadopago': 'digital_wallet',
    'rapipago': 'cash_voucher',
    'webpay': 'bank_transfer',
    'pagoefectivo': 'cash_voucher',
    'pix': 'instant_transfer',
    'boleto': 'bank_slip',
    'paypal': 'digital_wallet'
  };

  return categories[paymentMethod.toLowerCase()] || 'other';
}

// Currency conversion tracking function
interface CurrencyConversionData {
  sessionId: string;
  originalAmount: number;
  originalCurrency: CurrencyCode;
  convertedAmount: number;
  convertedCurrency: CurrencyCode;
  conversionRate: number;
  conversionSource: string;
  country?: CountryCode;
  timestamp: string;
}

async function trackCurrencyConversion(data: CurrencyConversionData): Promise<void> {
  try {
    console.log('💱 Tracking currency conversion:', {
      from: `${data.originalAmount} ${data.originalCurrency}`,
      to: `${data.convertedAmount} ${data.convertedCurrency}`,
      rate: data.conversionRate,
      country: data.country
    });

    // Enhanced audit logging for currency conversion
    await auditLogger.logPaymentEvent('currency_conversion_tracked', {
      sessionId: data.sessionId,
      originalAmount: data.originalAmount,
      originalCurrency: data.originalCurrency,
      convertedAmount: data.convertedAmount,
      convertedCurrency: data.convertedCurrency,
      conversionRate: data.conversionRate,
      conversionSource: data.conversionSource,
      country: data.country,
      timestamp: data.timestamp,
      // Additional tracking metrics
      conversionAccuracy: calculateConversionAccuracy(data),
      priceImpact: calculatePriceImpact(data),
      isSignificantConversion: isSignificantConversion(data)
    }, {
      sessionId: data.sessionId,
      requestId: `conversion_${data.sessionId}_${Date.now()}`
    });

    // Track conversion metrics for monitoring
    await trackConversionMetrics(data);

  } catch (error) {
    console.error('❌ Error tracking currency conversion:', error);
    await auditLogger.logSecurityEvent('currency_conversion_tracking_failed', {
      sessionId: data.sessionId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

function calculateConversionAccuracy(data: CurrencyConversionData): number {
  // Calculate accuracy by comparing expected vs actual converted amount
  const expectedAmount = data.originalAmount * data.conversionRate;
  const actualAmount = data.convertedAmount;
  const accuracy = 1 - Math.abs(expectedAmount - actualAmount) / expectedAmount;
  return Math.max(0, Math.min(1, accuracy));
}

function calculatePriceImpact(data: CurrencyConversionData): number {
  // Calculate the percentage change from original to converted amount
  return ((data.convertedAmount - data.originalAmount) / data.originalAmount) * 100;
}

function isSignificantConversion(data: CurrencyConversionData): boolean {
  // Consider conversion significant if rate differs significantly from 1:1
  const rateThreshold = 0.1; // 10% difference
  return Math.abs(data.conversionRate - 1) > rateThreshold;
}

async function trackConversionMetrics(data: CurrencyConversionData): Promise<void> {
  try {
    // TODO: Implement actual metrics tracking (e.g., to analytics service)
    const metrics = {
      conversionPair: `${data.originalCurrency}-${data.convertedCurrency}`,
      rate: data.conversionRate,
      amount: data.originalAmount,
      country: data.country,
      source: data.conversionSource,
      timestamp: data.timestamp
    };

    console.log('📊 Currency conversion metrics:', metrics);

    // In production, this would send metrics to monitoring service
    // await metricsService.track('currency_conversion', metrics);

  } catch (error) {
    console.error('❌ Error tracking conversion metrics:', error);
  }
}

// Enhanced webhook event logging with geo-location data
async function logWebhookEventWithGeoData(
  event: Stripe.Event,
  status: string = 'processed',
  geoData: { country: CountryCode; currency: CurrencyCode; locale: string } | null = null
): Promise<void> {
  try {
    console.log(`📝 Logging webhook event with geo-data: ${event.type} (${status})`);

    const logEntry = {
      eventId: event.id,
      eventType: event.type,
      status: status,
      timestamp: new Date().toISOString(),
      created: new Date(event.created * 1000).toISOString(),
      livemode: event.livemode,
      // Don't log sensitive data, just metadata
      objectId: (event.data.object as any).id,
      objectType: event.data.object.object,
      // Geo-location data
      detectedCountry: geoData?.country,
      detectedCurrency: geoData?.currency,
      locale: geoData?.locale,
      // Regional context
      isLatinAmericanEvent: geoData?.country ? ['MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR'].includes(geoData.country) : false
    };

    // Use enhanced audit logger for webhook events
    await auditLogger.logSystemEvent('webhook_processed', logEntry, {
      source: 'stripe_webhook',
      requestId: `webhook_${event.id}`
    });

    console.log('✅ Webhook event with geo-data logged:', logEntry);
  } catch (error) {
    console.error('❌ Failed to log webhook event with geo-data:', error);
  }
}