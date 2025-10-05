'use client'

import Link from 'next/link'
import { Clock, Eye, Heart, ArrowRight } from 'lucide-react'
import { getRelatedPosts, categories, type BlogPost } from '@/lib/blog-data'

interface RelatedArticlesProps {
  currentPostId: string
  category: string
  tags: string[]
  limit?: number
}

export default function RelatedArticles({ 
  currentPostId, 
  category, 
  tags, 
  limit = 3 
}: RelatedArticlesProps) {
  const relatedPosts = getRelatedPosts(currentPostId, limit)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <ArrowRight className="w-5 h-5 text-blue-500" />
        Artículos Relacionados
      </h3>
      
      <div className="space-y-4">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.id}`}
            className="group flex gap-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-all duration-300 hover:bg-zinc-750"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">
                {categories.find(cat => cat.id === post.category)?.icon || '📝'}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-white bg-zinc-700 px-2 py-1 rounded">
                  {categories.find(cat => cat.id === post.category)?.name}
                </span>
                <span className="text-xs text-zinc-500">{post.readTime}</span>
              </div>
              
              <h4 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-zinc-300 transition-colors">
                {post.title}
              </h4>
              
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {post.likes}
                </span>
                <span>{post.date}</span>
              </div>
            </div>
            
            <div className="flex items-center text-zinc-500 group-hover:text-white transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}