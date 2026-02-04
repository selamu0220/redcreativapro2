'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

const MAX_FREE_TRIALS = 3
const STORAGE_KEY = 'redcreativa_free_playground'

interface TrialState {
    count: number
    lastReset: string // Date string YYYY-MM-DD
}

export function useFreeAccess() {
    const [trialsLeft, setTrialsLeft] = useState(3)
    const [isBlocked, setIsBlocked] = useState(false)

    useEffect(() => {
        // Load state on mount
        const today = new Date().toISOString().split('T')[0]
        const stored = localStorage.getItem(STORAGE_KEY)

        if (stored) {
            const data: TrialState = JSON.parse(stored)

            if (data.lastReset !== today) {
                // New day, reset quota
                resetQuota(today)
            } else {
                // Same day, load quota
                setTrialsLeft(Math.max(0, MAX_FREE_TRIALS - data.count))
                if (data.count >= MAX_FREE_TRIALS) setIsBlocked(true)
            }
        } else {
            // First time user
            resetQuota(today)
        }
    }, [])

    const resetQuota = (date: string) => {
        const newState: TrialState = { count: 0, lastReset: date }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
        setTrialsLeft(MAX_FREE_TRIALS)
        setIsBlocked(false)
    }

    const consumeToken = (): boolean => {
        const today = new Date().toISOString().split('T')[0]
        const stored = localStorage.getItem(STORAGE_KEY)
        let count = 0

        if (stored) {
            const data: TrialState = JSON.parse(stored)
            // Double check date
            if (data.lastReset === today) {
                count = data.count
            }
        }

        if (count >= MAX_FREE_TRIALS) {
            setIsBlocked(true)
            toast.error('Has alcanzado el límite diario gratuito. Regístrate para continuar.', {
                action: {
                    label: 'Registrarme',
                    onClick: () => window.location.href = '/api/auth/register'
                }
            })
            return false
        }

        // Increment and save
        const newState: TrialState = { count: count + 1, lastReset: today }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
        setTrialsLeft(MAX_FREE_TRIALS - (count + 1))

        if (count + 1 >= MAX_FREE_TRIALS) {
            setIsBlocked(true)
        }

        return true
    }

    return {
        trialsLeft,
        isBlocked,
        consumeToken,
        maxTrials: MAX_FREE_TRIALS
    }
}
