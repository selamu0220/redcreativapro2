import { useState, useCallback, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { NexusMessage } from '../types/nexus.types';

export interface UseNexusChatConfig {
    initialMessages?: any[];
    onImprove?: (text: string) => void;
}

export function useNexusChat(config: UseNexusChatConfig = {}) {
    const [isNexusActive, setIsNexusActive] = useState(false);
    const [systemStatus, setSystemStatus] = useState<'healthy' | 'degraded' | 'down'>('healthy');

    // Use Vercel AI SDK hook but connected to our Nexus endpoint
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        append,
        setMessages,
        stop
    } = useChat({
        api: '/api/nexus/process',
        initialMessages: config.initialMessages || [],
        onResponse: (response) => {
            setIsNexusActive(true);
            if (response.status !== 200) {
                setSystemStatus('degraded');
            }
        },
        onFinish: () => {
            setIsNexusActive(false);
        },
        onError: (error) => {
            console.error('[NexusChat] Stream error:', error);
            setSystemStatus('degraded'); // Or check health endpoint
        }
    } as any) as any;

    const checkHealth = useCallback(async () => {
        try {
            const res = await fetch('/api/nexus/health');
            const data = await res.json();
            setSystemStatus(data.status);
        } catch (e) {
            setSystemStatus('down');
        }
    }, []);

    // Wrapper for manual submit to ensure Nexus tracking
    const sendMessage = useCallback(async (content: string) => {
        await append({
            role: 'user',
            content: content
        });
    }, [append]);

    return {
        messages: messages || [],
        input: input ?? '',
        handleInputChange,
        handleSubmit,
        isLoading,
        sendMessage,
        isNexusActive,
        systemStatus,
        setMessages,
        checkHealth,
        stop
    };
}
