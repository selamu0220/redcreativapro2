import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

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
