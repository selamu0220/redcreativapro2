/**
 * Style Learning Service
 * 
 * NLP-based text analysis for extracting writing style characteristics:
 * - Tone analysis (formal, conversational, authoritative, empathetic)
 * - Vocabulary patterns (common words, avoided words, preferred phrases)
 * - Structural preferences (sentence length, paragraph length, transitions)
 * - Stylistic elements (metaphors, questions, active voice, pronouns)
 * 
 * Requirements: 4.2, 4.3
 */

export interface WritingSample {
    id: string;
    content: string;
    wordCount: number;
    addedAt: number; // timestamp
}

export interface ToneAnalysis {
    primary: string; // Main tone
    secondary: string[]; // Additional tones detected
    confidence: number; // 0-1 scale
    toneDistribution: {
        formal: number;
        conversational: number;
        authoritative: number;
        empathetic: number;
        humorous: number;
        serious: number;
    };
}

export interface VocabularyPatterns {
    commonWords: Array<{ word: string; frequency: number }>;
    avoidedWords: string[]; // Words rarely used in common contexts
    preferredPhrases: Array<{ phrase: string; frequency: number }>;
    vocabularyRichness: number; // Unique words / total words
    avgWordLength: number;
}

export interface StructuralPreferences {
    avgSentenceLength: number;
    sentenceLengthVariation: number; // Standard deviation
    avgParagraphLength: number; // In sentences
    paragraphLengthVariation: number;
    useTransitions: boolean;
    transitionWords: string[];
    listUsageFrequency: number; // How often lists are used
}

export interface StylisticElements {
    useMetaphors: boolean;
    metaphorFrequency: number;
    useQuestions: boolean;
    questionFrequency: number;
    activeVoicePreference: number; // 0-1 scale (1 = always active)
    pronounUsage: {
        firstPerson: number; // I, we, me, us
        secondPerson: number; // you
        thirdPerson: number; // he, she, they
    };
    punctuationStyle: {
        exclamationMarks: number;
        questionMarks: number;
        semicolons: number;
        dashes: number;
        parentheses: number;
    };
}

export interface StyleProfile {
    id: string;
    createdAt: number;
    updatedAt: number;
    sampleCount: number;
    totalWordCount: number;

    // Analyzed characteristics
    tone: ToneAnalysis;
    vocabulary: VocabularyPatterns;
    structure: StructuralPreferences;
    stylistic: StylisticElements;

    // Confidence and reliability
    confidence: number; // 0-1 scale, based on sample size
    reliability: 'low' | 'medium' | 'high'; // Based on consistency across samples
}

/**
 * Style Learning Service
 * 
 * Analyzes writing samples to extract and learn user's writing style.
 */
export class StyleLearningService {
    /**
     * Analyze writing samples to create a style profile
     * 
     * @param samples - Array of writing samples
     * @returns Style profile
     */
    async createProfile(samples: WritingSample[]): Promise<StyleProfile> {
        if (samples.length === 0) {
            throw new Error('No samples provided');
        }

        // Calculate total word count
        const totalWordCount = samples.reduce((sum, s) => sum + s.wordCount, 0);

        // Analyze each aspect
        const tone = await this.analyzeTone(samples);
        const vocabulary = await this.analyzeVocabulary(samples);
        const structure = await this.analyzeStructure(samples);
        const stylistic = await this.analyzeStylistic(samples);

        // Calculate confidence based on sample size
        const confidence = this.calculateConfidence(totalWordCount);
        const reliability = this.calculateReliability(samples, tone, vocabulary, structure);

        return {
            id: this.generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            sampleCount: samples.length,
            totalWordCount,
            tone,
            vocabulary,
            structure,
            stylistic,
            confidence,
            reliability
        };
    }

    /**
     * Update existing profile with new samples
     * 
     * @param existingProfile - Existing style profile
     * @param newSamples - New writing samples
     * @returns Updated style profile
     */
    async updateProfile(
        existingProfile: StyleProfile,
        newSamples: WritingSample[]
    ): Promise<StyleProfile> {
        // Combine with new samples and recreate profile
        // In a real implementation, we would merge intelligently
        // For now, we'll create a fresh profile

        const newProfile = await this.createProfile(newSamples);

        return {
            ...newProfile,
            id: existingProfile.id,
            createdAt: existingProfile.createdAt,
            updatedAt: Date.now(),
            sampleCount: existingProfile.sampleCount + newSamples.length,
            totalWordCount: existingProfile.totalWordCount + newProfile.totalWordCount
        };
    }

