
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifySchema() {
    console.log("🔍 Verifying 'blog_posts' table schema...");

    const testSlug = `schema-test-${Date.now()}`;
    const testPost = {
        title: "Schema Verification Test",
        content: "<p>Test content</p>",
        slug: testSlug,
        excerpt: "Test excerpt",
        image: "https://example.com/image.jpg",
        category: "Test",
        author: "System Admin",
        // author_id: "...", // We might not have a valid auth user ID easily, so lets try without or use a dummy if not enforced constraint
        status: "draft",
        views: 0,
        likes: 0,
        read_time: "1 min",
        tags: ["test", "schema"],
        published_at: new Date().toISOString()
    };

    // 1. Attempt Insert
    console.log("Attempting INSERT...");
    const { data: insertData, error: insertError } = await supabase
        .from('blog_posts')
        .insert([testPost])
        .select()
        .single();

    if (insertError) {
        console.error("❌ INSERT Failed:", insertError.message);
        console.error("Details:", insertError.details);
        console.error("Hint:", insertError.hint);
        if (insertError.code === '42P01') {
            console.error("CRITICAL: Table 'blog_posts' does not exist!");
        } else if (insertError.code === '42703') {
            console.error("CRITICAL: Column missing or named incorrectly.");
        }
        return;
    }

    console.log("✅ INSERT Successful:", insertData.id);

    // 2. Verify Columns in Returned Data
    const keys = Object.keys(insertData);
    const expected = [
        'id', 'title', 'content', 'slug', 'excerpt', 'image',
        'category', 'author', 'status', 'views', 'likes',
        'read_time', 'tags', 'published_at', 'created_at'
    ];

    const missing = expected.filter(k => !keys.includes(k));

    if (missing.length > 0) {
        console.warn("⚠️ Warning: Some expected columns were not returned (might be null or missing in select):", missing);
    } else {
        console.log("✅ All expected columns present in response.");
    }

    // 3. Clean up
    console.log("Cleaning up test record...");
    const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', insertData.id);

    if (deleteError) {
        console.warn("⚠️ Failed to delete test record:", deleteError.message);
    } else {
        console.log("✅ Cleanup successful.");
    }
}

verifySchema().catch(console.error);
