import { NextRequest, NextResponse } from 'next/server';
import { getUserCollectedEmailsAsync } from '../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userEmail: string }> }
) {
  try {
    const resolvedParams = await params;
    const userEmail = decodeURIComponent(resolvedParams.userEmail);
    
    // Get collected emails for the user
    const emails = await getUserCollectedEmailsAsync(userEmail);
    
    return NextResponse.json({
      success: true,
      emails: emails || [],
      count: emails?.length || 0
    });
  } catch (error) {
    console.error('Error fetching collected emails:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los correos recopilados',
        emails: [],
        count: 0
      },
      { status: 500 }
    );
  }
}