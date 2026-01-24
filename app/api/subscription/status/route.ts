import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { getSubscription } from '../../../lib/server/subscription-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const subscription = await getSubscription(user.id);

        return NextResponse.json({
            subscription: subscription,
            status: subscription?.status || 'free',
            isPremium: subscription?.status === 'active' || subscription?.status === 'trialing',
            hasPremiumAccess: subscription?.status === 'active' || subscription?.status === 'trialing'
        });

    } catch (error: any) {
        console.error('Subscription status error:', error);
        return NextResponse.json(
            { error: 'Failed to get subscription status' },
            { status: 500 }
        );
    }
}
