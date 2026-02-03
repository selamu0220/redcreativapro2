/**
 * Topic Clusters System
 * 
 * Generates internal links between related blog posts based on
 * categories, tags, and content similarity to improve SEO authority.
 */

import { BlogPost } from '@/lib/blog-data'

// ============================================================================
// TOPIC CLUSTERS CONFIGURATION
// ============================================================================

export interface TopicCluster {
    id: string
    name: string
    pillarPostId: string  // The main "hub" article for this cluster
    description: string
    keywords: string[]
    relatedPostIds: string[]
}

/**
 * Define your topic clusters here.
 * Each cluster has a "pillar" post (comprehensive guide) and "cluster" posts (specific topics).
 */
export const TOPIC_CLUSTERS: TopicCluster[] = [
    {
        id: 'escritura-ia',
        name: 'Escritura con IA',
        pillarPostId: 'creador-redacciones-automatico-guia-ejemplos',
        description: 'Todo sobre cómo usar IA para escribir textos, artículos y redacciones.',
        keywords: ['IA', 'escritura', 'redacción', 'automatización', 'ChatGPT', 'textos automáticos'],
        relatedPostIds: [
            'como-humanizar-texto-ia-indetectable',
            'generador-textos-ia-gratis-sin-registro',
            'textos-automaticos-cuando-usarlos-cuando-no',
        ]
    },
    {
        id: 'seo-contenidos',
        name: 'SEO y Estrategia de Contenidos',
        pillarPostId: 'estrategia-seo-ia-blog-automatico',
        description: 'Estrategias para crear y posicionar contenido usando inteligencia artificial.',
        keywords: ['SEO', 'topic clusters', 'contenido', 'blog', 'posicionamiento', 'Google'],
        relatedPostIds: [
            'generador-textos-ia-gratis-sin-registro',
            'textos-automaticos-cuando-usarlos-cuando-no',
        ]
    },
    {
        id: 'detectores-ia',
        name: 'Detectores y Humanización de IA',
        pillarPostId: 'como-humanizar-texto-ia-indetectable',
        description: 'Cómo evitar que detecten tu contenido generado por IA.',
        keywords: ['detectores', 'Turnitin', 'GPTZero', 'humanizar', 'stealth', 'indetectable'],
        relatedPostIds: [
            'creador-redacciones-automatico-guia-ejemplos',
            'textos-automaticos-cuando-usarlos-cuando-no',
        ]
    }
]

// ============================================================================
// INTERNAL LINKING UTILITIES
// ============================================================================

export interface InternalLink {
    href: string
    text: string
    context: 'related' | 'pillar' | 'cluster'
}

/**
 * Get related posts for a given post based on topic clusters
 */
export function getRelatedPosts(
    currentPostId: string,
    allPosts: BlogPost[],
    maxResults: number = 5
): BlogPost[] {
    const related: BlogPost[] = []
    const relatedIds = new Set<string>()

    // Find clusters that contain this post
    for (const cluster of TOPIC_CLUSTERS) {
        if (cluster.pillarPostId === currentPostId || cluster.relatedPostIds.includes(currentPostId)) {
            // Add pillar post if not current
            if (cluster.pillarPostId !== currentPostId) {
                relatedIds.add(cluster.pillarPostId)
            }
            // Add related posts
            for (const id of cluster.relatedPostIds) {
                if (id !== currentPostId) {
                    relatedIds.add(id)
                }
            }
        }
    }

    // If not in any cluster, fallback to category/tag matching
    const currentPost = allPosts.find(p => p.id === currentPostId)
    if (relatedIds.size === 0 && currentPost) {
        // Find posts with same category
        for (const post of allPosts) {
            if (post.id !== currentPostId && post.category === currentPost.category) {
                relatedIds.add(post.id)
            }
        }
        // Find posts with overlapping tags
        for (const post of allPosts) {
            if (post.id !== currentPostId && post.tags) {
                const overlap = post.tags.filter(t => currentPost.tags?.includes(t))
                if (overlap.length >= 2) {
                    relatedIds.add(post.id)
                }
            }
        }
    }

    // Convert IDs to posts
    for (const id of relatedIds) {
        const post = allPosts.find(p => p.id === id)
        if (post && related.length < maxResults) {
            related.push(post)
        }
    }

    return related
}

