import { NextRequest, NextResponse } from 'next/server';
import { SentinelMonitor } from '@/app/nexus-ai/monitoring/SentinelMonitor';

export async function GET(req: NextRequest) {
    const sentinel = SentinelMonitor.getInstance();
    const status = sentinel.getSystemStatus();

    return NextResponse.json({
        ...status,
        timestamp: Date.now(),
        version: '1.0.0-nexus'
    });
}
