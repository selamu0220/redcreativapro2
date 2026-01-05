/**
 * Real-Time SEO Scoring Engine
 * 
 * Provides live SEO analysis and scoring as content changes:
 * - Real-time SEO score calculation (0-100)
 * - Automatic meta generation (keywords, descriptions, title tags)
 * - SEO improvement suggestions
 * - Keyword density analysis
 * - Readability metrics
 * 
 * Requirements: 7.1, 7.2, 7.4
 */

export interface SEOScore {
    overall: number; // 0-100 scale
    breakdown: {
        keywords: number; // Keyword optimization
        readability: number; // Reading ease
        structure: number; // Heading hierarchy, paragraphs
        meta: number; // Meta tags quality
        content: number; // Content quality and length
    };
    grade: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface MetaTags {
    title: string;
    description: string;
    keywords: string[];
    ogTitle?: string;
    ogDescription?: string;
}

export interface KeywordAnalysis {
    keyword: string;
    density: number; // Percentage
    occurrences: number;
    positions: number[]; // Character positions
    optimal: boolean; // Whether density is in optimal range
    recommendation?: string;
}

export interface ReadabilityMetrics {
    fleschReadingEase: number; // 0-100, higher is easier
    fleschKincaidGrade: number; // US grade level
    avgSentenceLength: number;
    avgWordLength: number;
    complexWords: number; // Words with 3+ syllables
    readingLevel: 'very easy' | 'easy' | 'fairly easy' | 'standard' | 'fairly difficult' | 'difficult';
}

export interface SEOSuggestion {
    id: string;
    category: 'keywords' | 'readability' | 'structure' | 'meta' | 'content';
    issue: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
    priority: number; // 1-10, higher is more important
}

export interface SEOResult {
    score: SEOScore;
    metaTags: MetaTags;
    keywordAnalysis: KeywordAnalysis[];
    readability: ReadabilityMetrics;
    suggestions: SEOSuggestion[];
    timestamp: number;
}

/**
 * Real-Time SEO Scoring Engine
 * 
 * Analyzes content for SEO optimization in real-time.
 */
export class RealTimeSEOEngine {
    /**
     * Analyze content for SEO
     * 
     * @param content - Content to analyze
     * @param targetKeywords - Optional target keywords
     * @param existingMeta - Existing meta tags
     * @returns Complete SEO analysis
     */
    async analyzeSEO(
        content: string,
        targetKeywords?: string[],
        existingMeta?: Partial<MetaTags>
    ): Promise<SEOResult> {
        // Perform all analyses in parallel
        const [
            keywordAnalysis,
            readability,
            metaTags
        ] = await Promise.all([
            this.analyzeKeywords(content, targetKeywords || []),
            this.analyzeReadability(content),
            this.generateMetaTags(content, targetKeywords)
        ]);

        // Calculate scores
        const breakdown = {
            keywords: this.calculateKeywordScore(keywordAnalysis),
            readability: this.calculateReadabilityScore(readability),
            structure: this.calculateStructureScore(content),
            meta: this.calculateMetaScore(metaTags, existingMeta),
            content: this.calculateContentScore(content)
        };

        // Calculate overall score (weighted average)
        const overall = Math.round(
            breakdown.keywords * 0.25 +
            breakdown.readability * 0.2 +
            breakdown.structure * 0.2 +
            breakdown.meta * 0.15 +
            breakdown.content * 0.2
        );

        const score: SEOScore = {
            overall,
            breakdown,
            grade: this.getGrade(overall)
        };

        // Generate suggestions
        const suggestions = this.generateSuggestions(
            content,
            score,
            keywordAnalysis,
            readability
        );

        return {
            score,
            metaTags: { ...metaTags, ...existingMeta },
            keywordAnalysis,
            readability,
            suggestions,
            timestamp: Date.now()
        };
    }

