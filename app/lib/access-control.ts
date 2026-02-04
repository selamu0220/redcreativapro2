import { createClient } from '@/app/lib/supabase/server';
import { getSubscription } from './server/subscription-service';
import { redirect } from 'next/navigation';

export async function checkSubscriptionAccess() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Admin Bypass
    if (user.email === 'selamu.garciabravo@gmail.com') {
        return true;
    }

    const subscription = await getSubscription(user.id);

    if (!subscription || subscription.status !== 'active') {
        // Allow trialing status
        if (subscription?.status === 'trialing') return true;
        return false;
    }

    return true;
}

export async function requireSubscription() {
    const hasAccess = await checkSubscriptionAccess();
    if (!hasAccess) {
        redirect('/planes');
    }
}
