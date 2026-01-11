import { renderHook, act } from '@testing-library/react';
import { useNexusAutoImprove } from '../useNexusAutoImprove';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useNexusAutoImprove Hook', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should stay idle if disabled', () => {
        const { result } = renderHook(() => useNexusAutoImprove({
            enabled: false,
            delay: 1000,
            minWords: 5,
            onImprove: async () => { }
        }));

        act(() => {
            result.current.notifyTyping('one two three four five six');
        });

        expect(result.current.status).toBe('idle');
    });

    it('should transition to pending when typing enough words', () => {
        const { result } = renderHook(() => useNexusAutoImprove({
            enabled: true,
            delay: 1000,
            minWords: 3,
            onImprove: async () => { }
        }));

        act(() => {
            result.current.notifyTyping('one two three');
        });

        expect(result.current.status).toBe('pending');
    });

    it('should trigger onImprove after delay', async () => {
        const mockImprove = vi.fn().mockResolvedValue('improved text');

        const { result } = renderHook(() => useNexusAutoImprove({
            enabled: true,
            delay: 2000,
            minWords: 3,
            onImprove: mockImprove
        }));

        // 1. User types
        act(() => {
            result.current.notifyTyping('one two three');
        });

        expect(result.current.status).toBe('pending');
        expect(mockImprove).not.toHaveBeenCalled();

        // 2. Advance time (but not enough)
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(mockImprove).not.toHaveBeenCalled();

        // 3. Advance time to finish delay
        await act(async () => {
            vi.advanceTimersByTime(1005);
        });

        // 4. Verify trigger
        expect(mockImprove).toHaveBeenCalledWith('one two three');
    });

    it('should reset timer if typing continues', async () => {
        const mockImprove = vi.fn();
        const { result } = renderHook(() => useNexusAutoImprove({
            enabled: true,
            delay: 2000,
            minWords: 3,
            onImprove: mockImprove
        }));

        // Type once
        act(() => { result.current.notifyTyping('one two three'); });

        // Wait 1.5s
        act(() => { vi.advanceTimersByTime(1500); });

        // Type again (should reset 2s timer)
        act(() => { result.current.notifyTyping('one two three four'); });

        // Wait 1.5s (Total 3s from start, but only 1.5s from last type)
        act(() => { vi.advanceTimersByTime(1500); });

        expect(mockImprove).not.toHaveBeenCalled();

        // Wait remaining 0.5s+
        await act(async () => { vi.advanceTimersByTime(600); });

        expect(mockImprove).toHaveBeenCalled();
    });
});
