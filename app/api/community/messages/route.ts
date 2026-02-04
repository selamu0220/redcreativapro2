import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/auth/supabase-admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const channelId = searchParams.get('channelId');

        if (!channelId) {
            return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
        }

        console.log('[API] Fetching messages for channel:', channelId);

        const { data: messages, error } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('channel_id', channelId)
            .order('created_at', { ascending: true })
            .limit(100);

        if (error) {
            console.error('Error fetching messages:', error);
            return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
        }

        return NextResponse.json(messages || []);
    } catch (error) {
        console.error('Internal Error GET messages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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
            console.error('[API] Auth Error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { channelId, content } = body;

        if (!channelId || !content) {
            return NextResponse.json({ error: 'Channel ID and content are required' }, { status: 400 });
        }

        // Create message
        console.log('[API] Creating message for channel:', channelId, 'User:', user.id);

        const { data: message, error } = await supabaseAdmin
            .from('messages')
            .insert({
                channel_id: channelId,
                user_id: user.id,
                content,
                sender_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
                sender_avatar: user.user_metadata?.avatar_url || null,
            })
            .select()
            .single();

        if (error) {
            console.error('[API] Error creating message IN DB:', error);
            return NextResponse.json({ error: `DB Error: ${error.message}` }, { status: 500 });
        }

        console.log('[API] Message created successfully:', message.id);

        return NextResponse.json(message);
    } catch (error) {
        console.error('Create message error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
