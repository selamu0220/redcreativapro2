export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  slug?: string;
  author?: string;
  tags?: string[];
  published?: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface BlogMetadata {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  publishedAt: string;
  updatedAt?: string;
  canonicalUrl?: string;
}