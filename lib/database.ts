import { createClient } from '@supabase/supabase-js';

// ADMIN Client - Bypasses RLS. Use ONLY in server-side API routes (webhooks, etc).
const getAdminClient = () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase Service Role Key');
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
};

// Types corresponding to our Schema
export type SubscriptionStatus = 'free' | 'pro' | 'past_due' | 'canceled';

export interface UserSubscriptionUpdate {
    subscriptionId?: string;
    subscriptionActive: boolean;
    subscriptionStartDate?: string;
    subscriptionCurrentPeriodEnd?: string;
    subscriptionCanceledAt?: string;
    lastPaymentStatus?: string;
    isPremium: boolean;
    customerId?: string;
}

/**
 * Updates a user's subscription status in the 'profiles' table.
 * Called by Stripe Webhook.
 */
export async function updateUserSubscriptionStatusAsync(
    email: string,
    status: string, // 'pro' | 'free'
    details: UserSubscriptionUpdate
): Promise<void> {
    const supabase = getAdminClient();

    // 1. Get User ID from Email
    // Note: 'profiles' usually stores 'id' which matches auth.users.id
    // We might need to look up the user by email first in auth.users?
    // Actually, 'profiles' has an 'email' column based on our migration/schema so we can query it directly.

    const updateData = {
        is_pro: details.isPremium,
        subscription_status: status,
        stripe_customer_id: details.customerId, // Optional update
        updated_at: new Date().toISOString()
    };

    // Remove undefined keys
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('email', email);

    if (error) {
        console.error('Error updating profile subscription:', error);
        throw new Error(`Failed to update subscription for ${email}: ${error.message}`);
    }
}

/**
 * Helper to create or update user (mostly for payment success events if user doesn't exist?
 * Use with caution, usually we prefer standard auth flow).
 */
export async function createOrUpdateUserAsync(data: { email: string, lastPaymentStatus?: string, lastActiveAt?: string }) {
    // Ideally just update metadata if they exist
    const supabase = getAdminClient();
    const { error } = await supabase
        .from('profiles')
        .update({ payment_method: { last_status: data.lastPaymentStatus } }) // Storing locally in a jsonb or separate column
        .eq('email', data.email);

    if (error) console.error('Error updating user payment status:', error);
}

// --- USAGE LIMITS ---

const FREE_WORDS_LIMIT = 5000;

export async function checkUsage(userId: string): Promise<{ canGenerate: boolean; message?: string; usage?: number; limit?: number }> {
    const supabase = getAdminClient();

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('words_used, is_pro, usage_reset_at, email')
        .eq('id', userId)
        .single();



    if (error || !profile) {
        // Fallback or error - assume strict if error?
        console.error('Error checking usage:', error);
        return { canGenerate: false, message: 'Error checking usage limits.' };
    }

    if (profile.is_pro || profile.email === 'selamu.garciabravo@gmail.com') {
        return { canGenerate: true, usage: profile.words_used, limit: -1 }; // -1 for infinite
    }


    // Check reset date (Monthly reset logic)
    const now = new Date();
    const resetDate = new Date(profile.usage_reset_at);

    if (now > resetDate) {
        // Reset usage
        await supabase.from('profiles').update({
            words_used: 0,
            usage_reset_at: new Date(now.setMonth(now.getMonth() + 1)).toISOString()
        }).eq('id', userId);

        return { canGenerate: true, usage: 0, limit: FREE_WORDS_LIMIT };
    }

    if (profile.words_used >= FREE_WORDS_LIMIT) {
        return {
            canGenerate: false,
            message: 'Has alcanzado el límite de 5.000 palabras del plan gratuito. Actualiza a Pro por solo 1€/mes para acceso ilimitado.',
            usage: profile.words_used,
            limit: FREE_WORDS_LIMIT
        };
    }

    return { canGenerate: true, usage: profile.words_used, limit: FREE_WORDS_LIMIT };
}

export async function incrementUsage(userId: string, wordsToAdd: number): Promise<void> {
    const supabase = getAdminClient();

    // RPC or direct increment? Direct update is risky for concurrency but fine for this scale for now.
    // Ideally use an RPC function: increment_usage(user_id, amount)

    const { data: profile } = await supabase.from('profiles').select('words_used').eq('id', userId).single();
    const current = profile?.words_used || 0;

    await supabase.from('profiles').update({
        words_used: current + wordsToAdd
    }).eq('id', userId);
}
