import { NextRequest, NextResponse } from 'next/server';
import { getUserEmailPagesAsync, createEmailPageAsync, getUserByEmailAsync } from '../../lib/database';

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

// POST /api/email-pages - Create a new email collection page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, title, description, buttonText, successMessage, isActive = true, collectName = true, customFields = [], qualificationForm } = body;

    // Validate required fields
    if (!userEmail || !title || !description || !buttonText || !successMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: userEmail, title, description, buttonText, successMessage' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await getUserByEmailAsync(userEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a page
    const existingPages = await getUserEmailPagesAsync(userEmail);
    if (existingPages && existingPages.length > 0) {
      return NextResponse.json(
        { error: 'User already has an email collection page' },
        { status: 409 }
      );
    }

    // Create the new page
    const newPage = await createEmailPageAsync({
      userEmail,
      title,
      description,
      buttonText,
      successMessage,
      isActive,
      collectName,
      customFields,
      qualificationForm
    });

    return NextResponse.json(
      { message: 'Email collection page created successfully', page: newPage },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating email page:', error);
    return NextResponse.json(
      { error: 'Failed to create email collection page' },
      { status: 500 }
    );
  }
}
