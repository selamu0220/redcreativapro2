import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    return NextResponse.json({ error: 'Feature not available' }, { status: 503 });
}
