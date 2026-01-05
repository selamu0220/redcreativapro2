/**
 * Style Profile Persistence Service
 * 
 * Manages storage, retrieval, and versioning of style profiles:
 * - Automatic saving on profile creation/update
 * - Multiple versions for rollback capability
 * - Profile loading on user login
 * - History tracking with timestamps
 * 
 * Requirements: 5.1, 5.4, 5.5
 */

import { StyleProfile } from './style-learning-service';

export interface StyleProfileVersion {
    id: string;
    profileId: string;
    version: number;
    profile: StyleProfile;
    createdAt: number;
    description?: string;
}

export interface StyleProfileHistory {
    profileId: string;
    versions: StyleProfileVersion[];
    currentVersion: number;
    createdAt: number;
    updatedAt: number;
}

/**
 * Style Profile Persistence Service
 * 
 * Handles all database operations for style profiles.
 * Currently uses localStorage, but can be swapped for database backend.
 */
export class StyleProfilePersistenceService {
    private readonly STORAGE_KEY_PREFIX = 'style_profile_';
    private readonly HISTORY_KEY_PREFIX = 'style_profile_history_';
    private readonly USER_PROFILE_KEY = 'user_current_profile_';
    private readonly MAX_VERSIONS = 10; // Keep last 10 versions

    /**
     * Save a style profile
     * 
     * @param userId - User ID
     * @param profile - Style profile to save
     * @param description - Optional description of this version
     * @returns Saved profile version
     */
    async saveProfile(
        userId: string,
        profile: StyleProfile,
        description?: string
    ): Promise<StyleProfileVersion> {
        const history = await this.getHistory(userId, profile.id);

        // Create new version
        const newVersion: StyleProfileVersion = {
            id: this.generateVersionId(),
            profileId: profile.id,
            version: history.currentVersion + 1,
            profile: { ...profile, updatedAt: Date.now() },
            createdAt: Date.now(),
            description
        };

        // Add to history
        history.versions.push(newVersion);
        history.currentVersion = newVersion.version;
        history.updatedAt = Date.now();

        // Trim old versions if exceeding limit
        if (history.versions.length > this.MAX_VERSIONS) {
            history.versions = history.versions.slice(-this.MAX_VERSIONS);
        }

        // Save history
        await this.saveHistory(userId, history);

        // Set as current profile for user
        await this.setCurrentProfile(userId, profile.id);

        console.log(`Saved style profile version ${newVersion.version} for user ${userId}`);

        return newVersion;
    }

    /**
     * Load the current active profile for a user
     * 
     * @param userId - User ID
     * @returns Current style profile or null if none exists
     */
    async loadCurrentProfile(userId: string): Promise<StyleProfile | null> {
        const currentProfileId = await this.getCurrentProfileId(userId);

        if (!currentProfileId) {
            return null;
        }

        const history = await this.getHistory(userId, currentProfileId);

        if (history.versions.length === 0) {
            return null;
        }

        // Return the latest version
        const latestVersion = history.versions[history.versions.length - 1];
        return latestVersion.profile;
    }

    /**
     * Load a specific version of a profile
     * 
     * @param userId - User ID
     * @param profileId - Profile ID
     * @param version - Version number
     * @returns Style profile version or null if not found
     */
    async loadProfileVersion(
        userId: string,
        profileId: string,
        version: number
    ): Promise<StyleProfile | null> {
        const history = await this.getHistory(userId, profileId);

        const targetVersion = history.versions.find(v => v.version === version);

        return targetVersion ? targetVersion.profile : null;
    }

    /**
     * Get all versions of a profile
     * 
     * @param userId - User ID
     * @param profileId - Profile ID
     * @returns Array of profile versions
     */
    async getProfileVersions(
        userId: string,
        profileId: string
    ): Promise<StyleProfileVersion[]> {
        const history = await this.getHistory(userId, profileId);
        return [...history.versions]; // Return copy
    }

    /**
     * Rollback to a previous version
     * 
     * @param userId - User ID
     * @param profileId - Profile ID
     * @param version - Version number to rollback to
     * @returns Rolled back profile
     */
    async rollbackToVersion(
        userId: string,
        profileId: string,
        version: number
    ): Promise<StyleProfile> {
        const profile = await this.loadProfileVersion(userId, profileId, version);

        if (!profile) {
            throw new Error(`Version ${version} not found for profile ${profileId}`);
        }

        // Save as new version with rollback description
        await this.saveProfile(
            userId,
            profile,
            `Rolled back to version ${version}`
        );

        return profile;
    }

    /**
     * Delete a profile and all its versions
     * 
     * @param userId - User ID
     * @param profileId - Profile ID
     */
    async deleteProfile(userId: string, profileId: string): Promise<void> {
        const historyKey = this.getHistoryKey(userId, profileId);

        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(historyKey);
        }

