import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NexusCore } from '../core/NexusCore';
import { DEFAULT_NEXUS_CONFIG } from '../types/nexus.types';

// Mock dependencies
vi.mock('@openrouter/ai-sdk-provider', () => ({
    createOpenRouter: () => vi.fn().mockReturnValue((model: string) => `openrouter:${model}`)
}));

vi.mock('ai', () => ({
    streamText: vi.fn().mockReturnValue({
        toTextStreamResponse: () => new Response('mock stream')
    }),
    generateText: vi.fn()
}));

describe('NexusCore', () => {
    let nexus: NexusCore;

    beforeEach(() => {
        // Reset singleton specifically if exposed or mock getInstance?
        // Since it's a private singleton, testing re-initialization is hard without cheats.
        // We will just get instance.
        nexus = NexusCore.getInstance();
    });

    it('should be a singleton', () => {
        const instance2 = NexusCore.getInstance();
        expect(nexus).toBe(instance2);
    });

    it('should initialize with default config', () => {
        nexus.initialize();
        // Accessing private config for test via 'any' cast or we check behavior
        expect((nexus as any).config).toEqual(expect.objectContaining(DEFAULT_NEXUS_CONFIG));
    });

    it('should update config on initialize', () => {
        nexus.initialize({ temperature: 0.9, maxRetries: 5 });
        expect((nexus as any).config.temperature).toBe(0.9);
        expect((nexus as any).config.maxRetries).toBe(5);
    });

    it('should ensure initialization before processing', async () => {
        const initializeSpy = vi.spyOn(nexus, 'initialize');
        try {
            await nexus.processMessageStream('hello');
        } catch (e) {
            // Mock streamText might throw or return val
        }
        expect(initializeSpy).toHaveBeenCalled();
    });
});