    /**
     * Analyze tone across samples
     */
    private async analyzeTone(samples: WritingSample[]): Promise<ToneAnalysis> {
        // Combine all sample content
        const combinedText = samples.map(s => s.content).join('\n\n');

        // Analyze tone characteristics
        const toneDistribution = {
            formal: this.detectFormalTone(combinedText),
            conversational: this.detectConversationalTone(combinedText),
            authoritative: this.detectAuthoritativeTone(combinedText),
            empathetic: this.detectEmpatheticTone(combinedText),
            humorous: this.detectHumorousTone(combinedText),
            serious: this.detectSeriousTone(combinedText)
        };

        // Find primary and secondary tones
        const tones = Object.entries(toneDistribution)
            .sort((a, b) => b[1] - a[1]);

        const primary = tones[0]?.[0] || 'neutral';
        const secondary = tones.slice(1, 3).map(t => t[0]);
        const confidence = tones[0]?.[1] || 0;

        return {
            primary,
            secondary,
            confidence: Math.min(confidence, 1),
            toneDistribution
        };
    }

    /**
     * Analyze vocabulary patterns
     */
    private async analyzeVocabulary(samples: WritingSample[]): Promise<VocabularyPatterns> {
        const combinedText = samples.map(s => s.content).join(' ');

        // Tokenize words
        const words = this.tokenizeWords(combinedText);
        const uniqueWords = new Set(words);

        // Calculate word frequencies
        const wordFrequencies = new Map<string, number>();
        words.forEach(word => {
            wordFrequencies.set(word, (wordFrequencies.get(word) || 0) + 1);
        });

        // Get common words (excluding stop words)
        const stopWords = this.getStopWords();
        const commonWords = Array.from(wordFrequencies.entries())
            .filter(([word]) => !stopWords.has(word.toLowerCase()))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .map(([word, frequency]) => ({ word, frequency }));

        // Detect avoided words (common words that aren't used)
        const avoidedWords = this.detectAvoidedWords(wordFrequencies);

        // Extract preferred phrases (2-3 word combinations)
        const preferredPhrases = this.extractPhrases(combinedText);

        // Calculate vocabulary richness
        const vocabularyRichness = uniqueWords.size / words.length;

        // Calculate average word length
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

        return {
            commonWords,
            avoidedWords,
            preferredPhrases,
            vocabularyRichness,
            avgWordLength
        };
    }

    /**
     * Analyze structural preferences
     */
    private async analyzeStructure(samples: WritingSample[]): Promise<StructuralPreferences> {
        const combinedText = samples.map(s => s.content).join('\n\n');

        // Split into paragraphs and sentences
        const paragraphs = this.splitParagraphs(combinedText);
        const allSentences = paragraphs.flatMap(p => this.splitSentences(p));

        // Calculate sentence statistics
        const sentenceLengths = allSentences.map(s => this.tokenizeWords(s).length);
        const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0;
        const sentenceLengthVariation = this.calculateStdDev(sentenceLengths);

        // Calculate paragraph statistics
        const paragraphLengths = paragraphs.map(p => this.splitSentences(p).length);
        const avgParagraphLength = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length || 0;
        const paragraphLengthVariation = this.calculateStdDev(paragraphLengths);

        // Detect transition word usage
        const transitionWords = this.detectTransitionWords(combinedText);
        const useTransitions = transitionWords.length > 0;

        // Detect list usage
        const listUsageFrequency = this.detectListUsage(combinedText);

        return {
            avgSentenceLength,
            sentenceLengthVariation,
            avgParagraphLength,
            paragraphLengthVariation,
            useTransitions,
            transitionWords,
            listUsageFrequency
        };
    }

