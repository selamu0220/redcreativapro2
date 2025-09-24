import { NextRequest, NextResponse } from 'next/server';
import { updateUserGmailCredentialsAsync, getUserGmailCredentialsAsync } from '../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, gmailUser, gmailPassword } = await request.json();

    console.log('🔍 Testing Gmail credentials save...');
    console.log('Email:', email);
    console.log('Gmail User:', gmailUser);
    console.log('Gmail Password length:', gmailPassword?.length);

    if (!email || !gmailUser || !gmailPassword) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters',
        received: { email: !!email, gmailUser: !!gmailUser, gmailPassword: !!gmailPassword }
      });
    }

    // Test saving credentials
    console.log('📝 Attempting to save credentials...');
    const saveResult = await updateUserGmailCredentialsAsync(email, gmailUser, gmailPassword);
    console.log('Save result:', saveResult);

    if (!saveResult) {
      return NextResponse.json({
        success: false,
        error: 'updateUserGmailCredentialsAsync returned false',
        saveResult
      });
    }

    // Test retrieving credentials
    console.log('📖 Attempting to retrieve credentials...');
    const retrievedCredentials = await getUserGmailCredentialsAsync(email);
    console.log('Retrieved credentials:', {
      found: !!retrievedCredentials,
      gmailUser: retrievedCredentials?.gmailUser,
      passwordLength: retrievedCredentials?.gmailPassword?.length
    });

    return NextResponse.json({
      success: true,
      message: 'Gmail credentials test completed successfully',
      saveResult,
      retrievedCredentials: {
        found: !!retrievedCredentials,
        gmailUser: retrievedCredentials?.gmailUser,
        passwordMatches: retrievedCredentials?.gmailPassword === gmailPassword
      }
    });

  } catch (error) {
    console.error('❌ Error in Gmail credentials test:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}