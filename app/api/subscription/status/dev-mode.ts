// Modo de desarrollo para status de suscripción
export function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development' && 
         (!process.env.STRIPE_SECRET_KEY || 
          process.env.STRIPE_SECRET_KEY.includes('sk_test_4eC39HqLyjWDarjtT1zdp7dc'));
}

export function getMockSubscriptionStatus(userEmail: string) {
  // Simular diferentes estados según el email para testing
  if (userEmail.includes('expired')) {
    return {
      hasSubscription: false,
      isPremium: false,
      subscriptionPlan: null,
      subscriptionActive: false,
      planType: 'expired',
      daysRemaining: 0,
      canAccessTools: false,
      mock: true,
      message: 'Suscripción expirada - Modo desarrollo'
    };
  }
  
  return {
    hasSubscription: true,
    isPremium: true,
    subscriptionPlan: 'premium',
    subscriptionActive: true,
    planType: 'premium',
    daysRemaining: 30,
    canAccessTools: true,
    mock: true,
    message: 'Suscripción activa - Modo desarrollo'
  };
}