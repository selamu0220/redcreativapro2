// Funciones para simular verificación de sesiones en modo desarrollo

export function isDevMode(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export function createMockVerificationResponse(sessionId: string) {
  console.log('🔧 Modo desarrollo: Simulando verificación de sesión exitosa');
  
  // Simular diferentes tipos de respuesta basado en el sessionId
  const mockResponses = {
    success: {
      success: true,
      planType: 'monthly',
      amount: 4.99,
      paymentMethod: 'card',
      session: {
        id: sessionId,
        customer_email: 'test@example.com',
        payment_status: 'paid',
        subscription_id: `sub_mock_${Date.now()}`,
      },
    },
    yearly: {
      success: true,
      planType: 'yearly',
      amount: 142.80,
      paymentMethod: 'card',
      session: {
        id: sessionId,
        customer_email: 'test@example.com',
        payment_status: 'paid',
        subscription_id: `sub_mock_${Date.now()}`,
      },
    },
    lifetime: {
      success: true,
      planType: 'lifetime',
      amount: 429.00,
      paymentMethod: 'card',
      session: {
        id: sessionId,
        customer_email: 'test@example.com',
        payment_status: 'paid',
        subscription_id: `lifetime_mock_${Date.now()}`,
      },
    }
  };

  // Determinar el tipo de plan basado en el sessionId
  if (sessionId.includes('yearly')) {
    return mockResponses.yearly;
  } else if (sessionId.includes('lifetime')) {
    return mockResponses.lifetime;
  } else {
    return mockResponses.success;
  }
}