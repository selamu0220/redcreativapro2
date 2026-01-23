import Stripe from 'stripe';

// Lazy initialization to prevent build-time errors when env vars aren't available
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia' as any,
            typescript: true,
        });
    }
    return _stripe;
}

// For backwards compatibility - will throw at runtime if STRIPE_SECRET_KEY is not set
export const stripe = {
    checkout: {
        sessions: {
            create: (...args: Parameters<Stripe['checkout']['sessions']['create']>) =>
                getStripe().checkout.sessions.create(...args),
            retrieve: (...args: Parameters<Stripe['checkout']['sessions']['retrieve']>) =>
                getStripe().checkout.sessions.retrieve(...args),
        },
    },
    subscriptions: {
        retrieve: (...args: Parameters<Stripe['subscriptions']['retrieve']>) =>
            getStripe().subscriptions.retrieve(...args),
        update: (...args: Parameters<Stripe['subscriptions']['update']>) =>
            getStripe().subscriptions.update(...args),
        cancel: (...args: Parameters<Stripe['subscriptions']['cancel']>) =>
            getStripe().subscriptions.cancel(...args),
    },
    customers: {
        create: (...args: Parameters<Stripe['customers']['create']>) =>
            getStripe().customers.create(...args),
        retrieve: (...args: Parameters<Stripe['customers']['retrieve']>) =>
            getStripe().customers.retrieve(...args),
    },
    billingPortal: {
        sessions: {
            create: (...args: Parameters<Stripe['billingPortal']['sessions']['create']>) =>
                getStripe().billingPortal.sessions.create(...args),
        },
    },
    webhooks: {
        constructEvent: (...args: Parameters<Stripe['webhooks']['constructEvent']>) =>
            getStripe().webhooks.constructEvent(...args),
    },
} as unknown as Stripe;
