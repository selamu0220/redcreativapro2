import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { databases, DATABASE_ID, ID, Query } from '@/app/lib/appwrite-server';
import { COMMUNITY_MEMBERS_ID, getOrCreateCommunityCollections } from '@/app/lib/appwrite-community';

// GET: List members of a channel
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ channelId: string }> }
) {
    try {
        const { channelId } = await params;
        const { isAuthenticated } = getKindeServerSession();
        // const session = await getServerSession(); // This line was in the instruction but getServerSession is not imported.
        // Assuming isAuthenticated is still obtained from getKindeServerSession as per original code.
        if (!(await isAuthenticated())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await getOrCreateCommunityCollections();

        const members = await databases.listDocuments(
            DATABASE_ID,
            COMMUNITY_MEMBERS_ID,
            [
                Query.equal('channel_id', channelId),
                Query.limit(100) // Adjust limit as needed
            ]
        );

        return NextResponse.json(members.documents);

    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Join a channel (or add member)
export async function POST(
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
        const body = await request.json().catch(() => ({})); // Body optional for self-join

        // Determine target user and role
        // If body has userId and current user is Admin (logic needed), add them.
        // For now, assume this endpoint is for "Join Channel" (Self)

        const targetUserId = user.id;
        const initialRole = 'participant';
        // Note: Channel Creator logic needs to run when creating channel to make them Admin.

        // Check if already a member
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COMMUNITY_MEMBERS_ID,
            [
                Query.equal('channel_id', channelId),
                Query.equal('user_id', targetUserId)
            ]
        );

        if (existing.total > 0) {
            return NextResponse.json({ error: 'Already a member' }, { status: 400 });
        }

        const newMember = await databases.createDocument(
            DATABASE_ID,
            COMMUNITY_MEMBERS_ID,
            ID.unique(),
            {
                channel_id: channelId,
                user_id: targetUserId,
                role: initialRole,
                joined_at: new Date().toISOString()
            }
        );

        return NextResponse.json(newMember);

    } catch (error) {
        console.error('Error joining channel:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
