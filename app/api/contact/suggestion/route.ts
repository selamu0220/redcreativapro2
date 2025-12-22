import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, message, category } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'User ID and message are required' },
        { status: 400 }
      );
    }

    console.log('💬 Suggestion from user:', userId, '- Message:', message);

    // TODO: Implement with Clerk metadata or alternative storage
    return NextResponse.json({
      success: true,
      message: 'Suggestion received (not persisted - Clerk migration pending)',
      suggestionId: `temp_${Date.now()}`
    });

  } catch (error) {
    console.error('❌ Error processing suggestion:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process suggestion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // TODO: Implement with Clerk metadata or alternative storage
    return NextResponse.json({
      suggestions: []
    });

  } catch (error) {
    console.error('❌ Error fetching suggestions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
