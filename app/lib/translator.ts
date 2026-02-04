import { OpenRouterClient } from './openrouter-client';

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese'
};

let client: OpenRouterClient | null = null;

function getClient() {
    if (!client) {
        client = new OpenRouterClient({
            model: 'google/gemini-2.0-flash-001',
        });
    }
    return client;
}

export async function translateText(
    text: string,
    targetLang: SupportedLanguage,
    context?: string
): Promise<string> {
    if (!text || !text.trim()) return text;

    // Detect if text is Markdown
    const isMarkdown = text.includes('#') || text.includes('*') || text.includes('`') || text.includes('[');

    const prompt = `
    You are a professional translator. Translate the following ${isMarkdown ? 'Markdown content' : 'text'} to ${LANGUAGE_NAMES[targetLang]}.
    
    Rules:
    1. Maintain the original tone and style.
    2. Do NOT translate code blocks, specific technical terms that should remain in English (like "React", "Next.js"), or proper nouns.
    3. ${isMarkdown ? 'Preserve all Markdown formatting exactly.' : ''}
    4. Only output the translated text, nothing else. No preamble.
    ${context ? `Context: ${context}` : ''}

    Text to translate:
    ---
    ${text}
    ---
  `;

    try {
        const response = await getClient().generateContent({
            prompt: prompt.trim(),
        });

        if (response.success && response.content) {
            return response.content.trim();
        } else {
            console.error(`Translation failed for ${targetLang}:`, response.error);
            throw new Error(response.error?.message || 'Translation failed');
        }
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}
