/**
 * Feature Flags Service
 * Manages rollout of new features and experimental capabilities
 */

export type FeatureFlag =
    | 'localization_v2'        // Enable full Latin America localization
    | 'new_currency_converter' // Use the new interactive converter
    | 'payment_optimization'   // Enable smart payment method sorting
    | 'admin_panel'            // Enable admin routes
    | 'debug_mode'             // Show debug info in UI

interface FeatureFlagConfig {
    id: FeatureFlag
    defaultValue: boolean
    description: string
}

const FEATURE_FLAGS: Record<FeatureFlag, FeatureFlagConfig> = {
    localization_v2: {
        id: 'localization_v2',
        defaultValue: true,
        description: 'Enable full Latin America localization features'
    },
    new_currency_converter: {
        id: 'new_currency_converter',
        defaultValue: true,
        description: 'Use the new interactive currency converter widget'
    },
    payment_optimization: {
        id: 'payment_optimization',
        defaultValue: true,
        description: 'Enable smart payment method sorting and recommendations'
    },
    admin_panel: {
        id: 'admin_panel',
        defaultValue: false, // Default to false in production until fully ready
        description: 'Enable admin configuration routes'
    },
    debug_mode: {
        id: 'debug_mode',
        defaultValue: false,
        description: 'Show technical debug information in the UI'
    }
}

class FeatureFlagService {
    private overrides: Map<FeatureFlag, boolean> = new Map()

    /**
     * Check if a feature flag is enabled
     */
    isEnabled(flag: FeatureFlag): boolean {
        // Check for runtime overrides (e.g. from admin panel or query params)
        if (this.overrides.has(flag)) {
            return this.overrides.get(flag)!
        }

        // Check environment variables
        const envKey = `NEXT_PUBLIC_FF_${flag.toUpperCase()}`
        if (typeof process !== 'undefined' && process.env[envKey]) {
            return process.env[envKey] === 'true'
        }

        // Return default value
        return FEATURE_FLAGS[flag].defaultValue
    }

    /**
     * Override a flag value (runtime only)
     */
    setOverride(flag: FeatureFlag, value: boolean) {
        this.overrides.set(flag, value)
    }

    /**
     * Clear all overrides
     */
    resetOverrides() {
        this.overrides.clear()
    }

    /**
     * Get all flags and their current status
     */
    getAllFlags(): Record<FeatureFlag, boolean> {
        const result = {} as Record<FeatureFlag, boolean>
        (Object.keys(FEATURE_FLAGS) as FeatureFlag[]).forEach(flag => {
            result[flag] = this.isEnabled(flag)
        })
        return result
    }
}

export const featureFlags = new FeatureFlagService()
