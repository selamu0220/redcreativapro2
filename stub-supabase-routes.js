const fs = require('fs');

// These routes depend on Supabase tables that don't exist
// We'll stub them to return appropriate responses
const routesToStub = [
  {
    path: 'app/api/contact/suggestion/route.ts',
    content: `import { NextRequest, NextResponse } from 'next/server';

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
      suggestionId: \`temp_\${Date.now()}\`
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
`
  },
  {
    path: 'app/api/user/profile/route.ts',
    content: `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // TODO: Implement with Clerk user metadata
    return NextResponse.json({ 
      id: userId,
      message: 'User profile endpoint - Clerk migration pending' 
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email } = body;

    if (!id || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    // TODO: Implement with Clerk user metadata
    return NextResponse.json({ 
      id, 
      email,
      message: 'User creation endpoint - Clerk migration pending' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`
  }
];

console.log('🔧 Stubbing Supabase-dependent routes...\n');

routesToStub.forEach(({ path, content }) => {
  try {
    fs.writeFileSync(path, content, 'utf8');
    console.log(`✅ Stubbed: ${path}`);
  } catch (error) {
    console.error(`❌ Error stubbing ${path}:`, error.message);
  }
});

console.log('\n✨ Stubbing complete!');
