import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DocumentsService } from '@/app/lib/documents-service';

// POST /api/documents/move - Move documents to a different group
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { documentIds, groupId } = body;

        if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
            return NextResponse.json({ error: 'Document IDs required' }, { status: 400 });
        }

        let movedCount = 0;
        const errors: string[] = [];

        await Promise.all(documentIds.map(async (docId: string) => {
            try {
                // DocumentsService handles ownership check
                await DocumentsService.updateDocument(docId, user.id, {
                    group_id: groupId || null
                });
                movedCount++;
            } catch (err: any) {
                console.error(`Failed to move ${docId}:`, err);
                errors.push(`Error ${docId}: ${err.message}`);
            }
        }));

        return NextResponse.json({
            success: true,
            message: `${movedCount} documents moved`,
            movedCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('Move documents error:', error);
        return NextResponse.json(
            { error: 'Failed to move documents', details: error.message },
            { status: 500 }
        );
    }
}
