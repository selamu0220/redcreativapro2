/**
 * Subscription Middleware - Unified Type Definitions
 */

export interface SubscriptionStatus {
  isActive: boolean;
  plan: 'free' | 'trial' | 'pro' | 'premium';
  planType: 'free' | 'trial' | 'pro' | 'premium' | 'expired' | 'lifetime';
  daysRemaining: number;
  expirationDate: string | null;
  canAccessTools: boolean;
  subscription: any;
  trialInfo: any;
  features: string[];
  cancelAtPeriodEnd?: boolean;
}

export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  // TODO: Implement with Clerk metadata
  return {
    isActive: false,
    plan: 'free',
    planType: 'free',
    daysRemaining: 0,
    expirationDate: null,
    canAccessTools: false,
    subscription: null,
    trialInfo: null,
    features: [],
    cancelAtPeriodEnd: false
  };
}

export function shouldBlockAccess(status: SubscriptionStatus): boolean {
  // For now, don't block access during migration
  return false;
}

export function getAccessMessage(status: SubscriptionStatus): string {
  if (!status.isActive) {
    return 'Upgrade to access premium features';
  }
  return '';
}

export function getBlockingMessageColor(status: SubscriptionStatus): string {
  return 'yellow';
}

export function getPlanLimits(plan: string) {
  const limits = {
    free: {
      emailsPerMonth: 10,
      templatesPerMonth: 5,
      aiGenerationsPerMonth: 20
    },
    trial: {
      emailsPerMonth: 50,
      templatesPerMonth: 20,
      aiGenerationsPerMonth: 100
    },
    pro: {
      emailsPerMonth: 500,
      templatesPerMonth: 100,
      aiGenerationsPerMonth: 1000
    },
    premium: {
      emailsPerMonth: -1, // unlimited
      templatesPerMonth: -1,
      aiGenerationsPerMonth: -1
    }
  };

  return limits[plan as keyof typeof limits] || limits.free;
}
