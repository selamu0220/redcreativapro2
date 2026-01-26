import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createBlogAdapter } from '@/app/lib/blog-adapters';
import { validateCredentials } from '@/app/lib/security/encryption';
// import type { BlogPlatform } from '@/app/lib/blog-integrations-schema';

/**
 * POST /api/integrations/blog/test
 * Test connection to a blog platform
 * 
 * Body: { platform, site_url, credentials }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { platform, site_url, credentials } = body;

        // Validate required fields
        if (!platform || !site_url || !credentials) {
            return NextResponse.json(
                { error: 'Faltan campos: platform, site_url, credentials' },
                { status: 400 }
            );
        }

        // Validate credentials structure
        if (!validateCredentials(platform, credentials)) {
            return NextResponse.json({
                success: false,
                message: 'Credenciales incompletas. Verifica que todos los campos estén llenos.',
            });
        }

        // Create adapter and test connection
        try {
            const adapter = createBlogAdapter(platform as any, site_url, credentials);
            const result = await adapter.testConnection();

            return NextResponse.json(result);
        } catch (adapterError: any) {
            return NextResponse.json({
                success: false,
                message: adapterError.message || 'Error al conectar con la plataforma',
            });
        }
    } catch (error: any) {
        console.error('Error testing connection:', error);
        return NextResponse.json(
            { success: false, message: `Error interno: ${error.message}` },
            { status: 500 }
        );
    }
}
