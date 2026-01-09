import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function POST(req: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { priceId } = await req.json();

        if (!priceId) {
            return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            customer_email: user.email!,
            metadata: {
                userId: user.id,
            },
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/planes?subscription=canceled`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
