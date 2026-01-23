import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { Databases, Query, ID } from 'node-appwrite';
import { createAdminClient, APPWRITE_DB_ID } from '@/app/lib/server/appwrite';
import {
    BLOG_INTEGRATIONS_COLLECTION_ID,
    BlogIntegration,
    ensureBlogIntegrationsCollection
} from '@/app/lib/blog-integrations-schema';
import { encryptCredentials, decryptCredentials, validateCredentials } from '@/app/lib/security/encryption';

/**
 * GET /api/integrations/blog
 * List all blog integrations for the current user
 */
export async function GET(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Ensure collection exists
        await ensureBlogIntegrationsCollection();

        const { databases } = createAdminClient();

        const response = await databases.listDocuments(
            APPWRITE_DB_ID,
            BLOG_INTEGRATIONS_COLLECTION_ID,
            [Query.equal('user_id', user.id), Query.orderDesc('$createdAt')]
        );

        // Remove encrypted credentials from response
        const integrations = response.documents.map((doc: any) => ({
            id: doc.$id,
            platform: doc.platform,
            name: doc.name,
            site_url: doc.site_url,
            is_active: doc.is_active,
            last_used: doc.last_used,
            created_at: doc.created_at,
        }));

        return NextResponse.json({ integrations });
    } catch (error: any) {
        console.error('Error fetching integrations:', error);
        return NextResponse.json(
            { error: 'Error al obtener integraciones', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/integrations/blog
 * Create a new blog integration
 */
export async function POST(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { platform, name, site_url, credentials } = body;

        // Validate required fields
        if (!platform || !name || !site_url || !credentials) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos: platform, name, site_url, credentials' },
                { status: 400 }
            );
        }

        // Validate credentials structure
        if (!validateCredentials(platform, credentials)) {
            return NextResponse.json(
                { error: 'Credenciales inválidas para la plataforma seleccionada' },
                { status: 400 }
            );
        }

        // Ensure collection exists
        await ensureBlogIntegrationsCollection();

        const { databases } = createAdminClient();

        // Encrypt credentials before storing
        const encryptedCredentials = encryptCredentials(credentials);

        const integration: Omit<BlogIntegration, '$id' | '$createdAt' | '$updatedAt'> = {
            user_id: user.id,
            platform,
            name,
            site_url: site_url.replace(/\/$/, ''), // Remove trailing slash
            credentials: encryptedCredentials,
            is_active: true,
            created_at: new Date().toISOString(),
        };

        const created = await databases.createDocument(
            APPWRITE_DB_ID,
            BLOG_INTEGRATIONS_COLLECTION_ID,
            ID.unique(),
            integration
        );

        const createdDoc = created as any;

        return NextResponse.json({
            success: true,
            integration: {
                id: createdDoc.$id,
                platform: createdDoc.platform,
                name: createdDoc.name,
                site_url: createdDoc.site_url,
                is_active: createdDoc.is_active,
                created_at: createdDoc.created_at,
            },
        });
    } catch (error: any) {
        console.error('Error creating integration:', error);
        return NextResponse.json(
            { error: 'Error al crear integración', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/integrations/blog?id=xxx
 * Delete a blog integration
 */
export async function DELETE(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const integrationId = searchParams.get('id');

        if (!integrationId) {
            return NextResponse.json({ error: 'ID de integración requerido' }, { status: 400 });
        }

        const { databases } = createAdminClient();

        // Verify ownership
        const integration = await databases.getDocument(
            APPWRITE_DB_ID,
            BLOG_INTEGRATIONS_COLLECTION_ID,
            integrationId
        );

        const integrationDoc = integration as any;
        if (integrationDoc.user_id !== user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        await databases.deleteDocument(
            APPWRITE_DB_ID,
            BLOG_INTEGRATIONS_COLLECTION_ID,
            integrationId
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting integration:', error);
        return NextResponse.json(
            { error: 'Error al eliminar integración', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/integrations/blog
 * Update integration status or credentials
 */
export async function PATCH(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { id, is_active, credentials, name } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID de integración requerido' }, { status: 400 });
        }

        const { databases } = createAdminClient();

        // Verify ownership
        const integration = await databases.getDocument(
            APPWRITE_DB_ID,
            BLOG_INTEGRATIONS_COLLECTION_ID,
            id
        );

        const integrationDoc = integration as any;
        if (integrationDoc.user_id !== user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        const updates: any = {};

        if (typeof is_active === 'boolean') {
            updates.is_active = is_active;
        }

        if (name) {
            updates.name = name;
        }

        if (credentials) {
            if (!validateCredentials(integrationDoc.platform, credentials)) {
                return NextResponse.json(
                    { error: 'Credenciales inválidas' },
                    { status: 400 }
                );
            }
            updates.credentials = encryptCredentials(credentials);
        }

        const updated = await databases.updateDocument(
            APPWRITE_DB_ID,
            BLOG_INTEGRATIONS_COLLECTION_ID,
            id,
            updates
        );

        const updatedDoc = updated as any;

        return NextResponse.json({
            success: true,
            integration: {
                id: updatedDoc.$id,
                platform: updatedDoc.platform,
                name: updatedDoc.name,
                site_url: updatedDoc.site_url,
                is_active: updatedDoc.is_active,
            },
        });
    } catch (error: any) {
        console.error('Error updating integration:', error);
        return NextResponse.json(
            { error: 'Error al actualizar integración', details: error.message },
            { status: 500 }
        );
    }
}
