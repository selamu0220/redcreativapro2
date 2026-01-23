import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { databases, DATABASE_ID, Query } from '@/app/lib/appwrite-server';
import { COMMUNITY_CHANNELS_ID, COMMUNITY_MEMBERS_ID, getOrCreateCommunityCollections } from '@/app/lib/appwrite-community';

// DELETE: Delete Channel (Owner or Admin Member only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ channelId: string }> }
) {
    try {
        const { getUser, isAuthenticated } = getKindeServerSession();
        if (!(await isAuthenticated())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await getOrCreateCommunityCollections();

        const user = await getUser();
        const { channelId } = await params;
        const isSuperAdmin = user.email === 'selamu.garciabravo@gmail.com';

        // Check Permissions via Members Collection
        const membership = await databases.listDocuments(
            DATABASE_ID,
            COMMUNITY_MEMBERS_ID,
            [
                Query.equal('channel_id', channelId),
                Query.equal('user_id', user.id)
            ]
        );

        const role = membership.documents[0]?.role;
        const isChannelAdmin = role === 'admin';

        if (!isChannelAdmin && !isSuperAdmin) {
            // Fallback check: is owner? (Legacy check, though owner SHOULD be admin)
            const channel = await databases.getDocument(
                DATABASE_ID,
                COMMUNITY_CHANNELS_ID,
                channelId
            );
            if (channel.owner_id !== user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // 2. Delete the channel
        await databases.deleteDocument(
            DATABASE_ID,
            COMMUNITY_CHANNELS_ID,
            channelId
        );

        // Cleanup members? Appwrite doesn't cascade delete automatically unfortunately.
        // In a real app we'd run a background job. Here we might leave orphans or try to delete some.
        // For simplicity/speed, we'll leave orphans for now or maybe delete strictly related resources if critical.

        return NextResponse.json({ success: true, message: 'Channel deleted' });

    } catch (error) {
        console.error('Error deleting channel:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// GET: Get Channel Details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ channelId: string }> }
) {
    try {
        const { isAuthenticated } = getKindeServerSession();
        if (!(await isAuthenticated())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await getOrCreateCommunityCollections();

        const { channelId } = await params;

        const channel = await databases.getDocument(
            DATABASE_ID,
            COMMUNITY_CHANNELS_ID,
            channelId
        );

        return NextResponse.json(channel);

    } catch (error) {
        console.error('Error fetching channel details:', error);
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
}

// PATCH: Update Channel (Admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ channelId: string }> }
) {
    try {
        const { getUser, isAuthenticated } = getKindeServerSession();
        if (!(await isAuthenticated())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await getOrCreateCommunityCollections();

        const user = await getUser();
        const { channelId } = await params;
        const { name, description } = await request.json();
        const isSuperAdmin = user.email === 'selamu.garciabravo@gmail.com';

        // Check Permissions via Members Collection
        const membership = await databases.listDocuments(
            DATABASE_ID,
            COMMUNITY_MEMBERS_ID,
            [
                Query.equal('channel_id', channelId),
                Query.equal('user_id', user.id)
            ]
        );

        const role = membership.documents[0]?.role;
        const isChannelAdmin = role === 'admin';

        if (!isChannelAdmin && !isSuperAdmin) {
            // Fallback: Check if owner (for legacy channels or owner override)
            const channel = await databases.getDocument(
                DATABASE_ID,
                COMMUNITY_CHANNELS_ID,
                channelId
            );
            if (channel.owner_id !== user.id) {
                return NextResponse.json({ error: 'Forbidden: Admins or Owner only' }, { status: 403 });
            }
        }

        const updatedChannel = await databases.updateDocument(
            DATABASE_ID,
            COMMUNITY_CHANNELS_ID,
            channelId,
            {
                name,
                description
            }
        );

        return NextResponse.json(updatedChannel);

    } catch (error) {
        console.error('Error updating channel:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
