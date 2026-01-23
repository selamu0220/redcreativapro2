import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { databases, DATABASE_ID, ID, Query } from '@/app/lib/appwrite-server';
import { COMMUNITY_MESSAGES_ID, COMMUNITY_PROFILES_ID, getOrCreateCommunityCollections } from '@/app/lib/appwrite-community';

const BANNED_WORDS = [
    'palabrota1', 'palabrota2', 'insulto', 'groseria', // Placeholder for actual list
    'mierda', 'puta', 'cabron', 'joder', 'coño', 'estupido', 'idiota', 'imbecil' // Common Spanish bad words (basic set)
];

function containsBannedWords(text: string): boolean {
    const lowerText = text.toLowerCase();
    return BANNED_WORDS.some(word => lowerText.includes(word));
}

export async function GET(request: NextRequest) {
    try {
        const { isAuthenticated } = getKindeServerSession();
        if (!(await isAuthenticated())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Ensure collections exist (lazy initialization)
        await getOrCreateCommunityCollections();

        const { searchParams } = new URL(request.url);
        const channelId = searchParams.get('channelId');

        if (!channelId) {
            return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
        }

        const messages = await databases.listDocuments(
            DATABASE_ID,
            COMMUNITY_MESSAGES_ID,
            [
                Query.equal('channel_id', channelId),
                Query.orderDesc('created_at'),
                Query.limit(50) // Pagination limit
            ]
        );

        return NextResponse.json(messages.documents.reverse()); // Return in chronological order for chat UI

    } catch (error) {
        console.error('Error fetching messages:', error);
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
        const { channelId, content } = await request.json();

        if (!channelId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Content Moderation
        if (containsBannedWords(content)) {
            return NextResponse.json({
                error: 'Your message contains inappropriate language. Please be respectful.'
            }, { status: 400 });
        }

        // 2. Fetch User Profile for display name and avatar
        // We try to get the custom profile, otherwise fallback to Kinde info
        let senderName = `${user.given_name} ${user.family_name}`.trim() || 'User';
        let senderAvatar = user.picture || '';

        try {
            const profiles = await databases.listDocuments(
                DATABASE_ID,
                COMMUNITY_PROFILES_ID,
                [Query.equal('user_id', user.id)]
            );
            if (profiles.total > 0) {
                const profile = profiles.documents[0];
                if (profile.handle) senderName = profile.handle; // Use handle if set
                if (profile.avatar_url) senderAvatar = profile.avatar_url;
            }
        } catch (e) {
            // Ignore profile fetch error, just use defaults
        }

        const newMessage = await databases.createDocument(
            DATABASE_ID,
            COMMUNITY_MESSAGES_ID,
            ID.unique(),
            {
                channel_id: channelId,
                user_id: user.id,
                content,
                sender_name: senderName,
                sender_avatar: senderAvatar,
                created_at: new Date().toISOString()
            }
        );

        return NextResponse.json(newMessage);

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
