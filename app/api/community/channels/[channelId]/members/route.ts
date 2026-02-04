import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/auth/supabase-admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
    try {
        const { channelId } = await params;

        const { data: members, error } = await supabaseAdmin
            .from('channel_members')
            .select('*')
            .eq('channel_id', channelId);

        if (error) {
            console.error('Error fetching members:', error);
            return NextResponse.json({ error: 'Error fetching members' }, { status: 500 });
        }

        return NextResponse.json(members || []);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch { }
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { channelId } = await params;

        // Check if already a member
        const { data: existingMember } = await supabaseAdmin
            .from('channel_members')
            .select('*')
            .eq('channel_id', channelId)
            .eq('user_id', user.id)
            .single();

        if (existingMember) {
            return NextResponse.json(existingMember);
        }

        // Join channel
        const { data: member, error } = await supabaseAdmin
            .from('channel_members')
            .insert({
                channel_id: channelId,
                user_id: user.id,
                role: 'participant'
            })
            .select()
            .single();

        if (error) {
            console.error('Error joining channel:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(member);
    } catch (error) {
        console.error('Join channel error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
