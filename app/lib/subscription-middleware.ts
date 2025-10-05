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

// Default fallback subscription status
const DEFAULT_SUBSCRIPTION_STATUS: SubscriptionStatus = {
  planType: 'free',
  isActive: false,
  daysRemaining: 0,
  canAccessTools: false,
  subscription: null,
  trialInfo: null,
  expirationDate: null
};

export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  // Return default status if no userId provided
  if (!userId) {
    console.warn('No userId provided to checkSubscriptionStatus');
    return DEFAULT_SUBSCRIPTION_STATUS;
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('/api/subscription/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Log the specific error but don't throw
      console.warn(`Subscription API returned ${response.status}: ${response.statusText}`);
      
      // Try to get error details
      try {
        const errorData = await response.text();
        console.warn('Subscription API error details:', errorData);
      } catch (parseError) {
        console.warn('Could not parse subscription API error response');
      }
      
      return DEFAULT_SUBSCRIPTION_STATUS;
    }

    const data = await response.json();
    
    // Validate the response structure
    if (!data || typeof data !== 'object') {
      console.warn('Invalid subscription status response format');
      return DEFAULT_SUBSCRIPTION_STATUS;
    }

    // Ensure all required fields are present with defaults
    return {
      planType: data.planType || 'free',
      isActive: Boolean(data.isActive),
      daysRemaining: Number(data.daysRemaining) || 0,
      canAccessTools: Boolean(data.canAccessTools),
      subscription: data.subscription || null,
      trialInfo: data.trialInfo || null,
      expirationDate: data.expirationDate || null
    };

  } catch (error) {
    // Handle different types of errors gracefully
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('Subscription status request timed out');
      } else if (error.message.includes('fetch')) {
        console.warn('Network error fetching subscription status:', error.message);
      } else {
        console.warn('Error checking subscription status:', error.message);
      }
    } else {
      console.warn('Unknown error checking subscription status:', error);
    }
    
    // Always return safe defaults instead of throwing
    return DEFAULT_SUBSCRIPTION_STATUS;
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