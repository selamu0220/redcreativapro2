'use client'

import React from 'react'
import BlogContentFormatter from './BlogContentFormatter'
import ArticleContentWrapper from './ArticleContentWrapper'

interface BlogContentProps {
  content: string
  className?: string
}

export default function BlogContent({ content, className = '' }: BlogContentProps) {
  if (!content) return null

  return (
    <BlogContentFormatter className={className}>
      <div 
        className="article-body"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </BlogContentFormatter>
  )
}
