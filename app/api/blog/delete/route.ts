import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug } = await request.json();

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        // Delete the post ensuring it belongs to the user (optional check depending on requirements, usually safe to check user_id)
        // Note: If admins can delete any post, remove the user_id check. For now, assuming users manage their own.
        // Actually, for a multi-user blog, checking user_id is safer.
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('slug', slug)
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error deleting blog post:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
