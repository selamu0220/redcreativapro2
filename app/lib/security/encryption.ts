import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

// Get encryption key from environment (must be 32 bytes for AES-256)
function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY || process.env.CREDENTIALS_ENCRYPTION_KEY;

    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is required for credential encryption');
    }

    // If key is hex-encoded (64 chars for 32 bytes)
    if (key.length === 64 && /^[a-fA-F0-9]+$/.test(key)) {
        return Buffer.from(key, 'hex');
    }

    // Otherwise, derive a key from the provided string
    return crypto.scryptSync(key, 'redcreativa-salt', 32);
}

/**
 * Encrypt sensitive data (like API credentials) for storage
 * Uses AES-256-GCM for authenticated encryption
 */
export function encryptCredentials(data: object): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const plaintext = JSON.stringify(data);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    // Combine IV + AuthTag + Encrypted data into single base64 string
    const combined = Buffer.concat([iv, authTag, encrypted]);
    return combined.toString('base64');
}

/**
 * Decrypt stored credentials
 */
export function decryptCredentials<T = any>(encrypted: string): T {
    try {
        const key = getEncryptionKey();
        const combined = Buffer.from(encrypted, 'base64');

        // Extract components
        const iv = combined.subarray(0, IV_LENGTH);
        const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
        const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final()
        ]);

        return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
        throw new Error('Failed to decrypt credentials. The encryption key may have changed.');
    }
}

/**
 * Generate a secure random encryption key (for initial setup)
 * Run this once and save the output to your environment variables
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Credential types for different platforms
 */
export interface WordPressCredentials {
    username: string;
    applicationPassword: string; // Application Password from WordPress
}

export interface GhostCredentials {
    adminApiKey: string; // Format: {id}:{secret}
}

export interface StrapiCredentials {
    apiToken: string;
    contentType?: string; // Default: 'articles'
}

export interface SanityCredentials {
    projectId: string;
    dataset: string;
    token: string;
}

export interface WebflowCredentials {
    apiToken: string;
    siteId: string;
    collectionId: string;
}

export interface ContentfulCredentials {
    spaceId: string;
    accessToken: string; // Content Management API token
    environmentId?: string; // Default: 'master'
}

export type PlatformCredentials =
    | WordPressCredentials
    | GhostCredentials
    | StrapiCredentials
    | SanityCredentials
    | WebflowCredentials
    | ContentfulCredentials;

/**
 * Validate credentials structure for a platform
 */
export function validateCredentials(platform: string, credentials: any): boolean {
    switch (platform) {
        case 'wordpress':
            return !!(credentials.username && credentials.applicationPassword);
        case 'ghost':
            return !!(credentials.adminApiKey && credentials.adminApiKey.includes(':'));
        case 'strapi':
            return !!credentials.apiToken;
        case 'sanity':
            return !!(credentials.projectId && credentials.dataset && credentials.token);
        case 'webflow':
            return !!(credentials.apiToken && credentials.siteId && credentials.collectionId);
        case 'contentful':
            return !!(credentials.spaceId && credentials.accessToken);
        default:
            return false;
    }
}
