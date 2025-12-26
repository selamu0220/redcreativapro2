# PostHog post-wizard report

The wizard has completed a deep integration of your Red Creativa Pro Next.js project. PostHog has been configured to track user behavior across the entire customer journey, from initial visits and trials through subscription purchase and ongoing product usage.

## Integration Summary

### Core Setup
- **Client-side initialization**: Added PostHog to `src/instrumentation-client.ts` alongside existing Sentry integration
- **Server-side client**: Created `app/lib/posthog-server.ts` for server-side event tracking
- **Environment variables**: Configured `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` in `.env.local`
- **Dependencies installed**: `posthog-js` (client) and `posthog-node` (server)

### Events Instrumented

| Event Name | Description | File Path |
|------------|-------------|-----------|
| `guest_trial_started` | Anonymous user started a guest trial without registration | `app/components/AuthPageClient.tsx` |
| `subscription_plan_selected` | User clicked on a subscription plan to begin checkout | `app/planes/page.tsx` |
| `subscription_checkout_started` | User initiated Stripe checkout for a subscription plan | `app/planes/page.tsx` |
| `subscription_purchase_completed` | User successfully completed a subscription purchase | `app/components/SuccessPageClient.tsx` |
| `subscription_cancelled` | User cancelled their subscription | `app/subscription/page.tsx` |
| `checkout_abandoned` | User cancelled or abandoned the checkout process | `app/cancel/page.tsx` |
| `ai_content_generated` | User successfully generated AI-improved content | `app/escritor-ia/page.tsx` |
| `usage_limit_reached` | Free user reached their daily usage limit | `app/escritor-ia/page.tsx` |
| `email_generated` | User generated an AI-powered email | `app/correos-ia/page.tsx` |
| `newsletter_subscribed` | User subscribed to the blog newsletter | `components/blog/Newsletter.tsx` |
| `contact_form_submitted` | User submitted the contact/support form | `app/contacto/ContactoClient.tsx` |
| `email_unsubscribed` | User unsubscribed from email communications | `app/unsubscribe/page.tsx` |
| `cta_clicked` | User clicked a CTA button on the homepage | `app/components/HomePageClient.tsx` |

### Additional Features
- **User identification**: Users are identified with PostHog after successful subscription purchases
- **Error tracking**: `posthog.captureException()` added to catch errors in AI generation, checkout, and email generation flows
- **Event properties**: All events include relevant contextual properties (plan type, model used, user status, etc.)

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- **Analytics basics**: [https://eu.posthog.com/project/111039/dashboard/469475](https://eu.posthog.com/project/111039/dashboard/469475)

### Insights
- **Subscription Conversion Funnel**: [https://eu.posthog.com/project/111039/insights/wRRrlX31](https://eu.posthog.com/project/111039/insights/wRRrlX31)
  - Tracks users from plan selection through checkout to purchase completion
- **AI Content Generation Trends**: [https://eu.posthog.com/project/111039/insights/k8EXYJU4](https://eu.posthog.com/project/111039/insights/k8EXYJU4)
  - Tracks AI content and email generation events over time
- **User Acquisition & Trials**: [https://eu.posthog.com/project/111039/insights/JQq9t1Q4](https://eu.posthog.com/project/111039/insights/JQq9t1Q4)
  - Tracks new signups and guest trial starts
- **Churn Events**: [https://eu.posthog.com/project/111039/insights/IkfXeeXs](https://eu.posthog.com/project/111039/insights/IkfXeeXs)
  - Tracks subscription cancellations, checkout abandonments, and email unsubscribes
- **Usage Limits & Conversions**: [https://eu.posthog.com/project/111039/insights/5FHlJBXK](https://eu.posthog.com/project/111039/insights/5FHlJBXK)
  - Tracks when users hit usage limits and engagement events

## Configuration

Environment variables are set in `.env.local`:
```
NEXT_PUBLIC_POSTHOG_KEY=phc_aPYTzfxv1BjVLzfBdQE422GRDpuYDsBDCYROimUG9bc
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

Make sure to add these same variables to your production environment (Vercel, etc.).
