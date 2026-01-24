require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCommunityFeatures() {
    console.log('🧪 Testing Community Channels & Messages...');

    const userId = 'test-community-user';
    const channelName = 'Test Channel ' + Date.now();

    try {
        // 1. Create Channel
        console.log('1️⃣ Creating Channel:', channelName);
        const { data: channel, error: createError } = await supabase
            .from('community_channels')
            .insert({ name: channelName, description: 'Test Description', owner_id: userId })
            .select()
            .single();

        if (createError) throw createError;
        console.log('✅ Channel Created:', channel.id);

        // 2. Send Message
        console.log('2️⃣ Sending Message...');
        const { data: message, error: msgError } = await supabase
            .from('community_messages')
            .insert({ channel_id: channel.id, user_id: userId, content: 'Hello World' })
            .select()
            .single();

        if (msgError) throw msgError;
        console.log('✅ Message Sent:', message.id);

        // 3. List Messages
        console.log('3️⃣ Fetching Messages...');
        const { data: messages, error: listError } = await supabase
            .from('community_messages')
            .select('*')
            .eq('channel_id', channel.id);

        if (listError) throw listError;
        console.log(`✅ Found ${messages.length} messages.`);

        // 4. Delete Channel
        console.log('4️⃣ Deleting Channel...');
        const { error: deleteError } = await supabase
            .from('community_channels')
            .delete()
            .eq('id', channel.id);

        if (deleteError) throw deleteError;
        console.log('✅ Channel Deleted (Cascade should verify messages are gone too)');

    } catch (err) {
        console.error('❌ Test Failed:', err);
    }
}

testCommunityFeatures();
