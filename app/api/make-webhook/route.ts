import { NextRequest, NextResponse } from 'next/server';
import { notifyMake, MakeEventType } from '@/app/lib/make-utils';

/**
 * POST /api/make-webhook
 * 
 * Internal endpoint to trigger Make.com automations
 * Use this to send events from anywhere in the app to Make
 */
export async function POST(request: NextRequest) {
    try {
        const { eventType, data } = await request.json();

        if (!eventType) {
            return NextResponse.json(
                { error: 'eventType is required' },
                { status: 400 }
            );
        }

        // Validate event type
        const validEventTypes: MakeEventType[] = [
            'payment.succeeded',
            'payment.failed',
            'user.registered',
            'subscription.created',
            'subscription.updated',
            'subscription.cancelled',
            'error.critical',
        ];

        if (!validEventTypes.includes(eventType)) {
            return NextResponse.json(
                { error: `Invalid eventType. Valid types: ${validEventTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Send to Make
        const result = await notifyMake(eventType, data || {});

        if (!result.success) {
            return NextResponse.json(
                { error: result.error, sent: false },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Event '${eventType}' sent to Make.com`,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[Make Webhook] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/make-webhook
 * 
 * Health check endpoint for Make webhook
 */
export async function GET() {
    const isConfigured = !!process.env.MAKE_WEBHOOK_URL;

    return NextResponse.json({
        status: 'ok',
        configured: isConfigured,
        message: isConfigured
            ? 'Make.com integration is configured'
            : 'MAKE_WEBHOOK_URL not set',
    });
}