    /**
     * Quick score calculation (optimized for real-time updates)
     * 
     * @param content - Content to score
     * @returns Quick SEO score
     */
    async quickScore(content: string): Promise<number> {
        // Simplified scoring for performance
        const wordCount = this.tokenizeWords(content).length;
        const sentenceCount = this.splitSentences(content).length;
        const headingCount = this.countHeadings(content);

        let score = 0;

        // Content length (20 points)
        if (wordCount >= 300 && wordCount <= 2000) {
            score += 20;
        } else if (wordCount > 100) {
            score += 10;
        }

        // Sentence structure (20 points)
        const avgSentenceLength = wordCount / Math.max(sentenceCount, 1);
        if (avgSentenceLength >= 15 && avgSentenceLength <= 25) {
            score += 20;
        } else if (avgSentenceLength >= 10 && avgSentenceLength <= 30) {
            score += 10;
        }

        // Headings (20 points)
        if (headingCount >= 2 && headingCount <= Math.ceil(wordCount / 300)) {
            score += 20;
        } else if (headingCount >= 1) {
            score += 10;
        }

        // Baseline (40 points for having content)
        score += 40;

        return Math.min(score, 100);
    }

    // ========== Analysis Methods ==========

    /**
     * Analyze keywords in content
     */
    private async analyzeKeywords(
        content: string,
        targetKeywords: string[]
    ): Promise<KeywordAnalysis[]> {
        const analysis: KeywordAnalysis[] = [];
        const words = this.tokenizeWords(content);
        const totalWords = words.length;

        for (const keyword of targetKeywords) {
            const keywordLower = keyword.toLowerCase();
            const positions: number[] = [];
            let occurrences = 0;

            // Find all occurrences
            const contentLower = content.toLowerCase();
            let pos = contentLower.indexOf(keywordLower);
            while (pos !== -1) {
                positions.push(pos);
                occurrences++;
                pos = contentLower.indexOf(keywordLower, pos + 1);
            }

            // Calculate density
            const density = (occurrences / totalWords) * 100;

            // Optimal density is 1-3%
            const optimal = density >= 1 && density <= 3;

            // Generate recommendation
            let recommendation: string | undefined;
            if (density < 1) {
                recommendation = `Increase usage of "${keyword}" (current: ${density.toFixed(2)}%, optimal: 1-3%)`;
            } else if (density > 3) {
                recommendation = `Reduce usage of "${keyword}" to avoid keyword stuffing (current: ${density.toFixed(2)}%, optimal: 1-3%)`;
            }

            analysis.push({
                keyword,
                density,
                occurrences,
                positions,
                optimal,
                recommendation
            });
        }

        return analysis;
    }

    /**
     * Analyze readability
     */
    private async analyzeReadability(content: string): Promise<ReadabilityMetrics> {
        const sentences = this.splitSentences(content);
        const words = this.tokenizeWords(content);
        const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

        const sentenceCount = Math.max(sentences.length, 1);
        const wordCount = Math.max(words.length, 1);

        // Flesch Reading Ease: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
        const avgWordsPerSentence = wordCount / sentenceCount;
        const avgSyllablesPerWord = syllables / wordCount;
        const fleschReadingEase = Math.max(
            0,
            Math.min(
                100,
                206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
            )
        );

        // Flesch-Kincaid Grade: 0.39(words/sentences) + 11.8(syllables/words) - 15.59
        const fleschKincaidGrade = Math.max(
            0,
            0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
        );

        // Count complex words (3+ syllables)
        const complexWords = words.filter(w => this.countSyllables(w) >= 3).length;

        // Average word length
        const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / wordCount;

        // Determine reading level
        let readingLevel: ReadabilityMetrics['readingLevel'];
        if (fleschReadingEase >= 90) readingLevel = 'very easy';
        else if (fleschReadingEase >= 80) readingLevel = 'easy';
        else if (fleschReadingEase >= 70) readingLevel = 'fairly easy';
        else if (fleschReadingEase >= 60) readingLevel = 'standard';
        else if (fleschReadingEase >= 50) readingLevel = 'fairly difficult';
        else readingLevel = 'difficult';

        return {
            fleschReadingEase,
            fleschKincaidGrade,
            avgSentenceLength: avgWordsPerSentence,
            avgWordLength,
            complexWords,
            readingLevel
        };
    }

