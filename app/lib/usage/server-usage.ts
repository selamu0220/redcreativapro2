import { createClient } from '@/utils/supabase/server';

const FREE_LIMITS = {
  emails: 5,
  generations: 10,
  words: 2000
};

const PRO_LIMITS = {
  emails: 1000,
  generations: 1000,
  words: 100000
};

export const serverUsage = {
  async checkUsageCount(userId: string, feature: string = 'generations'): Promise<{ usage: number; limit: number; allowed: boolean }> {
    const supabase = await createClient();

    // 1. Get User Profile for Subscription Status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_pro, subscription_status')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile usage:', profileError);
      // Fail safe: allow if error, or block? Let's allow but log.
      return { usage: 0, limit: 10, allowed: true };
    }

    const isPro = profile?.is_pro || false;
    const limits = isPro ? PRO_LIMITS : FREE_LIMITS;
    const limit = limits[feature as keyof typeof limits] || 10;

    // 2. Count Usage for Current Period (Monthly - approximation: last 30 days)
    // Ideally we use subscription_period_start from Stripe, but for now 30 days window or 1st of month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const { count, error: countError } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('feature', feature)
      .gte('created_at', firstDayOfMonth);

    if (countError) {
      console.error('Error counting usage:', countError);
      return { usage: 0, limit, allowed: true };
    }

    const currentUsage = count || 0;

    return {
      usage: currentUsage,
      limit,
      allowed: currentUsage < limit
    };
  },

  async incrementUsage(userId: string, feature: string = 'generations', amount: number = 1): Promise<number> {
    const supabase = await createClient();

    const { error } = await supabase.from('usage_logs').insert({
      user_id: userId,
      feature: feature,
      amount: amount
    });

    if (error) {
      console.error('Error incrementing usage:', error);
    }

    // Also update words_used in profile if applicable? 
    // For now logging is sufficient for the count check above.
    return amount;
  },

  async getUsage(userId: string): Promise<number> {
    const supabase = await createClient();
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth);

    return count || 0;
  }
};
