import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    return NextResponse.json({ webhooks: [] });
}

export async function POST(request: NextRequest) {
    return NextResponse.json({ error: 'Feature not available' }, { status: 503 });
}
