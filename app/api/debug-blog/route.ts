import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('blog_posts').select('id, title, image').limit(5)
    return NextResponse.json({ data, error })
}
