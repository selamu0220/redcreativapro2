// Modo de desarrollo para testing sin Stripe válido
export function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development' && 
         (!process.env.STRIPE_SECRET_KEY || 
          process.env.STRIPE_SECRET_KEY.includes('sk_test_4eC39HqLyjWDarjtT1zdp7dc'));
}

export function createMockCheckoutSession(userEmail: string, priceId: string) {
  const mockSessionId = `cs_test_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    sessionId: mockSessionId,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id=${mockSessionId}&mock=true`,
    mock: true,
    message: 'Sesión de pago simulada - Modo desarrollo'
  };
}

export function getMockSubscriptionStatus() {
  return {
    hasSubscription: true,
    isPremium: true,
    subscriptionPlan: 'premium',
    subscriptionActive: true,
    planType: 'premium',
    daysRemaining: 30,
    canAccessTools: true,
    mock: true
  };
}