import { NextRequest, NextResponse } from 'next/server';
import { SentinelMonitor } from '@/app/nexus-ai/monitoring/SentinelMonitor';

export async function GET(req: NextRequest) {
    // Simple auth check simulation (should be protected in real prod)
    // const session = await getSession();
    // if (!session) return new Response('Unauthorized', { status: 401 });

    const sentinel = SentinelMonitor.getInstance();
    const status = sentinel.getSystemStatus();

    // In future: expose detailed metrics history via Sentinel
    return NextResponse.json({
        overview: status,
        // extended metrics could go here
        _meta: {
            serverTime: new Date().toISOString()
        }
    });
}
