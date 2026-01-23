import {
    BaseAdapter,
    PostData,
    TestResult,
    PublishResult,
    UpdateResult,
    Category,
    Tag
} from './base-adapter';
import type { StrapiCredentials } from '../security/encryption';

/**
 * Strapi CMS Adapter (v4+)
 * Uses API Token for authentication
 * 
 * @see https://docs.strapi.io/dev-docs/api/rest
 */
export class StrapiAdapter extends BaseAdapter {
    readonly platform = 'strapi';
    private strapiCredentials: StrapiCredentials;
    private contentType: string;

    constructor(siteUrl: string, credentials: StrapiCredentials) {
        super(siteUrl, credentials);
        this.strapiCredentials = credentials;
        this.contentType = credentials.contentType || 'articles';
    }

    /**
     * Get auth header with Bearer token
     */
    private getAuthHeader(): string {
        return `Bearer ${this.strapiCredentials.apiToken}`;
    }

    async testConnection(): Promise<TestResult> {
        try {
            // Test by fetching content type info
            const response = await fetch(`${this.siteUrl}/api/${this.contentType}?pagination[limit]=1`, {
                headers: {
                    'Authorization': this.getAuthHeader(),
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    return {
                        success: false,
                        message: 'Autenticación fallida. Verifica tu API Token y permisos.',
                    };
                }
                if (response.status === 404) {
                    return {
                        success: false,
                        message: `Content type '${this.contentType}' no encontrado. Verifica el nombre.`,
                    };
                }
                return {
                    success: false,
                    message: `Error de conexión: ${response.status} ${response.statusText}`,
                };
            }

            return {
                success: true,
                message: `Conectado a Strapi (${this.contentType})`,
                blogInfo: {
                    name: 'Strapi CMS',
                    url: this.siteUrl,
                    version: 'v4+',
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
            const strapiData = this.mapToStrapiPost(post);

            const response = await fetch(`${this.siteUrl}/api/${this.contentType}`, {
                method: 'POST',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: strapiData }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            const created = result.data;

            // Strapi might not have a direct URL, construct one
            const externalUrl = `${this.siteUrl}/${this.contentType}/${created.attributes?.slug || created.id}`;

            return {
                success: true,
                externalId: String(created.id),
                externalUrl,
                message: `Artículo creado: ${created.attributes?.title || created.id}`,
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
            const strapiData = this.mapToStrapiPost(post);

            const response = await fetch(`${this.siteUrl}/api/${this.contentType}/${externalId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: strapiData }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            const updated = result.data;
            const externalUrl = `${this.siteUrl}/${this.contentType}/${updated.attributes?.slug || updated.id}`;

            return {
                success: true,
                externalId: String(updated.id),
                externalUrl,
                message: `Artículo actualizado: ${updated.attributes?.title || updated.id}`,
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
        try {
            const response = await fetch(`${this.siteUrl}/api/categories?pagination[limit]=100`, {
                headers: {
                    'Authorization': this.getAuthHeader(),
                },
            });

            if (!response.ok) {
                return [];
            }

            const result = await response.json();
            return result.data.map((cat: any) => ({
                id: String(cat.id),
                name: cat.attributes?.name || cat.name,
                slug: cat.attributes?.slug || cat.slug,
            }));
        } catch {
            return [];
        }
    }

    async getTags(): Promise<Tag[]> {
        try {
            const response = await fetch(`${this.siteUrl}/api/tags?pagination[limit]=100`, {
                headers: {
                    'Authorization': this.getAuthHeader(),
                },
            });

            if (!response.ok) {
                return [];
            }

            const result = await response.json();
            return result.data.map((tag: any) => ({
                id: String(tag.id),
                name: tag.attributes?.name || tag.name,
                slug: tag.attributes?.slug || tag.slug,
            }));
        } catch {
            return [];
        }
    }

    /**
     * Map our PostData to Strapi format
     * Note: Field names may vary based on Strapi schema
     */
    private mapToStrapiPost(post: PostData): any {
        const strapiData: any = {
            title: post.title,
            content: post.content, // or 'body' depending on schema
        };

        // Map status - Strapi v4 often uses publishedAt
        if (post.status === 'publish') {
            strapiData.publishedAt = new Date().toISOString();
        } else if (post.status === 'draft') {
            strapiData.publishedAt = null;
        } else if (post.status === 'scheduled' && post.scheduledDate) {
            strapiData.publishedAt = post.scheduledDate;
        }

        if (post.excerpt) {
            strapiData.description = post.excerpt; // Common field name
        }

        if (post.slug) {
            strapiData.slug = post.slug;
        }

        // Categories and tags depend on relations in schema
        // These would need to be relation IDs
        if (post.categories?.length) {
            strapiData.categories = post.categories; // Assuming IDs
        }

        if (post.tags?.length) {
            strapiData.tags = post.tags; // Assuming IDs
        }

        return strapiData;
    }
}
