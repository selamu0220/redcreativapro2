import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { DocumentsService } from '@/app/lib/documents-service';

export async function DELETE(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { documentId, documentIds } = await request.json();

        if (!documentId && (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0)) {
            return NextResponse.json({ error: 'Document ID(s) required' }, { status: 400 });
        }

        const idsToDelete = documentIds || [documentId];
        let deletedCount = 0;
        let errors = [];

        await Promise.all(idsToDelete.map(async (id: string) => {
            try {
                await DocumentsService.deleteDocument(id, user.id);
                deletedCount++;
            } catch (err: any) {
                console.error(`Failed to delete ${id}:`, err);
                errors.push(`Error ${id}: ${err.message}`);
            }
        }));

        return NextResponse.json({
            success: true,
            message: `${deletedCount} documents deleted`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('Delete document error:', error);
        return NextResponse.json(
            { error: 'Failed to delete document', details: error.message },
            { status: 500 }
        );
    }
}
