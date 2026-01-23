import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { createAdminClient } from '@/app/lib/server/appwrite';
import { Query } from 'node-appwrite';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { users } = createAdminClient();
        // Try to find user by email to get Appwrite ID
        const userList = await users.list([
            Query.equal('email', user.email)
        ]);

        if (userList.total === 0) {
            // Fallback for mocked environment or desync
            return NextResponse.json({
                key: 'rc_live_' + Buffer.from(user.email).toString('base64').substring(0, 16).replace(/[^a-zA-Z0-9]/g, '') + 'xMock',
                is_mock: true
            });
        }

        const appwriteUser = userList.users[0];
        const prefs = appwriteUser.prefs as { apiKey?: string };

        if (!prefs.apiKey) {
            // Generate one if missing
            const newKey = 'rc_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await users.updatePrefs(appwriteUser.$id, { ...prefs, apiKey: newKey });
            return NextResponse.json({ key: newKey, is_mock: false });
        }

        return NextResponse.json({ key: prefs.apiKey, is_mock: false });

    } catch (error) {
        console.error('API Key Error:', error);
        // Fallback to allow UI to render even if Appwrite fails
        return NextResponse.json({ key: 'rc_live_error_fallback_key', is_mock: true });
    }
}

export async function POST(request: NextRequest) {
    // Regenerate Key
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { users } = createAdminClient();
        const userList = await users.list([
            Query.equal('email', user.email)
        ]);

        if (userList.total === 0) {
            return NextResponse.json({ error: 'User not found in database cannot rotate real key' }, { status: 404 });
        }

        const appwriteUser = userList.users[0];
        const newKey = 'rc_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        await users.updatePrefs(appwriteUser.$id, { ...appwriteUser.prefs, apiKey: newKey });

        return NextResponse.json({ key: newKey });

    } catch (error) {
        console.error('API Key Rotation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
