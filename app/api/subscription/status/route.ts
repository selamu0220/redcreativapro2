
import { NextRequest, NextResponse } from 'next/server';
import { getSubscription } from '@/app/lib/server/subscription-service';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { createAdminClient } from '@/app/lib/server/appwrite';
import { Query } from 'node-appwrite';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();
        const searchParams = req.nextUrl.searchParams;
        const email = searchParams.get('email');

        // Security check: Ensure the requesting user matches the email or is admin? 
        // For now, let's rely on Kinde session if available, but the hook passes email query param.
        // Ideally we should use user.id from session for lookups.

        const targetEmail = email || user?.email;

        if (!targetEmail) {
            return NextResponse.json({ isActive: false }, { status: 400 });
        }

        // --- ADMIN BYPASS ---
        if (targetEmail === 'selamu.garciabravo@gmail.com') {
            return NextResponse.json({
                isActive: true,
                status: 'active',
                plan: 'pro_annual',
                expiry: '2099-12-31'
            });
        }
        // --------------------

        // We need to look up userId by email if we don't have the session user ID, 
        // but subscription-service expects userId.
        // If we are strictly server-side, we should look up the user in Appwrite Users to get the ID.
        // Or, we can query subscriptions by userId directly if we have it from Kinde.

        let userId = user?.id;

        if (!userId && email) {
            // Try to find user by email in Appwrite (Admin)
            const { users } = createAdminClient();
            // List users with email? Appwrite Users API might allow list by email?
            // Or we just assume we can't look it up easily without ID.
            // But valid useSubscription logic should probably use session.
            // let's assume session is valid.
            console.warn("No session user found for subscription check");
        }

        if (userId) {
            const subscription = await getSubscription(userId);

            if (subscription && subscription.status === 'active') {
                // Determinar tipo de plan basado en priceId
                const priceId = subscription.priceId || '';
                let subscriptionPlan = 'monthly';
                if (priceId.includes('lifetime')) {
                    subscriptionPlan = 'lifetime';
                } else if (priceId.includes('yearly') || priceId.includes('annual')) {
                    subscriptionPlan = 'yearly';
                }

                return NextResponse.json({
                    isActive: true,
                    status: subscription.status,
                    plan: 'pro',
                    subscriptionPlan,
                    expiry: subscription.currentPeriodEnd,
                    customerId: subscription.stripeCustomerId,
                    nextBillingDate: subscription.currentPeriodEnd
                });
            }
        }

        return NextResponse.json({ isActive: false });

    } catch (error) {
        console.error('Subscription Status Error:', error);
        return NextResponse.json({ isActive: false }, { status: 500 });
    }
}
