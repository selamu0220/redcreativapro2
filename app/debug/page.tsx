import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'

export default async function DebugPage() {
    const cookieStore = await cookies()
    const headersList = await headers()
    const supabase = await createClient()

    const { data, error } = await supabase.from('blog_posts').select('count', { count: 'exact', head: true })

    const envCheck = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINED' : 'MISSING',
        VERCEL_URL: process.env.VERCEL_URL,
    }

    return (
        <div className="p-8 bg-gray-900 text-green-400 font-mono text-sm overflow-auto">
            <h1 className="text-xl font-bold mb-4">System Diagnostics</h1>

            <section className="mb-6 border border-green-800 p-4 rounded">
                <h2 className="text-white mb-2">1. Environment Variables</h2>
                <pre>{JSON.stringify(envCheck, null, 2)}</pre>
            </section>

            <section className="mb-6 border border-green-800 p-4 rounded">
                <h2 className="text-white mb-2">2. Supabase Connection (Server)</h2>
                <div className="mb-2">
                    Status: {error ? 'FAIL' : 'OK'}
                </div>
                {error && <pre className="text-red-400">{JSON.stringify(error, null, 2)}</pre>}
                {data !== null && <div>Row Count Check: {data} (If null, maybe head fetch worked but no count? Head true returns count in count prop usually)</div>}
            </section>

            <section className="mb-6 border border-green-800 p-4 rounded">
                <h2 className="text-white mb-2">3. Headers (Middleware Check)</h2>
                <p className="text-gray-500 mb-2">Looking for x-middleware-rewrite or similar</p>
                <ul className="list-disc pl-4">
                    {Array.from(headersList.entries()).map(([key, value]) => (
                        <li key={key}>
                            <span className="text-blue-400">{key}:</span> {key.includes('cookie') || key.includes('auth') ? '***' : value}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="mb-6 border border-green-800 p-4 rounded">
                <h2 className="text-white mb-2">4. Cookies</h2>
                <div>Count: {cookieStore.getAll().length}</div>
            </section>
        </div>
    )
}