    /**
     * Analyze stylistic elements
     */
    private async analyzeStylistic(samples: WritingSample[]): Promise<StylisticElements> {
        const combinedText = samples.map(s => s.content).join('\n\n');

        // Analyze metaphor usage
        const metaphorFrequency = this.detectMetaphorFrequency(combinedText);
        const useMetaphors = metaphorFrequency > 0.01; // More than 1% of sentences

        // Analyze question usage
        const questionFrequency = this.detectQuestionFrequency(combinedText);
        const useQuestions = questionFrequency > 0;

        // Analyze voice (active vs passive)
        const activeVoicePreference = this.detectActiveVoicePreference(combinedText);

        // Analyze pronoun usage
        const pronounUsage = this.detectPronounUsage(combinedText);

        // Analyze punctuation style
        const punctuationStyle = this.detectPunctuationStyle(combinedText);

        return {
            useMetaphors,
            metaphorFrequency,
            useQuestions,
            questionFrequency,
            activeVoicePreference,
            pronounUsage,
            punctuationStyle
        };
    }

    /**
     * Calculate confidence based on sample size
     */
    private calculateConfidence(totalWordCount: number): number {
        // Confidence increases with word count, plateaus at 5000 words
        const minWords = 500;
        const maxWords = 5000;

        if (totalWordCount < minWords) {
            return totalWordCount / minWords * 0.5; // Up to 50% confidence
        }

        if (totalWordCount >= maxWords) {
            return 1; // 100% confidence
        }

        // Linear interpolation between 50% and 100%
        const progress = (totalWordCount - minWords) / (maxWords - minWords);
        return 0.5 + progress * 0.5;
    }

    /**
     * Calculate reliability based on consistency across samples
     */
    private calculateReliability(
        samples: WritingSample[],
        tone: ToneAnalysis,
        vocabulary: VocabularyPatterns,
        structure: StructuralPreferences
    ): 'low' | 'medium' | 'high' {
        // Simple heuristic: based on sample count and confidence
        if (samples.length < 2) {
            return 'low';
        }

        if (samples.length >= 5 && tone.confidence > 0.7) {
            return 'high';
        }

        return 'medium';
    }

    // ========== Helper Methods ==========

    private detectFormalTone(text: string): number {
        const formalIndicators = /\b(therefore|thus|consequently|furthermore|moreover|nevertheless)\b/gi;
        const matches = text.match(formalIndicators) || [];
        return Math.min(matches.length / 100, 1);
    }

    private detectConversationalTone(text: string): number {
        const conversationalIndicators = /\b(you know|I mean|basically|actually|literally|like)\b/gi;
        const matches = text.match(conversationalIndicators) || [];
        return Math.min(matches.length / 100, 1);
    }

    private detectAuthoritativeTone(text: string): number {
        const authoritativeIndicators = /\b(research shows|studies indicate|data suggests|evidence demonstrates)\b/gi;
        const matches = text.match(authoritativeIndicators) || [];
        return Math.min(matches.length / 50, 1);
    }

    private detectEmpatheticTone(text: string): number {
        const empatheticIndicators = /\b(understand|feel|empathize|care|support|help)\b/gi;
        const matches = text.match(empatheticIndicators) || [];
        return Math.min(matches.length / 100, 1);
    }

    private detectHumorousTone(text: string): number {
        const humorIndicators = /[!]{2,}|ha ha|lol|😄|😊|😂/gi;
        const matches = text.match(humorIndicators) || [];
        return Math.min(matches.length / 50, 1);
    }

    private detectSeriousTone(text: string): number {
        // Inverse of humorous + formal indicators
        const formal = this.detectFormalTone(text);
        const humorous = this.detectHumorousTone(text);
        return Math.max(formal - humorous, 0);
    }

