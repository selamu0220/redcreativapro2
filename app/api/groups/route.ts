import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            groups: [],
            total: 0
        });

    } catch (error: any) {
        console.error('List groups error:', error);
        return NextResponse.json(
            { error: 'Failed to list groups', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, color, description, icon } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const newGroup = {
            $id: crypto.randomUUID(),
            owner_id: user.id,
            name: name.trim(),
            color: color || '#808080',
            description: description || '',
            icon: icon || '📁'
        };

        return NextResponse.json({
            success: true,
            group: newGroup
        });

    } catch (error: any) {
        console.error('Create group error:', error);
        return NextResponse.json(
            { error: 'Failed to create group', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    return NextResponse.json({ success: true, group: {} });
}

export async function DELETE(request: NextRequest) {
    return NextResponse.json({ success: true, message: 'Group deleted' });
}
