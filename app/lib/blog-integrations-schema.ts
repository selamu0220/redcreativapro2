export const BLOG_INTEGRATIONS_COLLECTION_ID = '';
export const PUBLISHED_ARTICLES_COLLECTION_ID = '';

export interface BlogIntegration {
  $id?: string;
  platform: string;
  name: string;
  apiKey: string;
  blogUrl: string;
  enabled: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function ensureBlogCollections() {
  return null;
}
