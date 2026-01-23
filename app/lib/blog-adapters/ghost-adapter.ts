import {
    BaseAdapter,
    PostData,
    TestResult,
    PublishResult,
    UpdateResult,
    Category,
    Tag
} from './base-adapter';
import crypto from 'crypto';
import type { GhostCredentials } from '../security/encryption';

/**
 * Ghost Admin API Adapter
 * Uses Admin API Key (JWT) for authentication
 * 
 * @see https://ghost.org/docs/admin-api/
 */
export class GhostAdapter extends BaseAdapter {
    readonly platform = 'ghost';
    private ghostCredentials: GhostCredentials;

    constructor(siteUrl: string, credentials: GhostCredentials) {
        super(siteUrl, credentials);
        this.ghostCredentials = credentials;
    }

    /**
     * Generate JWT token for Ghost Admin API
     * Ghost Admin API keys are in format: {id}:{secret}
     */
    private generateToken(): string {
        const [id, secret] = this.ghostCredentials.adminApiKey.split(':');

        if (!id || !secret) {
            throw new Error('Invalid Ghost Admin API key format. Expected: {id}:{secret}');
        }

        // Create JWT header and payload
        const header = {
            alg: 'HS256',
            typ: 'JWT',
            kid: id,
        };

        const payload = {
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
            aud: '/admin/',
        };

        // Encode header and payload
        const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

        // Create signature
        const signatureInput = `${encodedHeader}.${encodedPayload}`;
        const keyBuffer = Buffer.from(secret, 'hex');
        const signature = crypto
            .createHmac('sha256', keyBuffer)
            .update(signatureInput)
            .digest('base64url');

        return `${signatureInput}.${signature}`;
    }

    async testConnection(): Promise<TestResult> {
        try {
            const token = this.generateToken();

            const response = await fetch(`${this.siteUrl}/ghost/api/admin/site/`, {
                headers: {
                    'Authorization': `Ghost ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    return {
                        success: false,
                        message: 'Autenticación fallida. Verifica tu Admin API Key.',
                    };
                }
                return {
                    success: false,
                    message: `Error de conexión: ${response.status} ${response.statusText}`,
                };
            }

            const data = await response.json();
            const site = data.site;

            return {
                success: true,
                message: 'Conectado exitosamente',
                blogInfo: {
                    name: site.title || 'Ghost Site',
                    url: site.url || this.siteUrl,
                    version: site.version || 'Unknown',
                },
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Error de conexión: ${error.message}`,
            };
        }
    }

    async createPost(post: PostData): Promise<PublishResult> {
        try {
            const token = this.generateToken();
            const ghostPost = this.mapToGhostPost(post);

            const response = await fetch(`${this.siteUrl}/ghost/api/admin/posts/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Ghost ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ posts: [ghostPost] }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.errors?.[0]?.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            const created = data.posts[0];

            return {
                success: true,
                externalId: created.id,
                externalUrl: created.url,
                message: `Artículo publicado: ${created.title}`,
            };
        } catch (error: any) {
            return {
                success: false,
                externalId: '',
                externalUrl: '',
                message: `Error al publicar: ${error.message}`,
            };
        }
    }

    async updatePost(externalId: string, post: PostData): Promise<UpdateResult> {
        try {
            const token = this.generateToken();

            // First, get the current post to get its updated_at
            const getResponse = await fetch(`${this.siteUrl}/ghost/api/admin/posts/${externalId}/`, {
                headers: {
                    'Authorization': `Ghost ${token}`,
                },
            });

            if (!getResponse.ok) {
                throw new Error(`Post not found: ${externalId}`);
            }

            const currentData = await getResponse.json();
            const ghostPost = {
                ...this.mapToGhostPost(post),
                updated_at: currentData.posts[0].updated_at,
            };

            const response = await fetch(`${this.siteUrl}/ghost/api/admin/posts/${externalId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Ghost ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ posts: [ghostPost] }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.errors?.[0]?.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            const updated = data.posts[0];

            return {
                success: true,
                externalId: updated.id,
                externalUrl: updated.url,
                message: `Artículo actualizado: ${updated.title}`,
            };
        } catch (error: any) {
            return {
                success: false,
                externalId,
                externalUrl: '',
                message: `Error al actualizar: ${error.message}`,
            };
        }
    }

    async getCategories(): Promise<Category[]> {
        // Ghost doesn't have categories, only tags
        return [];
    }

    async getTags(): Promise<Tag[]> {
        try {
            const token = this.generateToken();

            const response = await fetch(`${this.siteUrl}/ghost/api/admin/tags/?limit=all`, {
                headers: {
                    'Authorization': `Ghost ${token}`,
                },
            });

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            return data.tags.map((tag: any) => ({
                id: tag.id,
                name: tag.name,
                slug: tag.slug,
            }));
        } catch {
            return [];
        }
    }

    /**
     * Map our PostData to Ghost post format
     */
    private mapToGhostPost(post: PostData): any {
        const ghostPost: any = {
            title: post.title,
            html: post.content, // Ghost uses 'html' for content
            status: post.status === 'scheduled' ? 'scheduled' : post.status,
        };

        if (post.excerpt) {
            ghostPost.custom_excerpt = post.excerpt;
        }

        if (post.slug) {
            ghostPost.slug = post.slug;
        }

        if (post.scheduledDate && post.status === 'scheduled') {
            ghostPost.published_at = post.scheduledDate;
        }

        if (post.featuredImageUrl) {
            ghostPost.feature_image = post.featuredImageUrl;
        }

        // Ghost uses tags array with objects
        if (post.tags?.length) {
            ghostPost.tags = post.tags.map(tag => ({ name: tag }));
        }

        return ghostPost;
    }
}
