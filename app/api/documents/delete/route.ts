import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { databases, DATABASE_ID, COLLECTION_ID } from '../../../lib/appwrite-server';

export async function DELETE(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { documentId } = await request.json();

        if (!documentId) {
            return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
        }

        // Verify ownership before deleting
        const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, documentId);

        if (doc.owner_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, documentId);

        return NextResponse.json({ success: true, message: 'Document deleted' });

    } catch (error: any) {
        console.error('Delete document error:', error);
        return NextResponse.json(
            { error: 'Failed to delete document', details: error.message },
            { status: 500 }
        );
    }
}
