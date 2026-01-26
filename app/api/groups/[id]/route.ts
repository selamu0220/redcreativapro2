
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
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
