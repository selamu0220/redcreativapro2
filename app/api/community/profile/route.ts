import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { databases, DATABASE_ID, ID, Query } from '@/app/lib/appwrite-server';
import { COMMUNITY_PROFILES_ID, getOrCreateCommunityCollections } from '@/app/lib/appwrite-community';

export async function GET(request: NextRequest) {
    try {
        const { isAuthenticated, getUser } = getKindeServerSession();
        if (!(await isAuthenticated())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Ensure collections exist (lazy initialization)
        await getOrCreateCommunityCollections();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId'); // Allow fetching other users' profiles
        const currentUser = await getUser();

        // If no userId provided, fetch current user's profile
        const targetUserId = userId || currentUser.id;

        const profiles = await databases.listDocuments(
            DATABASE_ID,
            COMMUNITY_PROFILES_ID,
            [Query.equal('user_id', targetUserId)]
        );

        if (profiles.total === 0) {
            return NextResponse.json(null); // No profile found, return null (frontend handles creation form)
        }

        return NextResponse.json(profiles.documents[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
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
        const body = await request.json();

        // Check if profile exists
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COMMUNITY_PROFILES_ID,
            [Query.equal('user_id', user.id)]
        );

        const profileData = {
            user_id: user.id,
            handle: body.handle || `${user.given_name || 'User'}`,
            bio: body.bio || '',
            instagram: body.instagram || '',
            why_i_use_app: body.why_i_use_app || '',
            avatar_url: body.avatar_url || user.picture || ''
        };

        if (existing.total > 0) {
            // Update
            const updated = await databases.updateDocument(
                DATABASE_ID,
                COMMUNITY_PROFILES_ID,
                existing.documents[0].$id,
                profileData
            );
            return NextResponse.json(updated);
        } else {
            // Create
            const created = await databases.createDocument(
                DATABASE_ID,
                COMMUNITY_PROFILES_ID,
                ID.unique(),
                profileData
            );
            return NextResponse.json(created);
        }

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
