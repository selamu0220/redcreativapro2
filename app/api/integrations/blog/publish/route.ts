import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { ID } from 'node-appwrite';
import { createAdminClient, APPWRITE_DB_ID } from '@/app/lib/server/appwrite';
import {
    BLOG_INTEGRATIONS_COLLECTION_ID,
    PUBLISHED_ARTICLES_COLLECTION_ID,
    ensurePublishedArticlesCollection
} from '@/app/lib/blog-integrations-schema';
import { decryptCredentials } from '@/app/lib/security/encryption';
import { createBlogAdapter } from '@/app/lib/blog-adapters';
import type { PostData } from '@/app/lib/blog-adapters/base-adapter';
import type { BlogPlatform } from '@/app/lib/blog-integrations-schema';

/**
 * POST /api/integrations/blog/publish
 * Publish an article to a connected blog
 * 
 * Body: {
 *   integration_id: string,
 *   document_id?: string,  // Optional: track which document was published
 *   title: string,
 *   content: string,
 *   excerpt?: string,
 *   status: 'publish' | 'draft',
 *   categories?: string[],
 *   tags?: string[],
 *   featured_image_url?: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const {
            integration_id,
            document_id,
            title,
            content,
            excerpt,
            status = 'draft',
            categories,
            tags,
            featured_image_url,
            slug
        } = body;

        // Validate required fields
        if (!integration_id || !title || !content) {
            return NextResponse.json(
                { error: 'Campos requeridos: integration_id, title, content' },
                { status: 400 }
            );
        }

        const { databases } = createAdminClient();

        // Get integration and verify ownership
        const integration = await databases.getDocument(
            APPWRITE_DB_ID,
            BLOG_INTEGRATIONS_COLLECTION_ID,
            integration_id
        );

        if (integration.user_id !== user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        if (!integration.is_active) {
            return NextResponse.json(
                { error: 'Esta integración está desactivada' },
                { status: 400 }
            );
        }

        // Decrypt credentials
        let credentials;
        try {
            credentials = decryptCredentials(integration.credentials);
        } catch {
            return NextResponse.json(
                { error: 'Error al descifrar credenciales. Puede que necesites volver a configurar la integración.' },
                { status: 500 }
            );
        }

        // Create adapter and publish
        const adapter = createBlogAdapter(
            integration.platform as BlogPlatform,
            integration.site_url,
            credentials
        );

        const postData: PostData = {
            title,
            content,
            status: status as 'publish' | 'draft',
            excerpt,
            categories,
            tags,
            featuredImageUrl: featured_image_url,
            slug,
        };

        const result = await adapter.createPost(postData);

        if (!result.success) {
            return NextResponse.json({
                success: false,
                message: result.message,
            });
        }

        // Track the published article
        await ensurePublishedArticlesCollection();

        const publishedArticle = await databases.createDocument(
            APPWRITE_DB_ID,
            PUBLISHED_ARTICLES_COLLECTION_ID,
            ID.unique(),
            {
                user_id: user.id,
                integration_id,
                document_id: document_id || '',
                external_id: result.externalId,
                external_url: result.externalUrl,
                status: status === 'publish' ? 'published' : status,
                published_at: new Date().toISOString(),
            }
        );

        // Update last_used on integration
        await databases.updateDocument(
            APPWRITE_DB_ID,
            BLOG_INTEGRATIONS_COLLECTION_ID,
            integration_id,
            { last_used: new Date().toISOString() }
        );

        return NextResponse.json({
            success: true,
            external_id: result.externalId,
            external_url: result.externalUrl,
            message: result.message,
            tracking_id: publishedArticle.$id,
        });
    } catch (error: any) {
        console.error('Error publishing article:', error);
        return NextResponse.json(
            { success: false, message: `Error al publicar: ${error.message}` },
            { status: 500 }
        );
    }
}

/**
 * GET /api/integrations/blog/publish?integration_id=xxx
 * Get categories and tags available for a blog
 */
export async function GET(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const integrationId = searchParams.get('integration_id');

        if (!integrationId) {
            return NextResponse.json(
                { error: 'integration_id requerido' },
                { status: 400 }
            );
        }

        const { databases } = createAdminClient();

        // Get integration and verify ownership
        const integration = await databases.getDocument(
            APPWRITE_DB_ID,
            BLOG_INTEGRATIONS_COLLECTION_ID,
            integrationId
        );

        if (integration.user_id !== user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        // Decrypt credentials
        const credentials = decryptCredentials(integration.credentials);

        // Create adapter and get metadata
        const adapter = createBlogAdapter(
            integration.platform as BlogPlatform,
            integration.site_url,
            credentials
        );

        const [categories, tags] = await Promise.all([
            adapter.getCategories(),
            adapter.getTags(),
        ]);

        return NextResponse.json({
            categories,
            tags,
        });
    } catch (error: any) {
        console.error('Error getting blog metadata:', error);
        return NextResponse.json(
            { error: `Error: ${error.message}` },
            { status: 500 }
        );
    }
}
