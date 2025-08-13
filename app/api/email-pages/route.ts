import { NextRequest, NextResponse } from 'next/server';
import { getUserEmailPagesAsync } from '../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    const pages = await getUserEmailPagesAsync(userEmail);
    
    return NextResponse.json(pages || []);
  } catch (error) {
    console.error('Error fetching email pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email pages' },
      { status: 500 }
    );
  }
}