        // If this was the current profile, clear it
        const currentProfileId = await this.getCurrentProfileId(userId);
        if (currentProfileId === profileId) {
            await this.clearCurrentProfile(userId);
        }

        console.log(`Deleted style profile ${profileId} for user ${userId}`);
    }

    /**
     * List all profiles for a user
     * 
     * @param userId - User ID
     * @returns Array of profile IDs and metadata
     */
    async listProfiles(userId: string): Promise<Array<{
        profileId: string;
        versionCount: number;
        createdAt: number;
        updatedAt: number;
    }>> {
        if (typeof window === 'undefined' || !window.localStorage) {
            return [];
        }

        const profiles: Array<{
            profileId: string;
            versionCount: number;
            createdAt: number;
            updatedAt: number;
        }> = [];

        const historyPrefix = this.HISTORY_KEY_PREFIX + userId + '_';

        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);

            if (key && key.startsWith(historyPrefix)) {
                const historyData = window.localStorage.getItem(key);

                if (historyData) {
                    try {
                        const history: StyleProfileHistory = JSON.parse(historyData);
                        profiles.push({
                            profileId: history.profileId,
                            versionCount: history.versions.length,
                            createdAt: history.createdAt,
                            updatedAt: history.updatedAt
                        });
                    } catch (error) {
                        console.error(`Failed to parse history for key ${key}`, error);
                    }
                }
            }
        }

        return profiles;
    }

    /**
     * Export a profile for backup or transfer
     * 
     * @param userId - User ID
     * @param profileId - Profile ID
     * @returns JSON string of profile data
     */
    async exportProfile(userId: string, profileId: string): Promise<string> {
        const history = await this.getHistory(userId, profileId);
        return JSON.stringify(history, null, 2);
    }

    /**
     * Import a profile from backup
     * 
     * @param userId - User ID
     * @param profileData - JSON string of profile data
     * @returns Imported profile
     */
    async importProfile(userId: string, profileData: string): Promise<StyleProfile> {
        const history: StyleProfileHistory = JSON.parse(profileData);

        // Validate history structure
        if (!history.profileId || !history.versions || history.versions.length === 0) {
            throw new Error('Invalid profile data');
        }

        // Save imported history
        await this.saveHistory(userId, history);

        // Return latest version
        return history.versions[history.versions.length - 1].profile;
    }

    // ========== Private Methods ==========

    /**
     * Get or create history for a profile
     */
    private async getHistory(
        userId: string,
        profileId: string
    ): Promise<StyleProfileHistory> {
        const historyKey = this.getHistoryKey(userId, profileId);

        if (typeof window === 'undefined' || !window.localStorage) {
            // Server-side or no localStorage: return empty history
            return {
                profileId,
                versions: [],
                currentVersion: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
        }

        const historyData = window.localStorage.getItem(historyKey);

        if (!historyData) {
            // Create new history
            return {
                profileId,
                versions: [],
                currentVersion: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
        }

        try {
            return JSON.parse(historyData);
        } catch (error) {
            console.error('Failed to parse profile history', error);
            // Return empty history on parse error
            return {
                profileId,
                versions: [],
                currentVersion: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
        }
    }

    /**
     * Save history to storage
     */
    private async saveHistory(
        userId: string,
        history: StyleProfileHistory
    ): Promise<void> {
        const historyKey = this.getHistoryKey(userId, history.profileId);

        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(historyKey, JSON.stringify(history));
        }
    }

    /**
     * Get current profile ID for a user
     */
    private async getCurrentProfileId(userId: string): Promise<string | null> {
        const key = this.USER_PROFILE_KEY + userId;

        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
        }

        return null;
    }

    /**
     * Set current profile for a user
     */
    private async setCurrentProfile(userId: string, profileId: string): Promise<void> {
        const key = this.USER_PROFILE_KEY + userId;

        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, profileId);
        }
    }

    /**
     * Clear current profile for a user
     */
    private async clearCurrentProfile(userId: string): Promise<void> {
        const key = this.USER_PROFILE_KEY + userId;

        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
        }
    }

    /**
     * Generate history storage key
     */
    private getHistoryKey(userId: string, profileId: string): string {
        return `${this.HISTORY_KEY_PREFIX}${userId}_${profileId}`;
    }

    /**
     * Generate unique version ID
     */
    private generateVersionId(): string {
        return `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Create singleton instance
 */
let globalPersistenceService: StyleProfilePersistenceService | null = null;

export function getGlobalStyleProfilePersistence(): StyleProfilePersistenceService {
    if (!globalPersistenceService) {
        globalPersistenceService = new StyleProfilePersistenceService();
    }
    return globalPersistenceService;
}
