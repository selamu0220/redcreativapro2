'use client'

import { useEffect } from 'react'
import { useLocalization } from '@/app/contexts/LocalizationContext'
import { useLanguage } from '@/app/lib/language/context'

/**
 * Syncs the localization country with the language context
 */
export function LocalizationLanguageSync() {
    /*
    const { config, country } = useLocalization()
    const { changeLanguage, currentLanguage } = useLanguage()

    useEffect(() => {
        // Determine target language based on country
        // LocalizationConfig has the preferred language for the region
        if (config?.language && config.language !== currentLanguage) {
            console.log(`[Sync] Switching language from ${currentLanguage} to ${config.language} based on country ${country}`)
            changeLanguage(config.language)
        }
    }, [config?.language, country, currentLanguage, changeLanguage])
    */

    return null
}
