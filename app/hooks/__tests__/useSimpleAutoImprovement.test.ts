
import { renderHook, act } from '@testing-library/react';
import { useSimpleAutoImprovement } from '../useSimpleAutoImprovement';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useSimpleAutoImprovement', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('should trigger improvement after delay when user stops typing', async () => {
        const onImproveMock = vi.fn().mockResolvedValue(undefined);
        const getCurrentContentMock = vi.fn().mockReturnValue('Hello world this is a test');

        const config = {
            enabled: true,
            delay: 2000,
            minWords: 5,
            improvementLevel: 'balanced' as const
        };

        const { result } = renderHook(() => useSimpleAutoImprovement({
            config,
            onImprove: onImproveMock,
            getCurrentContent: getCurrentContentMock
        }));

        // Simulate typing
        act(() => {
            result.current.handleTyping();
        });

        expect(result.current.state.isTyping).toBe(true);

        // Fast-forward time
        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(onImproveMock).toHaveBeenCalledTimes(1);
        expect(onImproveMock).toHaveBeenCalledWith('Hello world this is a test', true);
    });

    it('should not trigger if word count is too low', () => {
        const onImproveMock = vi.fn().mockResolvedValue(undefined);
        const getCurrentContentMock = vi.fn().mockReturnValue('Too short'); // 2 words

        const config = {
            enabled: true,
            delay: 2000,
            minWords: 5,
            improvementLevel: 'balanced' as const
        };

        const { result } = renderHook(() => useSimpleAutoImprovement({
            config,
            onImprove: onImproveMock,
            getCurrentContent: getCurrentContentMock
        }));

        act(() => {
            result.current.handleTyping();
        });

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(onImproveMock).not.toHaveBeenCalled();
    });

    it('should retry on failure', async () => {
        const onImproveMock = vi.fn()
            .mockRejectedValueOnce(new Error('Fail 1'))
            .mockRejectedValueOnce(new Error('Fail 2'))
            .mockResolvedValue(undefined); // Success on 3rd attempt

        const getCurrentContentMock = vi.fn().mockReturnValue('Hello world this is a test');

        const config = {
            enabled: true,
            delay: 2000,
            minWords: 5,
            improvementLevel: 'balanced' as const
        };

        const { result } = renderHook(() => useSimpleAutoImprovement({
            config,
            onImprove: onImproveMock,
            getCurrentContent: getCurrentContentMock
        }));

        act(() => {
            result.current.handleTyping();
        });

        // Advance for initial trigger
        await act(async () => {
            vi.advanceTimersByTime(2000);
        });

        // Attempt 1 fails. Wait 1000ms
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        // Attempt 2 fails. Wait 1000ms
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        expect(onImproveMock).toHaveBeenCalledTimes(3);
    });
});
