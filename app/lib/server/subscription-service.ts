import { supabaseAdmin } from '../auth/supabase-admin';

export interface SubscriptionData {
  id: string;
  userId: string;
  status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused';
  metadata?: any;
  priceId: string;
  quantity?: number;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: Date;
  currentPeriodEnd: Date;
  endedAt?: Date;
  cancelAt?: Date;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
}

export async function getSubscription(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .eq('user_id', userId)
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data;
}

export async function getSubscriptionByCustomerId(customerId: string) {
  // First get the user ID from the customers table
  const { data: customerData, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (customerError || !customerData) {
    console.error('Error fetching customer mapping:', customerError);
    return null;
  }

  return getSubscription(customerData.id);
}

export async function upsertSubscription(data: SubscriptionData) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      id: data.id,
      user_id: data.userId,
      status: data.status,
      metadata: data.metadata || {},
      price_id: data.priceId,
      quantity: data.quantity || 1,
      cancel_at_period_end: data.cancelAtPeriodEnd || false,
      current_period_start: data.currentPeriodStart?.toISOString(),
      current_period_end: data.currentPeriodEnd.toISOString(),
      ended_at: data.endedAt?.toISOString(),
      cancel_at: data.cancelAt?.toISOString(),
      canceled_at: data.canceledAt?.toISOString(),
      trial_start: data.trialStart?.toISOString(),
      trial_end: data.trialEnd?.toISOString()
    });

  if (error) {
    console.error('Error upserting subscription:', error);
    throw error;
  }
}

export async function upsertCustomerToSupabase(uuid: string, customerId: string) {
  const { error } = await supabaseAdmin
    .from('customers')
    .upsert({ id: uuid, stripe_customer_id: customerId });

  if (error) throw error;
}

export async function createOrUpdateProduct(product: any) {
  const { error } = await supabaseAdmin
    .from('products')
    .upsert({
      id: product.id,
      active: product.active,
      name: product.name,
      description: product.description ?? null,
      image: product.images?.[0] ?? null,
      metadata: product.metadata
    });
  if (error) throw error;
}

export async function createOrUpdatePrice(price: any) {
  const { error } = await supabaseAdmin
    .from('prices')
    .upsert({
      id: price.id,
      product_id: typeof price.product === 'string' ? price.product : price.product.id,
      active: price.active,
      currency: price.currency,
      type: price.type,
      unit_amount: price.unit_amount ?? null,
      interval: price.recurring?.interval ?? null,
      interval_count: price.recurring?.interval_count ?? null,
      trial_period_days: price.recurring?.trial_period_days ?? null,
      metadata: price.metadata
    });
  if (error) throw error;
}
