# Verification Guide: Stripe & Appwrite Integration

This guide will help you verify that the subscription system is working correctly.

## 1. Environment Setup
Ensure your `.env.local` file has the following keys:
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...

# Appwrite
NEXT_PUBLIC_APPWRITE_PROJECT_ID=...
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_API_KEY=... # Must have API Key with Database and User read/write permissions
```

## 2. Stripe Webhook Testing
Since we are using local development, you need to forward Stripe webhooks to your local machine.

1.  **Install Stripe CLI** (if not installed): [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2.  **Login**: `stripe login`
3.  **Listen**:
    ```bash
    stripe listen --forward-to localhost:3000/api/stripe/webhook
    ```
4.  **Copy Secret**: The command above will output a webhook secret (e.g., `whsec_...`). Paste this into your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

## 3. Appwrite Database Setup
Ensure you have an Appwrite Database created.
1.  **Database ID**: `main-db` (or update `app/lib/server/appwrite.ts` if different).
2.  **Collection ID**: `subscriptions` (or update `app/lib/server/appwrite.ts`).
3.  **Collection Attributes**:
    - `userId` (String, 255, Required)
    - `stripeCustomerId` (String, 255, Required)
    - `status` (String, 50, Required)
    - `priceId` (String, 255, Required)
    - `currentPeriodEnd` (String, 255, Required)

## 4. Testing the Flow
1.  **Start App**: `npm run dev`
2.  **Navigate**: Go to `http://localhost:3000/planes`.
3.  **Subscribe**: Click on "Suscribirse Mensual".
    - You should be redirected to Stripe Checkout.
4.  **Pay**: Use a Stripe Test Card (e.g., `4242 4242 4242 4242`).
5.  **Success**: After payment, you should be redirected to `/dashboard?subscription=success`.
6.  **Verify Appwrite**: Check your Appwrite "subscriptions" collection. A new document should exist with your User ID.
7.  **Verify Access**: Try to access `/escritor-ia`. It should now allow you in.

## 5. Testing Access Control (Blocking)
1.  **Login** with a new user (or delete the subscription document in Appwrite).
2.  **Navigate**: Try to go to `http://localhost:3000/escritor-ia`.
3.  **Result**: You should be redirected back to `/planes`.
