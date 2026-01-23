/**
 * Base adapter interface for all blog platform integrations
 */

export interface PostData {
    title: string;
    content: string; // HTML content
    excerpt?: string;
    status: 'publish' | 'draft' | 'scheduled';
    scheduledDate?: string; // ISO date string for scheduled posts
    categories?: string[];
    tags?: string[];
    featuredImageUrl?: string;
    slug?: string;
    meta?: Record<string, any>;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
}

export interface TestResult {
    success: boolean;
    message: string;
    blogInfo?: {
        name: string;
        url: string;
        version?: string;
    };
}

export interface PublishResult {
    success: boolean;
    externalId: string;
    externalUrl: string;
    message?: string;
}

export interface UpdateResult extends PublishResult { }

export interface BlogAdapter {
    /**
     * Platform identifier
     */
    readonly platform: string;

    /**
     * Test connection with the provided credentials
     */
    testConnection(): Promise<TestResult>;

    /**
     * Create a new post on the blog
     */
    createPost(post: PostData): Promise<PublishResult>;

    /**
     * Update an existing post
     */
    updatePost(externalId: string, post: PostData): Promise<UpdateResult>;

    /**
     * Get available categories
     */
    getCategories(): Promise<Category[]>;

    /**
     * Get available tags
     */
    getTags(): Promise<Tag[]>;
}

/**
 * Base class with common functionality
 */
export abstract class BaseAdapter implements BlogAdapter {
    abstract readonly platform: string;
    protected siteUrl: string;
    protected credentials: any;

    constructor(siteUrl: string, credentials: any) {
        this.siteUrl = siteUrl.replace(/\/$/, ''); // Remove trailing slash
        this.credentials = credentials;
    }

    abstract testConnection(): Promise<TestResult>;
    abstract createPost(post: PostData): Promise<PublishResult>;
    abstract updatePost(externalId: string, post: PostData): Promise<UpdateResult>;
    abstract getCategories(): Promise<Category[]>;
    abstract getTags(): Promise<Tag[]>;

    /**
     * Helper to make HTTP requests with error handling
     */
    protected async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.siteUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error (${response.status}): ${errorText}`);
        }

        return response.json();
    }
}
