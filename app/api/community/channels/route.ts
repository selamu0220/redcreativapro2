import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { databases, DATABASE_ID, ID, Query } from '@/app/lib/appwrite-server';
import { COMMUNITY_CHANNELS_ID, COMMUNITY_MEMBERS_ID, getOrCreateCommunityCollections } from '@/app/lib/appwrite-community';

// Ensure collections exist on first run (optional optimization: move to dedicated script or check lazily)
// getOrCreateCommunityCollections(); 

export async function GET(request: NextRequest) {
    try {
        const { isAuthenticated } = getKindeServerSession();
        if (!(await isAuthenticated())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Ensure collections exist (lazy initialization)
        await getOrCreateCommunityCollections();

        const channels = await databases.listDocuments(
            DATABASE_ID,
            COMMUNITY_CHANNELS_ID,
            [Query.orderDesc('created_at')]
        );

        return NextResponse.json(channels.documents);
    } catch (error) {
        console.error('Error fetching channels:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { getUser, isAuthenticated } = getKindeServerSession();
        if (!(await isAuthenticated())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Ensure collections exist (lazy initialization)
        await getOrCreateCommunityCollections();

        const user = await getUser();
        const { name, description } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // 1. Check if user has created a channel in the last 30 days
        // Admin override: selamu.garciabravo@gmail.com can create unlimited channels
        const isAdmin = user.email === 'selamu.garciabravo@gmail.com';

        if (!isAdmin) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const userChannels = await databases.listDocuments(
                DATABASE_ID,
                COMMUNITY_CHANNELS_ID,
                [
                    Query.equal('owner_id', user.id),
                    Query.greaterThan('created_at', thirtyDaysAgo.toISOString())
                ]
            );

            if (userChannels.total > 0) {
                return NextResponse.json({
                    error: 'You can only create one channel every 30 days. Please delete your existing channel or wait.',
                    remainingTime: 'Calculating...' // Could enhance this to show specific days left
                }, { status: 429 });
            }
        }

        // 2. Create the Channel
        const newChannel = await databases.createDocument(
            DATABASE_ID,
            COMMUNITY_CHANNELS_ID,
            ID.unique(),
            {
                name,
                description: description || '',
                owner_id: user.id,
                created_at: new Date().toISOString()
            }
        );

        // 3. Add Owner as Admin Member
        await databases.createDocument(
            DATABASE_ID,
            COMMUNITY_MEMBERS_ID,
            ID.unique(),
            {
                channel_id: newChannel.$id,
                user_id: user.id,
                role: 'admin',
                joined_at: newChannel.$createdAt
            }
        );

        return NextResponse.json(newChannel);

    } catch (error) {
        console.error('Error creating channel:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