/**
 * Get the cluster info for a post
 */
export function getClusterInfo(postId: string): { cluster: TopicCluster, isPillar: boolean } | null {
    for (const cluster of TOPIC_CLUSTERS) {
        if (cluster.pillarPostId === postId) {
            return { cluster, isPillar: true }
        }
        if (cluster.relatedPostIds.includes(postId)) {
            return { cluster, isPillar: false }
        }
    }
    return null
}

/**
 * Generate contextual internal links for a post
 */
export function generateContextualLinks(
    currentPostId: string,
    allPosts: BlogPost[]
): InternalLink[] {
    const links: InternalLink[] = []
    const clusterInfo = getClusterInfo(currentPostId)

    if (clusterInfo) {
        const { cluster, isPillar } = clusterInfo

        if (isPillar) {
            // This is a pillar post - link to all cluster posts
            for (const id of cluster.relatedPostIds) {
                const post = allPosts.find(p => p.id === id)
                if (post) {
                    links.push({
                        href: `/blog/${post.id}`,
                        text: post.title,
                        context: 'cluster'
                    })
                }
            }
        } else {
            // This is a cluster post - link back to pillar
            const pillarPost = allPosts.find(p => p.id === cluster.pillarPostId)
            if (pillarPost) {
                links.push({
                    href: `/blog/${pillarPost.id}`,
                    text: `📚 Guía Completa: ${pillarPost.title}`,
                    context: 'pillar'
                })
            }
            // Also link to siblings in the cluster
            for (const id of cluster.relatedPostIds) {
                if (id !== currentPostId) {
                    const post = allPosts.find(p => p.id === id)
                    if (post) {
                        links.push({
                            href: `/blog/${post.id}`,
                            text: post.title,
                            context: 'related'
                        })
                    }
                }
            }
        }
    }

    return links
}

/**
 * Generate internal link HTML for embedding in content
 */
export function generateInternalLinkBlock(
    currentPostId: string,
    allPosts: BlogPost[]
): string {
    const links = generateContextualLinks(currentPostId, allPosts)
    const clusterInfo = getClusterInfo(currentPostId)

    if (links.length === 0) return ''

    const pillarLink = links.find(l => l.context === 'pillar')
    const clusterLinks = links.filter(l => l.context === 'cluster' || l.context === 'related')

    let html = '<aside class="internal-links-block">'

    if (pillarLink) {
        html += `
            <div class="pillar-link">
                <span class="pillar-label">📖 Guía Principal</span>
                <a href="${pillarLink.href}">${pillarLink.text}</a>
            </div>
        `
    }

    if (clusterLinks.length > 0) {
        const title = clusterInfo?.isPillar
            ? '🔗 Artículos en este tema'
            : '📎 Artículos relacionados'

        html += `
            <div class="cluster-links">
                <span class="cluster-label">${title}</span>
                <ul>
                    ${clusterLinks.map(l => `<li><a href="${l.href}">${l.text}</a></li>`).join('')}
                </ul>
            </div>
        `
    }

    html += '</aside>'
    return html
}

// ============================================================================
// SCHEMA.ORG ITEMLIST FOR CLUSTERS
// ============================================================================

/**
 * Generate ItemList schema for a topic cluster
 */
export function generateClusterSchema(
    cluster: TopicCluster,
    allPosts: BlogPost[],
    baseUrl: string = 'https://www.redcreativa.pro'
) {
    const items = [cluster.pillarPostId, ...cluster.relatedPostIds]
        .map((id, index) => {
            const post = allPosts.find(p => p.id === id)
            if (!post) return null
            return {
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Article',
                    '@id': `${baseUrl}/blog/${post.id}`,
                    name: post.title,
                    description: post.excerpt
                }
            }
        })
        .filter(Boolean)

    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: cluster.name,
        description: cluster.description,
        numberOfItems: items.length,
        itemListElement: items
    }
}
