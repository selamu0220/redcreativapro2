import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
    return NextResponse.json({ error: 'Feature not available' }, { status: 503 });
}
