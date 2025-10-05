import { blogPosts, type BlogPost } from './blog-data'

/**
 * Find similar articles based on category and tags
 */
export function findSimilarArticles(targetCategory: string, targetTags: string[], excludeId?: string): BlogPost[] {
  return blogPosts
    .filter(post => {
      // Exclude the current post if provided
      if (excludeId && post.id === excludeId) return false
      
      // Check if post is in the same category
      const sameCategory = post.category === targetCategory
      
      // Check if post has any matching tags
      const hasMatchingTags = targetTags.some(tag => 
        post.tags.some(postTag => 
          postTag.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(postTag.toLowerCase())
        )
      )
      
      return sameCategory || hasMatchingTags
    })
    .sort((a, b) => {
      // Prioritize posts with same category
      const aCategory = a.category === targetCategory ? 1 : 0
      const bCategory = b.category === targetCategory ? 1 : 0
      
      if (aCategory !== bCategory) {
        return bCategory - aCategory
      }
      
      // Then by number of matching tags
      const aMatchingTags = targetTags.filter(tag => 
        a.tags.some(postTag => 
          postTag.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(postTag.toLowerCase())
        )
      ).length
      
      const bMatchingTags = targetTags.filter(tag => 
        b.tags.some(postTag => 
          postTag.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(postTag.toLowerCase())
        )
      ).length
      
      if (aMatchingTags !== bMatchingTags) {
        return bMatchingTags - aMatchingTags
      }
      
      // Finally by date (most recent first)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    .slice(0, 5) // Return top 5 similar articles
}

/**
 * Find articles by partial slug match
 */
export function findArticlesByPartialSlug(partialSlug: string): BlogPost[] {
  const searchTerm = partialSlug.toLowerCase()
  
  return blogPosts
    .filter(post => {
      const postId = post.id.toLowerCase()
      const postTitle = post.title.toLowerCase()
      
      // Check if the post ID contains the search term
      const idMatch = postId.includes(searchTerm) || searchTerm.includes(postId)
      
      // Check if any word in the title matches
      const titleWords = postTitle.split(/[\s-_]+/)
      const searchWords = searchTerm.split(/[\s-_]+/)
      
      const titleMatch = titleWords.some(titleWord => 
        searchWords.some(searchWord => 
          titleWord.includes(searchWord) || searchWord.includes(titleWord)
        )
      )
      
      return idMatch || titleMatch
    })
    .sort((a, b) => {
      // Calculate relevance score
      const aScore = calculateRelevanceScore(a, searchTerm)
      const bScore = calculateRelevanceScore(b, searchTerm)
      
      return bScore - aScore
    })
    .slice(0, 3) // Return top 3 matches
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(post: BlogPost, searchTerm: string): number {
  let score = 0
  const postId = post.id.toLowerCase()
  const postTitle = post.title.toLowerCase()
  
  // Exact ID match gets highest score
  if (postId === searchTerm) score += 100
  
  // ID contains search term
  if (postId.includes(searchTerm)) score += 50
  
  // Search term contains ID (partial match)
  if (searchTerm.includes(postId)) score += 30
  
  // Title exact match
  if (postTitle === searchTerm) score += 80
  
  // Title contains search term
  if (postTitle.includes(searchTerm)) score += 40
  
  // Word-level matches in title
  const titleWords = postTitle.split(/[\s-_]+/)
  const searchWords = searchTerm.split(/[\s-_]+/)
  
  titleWords.forEach(titleWord => {
    searchWords.forEach(searchWord => {
      if (titleWord === searchWord) score += 20
      else if (titleWord.includes(searchWord) || searchWord.includes(titleWord)) score += 10
    })
  })
  
  // Boost featured and trending posts
  if (post.featured) score += 5
  if (post.trending) score += 3
  
  return score
}

/**
 * Log 404 error to tracking API
 */
export async function log404Error(url: string, referrer?: string): Promise<void> {
  try {
    // Only run on client side or provide referrer explicitly
    const finalReferrer = referrer || (typeof window !== 'undefined' ? document.referrer : 'Server') || 'Direct'
    
    await fetch('/api/blog/404-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        referrer: finalReferrer
      })
    })
  } catch (error) {
    console.error('Failed to log 404 error:', error)
  }
}

/**
 * Get popular articles for 404 page recommendations
 */
export function getPopularArticles(limit: number = 6): BlogPost[] {
  return blogPosts
    .filter(post => post.featured || post.trending || post.views)
    .sort((a, b) => {
      // Sort by: featured > trending > views > date
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      
      if (a.trending && !b.trending) return -1
      if (!a.trending && b.trending) return 1
      
      if (a.views && b.views) {
        return b.views - a.views
      }
      
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    .slice(0, limit)
}