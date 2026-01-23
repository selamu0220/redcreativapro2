import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { databases, DATABASE_ID, Query } from '@/app/lib/appwrite-server';
import { COMMUNITY_CHANNELS_ID, COMMUNITY_MEMBERS_ID, getOrCreateCommunityCollections } from '@/app/lib/appwrite-community';

// PATCH: Update Member Role (Admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ channelId: string; memberId: string }> }
) {
    try {
        const { getUser, isAuthenticated } = getKindeServerSession();
        if (!(await isAuthenticated())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await getOrCreateCommunityCollections();

        const user = await getUser();
        const { channelId, memberId } = await params;
        const { role } = await request.json();

        // 1. Verify Requester is Admin of the channel
        const requesterMembership = await databases.listDocuments(
            DATABASE_ID,
            COMMUNITY_MEMBERS_ID,
            [
                Query.equal('channel_id', channelId),
                Query.equal('user_id', user.id)
            ]
        );

        let isAdmin = requesterMembership.documents[0]?.role === 'admin' || user.email === 'selamu.garciabravo@gmail.com';

        if (!isAdmin) {
            // Fallback: Check if Owner
            const channel = await databases.getDocument(
                DATABASE_ID,
                COMMUNITY_CHANNELS_ID,
                channelId
            );
            if (channel.owner_id === user.id) {
                isAdmin = true;
            }
        }

        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden: Only admins can manage roles' }, { status: 403 });
        }

        // 2. Verified. Update the target member.
        // Note: memberId param here refers to the Appwrite Document ID of the membership record, NOT the user_id. 
        // If frontend sends user_id, we'd need to lookup. Assuming Document ID for efficiency.

        const updatedMember = await databases.updateDocument(
            DATABASE_ID,
            COMMUNITY_MEMBERS_ID,
            memberId,
            { role }
        );

        return NextResponse.json(updatedMember);

    } catch (error) {
        console.error('Error updating member role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove Member (Kick by Admin) or Leave (Self)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ channelId: string; memberId: string }> }
) {
    try {
        const { getUser, isAuthenticated } = getKindeServerSession();
        if (!(await isAuthenticated())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await getOrCreateCommunityCollections();

        const user = await getUser();
        const { channelId, memberId } = await params;

        // Fetch the membership record to be deleted
        const targetMembership = await databases.getDocument(
            DATABASE_ID,
            COMMUNITY_MEMBERS_ID,
            memberId
        );

        if (!targetMembership) {
            return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
        }

        // Fetch Requester's membership
        const requesterMembership = await databases.listDocuments(
            DATABASE_ID,
            COMMUNITY_MEMBERS_ID,
            [
                Query.equal('channel_id', channelId),
                Query.equal('user_id', user.id)
            ]
        );

        const requesterRole = requesterMembership.documents[0]?.role;
        const isSelf = targetMembership.user_id === user.id;
        // Check if Admin Member or Super Admin
        let isAdmin = requesterMembership.documents[0]?.role === 'admin' || user.email === 'selamu.garciabravo@gmail.com';

        if (!isAdmin) {
            // Fallback: Check if Owner
            const channel = await databases.getDocument(
                DATABASE_ID,
                COMMUNITY_CHANNELS_ID,
                channelId
            );
            if (channel.owner_id === user.id) {
                isAdmin = true;
            }
        }

        // Allow if Self (Leave) OR Admin (Kick)
        if (!isSelf && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await databases.deleteDocument(
            DATABASE_ID,
            COMMUNITY_MEMBERS_ID,
            memberId
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error removing member:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
