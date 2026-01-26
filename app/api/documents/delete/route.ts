import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DocumentsService } from '@/app/lib/documents-service';


export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Handle both Query Param (?id=...) and JSON body
        const { searchParams } = new URL(request.url);
        const queryId = searchParams.get('id');

        let idsToDelete: string[] = [];

        if (queryId) {
            idsToDelete = [queryId];
        } else {
            try {
                const body = await request.json();
                if (body.documentId) idsToDelete.push(body.documentId);
                if (body.documentIds) idsToDelete.push(...body.documentIds);
            } catch (e) {
                // Ignore JSON parse error if body is empty
            }
        }

        if (idsToDelete.length === 0) {
            return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
        }

        console.log(`[API] Deleting documents: ${idsToDelete.join(', ')} for user ${user.id}`);

        // Perform Deletion (Direct Supabase)
        const { error } = await supabase
            .from('user_documents')
            .delete()
            .in('id', idsToDelete)
            .eq('owner_id', user.id); // RLS redundancy

        if (error) {
            console.error("Delete Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `${idsToDelete.length} documents deleted`
        });

    } catch (error: any) {
        console.error('Delete document error:', error);
        return NextResponse.json(
            { error: 'Failed to delete document', details: error.message },
            { status: 500 }
        );
    }
}
