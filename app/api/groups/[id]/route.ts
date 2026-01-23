import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { databases, DATABASE_ID, GROUPS_COLLECTION_ID, COLLECTION_ID } from '../../../lib/appwrite-server';
import { Query } from 'node-appwrite';

// DELETE GROUP
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;


        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const group = await databases.getDocument(DATABASE_ID, GROUPS_COLLECTION_ID, id);
        if (group.owner_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Optional: Reset group_id for documents in this group
        // We can do this in the background, or let the user decide. 
        // For now, let's just detach documents from the group.
        const docsInGroup = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal('group_id', id)]
        );

        // Update documents to remove group_id (could be slow if many docs, but safe for now)
        await Promise.all(docsInGroup.documents.map(doc =>
            databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, { group_id: null })
        ));

        await databases.deleteDocument(DATABASE_ID, GROUPS_COLLECTION_ID, id);

        return NextResponse.json({ success: true, message: 'Group deleted' });

    } catch (error: any) {
        console.error('Delete group error:', error);
        return NextResponse.json(
            { error: 'Failed to delete group', details: error.message },
            { status: 500 }
        );
    }
}

// UPDATE GROUP
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, color } = body;

        // Verify ownership
        const group = await databases.getDocument(DATABASE_ID, GROUPS_COLLECTION_ID, id);
        if (group.owner_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updatedGroup = await databases.updateDocument(
            DATABASE_ID,
            GROUPS_COLLECTION_ID,
            id,
            {
                name: name || group.name,
                color: color || group.color
            }
        );

        return NextResponse.json({ success: true, group: updatedGroup });

    } catch (error: any) {
        console.error('Update group error:', error);
        return NextResponse.json(
            { error: 'Failed to update group', details: error.message },
            { status: 500 }
        );
    }
}
