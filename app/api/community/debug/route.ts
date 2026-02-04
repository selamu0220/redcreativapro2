import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/auth/supabase-admin';
import { createClient } from '@/app/lib/supabase/server';

export async function GET(request: NextRequest) {
    const checks: any = {
        env: {
            supabase: {}
        },
        auth: {},
        database: {},
        timestamp: new Date().toISOString()
    };

    try {
        // 1. Check Env Vars (Presence only)
        const sbVars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY'
        ];

        sbVars.forEach(v => {
            checks.env.supabase[v] = process.env[v] ? 'Present' : 'MISSING';
        });

        // 2. Check Authentication (Supabase)
        try {
            const supabase = await createClient();
            const { data: { user }, error } = await supabase.auth.getUser();

            checks.auth = {
                isAuthenticated: !!user && !error,
                hasUser: !!user,
                userId: user?.id || null,
                userEmail: user?.email || null
            };
        } catch (authError: any) {
            checks.auth = { error: authError.message };
        }

        // 3. Check Database Connection
        try {
            const { data, error, status } = await supabaseAdmin
                .from('channels')
                .select('count', { count: 'exact', head: true });

            checks.database = {
                connected: !error,
                status,
                error: error ? error.message : null
            };
        } catch (dbError: any) {
            checks.database = { error: dbError.message };
        }

        return NextResponse.json(checks);

    } catch (error: any) {
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            checks
        }, { status: 500 });
    }
}
