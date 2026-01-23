import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
    return NextResponse.json({ error: 'Feature not available' }, { status: 503 });
}
