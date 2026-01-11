import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export type AutoImproveStatus = 'idle' | 'pending' | 'improving' | 'cooldown';

export interface UseNexusAutoImproveConfig {
    enabled: boolean;
    delay: number;
    minWords: number;
    onImprove: (content: string) => Promise<string | void>;
}

export function useNexusAutoImprove({
    enabled,
    delay = 2000,
    minWords = 5,
    onImprove
}: UseNexusAutoImproveConfig) {
    const [status, setStatus] = useState<AutoImproveStatus>('idle');

    // Refs
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastContentRef = useRef<string>('');
    const isImprovingRef = useRef(false);

    // cleanup
    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        clearTimer();
        setStatus('idle');
        isImprovingRef.current = false;
    }, [clearTimer]);

    const performImprovement = useCallback(async (content: string) => {
        if (!enabled || isImprovingRef.current) return;

        // Final sanity check on content change
        if (content === lastContentRef.current) {
            setStatus('idle');
            return;
        }

        isImprovingRef.current = true;
        setStatus('improving');

        try {
            const result = await onImprove(content);
            if (result && typeof result === 'string') {
                lastContentRef.current = result; // Update ref to avoid self-triggering
                setStatus('cooldown');
                // Short cooldown before going back to idle
                setTimeout(() => {
                    setStatus('idle');
                    isImprovingRef.current = false;
                }, 2000);
            } else {
                setStatus('idle');
                isImprovingRef.current = false;
            }
        } catch (error) {
            console.error(error);
            setStatus('idle'); // Recover
            isImprovingRef.current = false;
        }
    }, [enabled, onImprove]);

    const notifyTyping = useCallback((content: string) => {
        if (!enabled) {
            setStatus('idle');
            return;
        }

        if (isImprovingRef.current) return;

        // Content verification
        const wordCount = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
        if (wordCount < minWords) {
            setStatus('idle');
            return;
        }

        // Debounce Logic
        clearTimer();
        setStatus('pending'); // Visual feedback: 'Waiting...'

        timerRef.current = setTimeout(() => {
            performImprovement(content);
        }, delay);

    }, [enabled, minWords, delay, clearTimer, performImprovement]);

    // Cleanup on unmount
    useEffect(() => {
        return () => reset();
    }, [reset]);

    return {
        status,
        notifyTyping,
        reset
    };
}
