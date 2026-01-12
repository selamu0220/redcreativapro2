import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { databases, DATABASE_ID, COLLECTION_ID } from '../../../lib/appwrite-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Correct for Next.js 15
) {
  try {
    const { id } = await params;

    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);

    if (doc.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ document: doc });

  } catch (error: any) {
    if (error.code === 404) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch document', details: error.message },
      { status: 500 }
    );
  }
}
