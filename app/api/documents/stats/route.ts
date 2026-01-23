import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { DocumentsService } from '@/app/lib/documents-service';

export async function GET(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stats = await DocumentsService.getUserStats(user.id);

        return NextResponse.json(stats);

    } catch (error: any) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { error: 'Failed to get stats', details: error.message },
            { status: 500 }
        );
    }
}
