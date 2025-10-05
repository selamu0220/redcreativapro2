import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface SubscriptionStatus {
  planType: 'free' | 'trial' | 'monthly' | 'yearly' | 'lifetime' | 'expired';
  isActive: boolean;
  daysRemaining: number;
  canAccessTools: boolean;
  subscription: any | null;
  trialInfo: any | null;
  expirationDate: string | null;
}

export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    const response = await fetch('/api/subscription/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking subscription status:', error);
    // Return safe defaults
    return {
      planType: 'free',
      isActive: false,
      daysRemaining: 0,
      canAccessTools: false,
      subscription: null,
      trialInfo: null,
      expirationDate: null
    };
  }
}

export function shouldBlockAccess(subscriptionStatus: SubscriptionStatus): boolean {
  return !subscriptionStatus.canAccessTools;
}

export function getAccessMessage(subscriptionStatus: SubscriptionStatus): string {
  if (subscriptionStatus.planType === 'expired') {
    return 'Tu período de prueba ha expirado. Actualiza a Premium para continuar usando todas las herramientas.';
  }
  
  if (subscriptionStatus.planType === 'trial' && subscriptionStatus.daysRemaining <= 1) {
    return `Te queda ${subscriptionStatus.daysRemaining} día${subscriptionStatus.daysRemaining === 1 ? '' : 's'} de prueba gratuita. ¡Actualiza ahora para no perder el acceso!`;
  }
  
  if (subscriptionStatus.planType === 'trial') {
    return `Tienes ${subscriptionStatus.daysRemaining} días restantes de prueba gratuita.`;
  }
  
  return 'Necesitas una suscripción Premium para acceder a esta herramienta.';
}

export function getBlockingMessageColor(subscriptionStatus: SubscriptionStatus): string {
  if (subscriptionStatus.planType === 'expired') {
    return 'text-red-600 bg-red-50 border-red-200';
  }
  
  if (subscriptionStatus.planType === 'trial' && subscriptionStatus.daysRemaining <= 1) {
    return 'text-red-600 bg-red-50 border-red-200';
  }
  
  if (subscriptionStatus.planType === 'trial' && subscriptionStatus.daysRemaining <= 3) {
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  }
  
  return 'text-blue-600 bg-blue-50 border-blue-200';
}