    private tokenizeWords(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    private getStopWords(): Set<string> {
        return new Set([
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
        ]);
    }

    private detectAvoidedWords(wordFrequencies: Map<string, number>): string[] {
        // Words that are common in general but not used by this writer
        const commonWords = ['get', 'got', 'stuff', 'things', 'very', 'really'];
        return commonWords.filter(word => !wordFrequencies.has(word));
    }

    private extractPhrases(text: string): Array<{ phrase: string; frequency: number }> {
        const sentences = this.splitSentences(text);
        const phrases = new Map<string, number>();

        sentences.forEach(sentence => {
            const words = this.tokenizeWords(sentence);
            for (let i = 0; i < words.length - 1; i++) {
                const bigram = `${words[i]} ${words[i + 1]}`;
                phrases.set(bigram, (phrases.get(bigram) || 0) + 1);
            }
        });

        return Array.from(phrases.entries())
            .filter(([, freq]) => freq > 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([phrase, frequency]) => ({ phrase, frequency }));
    }

    private splitParagraphs(text: string): string[] {
        return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    }

    private splitSentences(text: string): string[] {
        return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    }

    private calculateStdDev(numbers: number[]): number {
        if (numbers.length === 0) return 0;
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
        return Math.sqrt(variance);
    }

    private detectTransitionWords(text: string): string[] {
        const transitions = [
            'however', 'therefore', 'furthermore', 'moreover', 'nevertheless',
            'additionally', 'consequently', 'meanwhile', 'otherwise'
        ];

        const found: string[] = [];
        const lowerText = text.toLowerCase();

        transitions.forEach(word => {
            if (lowerText.includes(word)) {
                found.push(word);
            }
        });

        return found;
    }

    private detectListUsage(text: string): number {
        const listMarkers = /(?:^|\n)\s*[-*•]\s+/gm;
        const numberedLists = /(?:^|\n)\s*\d+\.\s+/gm;

        const bulletLists = (text.match(listMarkers) || []).length;
        const numLists = (text.match(numberedLists) || []).length;

        return (bulletLists + numLists) / 100;
    }

    private detectMetaphorFrequency(text: string): number {
        // Simple heuristic: looking for "like" and "as" comparisons
        const metaphorIndicators = /\b(like a|as a|like the|as the)\b/gi;
        const matches = text.match(metaphorIndicators) || [];
        const sentences = this.splitSentences(text);
        return sentences.length > 0 ? matches.length / sentences.length : 0;
    }

    private detectQuestionFrequency(text: string): number {
        const questions = text.match(/\?/g) || [];
        const sentences = this.splitSentences(text);
        return sentences.length > 0 ? questions.length / sentences.length : 0;
    }

    private detectActiveVoicePreference(text: string): number {
        // Simple heuristic: look for passive voice indicators
        const passiveIndicators = /\b(was|were|been|being)\s+\w+ed\b/gi;
        const matches = text.match(passiveIndicators) || [];
        const sentences = this.splitSentences(text);
        const passiveRatio = sentences.length > 0 ? matches.length / sentences.length : 0;

        // Return inverse (1 = all active, 0 = all passive)
        return Math.max(1 - passiveRatio, 0);
    }

    private detectPronounUsage(text: string): StylisticElements['pronounUsage'] {
        const firstPerson = (text.match(/\b(I|we|me|us|my|our)\b/gi) || []).length;
        const secondPerson = (text.match(/\b(you|your|yours)\b/gi) || []).length;
        const thirdPerson = (text.match(/\b(he|she|they|him|her|them|his|hers|their)\b/gi) || []).length;

        const total = firstPerson + secondPerson + thirdPerson || 1;

        return {
            firstPerson: firstPerson / total,
            secondPerson: secondPerson / total,
            thirdPerson: thirdPerson / total
        };
    }

    private detectPunctuationStyle(text: string): StylisticElements['punctuationStyle'] {
        const sentences = this.splitSentences(text);
        const sentenceCount = sentences.length || 1;

        return {
            exclamationMarks: (text.match(/!/g) || []).length / sentenceCount,
            questionMarks: (text.match(/\?/g) || []).length / sentenceCount,
            semicolons: (text.match(/;/g) || []).length / sentenceCount,
            dashes: (text.match(/—|--/g) || []).length / sentenceCount,
            parentheses: (text.match(/\(/g) || []).length / sentenceCount
        };
    }

    private generateId(): string {
        return `style-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Create singleton instance
 */
let globalService: StyleLearningService | null = null;

export function getGlobalStyleLearningService(): StyleLearningService {
    if (!globalService) {
        globalService = new StyleLearningService();
    }
    return globalService;
}
