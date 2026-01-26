import { NextRequest, NextResponse } from 'next/server';
import { DocumentsService } from '@/app/lib/documents-service';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Correct for Next.js 15
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doc = await DocumentsService.getDocument(id, user.id);

    if (!doc) {
      return NextResponse.json({ error: 'Document not found or forbidden' }, { status: 404 });
    }

    return NextResponse.json({ document: doc });

  } catch (error: any) {
    if (error.code === 'PGRST116') { // Supabase single row not found
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch document', details: error.message },
      { status: 500 }
    );
  }
}
