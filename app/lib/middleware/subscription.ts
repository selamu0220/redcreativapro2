import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase para middleware
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rutas que requieren suscripción premium
const PREMIUM_ROUTES = [
  '/escritor-ia/advanced',
  '/ai-browser/premium',
  '/dashboard/analytics',
  '/subscription/manage'
];

// Funciones que requieren suscripción premium
const PREMIUM_FEATURES = [
  'enhanced_auto_improve',
  'advanced_ai_models',
  'unlimited_generations',
  'priority_support',
  'custom_templates',
  'export_formats',
  'collaboration_tools'
];

export interface SubscriptionStatus {
  isActive: boolean;
  plan: 'free' | 'monthly' | 'lifetime' | 'discounted';
  expiresAt?: Date;
  features: string[];
}

export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      return {
        isActive: false,
        plan: 'free',
        features: []
      };
    }

    // Verificar si la suscripción ha expirado (solo para planes mensuales)
    const now = new Date();
    const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;
    
    if (subscription.plan_type === 'monthly' && expiresAt && expiresAt < now) {
      // Marcar suscripción como expirada
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', subscription.id);

      return {
        isActive: false,
        plan: 'free',
        features: []
      };
    }

    // Determinar características disponibles según el plan
    let features: string[] = [];
    
    switch (subscription.plan_type) {
      case 'monthly':
      case 'lifetime':
      case 'discounted':
        features = PREMIUM_FEATURES;
        break;
      default:
        features = [];
    }

    return {
      isActive: true,
      plan: subscription.plan_type,
      expiresAt: expiresAt || undefined,
      features
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return {
      isActive: false,
      plan: 'free',
      features: []
    };
  }
}

export function hasFeatureAccess(subscriptionStatus: SubscriptionStatus, feature: string): boolean {
  return subscriptionStatus.isActive && subscriptionStatus.features.includes(feature);
}

export function requiresPremium(pathname: string): boolean {
  return PREMIUM_ROUTES.some(route => pathname.startsWith(route));
}

export async function subscriptionMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta requiere suscripción premium
  if (!requiresPremium(pathname)) {
    return NextResponse.next();
  }

  // Obtener token de autenticación
  const token = request.cookies.get('sb-access-token')?.value;
  
  if (!token) {
    // Redirigir a login si no hay token
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verificar token y obtener usuario
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar estado de suscripción
    const subscriptionStatus = await checkSubscriptionStatus(user.id);
    
    if (!subscriptionStatus.isActive) {
      // Redirigir a página de planes si no tiene suscripción activa
      const upgradeUrl = new URL('/planes', request.url);
      upgradeUrl.searchParams.set('feature', 'premium_access');
      upgradeUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(upgradeUrl);
    }

    // Agregar información de suscripción a los headers para uso en la aplicación
    const response = NextResponse.next();
    response.headers.set('x-subscription-status', JSON.stringify(subscriptionStatus));
    
    return response;
  } catch (error) {
    console.error('Subscription middleware error:', error);
    
    // En caso de error, redirigir a página de planes
    const upgradeUrl = new URL('/planes', request.url);
    upgradeUrl.searchParams.set('error', 'subscription_check_failed');
    return NextResponse.redirect(upgradeUrl);
  }
}

// Función helper para verificar acceso a características específicas
export async function checkFeatureAccess(
  userId: string, 
  feature: string
): Promise<{ hasAccess: boolean; subscriptionStatus: SubscriptionStatus }> {
  const subscriptionStatus = await checkSubscriptionStatus(userId);
  const hasAccess = hasFeatureAccess(subscriptionStatus, feature);
  
  return { hasAccess, subscriptionStatus };
}

// Función para obtener límites basados en el plan
export function getPlanLimits(plan: SubscriptionStatus['plan']) {
  switch (plan) {
    case 'monthly':
    case 'lifetime':
    case 'discounted':
      return {
        dailyGenerations: -1, // Ilimitado
        documentsPerMonth: -1, // Ilimitado
        aiModels: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'gemini-pro'],
        exportFormats: ['pdf', 'docx', 'html', 'markdown'],
        supportLevel: 'priority'
      };
    case 'free':
    default:
      return {
        dailyGenerations: 10,
        documentsPerMonth: 5,
        aiModels: ['gpt-3.5-turbo'],
        exportFormats: ['pdf'],
        supportLevel: 'community'
      };
  }
}