/**
 * Subscription Status API Endpoint
 * 
 * Provides secure access to subscription status with authentication validation.
 * Migrated to Clerk Auth and Freemium Model (3 daily uses for free users).
 */

import { NextRequest, NextResponse } from 'next/server';
import { authGuard } from '../../../lib/auth/AuthenticationGuard';
import { auditLogger } from '../../../lib/audit/AuditLogger';
import { currentUser } from '@clerk/nextjs/server';
import { serverUsage } from '../../../lib/usage/server-usage';

export async function GET(request: NextRequest) {
  const requestId = `status_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();

  try {
    // Authenticate user via Clerk
    // Note: authGuard is now using Clerk under the hood
    // But we can also access Clerk directly for metadata
    const user = await currentUser();

    if (!user) {
      // Return fail-safe for non-authenticated (public) or let them know they are "free" with 0 usage?
      // Spec says: "funcione de manera gratis iniciar sesion en la app... utilizar cualquier herramienta una 3 veces al día"
      // So if not logged in, maybe they can't use it? 
      // But the existing code returned a "free" fallback. 
      // Let's return the "not authenticated" state but with friendly free structure if needed.
      return NextResponse.json({
        success: true,
        data: {
          isActive: false,
          planId: 'free',
          source: 'public',
          remainingDailyUses: 0, // Must login to get free uses
          isAuthenticated: false
        }
      });
    }

    const userId = user.id;
    const email = user.emailAddresses[0]?.emailAddress;
    const publicMetadata = user.publicMetadata as { paiddd?: boolean; free_features?: boolean };

    // Check if user is paid
    // The user mentioned keys "paiddd" or "free_features" in the prompt.
    // "paiddd" description: "all ,paid"
    const isPaid = !!publicMetadata.paiddd;

    console.log(`🔍 Checking status for ${email} (ID: ${userId}). Paid: ${isPaid}`);

    // Track usage
    let usageStats = { usage: 0, limit: 3, allowed: true };

    if (!isPaid) {
      usageStats = await serverUsage.checkUsageCount(userId);
    } else {
      usageStats = { usage: 0, limit: -1, allowed: true }; // Unlimited
    }

    const responseTime = Date.now() - startTime;

    const statusData = {
      // Legacy fields for frontend compatibility
      hasSubscription: isPaid,
      isPremium: isPaid,
      subscriptionStatus: isPaid ? 'active' : 'inactive',
      subscriptionPlan: isPaid ? 'premium' : 'free',
      subscriptionId: 'clerk_managed',
      customerId: userId,

      // New fields
      isActive: true, // User is active in the system regardless of plan
      planId: isPaid ? 'premium' : 'free',
      source: 'clerk_metadata',
      expiresAt: null,
      lastUpdated: new Date().toISOString(),
      features: {
        ...publicMetadata,
        dailyUsage: usageStats.usage,
        dailyLimit: usageStats.limit
      },
      usage: usageStats
    };

    return NextResponse.json({
      success: true,
      data: statusData,
      // Flatten data for clients expecting direct props if 'data' key is unwrapped
      ...statusData,
      responseTime,
      requestId
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Error fetching subscription status:', error);

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
  // POST might be used for incrementing usage? Or refreshing?
  // Let's support an "increment" action if this endpoint was used for check-and-consume
  // But typically GET is just status. POST was used for "refresh".
  // We'll keep it simple: POST can also return status, or we can add a specific action.
  // For now, let's just mirror GET logic but maybe with a "consume" flag if the client sends it?
  // The client likely calls a different endpoint to consume.
  // However, if the user wants "utilizar cualquier herramienta una 3 veces al día", the tools need to checking this.
  // We'll assume the tools call a usage check. 
  // If THIS route is just status, we return status.
  // If the POST was doing something specific before, we should try to preserve it or deprecate it safely.
  // The previous POST had "refresh" logic. Clerk metadata is fairly instant but we can't "refresh" it from here easily without API calls to Stripe.

  return GET(request);
}
