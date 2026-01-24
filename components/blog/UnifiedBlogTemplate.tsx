'use client';

import React from 'react';
import PremiumArticleTemplate from './PremiumArticleTemplate';
import { BlogPost } from '@/app/lib/blog-service';

interface UnifiedBlogTemplateProps {
    post: BlogPost;
    children?: React.ReactNode;
}

/**
 * Unified Blog Template - Decides which template to use based on post data
 * 
 * If the post has premium fields (process, promptsSection, resourcesSection),
 * it renders using PremiumArticleTemplate for guaranteed perfect styling.
 * 
 * This makes it IMPOSSIBLE for an article to have inconsistent styling.
 */
export default function UnifiedBlogTemplate({ post, children }: UnifiedBlogTemplateProps) {

    // Defensive check
    if (!post) {
        return <div className="p-8 text-center">Cargando artículo...</div>;
    }

    // Determine if this post should use the premium template
    const hasPremiumContent = !!(
        post.process ||
        post.promptsSection ||
        post.resourcesSection ||
        post.relatedLinks?.length
    );

    // Format the date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    // Always use PremiumArticleTemplate for consistency
    // The template handles all styling automatically
    return (
        <PremiumArticleTemplate
            title={post.title || 'Sin título'}
            description={post.excerpt || ''}
            category={post.category || 'General'}
            readingTime={post.readTime || '5 min'}
            date={formatDate(post.publishedAt)}
            process={post.process || []}
            prompts={post.promptsSection || []}
            resources={post.resourcesSection || []}
            relatedLinks={post.relatedLinks || []}
            faqJsonLd={post.faqJsonLd}
        >
            {/* Render content or children */}
            {children ? (
                children
            ) : post.content ? (
                <div
                    className="prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            ) : (
                <p className="text-muted-foreground">Contenido no disponible.</p>
            )}
        </PremiumArticleTemplate>
    );
}
