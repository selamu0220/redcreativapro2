'use client'

/**
 * Related Posts Component
 * 
 * Displays related articles based on Topic Clusters for internal SEO linking
 */

import Link from 'next/link'
import { BlogPost } from '@/lib/blog-data'
import { getRelatedPosts, getClusterInfo } from '@/lib/seo/topic-clusters'
import { ArrowRight, BookOpen, Link2 } from 'lucide-react'

interface RelatedPostsProps {
    currentPostId: string
    allPosts: BlogPost[]
    maxPosts?: number
}

export function RelatedPosts({ currentPostId, allPosts, maxPosts = 4 }: RelatedPostsProps) {
    const relatedPosts = getRelatedPosts(currentPostId, allPosts, maxPosts)
    const clusterInfo = getClusterInfo(currentPostId)

    if (relatedPosts.length === 0) return null

    return (
        <aside className="related-posts mt-12 py-8 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-6">
                <Link2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {clusterInfo?.isPillar ? 'Artículos en este tema' : 'Artículos relacionados'}
                </h3>
            </div>

            {/* Pillar Post Link (if this is a cluster post) */}
            {clusterInfo && !clusterInfo.isPillar && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 mb-2">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-medium">Guía Completa</span>
                    </div>
                    {(() => {
                        const pillarPost = allPosts.find(p => p.id === clusterInfo.cluster.pillarPostId)
                        if (!pillarPost) return null
                        return (
                            <Link
                                href={`/blog/${pillarPost.id}`}
                                className="group flex items-center justify-between"
                            >
                                <span className="text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                    {pillarPost.title}
                                </span>
                                <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )
                    })()}
                </div>
            )}

            {/* Related Posts Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
                {relatedPosts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/blog/${post.id}`}
                        className="group p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start gap-3">
                            {post.image && (
                                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-2">
                                    {post.title}
                                </h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    {post.readTime} de lectura
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Topic Cluster Label */}
            {clusterInfo && (
                <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 text-center">
                    Parte del tema <strong className="text-emerald-600">{clusterInfo.cluster.name}</strong>
                </p>
            )}
        </aside>
    )
}