    /**
     * Generate meta tags automatically
     */
    private async generateMetaTags(
        content: string,
        targetKeywords?: string[]
    ): Promise<MetaTags> {
        // Extract title from first heading or generate from content
        const title = this.extractTitle(content);

        // Generate description from first paragraph or summary
        const description = this.generateDescription(content);

        // Extract or use provided keywords
        const keywords = targetKeywords && targetKeywords.length > 0
            ? targetKeywords
            : this.extractKeywords(content);

        return {
            title,
            description,
            keywords,
            ogTitle: title,
            ogDescription: description
        };
    }

    // ========== Scoring Methods ==========

    private calculateKeywordScore(analysis: KeywordAnalysis[]): number {
        if (analysis.length === 0) return 50; // No keywords specified

        const optimalCount = analysis.filter(a => a.optimal).length;
        return Math.round((optimalCount / analysis.length) * 100);
    }

    private calculateReadabilityScore(readability: ReadabilityMetrics): number {
        // Optimal: Flesch Reading Ease 60-80 (standard to fairly easy)
        const { fleschReadingEase } = readability;

        if (fleschReadingEase >= 60 && fleschReadingEase <= 80) {
            return 100;
        } else if (fleschReadingEase >= 50 && fleschReadingEase <= 90) {
            return 80;
        } else if (fleschReadingEase >= 40 && fleschReadingEase <= 100) {
            return 60;
        } else {
            return 40;
        }
    }

    private calculateStructureScore(content: string): number {
        let score = 0;

        // Check for headings
        const headingCount = this.countHeadings(content);
        if (headingCount >= 2) score += 30;
        else if (headingCount >= 1) score += 15;

        // Check for paragraphs
        const paragraphs = this.splitParagraphs(content);
        if (paragraphs.length >= 3) score += 30;
        else if (paragraphs.length >= 2) score += 15;

        // Check paragraph length (not too long)
        const avgParagraphLength = this.tokenizeWords(content).length / Math.max(paragraphs.length, 1);
        if (avgParagraphLength >= 50 && avgParagraphLength <= 150) score += 20;
        else if (avgParagraphLength >= 30 && avgParagraphLength <= 200) score += 10;

        // Check for lists
        const hasLists = /[-*•]|\d+\./.test(content);
        if (hasLists) score += 20;

        return Math.min(score, 100);
    }

    private calculateMetaScore(
        generated: MetaTags,
        existing?: Partial<MetaTags>
    ): number {
        let score = 0;

        // Title (40 points)
        const title = existing?.title || generated.title;
        if (title.length >= 50 && title.length <= 60) score += 40;
        else if (title.length >= 30 && title.length <= 70) score += 30;
        else if (title.length > 0) score += 20;

        // Description (40 points)
        const description = existing?.description || generated.description;
        if (description.length >= 150 && description.length <= 160) score += 40;
        else if (description.length >= 120 && description.length <= 180) score += 30;
        else if (description.length > 0) score += 20;

        // Keywords (20 points)
        const keywords = existing?.keywords || generated.keywords;
        if (keywords.length >= 3 && keywords.length <= 10) score += 20;
        else if (keywords.length > 0) score += 10;

        return Math.min(score, 100);
    }

    private calculateContentScore(content: string): number {
        const wordCount = this.tokenizeWords(content).length;

        // Optimal: 300-2000 words
        if (wordCount >= 300 && wordCount <= 2000) {
            return 100;
        } else if (wordCount >= 200 && wordCount <= 3000) {
            return 80;
        } else if (wordCount >= 100) {
            return 60;
        } else if (wordCount >= 50) {
            return 40;
        } else {
            return 20;
        }
    }

    private getGrade(score: number): SEOScore['grade'] {
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'fair';
        return 'poor';
    }

    // ========== Suggestion Generation ==========

