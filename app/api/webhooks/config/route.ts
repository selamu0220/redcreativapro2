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
        const userList = await users.list([
            Query.equal('email', user.email)
        ]);

        if (userList.total === 0) {
            return NextResponse.json({ secret: 'whsec_' + Buffer.from(user.email).toString('base64').substring(0, 16), is_mock: true });
        }

        const appwriteUser = userList.users[0];
        const prefs = appwriteUser.prefs as { webhookSecret?: string };

        if (!prefs.webhookSecret) {
            const newSecret = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await users.updatePrefs(appwriteUser.$id, { ...prefs, webhookSecret: newSecret });
            return NextResponse.json({ secret: newSecret, is_mock: false });
        }

        return NextResponse.json({ secret: prefs.webhookSecret, is_mock: false });

    } catch (error) {
        console.error('Webhook Secret Error:', error);
        return NextResponse.json({ secret: 'whsec_error_fallback', is_mock: true });
    }
}
