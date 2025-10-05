'use client'

import { useEffect } from 'react'

interface BlogPostClientProps {
  postId: string
  postTitle: string
  children: React.ReactNode
}

export default function BlogPostClient({ postId, postTitle, children }: BlogPostClientProps) {
  useEffect(() => {
    // Track page view or any client-side analytics
    if (typeof window !== 'undefined') {
      // You can add analytics tracking here
      console.log(`Viewing blog post: ${postTitle}`)
    }
  }, [postId, postTitle])

  return (
    <>
      {children}
    </>
  )
}