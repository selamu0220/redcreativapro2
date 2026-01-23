import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    return NextResponse.json({ integrations: [] });
}

export async function POST(request: NextRequest) {
    return NextResponse.json({ error: 'Feature not available' }, { status: 503 });
}

export async function DELETE(request: NextRequest) {
    return NextResponse.json({ error: 'Feature not available' }, { status: 503 });
}
