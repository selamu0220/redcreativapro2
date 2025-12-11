/**
 * Feature Access Validation API Endpoint
 * 
 * Validates user access to specific features based on subscription status.
 * Implements subscription access validation from the secure payment flow spec.
 */

import { NextRequest, NextResponse } from 'next/server';
import { subscriptionStatusService } from '../../../lib/subscription/SubscriptionStatusService';
import { authGuard } from '../../../lib/auth/AuthenticationGuard';
import { auditLogger } from '../../../lib/audit/AuditLogger';

export async function POST(request: NextRequest) {
  const requestId = `access_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    // Authenticate user
    const userIdentity = await authGuard.requireAuthentication();
    
    // Parse request body
    const { feature, features } = await request.json();
    
    if (!feature && !features) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Feature or features array is required',
          requestId
        },
        { status: 400 }
      );
    }

    console.log('🔐 Checking feature access for user:', userIdentity.email, { feature, features });

    // Log the access check request
    await auditLogger.logSystemEvent('feature_access_check', {
      userId: userIdentity.userId,
      email: userIdentity.email,
      feature: feature || features,
      requestId,
      timestamp: new Date().toISOString()
    });

    let result;

    if (feature) {
      // Single feature check
      result = await subscriptionStatusService.validateSubscriptionAccess(
        userIdentity.userId,
        feature
      );
      
      console.log(`✅ Feature access result for '${feature}':`, result);
      
      return NextResponse.json({
        success: true,
        data: {
          feature,
          ...result
        },
        requestId
      });
    } else if (features && Array.isArray(features)) {
      // Multiple features check
      const results = await Promise.all(
        features.map(async (f: string) => {
          const access = await subscriptionStatusService.validateSubscriptionAccess(
            userIdentity.userId,
            f
          );
          return {
            feature: f,
            ...access
          };
        })
      );
      
      console.log('✅ Multiple feature access results:', results);
      
      return NextResponse.json({
        success: true,
        data: results,
        requestId
      });
    }

  } catch (error) {
    console.error('❌ Error checking feature access:', error);

    // Log the error
    await auditLogger.logSystemEvent('feature_access_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId,
      timestamp: new Date().toISOString()
    });

    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          requestId
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check feature access',
        requestId
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for quick feature access check via query parameters
 */
export async function GET(request: NextRequest) {
  const requestId = `access_get_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const { searchParams } = new URL(request.url);
  const feature = searchParams.get('feature');

  try {
    if (!feature) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Feature parameter is required',
          requestId
        },
        { status: 400 }
      );
    }

    // Authenticate user
    const userIdentity = await authGuard.requireAuthentication();
    
    console.log(`🔐 Quick feature access check for '${feature}' by user:`, userIdentity.email);

    // Check feature access
    const result = await subscriptionStatusService.validateSubscriptionAccess(
      userIdentity.userId,
      feature
    );

    // Log the access check
    await auditLogger.logSystemEvent('quick_feature_access_check', {
      userId: userIdentity.userId,
      email: userIdentity.email,
      feature,
      hasAccess: result.hasAccess,
      requestId,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ Quick access result for '${feature}':`, result);

    return NextResponse.json({
      success: true,
      data: {
        feature,
        ...result
      },
      requestId
    });

  } catch (error) {
    console.error('❌ Error in quick feature access check:', error);

    // Log the error
    await auditLogger.logSystemEvent('quick_feature_access_error', {
      feature,
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId,
      timestamp: new Date().toISOString()
    });

    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          requestId
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check feature access',
        requestId
      },
      { status: 500 }
    );
  }
}