export interface SubscriptionData {
  userId: string;
  stripeCustomerId: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'paused';
  priceId: string;
  currentPeriodEnd: Date;
}

export async function getSubscription(userId: string) {
  return null;
}

export async function getSubscriptionByCustomerId(customerId: string) {
  return null;
}

export async function upsertSubscription(data: SubscriptionData) {
  return null;
}
