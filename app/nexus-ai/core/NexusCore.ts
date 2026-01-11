import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { google } from '@ai-sdk/google';
import { createXai } from '@ai-sdk/xai';
import { streamText, generateText } from 'ai';
import {
    NexusConfig,
    NexusMessage,
    DEFAULT_NEXUS_CONFIG,
    NexusProvider,
    NexusStreamChunk
} from '../types/nexus.types';

export class NexusCore {
    private static instance: NexusCore;
    private config: NexusConfig;
    private isInitialized: boolean = false;

    private constructor() {
        this.config = { ...DEFAULT_NEXUS_CONFIG };
    }

    public static getInstance(): NexusCore {
        if (!NexusCore.instance) {
            NexusCore.instance = new NexusCore();
        }
        return NexusCore.instance;
    }

    public initialize(config?: Partial<NexusConfig>) {
        if (config) {
            this.config = { ...this.config, ...config };
        }
        this.isInitialized = true;
        console.log('[NexusCore] Initialized with config:', this.config);
    }

    public async processMessageStream(
        message: string,
        history: NexusMessage[] = []
    ) {
        if (!this.isInitialized) this.initialize();

        console.log('[NexusCore] Processing stream for:', message.substring(0, 50) + '...');

        // TODO: Integrate SentinelMonitor for pre-flight check
        // TODO: Implement actual circuit breaker logic here

        try {
            return await this.executeStream(message, history);
        } catch (error) {
            console.error('[NexusCore] Error processing stream, attempting fallback...', error);
            return await this.executeFallbackStrategy(message, history);
        }
    }

    private async executeStream(message: string, history: NexusMessage[]) {
        // Basic implementation using Vercel AI SDK
        // This will be enhanced with the AdaptiveEngine

        // Convert history to AI SDK format
        const messages = [
            ...history.map(m => ({ role: m.role, content: m.content })),
            { role: 'user' as const, content: message }
        ];

        // Select provider based on config
        const model = this.getProviderModel(this.config.primaryProvider);

        const result = streamText({
            model: model,
            messages: messages,
            temperature: this.config.temperature,
            onFinish: (completion) => {
                // TODO: Report metrics to SentinelMonitor
                console.log('[NexusCore] Stream finished. Tokens:', completion.usage.totalTokens);
            },
        });

        return result;
    }

    private async executeFallbackStrategy(message: string, history: NexusMessage[]) {
        // Simple fallback logic
        for (const provider of this.config.fallbackProviders) {
            try {
                console.log(`[NexusCore] Attempting fallback to ${provider}`);
                const model = this.getProviderModel(provider);
                const messages = [
                    ...history.map(m => ({ role: m.role, content: m.content })),
                    { role: 'user' as const, content: message }
                ];

                return streamText({
                    model: model,
                    messages: messages,
                    temperature: this.config.temperature,
                });
            } catch (err) {
                console.warn(`[NexusCore] Fallback to ${provider} failed`, err);
                continue;
            }
        }
        throw new Error('All providers failed');
    }

    private getProviderModel(provider: NexusProvider) {
        switch (provider) {
            case 'openrouter':
                const openrouter = createOpenRouter({ apiKey: process.env.OPEN_ROUTER_API_KEY });
                return openrouter(this.config.model === 'auto' ? 'google/gemini-2.0-flash-exp:free' : this.config.model);
            case 'gemini':
                return google('gemini-1.5-flash'); // Fallback usually to standard gemini
            case 'xai':
                const xai = createXai({ apiKey: process.env.XAI_API_KEY });
                return xai('grok-beta');
            default:
                const defaultProvider = createOpenRouter({ apiKey: process.env.OPEN_ROUTER_API_KEY });
                return defaultProvider('google/gemini-2.0-flash-exp:free');
        }
    }
}
