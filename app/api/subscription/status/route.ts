/**
 * Subscription Status API Endpoint
 * 
 * Provides secure access to subscription status with authentication validation.
 * Implements Requirements 4.1, 4.2, 4.3 from the secure payment flow spec.
 */

import { NextRequest, NextResponse } from 'next/server';
import { subscriptionStatusService } from '../../../lib/subscription/SubscriptionStatusService';
import { authGuard } from '../../../lib/auth/AuthenticationGuard';
import { auditLogger } from '../../../lib/audit/AuditLogger';
import { getSupabaseClient } from '../../../lib/db';

export async function GET(request: NextRequest) {
  const requestId = `status_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();

  try {
    // Authenticate user
    const userIdentity = await authGuard.requireAuthentication();
    
    console.log('🔍 Fetching subscription status for user:', userIdentity.email);

    // Log the status check request
    await auditLogger.logSystemEvent('subscription_status_check', {
      userId: userIdentity.userId,
      email: userIdentity.email,
      requestId,
      timestamp: new Date().toISOString()
    });

    // Get subscription status with retry logic
    const status = await subscriptionStatusService.getSubscriptionStatusWithRetry(
      userIdentity.userId
    );

    const responseTime = Date.now() - startTime;
    
    // Log successful status retrieval
    await auditLogger.logSystemEvent('subscription_status_retrieved', {
      userId: userIdentity.userId,
      email: userIdentity.email,
      status: status.isActive ? 'active' : 'inactive',
      planId: status.planId,
      source: status.source,
      responseTime,
      requestId
    });

    console.log(`✅ Subscription status retrieved in ${responseTime}ms:`, {
      isActive: status.isActive,
      planId: status.planId,
      source: status.source
    });

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        expiresAt: status.expiresAt ?? null,
        lastUpdated: status.lastUpdated
      },
      responseTime,
      requestId
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Error fetching subscription status:', error);

    // Log the error
    await auditLogger.logSystemEvent('subscription_status_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
      requestId,
      timestamp: new Date().toISOString()
    });

    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({
        success: true,
        data: {
          isActive: false,
          planId: 'free',
          source: 'fallback',
          expiresAt: null,
          lastUpdated: new Date().toISOString()
        },
        responseTime,
        requestId
      }, { status: 200 });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch subscription status',
        requestId
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const requestId = `status_post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  try {
    const { userEmail, refresh } = await request.json();

    // Handle legacy format with userEmail parameter
    if (userEmail) {
      console.log('📊 [LEGACY] Checking subscription status for:', userEmail);
      
      // Try to authenticate user, but fallback gracefully if not authenticated
      let userIdentity;
      try {
        userIdentity = await authGuard.requireAuthentication();
        
        // Verify email matches if provided
        if (userEmail !== userIdentity.email) {
          console.warn('⚠️ Email mismatch in legacy request:', { provided: userEmail, authenticated: userIdentity.email });
          return NextResponse.json({
            hasSubscription: false,
            isPremium: false,
            subscriptionStatus: 'inactive',
            subscriptionPlan: 'free',
            subscriptionId: null,
            customerId: null,
            subscriptionEndDate: null,
            subscriptionStartDate: null,
            trialStartDate: null,
            isActive: false,
            cancelAtPeriodEnd: false,
            currentPeriodStart: null,
            currentPeriodEnd: null,
            lastPaymentStatus: null,
            nextBillingDate: null
          });
        }
      } catch (authError) {
        console.log('🔓 [LEGACY] No authentication, returning free plan');
        return NextResponse.json({
          hasSubscription: false,
          isPremium: false,
          subscriptionStatus: 'inactive',
          subscriptionPlan: 'free',
          subscriptionId: null,
          customerId: null,
          subscriptionEndDate: null,
          subscriptionStartDate: null,
          trialStartDate: null,
          isActive: false,
          cancelAtPeriodEnd: false,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          lastPaymentStatus: null,
          nextBillingDate: null
        });
      }

      // Get subscription status using the new service
      const status = refresh 
        ? await subscriptionStatusService.getSubscriptionStatusWithRetry(userIdentity.userId)
        : await subscriptionStatusService.getSubscriptionStatus(userIdentity.userId);

      // Get additional user data for backward compatibility
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database not available');
      }

      const { data: userData } = await supabase
        .from('users')
        .select(`
          id,
          email,
          subscription_status,
          subscription_plan,
          subscription_end_date,
          subscription_start_date,
          trial_start_date,
          is_premium,
          stripe_customer_id,
          cancel_at_period_end,
          current_period_start,
          current_period_end,
          last_payment_status
        `)
        .eq('id', userIdentity.userId)
        .single();

      // Return legacy format
      const legacyResponse = {
        hasSubscription: status.isActive || (userData?.is_premium || false),
        isPremium: status.isActive,
        subscriptionStatus: status.isActive ? 'active' : (userData?.subscription_status || 'inactive'),
        subscriptionPlan: status.planId || userData?.subscription_plan || 'free',
        subscriptionId: userData?.id || null,
        customerId: userData?.stripe_customer_id || null,
        subscriptionEndDate: status.expiresAt?.toISOString() || userData?.subscription_end_date || null,
        subscriptionStartDate: userData?.subscription_start_date || null,
        trialStartDate: userData?.trial_start_date || null,
        isActive: status.isActive,
        cancelAtPeriodEnd: userData?.cancel_at_period_end || false,
        currentPeriodStart: userData?.current_period_start || null,
        currentPeriodEnd: status.expiresAt?.toISOString() || userData?.current_period_end || null,
        lastPaymentStatus: userData?.last_payment_status || null,
        nextBillingDate: status.expiresAt?.toISOString() || userData?.current_period_end || null,
        // Additional fields for compatibility
        features: status.features,
        lastUpdated: status.lastUpdated.toISOString(),
        source: status.source
      };

      console.log('✅ [LEGACY] Subscription status retrieved:', {
        email: userEmail,
        plan: legacyResponse.subscriptionPlan,
        isActive: legacyResponse.isActive,
        source: status.source
      });

      return NextResponse.json(legacyResponse);
    }

    // Handle new format (refresh request)
    const userIdentity = await authGuard.requireAuthentication();
    
    console.log('🔄 Refreshing subscription status for user:', userIdentity.email);

    // Log the refresh request
    await auditLogger.logSystemEvent('subscription_status_refresh', {
      userId: userIdentity.userId,
      email: userIdentity.email,
      requestId,
      timestamp: new Date().toISOString()
    });

    // Refresh subscription cache
    await subscriptionStatusService.refreshSubscriptionCache(userIdentity.userId);

    // Get fresh status
    const status = await subscriptionStatusService.getSubscriptionStatus(userIdentity.userId);

    console.log('✅ Subscription status refreshed:', {
      isActive: status.isActive,
      planId: status.planId,
      source: status.source
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription status refreshed',
      data: {
        ...status,
        expiresAt: status.expiresAt ?? null,
        lastUpdated: status.lastUpdated
      },
      requestId
    });

  } catch (error) {
    console.error('❌ Error in subscription status POST:', error);

    // Log the error
    await auditLogger.logSystemEvent('subscription_status_post_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId,
      timestamp: new Date().toISOString()
    });

    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({
        hasSubscription: false,
        isPremium: false,
        subscriptionStatus: 'inactive',
        subscriptionPlan: 'free',
        subscriptionId: null,
        customerId: null,
        subscriptionEndDate: null,
        subscriptionStartDate: null,
        trialStartDate: null,
        isActive: false,
        cancelAtPeriodEnd: false,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        lastPaymentStatus: null,
        nextBillingDate: null
      }, { status: 200 });
    }

    return NextResponse.json(
      { 
        error: 'Failed to get subscription status',
        requestId
      },
      { status: 500 }
    );
  }
}
