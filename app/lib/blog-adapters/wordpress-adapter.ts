import {
    BaseAdapter,
    PostData,
    TestResult,
    PublishResult,
    UpdateResult,
    Category,
    Tag
} from './base-adapter';
import type { WordPressCredentials } from '../security/encryption';

/**
 * WordPress REST API Adapter
 * Uses Application Passwords for authentication
 * 
 * @see https://developer.wordpress.org/rest-api/reference/posts/
 * @see https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/
 */
export class WordPressAdapter extends BaseAdapter {
    readonly platform = 'wordpress';
    private wpCredentials: WordPressCredentials;

    constructor(siteUrl: string, credentials: WordPressCredentials) {
        super(siteUrl, credentials);
        this.wpCredentials = credentials;
    }

    /**
     * Get Basic Auth header for WordPress Application Passwords
     */
    private getAuthHeader(): string {
        const { username, applicationPassword } = this.wpCredentials;
        const token = Buffer.from(`${username}:${applicationPassword}`).toString('base64');
        return `Basic ${token}`;
    }

    async testConnection(): Promise<TestResult> {
        try {
            // Test by fetching site info
            const response = await fetch(`${this.siteUrl}/wp-json/wp/v2/users/me`, {
                headers: {
                    'Authorization': this.getAuthHeader(),
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    return {
                        success: false,
                        message: 'Autenticación fallida. Verifica tu usuario y Application Password.',
                    };
                }
                return {
                    success: false,
                    message: `Error de conexión: ${response.status} ${response.statusText}`,
                };
            }

            const user = await response.json();

            // Also get site info
            const siteResponse = await fetch(`${this.siteUrl}/wp-json`);
            const siteInfo = await siteResponse.json();

            return {
                success: true,
                message: `Conectado como ${user.name}`,
                blogInfo: {
                    name: siteInfo.name || 'WordPress Site',
                    url: siteInfo.url || this.siteUrl,
                    version: siteInfo.namespaces?.includes('wp/v2') ? 'REST API v2' : 'Unknown',
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
            const wpPost = await this.mapToWordPressPost(post);

            const response = await fetch(`${this.siteUrl}/wp-json/wp/v2/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wpPost),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            const created = await response.json();

            return {
                success: true,
                externalId: String(created.id),
                externalUrl: created.link,
                message: `Artículo publicado: ${created.title.rendered}`,
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
            const wpPost = await this.mapToWordPressPost(post);

            const response = await fetch(`${this.siteUrl}/wp-json/wp/v2/posts/${externalId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wpPost),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            const updated = await response.json();

            return {
                success: true,
                externalId: String(updated.id),
                externalUrl: updated.link,
                message: `Artículo actualizado: ${updated.title.rendered}`,
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
            const response = await fetch(`${this.siteUrl}/wp-json/wp/v2/categories?per_page=100`, {
                headers: {
                    'Authorization': this.getAuthHeader(),
                },
            });

            if (!response.ok) {
                return [];
            }

            const categories = await response.json();
            return categories.map((cat: any) => ({
                id: String(cat.id),
                name: cat.name,
                slug: cat.slug,
            }));
        } catch {
            return [];
        }
    }

    async getTags(): Promise<Tag[]> {
        try {
            const response = await fetch(`${this.siteUrl}/wp-json/wp/v2/tags?per_page=100`, {
                headers: {
                    'Authorization': this.getAuthHeader(),
                },
            });

            if (!response.ok) {
                return [];
            }

            const tags = await response.json();
            return tags.map((tag: any) => ({
                id: String(tag.id),
                name: tag.name,
                slug: tag.slug,
            }));
        } catch {
            return [];
        }
    }

    /**
     * Map our PostData to WordPress post format
     */
    private async mapToWordPressPost(post: PostData): Promise<any> {
        const wpPost: any = {
            title: post.title,
            content: post.content,
            status: post.status === 'scheduled' ? 'future' : post.status,
        };

        if (post.excerpt) {
            wpPost.excerpt = post.excerpt;
        }

        if (post.slug) {
            wpPost.slug = post.slug;
        }

        if (post.scheduledDate && post.status === 'scheduled') {
            wpPost.date = post.scheduledDate;
        }

        // Handle categories - need to resolve names to IDs
        if (post.categories?.length) {
            const allCategories = await this.getCategories();
            const categoryIds = post.categories
                .map(catName => allCategories.find(c =>
                    c.name.toLowerCase() === catName.toLowerCase() ||
                    c.slug === catName.toLowerCase()
                )?.id)
                .filter(Boolean)
                .map(Number);

            if (categoryIds.length) {
                wpPost.categories = categoryIds;
            }
        }

        // Handle tags - need to resolve names to IDs
        if (post.tags?.length) {
            const allTags = await this.getTags();
            const tagIds = post.tags
                .map(tagName => allTags.find(t =>
                    t.name.toLowerCase() === tagName.toLowerCase() ||
                    t.slug === tagName.toLowerCase()
                )?.id)
                .filter(Boolean)
                .map(Number);

            if (tagIds.length) {
                wpPost.tags = tagIds;
            }
        }

        return wpPost;
    }
}