    private generateSuggestions(
        content: string,
        score: SEOScore,
        keywordAnalysis: KeywordAnalysis[],
        readability: ReadabilityMetrics
    ): SEOSuggestion[] {
        const suggestions: SEOSuggestion[] = [];

        // Keyword suggestions
        if (score.breakdown.keywords < 70) {
            keywordAnalysis.forEach(ka => {
                if (ka.recommendation) {
                    suggestions.push({
                        id: this.generateId(),
                        category: 'keywords',
                        issue: `Keyword "${ka.keyword}" density is ${ka.density.toFixed(2)}%`,
                        suggestion: ka.recommendation,
                        impact: ka.density < 0.5 || ka.density > 5 ? 'high' : 'medium',
                        priority: 8
                    });
                }
            });
        }

        // Readability suggestions
        if (score.breakdown.readability < 70) {
            if (readability.avgSentenceLength > 25) {
                suggestions.push({
                    id: this.generateId(),
                    category: 'readability',
                    issue: 'Sentences are too long',
                    suggestion: `Average sentence length is ${readability.avgSentenceLength.toFixed(1)} words. Aim for 15-20 words per sentence.`,
                    impact: 'high',
                    priority: 9
                });
            }
        }

        // Structure suggestions
        if (score.breakdown.structure < 70) {
            const headingCount = this.countHeadings(content);
            if (headingCount < 2) {
                suggestions.push({
                    id: this.generateId(),
                    category: 'structure',
                    issue: 'Not enough headings',
                    suggestion: 'Add at least 2-3 headings to break up your content and improve readability.',
                    impact: 'high',
                    priority: 9
                });
            }
        }

        // Content suggestions
        if (score.breakdown.content < 70) {
            const wordCount = this.tokenizeWords(content).length;
            if (wordCount < 300) {
                suggestions.push({
                    id: this.generateId(),
                    category: 'content',
                    issue: 'Content is too short',
                    suggestion: `Current word count: ${wordCount}. Aim for at least 300 words for better SEO.`,
                    impact: 'high',
                    priority: 10
                });
            }
        }

        // Sort by priority (highest first)
        return suggestions.sort((a, b) => b.priority - a.priority);
    }

    // ========== Helper Methods ==========

    private splitSentences(text: string): string[] {
        return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    }

    private splitParagraphs(text: string): string[] {
        return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    }

    private tokenizeWords(text: string): string[] {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    private countHeadings(content: string): number {
        // Count markdown-style headings
        const markdownHeadings = (content.match(/^#+\s/gm) || []).length;

        // Count HTML headings
        const htmlHeadings = (content.match(/<h[1-6]>/gi) || []).length;

        return markdownHeadings + htmlHeadings;
    }

    private countSyllables(word: string): number {
        word = word.toLowerCase().replace(/[^a-z]/g, '');
        if (word.length <= 3) return 1;

        const syllables = word.match(/[aeiouy]{1,2}/g);
        let count = syllables ? syllables.length : 1;

        // Adjust for silent 'e'
        if (word.endsWith('e')) count--;

        return Math.max(count, 1);
    }

    private extractTitle(content: string): string {
        // Try to extract from first heading
        const headingMatch = content.match(/^#+\s+(.+)$/m) || content.match(/<h1>(.+)<\/h1>/i);
        if (headingMatch) {
            return headingMatch[1].trim().substring(0, 60);
        }

        // Generate from first sentence
        const firstSentence = this.splitSentences(content)[0];
        if (firstSentence) {
            return firstSentence.trim().substring(0, 60);
        }

        return 'Untitled Article';
    }

    private generateDescription(content: string): string {
        // Use first paragraph
        const firstParagraph = this.splitParagraphs(content)[0];
        if (firstParagraph) {
            return firstParagraph.trim().substring(0, 160);
        }

        // Fall back to first 160 characters
        return content.trim().substring(0, 160);
    }

    private extractKeywords(content: string): string[] {
        const words = this.tokenizeWords(content);
        const frequencies = new Map<string, number>();

        // Count word frequencies (excluding common stop words)
        const stopWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it']);

        words.forEach(word => {
            if (!stopWords.has(word) && word.length > 3) {
                frequencies.set(word, (frequencies.get(word) || 0) + 1);
            }
        });

        // Return top 5-8 keywords
        return Array.from(frequencies.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([word]) => word);
    }

    private generateId(): string {
        return `seo-suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Create singleton instance
 */
let globalSEOEngine: RealTimeSEOEngine | null = null;

export function getGlobalSEOEngine(): RealTimeSEOEngine {
    if (!globalSEOEngine) {
        globalSEOEngine = new RealTimeSEOEngine();
    }
    return globalSEOEngine;
}
