require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCreateDocument() {
    console.log('🧪 Testing Document Creation...');

    const testDoc = {
        owner_id: 'test-user-system-verify', // Use a fake ID for verification
        title: 'System Verification Doc',
        content: 'This is a test document to verify Supabase write record.',
        category: 'Testing',
        tags: ['test', 'system', 'verification'],
        is_public: false,
        mode: 'test-mode',
        language: 'es'
    };

    try {
        const { data, error } = await supabase
            .from('user_documents')
            .insert(testDoc)
            .select()
            .single();

        if (error) {
            console.error('❌ Insert Failed:', error);
        } else {
            console.log('✅ Insert Successful!');
            console.log('Created Document:', data);

            // Cleanup
            console.log('🧹 Cleaning up test document...');
            const { error: deleteError } = await supabase
                .from('user_documents')
                .delete()
                .eq('id', data.id);

            if (deleteError) {
                console.error('⚠️ Warning: Failed to clean up test document:', deleteError);
            } else {
                console.log('✅ Cleanup Successful');
            }
        }
    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    }
}

testCreateDocument();
