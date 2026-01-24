import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DebugEnvPage() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('community_channels').select('count', { count: 'exact', head: true });

    const envStatus = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Defined' : '❌ Missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Defined' : '❌ Missing',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Defined' : '❌ Missing',
        // Check if the URL looks correct (basic validation)
        IS_VALID_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co') ? '✅ Yes' : '⚠️ Warning (might be custom domain or localhost)',
    };

    return (
        <div className="p-10 font-mono text-sm space-y-4">
            <h1 className="text-xl font-bold">Environment Diagnostics</h1>

            <div className="border p-4 rounded bg-gray-50 dark:bg-gray-900">
                <h2 className="font-bold mb-2">Environment Variables</h2>
                <pre>{JSON.stringify(envStatus, null, 2)}</pre>
            </div>

            <div className="border p-4 rounded bg-gray-50 dark:bg-gray-900">
                <h2 className="font-bold mb-2">Supabase Connection Test</h2>
                {error ? (
                    <div className="text-red-500">
                        ❌ Connection Failed: {error.message}
                        <br />
                        Code: {error.code}
                    </div>
                ) : (
                    <div className="text-green-500">
                        ✅ Connection Successful!
                        <br />
                        Table 'community_channels' is accessible.
                    </div>
                )}
            </div>

            <div className="text-gray-500 mt-8">
                If you see "❌ Missing" or Connection Failed, you need to go to your Vercel Project Settings {'>'} Environment Variables and add them.
            </div>
        </div>
    );
}
