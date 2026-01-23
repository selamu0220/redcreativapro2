import { BlogAdapter } from './base-adapter';
import { WordPressAdapter } from './wordpress-adapter';
import { GhostAdapter } from './ghost-adapter';
import { StrapiAdapter } from './strapi-adapter';
import type { BlogPlatform } from '../blog-integrations-schema';

/**
 * Factory function to create the appropriate adapter for a platform
 */
export function createBlogAdapter(
    platform: BlogPlatform,
    siteUrl: string,
    credentials: any
): BlogAdapter {
    switch (platform) {
        case 'wordpress':
            return new WordPressAdapter(siteUrl, credentials);
        case 'ghost':
            return new GhostAdapter(siteUrl, credentials);
        case 'strapi':
            return new StrapiAdapter(siteUrl, credentials);
        // TODO: Add more adapters as they are implemented
        case 'sanity':
        case 'webflow':
        case 'contentful':
        case 'prismic':
        case 'storyblok':
            throw new Error(`Adapter for ${platform} is not yet implemented`);
        default:
            throw new Error(`Unknown platform: ${platform}`);
    }
}

/**
 * Get platform display info
 */
export const PLATFORM_INFO: Record<BlogPlatform, { name: string; description: string; icon: string }> = {
    wordpress: {
        name: 'WordPress',
        description: 'Publicar en blogs WordPress vía REST API',
        icon: '📝',
    },
    ghost: {
        name: 'Ghost',
        description: 'Publicar en blogs Ghost CMS',
        icon: '👻',
    },
    strapi: {
        name: 'Strapi',
        description: 'Publicar en Strapi Headless CMS',
        icon: '🚀',
    },
    sanity: {
        name: 'Sanity',
        description: 'Publicar en Sanity Content Lake',
        icon: '🔮',
    },
    webflow: {
        name: 'Webflow',
        description: 'Publicar en Webflow CMS',
        icon: '🌐',
    },
    contentful: {
        name: 'Contentful',
        description: 'Publicar en Contentful CMS',
        icon: '📦',
    },
    prismic: {
        name: 'Prismic',
        description: 'Publicar en Prismic CMS',
        icon: '🔷',
    },
    storyblok: {
        name: 'Storyblok',
        description: 'Publicar en Storyblok CMS',
        icon: '📚',
    },
};

/**
 * Get required credential fields for each platform
 */
export function getCredentialFields(platform: BlogPlatform): Array<{
    key: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
    helpText?: string;
}> {
    switch (platform) {
        case 'wordpress':
            return [
                {
                    key: 'username',
                    label: 'Usuario',
                    type: 'text',
                    placeholder: 'admin',
                    helpText: 'Tu nombre de usuario de WordPress',
                },
                {
                    key: 'applicationPassword',
                    label: 'Application Password',
                    type: 'password',
                    placeholder: 'xxxx xxxx xxxx xxxx xxxx xxxx',
                    helpText: 'Genéralo en WordPress → Usuarios → Tu Perfil → Application Passwords',
                },
            ];
        case 'ghost':
            return [
                {
                    key: 'adminApiKey',
                    label: 'Admin API Key',
                    type: 'password',
                    placeholder: 'XXXXXXXXXXXXXXXX:XXXXXXXXXXXXXXXX...',
                    helpText: 'Encuéntrala en Ghost Admin → Integrations → Custom Integration',
                },
            ];
        case 'strapi':
            return [
                {
                    key: 'apiToken',
                    label: 'API Token',
                    type: 'password',
                    placeholder: 'Tu token de API de Strapi',
                    helpText: 'Créalo en Strapi Admin → Settings → API Tokens',
                },
                {
                    key: 'contentType',
                    label: 'Content Type',
                    type: 'text',
                    placeholder: 'articles',
                    helpText: 'Nombre del content type (por defecto: articles)',
                },
            ];
        default:
            return [];
    }
}

export { WordPressAdapter, GhostAdapter, StrapiAdapter };
export type { BlogAdapter };
