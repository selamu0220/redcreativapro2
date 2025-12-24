interface StrapiPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  cover?: {
    url: string;
  };
  tags?: Array<{
    name: string;
  }>;
}

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

async function fetchStrapi<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  if (!STRAPI_API_TOKEN) {
    console.warn('STRAPI_API_TOKEN is not defined');
    return null;
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error(`Strapi Error (${res.status}):`, error);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Strapi Fetch Error:', error);
    return null;
  }
}

export const strapi = {
  getPosts: async (options: { limit?: number; page?: number } = {}) => {
    const { limit = 20, page = 1 } = options;
    const query = new URLSearchParams({
      'pagination[pageSize]': limit.toString(),
      'pagination[page]': page.toString(),
      'populate': '*',
      'sort': 'publishedAt:desc',
    });

    const result = await fetchStrapi<{ data: StrapiPost[]; meta: any }>(`/articles?${query.toString()}`);
    
    if (!result) return { posts: [], meta: {} };

    // Map to a common format similar to Wisp
    const posts = result.data.map((post) => ({
      id: post.documentId,
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      image: post.cover ? `${STRAPI_URL}${post.cover.url}` : null,
      tags: post.tags || [],
    }));

    return { posts, meta: result.meta };
  },

  getPost: async (slug: string) => {
    const query = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate': '*',
    });

    const result = await fetchStrapi<{ data: StrapiPost[] }>(`/articles?${query.toString()}`);
    
    if (!result || result.data.length === 0) return { post: null };

    const post = result.data[0];
    return {
      post: {
        id: post.documentId,
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        image: post.cover ? `${STRAPI_URL}${post.cover.url}` : null,
        tags: post.tags || [],
      }
    };
  }
};
