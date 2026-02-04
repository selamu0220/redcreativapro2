"use client";

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface AIStreamOptions {
    onSuccess?: (result: string) => void;
    onError?: (error: any) => void;
}

export function useAIStream(options: AIStreamOptions = {}) {
    const [isProcessing, setIsProcessing] = useState(false);

    const generate = useCallback(async (
        prompt: string,
        model: string = 'gpt-4o-mini',
        config?: {
            context?: string;
            tone?: 'professional' | 'casual' | 'persuasive' | 'academic';
            length?: 'short' | 'medium' | 'long';
            creativity?: 'conservative' | 'balanced' | 'creative';
            language?: string;
            onStream?: (chunk: string) => void;
        }
    ) => {
        setIsProcessing(true);
        const toastId = toast.loading('IA pensando (Streaming)...');

        try {
            // Context Engineering
            // Language Injection
            // We can implicitly get the language from the hook usage or pass it in. 
            // Since this is inside a function that might be called async, 
            // relying on the hook's current state inside the callback requires the hook to be in dependency array.
            // But useSimpleTranslations is a hook, so we call it at the top level.

            const languageName = config?.language || 'Spanish'; // Fallback

            const systemContext = `
            Act as a World-Class Editor for high-end content.
            TONE: ${config?.tone || 'professional'}
            OUTPUT LANGUAGE: ${languageName} (STRICT)
            GOAL: Create content that flows like liquid. 2025 Standard.
            CONTEXT: ${config?.context || 'No specific context provided.'}
            RULES:
            1. NO conversational filler ("Here is...", "I have improved...").
            2. NO markdown tags like :::UPDATE_DOCUMENT::: unless explicitly asked.
            3. RETURN ONLY THE CONTENT.
            4. Ensure the output is in ${languageName} unless the user explicitly asks for translation.
            `;

            const fullPrompt = `
            [SYSTEM_INSTRUCTION]: ${systemContext}
            [USER_REQUEST]: ${prompt}
            `;

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: fullPrompt,
                    history: [],
                    model: model
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error en la solicitud de IA');
            }

            if (!response.body) throw new Error('ReadableStream not supported');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                result += chunk;

                // Stream the chunk to UI if listener exists
                if (config?.onStream) {
                    config.onStream(chunk);
                }
            }

            // Post-processing: Extract Protocol Content if present
            // Matches: :::UPDATE_DOCUMENT::: content :::UPDATE_DOCUMENT:::
            const updateMatch = result.match(/:::\s*UPDATE_DOCUMENT\s*:::([\s\S]*?):::\s*UPDATE_DOCUMENT\s*:::/i);

            if (updateMatch) {
                const innerContent = updateMatch[1].trim();
                // Safety: Only use inner content if it looks valid
                if (innerContent.length > 10) {
                    result = innerContent;
                }
            }

            // Clean up any lingering tags if regex match failed but tags exist (edge case)
            result = result.replace(/:::\s*UPDATE_DOCUMENT\s*:::/gi, '').trim();

            toast.dismiss(toastId);
            toast.success('Generado con éxito');

            if (options.onSuccess) {
                options.onSuccess(result);
            }

            return result;

        } catch (error: any) {
            console.error('AI Stream Error:', error);
            toast.dismiss(toastId);
            toast.error(error.message || 'Error al conectar con la IA');

            if (options.onError) {
                options.onError(error);
            }
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [options]);

    return {
        generate,
        isProcessing
    };
}
