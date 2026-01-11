export type NexusProvider = 'openrouter' | 'gemini' | 'anthropic' | 'xai';

export interface NexusMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface NexusConfig {
    maxRetries: number;
    timeout: number;
    temperature: number;
    model: string;
    primaryProvider: NexusProvider;
    fallbackProviders: NexusProvider[];
}

export interface NexusStreamChunk {
    text: string;
    isComplete: boolean;
    metadata?: {
        processingTime: number;
        provider: NexusProvider;
        tokens?: number;
    };
}

export interface SystemStatus {
    status: 'healthy' | 'degraded' | 'down';
    activeProvider: NexusProvider;
    latency: number;
    uptime: number;
}

export const DEFAULT_NEXUS_CONFIG: NexusConfig = {
    maxRetries: 2,
    timeout: 10000,
    temperature: 0.7,
    model: 'auto',
    primaryProvider: 'openrouter',
    fallbackProviders: ['gemini', 'xai']
};
