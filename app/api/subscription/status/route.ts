import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getSubscription } from '../../../lib/server/subscription-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const subscription = await getSubscription(user.id);

        const isAdmin = user.email === 'selamu.garciabravo@gmail.com';
        const isActive = subscription?.status === 'active' || subscription?.status === 'trialing' || isAdmin;

        return NextResponse.json({
            subscription: subscription,
            status: isAdmin ? 'active' : (subscription?.status || 'free'),
            isPremium: isActive,
            hasPremiumAccess: isActive
        });

    } catch (error: any) {
        console.error('Subscription status error:', error);
        return NextResponse.json(
            { error: 'Failed to get subscription status' },
            { status: 500 }
        );
    }
}
