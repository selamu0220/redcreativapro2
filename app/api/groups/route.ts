import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { databases, getOrCreateCollection, DATABASE_ID, GROUPS_COLLECTION_ID, ID } from '../../lib/appwrite-server';
import { Query } from 'node-appwrite';

// LIST GROUPS
export async function GET(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await getOrCreateCollection();

        const response = await databases.listDocuments(
            DATABASE_ID,
            GROUPS_COLLECTION_ID,
            [
                Query.equal('owner_id', user.id),
                Query.orderAsc('name'),
            ]
        );

        return NextResponse.json({
            groups: response.documents,
            total: response.total
        });

    } catch (error: any) {
        console.error('List groups error:', error);
        return NextResponse.json(
            { error: 'Failed to list groups', details: error.message },
            { status: 500 }
        );
    }
}

// CREATE GROUP
export async function POST(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, color, description, icon } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        await getOrCreateCollection();

        const newGroup = await databases.createDocument(
            DATABASE_ID,
            GROUPS_COLLECTION_ID,
            ID.unique(),
            {
                owner_id: user.id,
                name: name.trim(),
                color: color || '#808080',
                description: description || '',
                icon: icon || '📁'
            }
        );

        return NextResponse.json({
            success: true,
            group: newGroup
        });

    } catch (error: any) {
        console.error('Create group error:', error);
        return NextResponse.json(
            { error: 'Failed to create group', details: error.message },
            { status: 500 }
        );
    }
}

// UPDATE GROUP
export async function PUT(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, color, description, icon } = body;

        if (!id) {
            return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
        }

        await getOrCreateCollection();

        // Verify ownership
        const existing = await databases.getDocument(DATABASE_ID, GROUPS_COLLECTION_ID, id);
        if (existing.owner_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updates: Record<string, any> = {};
        if (name !== undefined) updates.name = name.trim();
        if (color !== undefined) updates.color = color;
        if (description !== undefined) updates.description = description;
        if (icon !== undefined) updates.icon = icon;

        const updatedGroup = await databases.updateDocument(
            DATABASE_ID,
            GROUPS_COLLECTION_ID,
            id,
            updates
        );

        return NextResponse.json({
            success: true,
            group: updatedGroup
        });

    } catch (error: any) {
        console.error('Update group error:', error);
        return NextResponse.json(
            { error: 'Failed to update group', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE GROUP
export async function DELETE(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
        }

        await getOrCreateCollection();

        // Verify ownership
        const existing = await databases.getDocument(DATABASE_ID, GROUPS_COLLECTION_ID, id);
        if (existing.owner_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await databases.deleteDocument(DATABASE_ID, GROUPS_COLLECTION_ID, id);

        return NextResponse.json({
            success: true,
            message: 'Group deleted'
        });

    } catch (error: any) {
        console.error('Delete group error:', error);
        return NextResponse.json(
            { error: 'Failed to delete group', details: error.message },
            { status: 500 }
        );
    }
}

