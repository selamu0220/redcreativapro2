/**
 * Make.com Integration Utilities
 * 
 * Handles communication with Make.com webhooks for automations
 */

export type MakeEventType =
    | 'payment.succeeded'
    | 'payment.failed'
    | 'user.registered'
    | 'subscription.created'
    | 'subscription.updated'
    | 'subscription.cancelled'
    | 'error.critical';

export interface MakeWebhookPayload {
    eventType: MakeEventType;
    timestamp: string;
    data: Record<string, any>;
}

/**
 * Send an event to Make.com webhook
 * 
 * @param eventType - Type of event to send
 * @param data - Event data payload
 * @returns Promise that resolves when webhook is called
 */
export async function notifyMake(
    eventType: MakeEventType,
    data: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn('[Make] MAKE_WEBHOOK_URL not configured, skipping notification');
        return { success: false, error: 'Webhook URL not configured' };
    }

    const payload: MakeWebhookPayload = {
        eventType,
        timestamp: new Date().toISOString(),
        data,
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(process.env.MAKE_WEBHOOK_SECRET && {
                    'X-Webhook-Secret': process.env.MAKE_WEBHOOK_SECRET,
                }),
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Make] Webhook failed:', response.status, errorText);
            return { success: false, error: `HTTP ${response.status}: ${errorText}` };
        }

        console.log(`[Make] ✅ Event '${eventType}' sent successfully`);
        return { success: true };
    } catch (error) {
        console.error('[Make] Webhook error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Format currency amount for display
 */
export function formatPaymentAmount(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amount);
}
