/**
 * SEO Opportunity Detector
 * 
 * Detects and suggests SEO opportunities:
 * - Internal linking opportunities
 * - Related content suggestions
 * - SEO best practices checklist
 * - Prioritized action items by impact
 * 
 * Requirements: 7.3, 7.5
 */

export interface InternalLinkOpportunity {
    id: string;
    keyword: string;
    targetUrl: string;
    targetTitle: string;
    position: { start: number; end: number };
    relevance: number; // 0-1 scale
    impact: 'high' | 'medium' | 'low';
}

export interface SEOBestPractice {
    id: string;
    category: 'technical' | 'content' | 'meta' | 'links' | 'structure';
    title: string;
    description: string;
    status: 'passed' | 'failed' | 'warning';
    impact: 'high' | 'medium' | 'low';
    actionItem?: string;
}

export interface SEOOpportunities {
    internalLinks: InternalLinkOpportunity[];
    bestPractices: SEOBestPractice[];
    prioritizedActions: Array<{
        id: string;
        title: string;
        impact: 'high' | 'medium' | 'low';
        effort: 'low' | 'medium' | 'high';
        score: number; // Impact/effort ratio
        category: string;
    }>;
}

/**
 * SEO Opportunity Detector
 * 
 * Analyzes content for SEO improvement opportunities.
 */
export class SEOOpportunityDetector {
    /**
     * Detect all SEO opportunities
     * 
     * @param content - Content to analyze
     * @param existingLinks - Existing links in the site
     * @returns SEO opportunities
     */
    async detectOpportunities(
        content: string,
        existingLinks?: Array<{ url: string; title: string; keywords: string[] }>
    ): Promise<SEOOpportunities> {
        // Detect internal linking opportunities
        const internalLinks = await this.detectInternalLinkOpportunities(
            content,
            existingLinks || []
        );

        // Check SEO best practices
        const bestPractices = await this.checkBestPractices(content);

        // Prioritize actions
        const prioritizedActions = this.prioritizeActions(internalLinks, bestPractices);

        return {
            internalLinks,
            bestPractices,
            prioritizedActions
        };
    }

    /**
     * Detect internal linking opportunities
     */
    private async detectInternalLinkOpportunities(
        content: string,
        existingLinks: Array<{ url: string; title: string; keywords: string[] }>
    ): Promise<InternalLinkOpportunity[]> {
        const opportunities: InternalLinkOpportunity[] = [];
        const contentLower = content.toLowerCase();

        for (const link of existingLinks) {
            for (const keyword of link.keywords) {
                const keywordLower = keyword.toLowerCase();

                // Find keyword occurrences
                let pos = contentLower.indexOf(keywordLower);
                while (pos !== -1 && opportunities.length < 10) { // Limit to 10
                    // Check if this position is not already in a link
                    if (!this.isInsideLink(content, pos)) {
                        opportunities.push({
                            id: this.generateId(),
                            keyword,
                            targetUrl: link.url,
                            targetTitle: link.title,
                            position: { start: pos, end: pos + keyword.length },
                            relevance: this.calculateLinkRelevance(keyword, content),
                            impact: this.calculateLinkImpact(keyword)
                        });
                    }

                    pos = contentLower.indexOf(keywordLower, pos + 1);
                }
            }
        }

        // Sort by relevance and impact
        return opportunities.sort((a, b) => {
            const scoreA = a.relevance * (a.impact === 'high' ? 3 : a.impact === 'medium' ? 2 : 1);
            const scoreB = b.relevance * (b.impact === 'high' ? 3 : b.impact === 'medium' ? 2 : 1);
            return scoreB - scoreA;
        });
    }

    /**
     * Check SEO best practices
     */
    private async checkBestPractices(content: string): Promise<SEOBestPractice[]> {
        const practices: SEOBestPractice[] = [];

        // Check title/H1
        practices.push(this.checkTitle(content));

        // Check heading hierarchy
        practices.push(this.checkHeadingHierarchy(content));

        // Check image alt texts (if any images)
        practices.push(this.checkImageAltTexts(content));

        // Check content length
        practices.push(this.checkContentLength(content));

        // Check keyword density
        practices.push(this.checkKeywordStuffing(content));

        // Check external links
        practices.push(this.checkExternalLinks(content));

        // Check internal links
        practices.push(this.checkInternalLinks(content));

        // Check readability
        practices.push(this.checkReadability(content));

        return practices;
    }

    /**
     * Prioritize actions by impact vs effort
     */
    private prioritizeActions(
        internalLinks: InternalLinkOpportunity[],
        bestPractices: SEOBestPractice[]
    ): Array<{
        id: string;
        title: string;
        impact: 'high' | 'medium' | 'low';
        effort: 'low' | 'medium' | 'high';
        score: number;
        category: string;
    }> {
        const actions: Array<{
            id: string;
            title: string;
            impact: 'high' | 'medium' | 'low';
            effort: 'low' | 'medium' | 'high';
            score: number;
            category: string;
        }> = [];

        // Add high-impact internal links as actions
        internalLinks
            .filter(link => link.impact === 'high')
            .slice(0, 3)
            .forEach(link => {
                actions.push({
                    id: link.id,
                    title: `Add internal link to "${link.targetTitle}"`,
                    impact: 'high',
                    effort: 'low', // Links are easy to add
                    score: this.calculateImpactEffortScore('high', 'low'),
                    category: 'Internal Linking'
                });
            });

        // Add failed best practices as actions
        bestPractices
            .filter(bp => bp.status === 'failed' && bp.actionItem)
            .forEach(bp => {
                const effort = this.estimateEffort(bp.category);
                actions.push({
                    id: bp.id,
                    title: bp.actionItem!,
                    impact: bp.impact,
                    effort,
                    score: this.calculateImpactEffortScore(bp.impact, effort),
                    category: bp.category
                });
            });

        // Sort by score (highest first)
        return actions.sort((a, b) => b.score - a.score);
    }

    // ========== Best Practice Checks ==========

    private checkTitle(content: string): SEOBestPractice {
        const titleMatch = content.match(/^#+\s+(.+)$/m) || content.match(/<h1>(.+)<\/h1>/i);
        const hasTitle = !!titleMatch;
        const titleLength = titleMatch ? titleMatch[1].length : 0;

        let status: SEOBestPractice['status'] = 'passed';
        let actionItem: string | undefined;

        if (!hasTitle) {
            status = 'failed';
            actionItem = 'Add a clear H1 heading to your content';
        } else if (titleLength < 30 || titleLength > 70) {
            status = 'warning';
            actionItem = 'Optimize title length (aim for 50-60 characters)';
        }

        return {
            id: this.generateId(),
            category: 'structure',
            title: 'H1 Heading',
            description: 'Content should have one clear H1 heading (50-60 characters)',
            status,
            impact: 'high',
            actionItem
        };
    }

    private checkHeadingHierarchy(content: string): SEOBestPractice {
        const headings = content.match(/^#+\s+/gm) || [];
        const hasProperHierarchy = headings.length >= 2;

        return {
            id: this.generateId(),
            category: 'structure',
            title: 'Heading Structure',
            description: 'Use proper heading hierarchy (H2, H3, etc.) to organize content',
            status: hasProperHierarchy ? 'passed' : 'warning',
            impact: 'medium',
            actionItem: hasProperHierarchy ? undefined : 'Add subheadings (H2, H3) to break up content'
        };
    }

    private checkImageAltTexts(content: string): SEOBestPractice {
        const images = content.match(/<img[^>]*>/gi) || [];
        const imagesWithAlt = content.match(/<img[^>]*alt="[^"]+"/gi) || [];

        const allHaveAlt = images.length === 0 || images.length === imagesWithAlt.length;

        return {
            id: this.generateId(),
            category: 'technical',
            title: 'Image Alt Texts',
            description: 'All images should have descriptive alt text',
            status: allHaveAlt ? 'passed' : 'failed',
            impact: 'medium',
            actionItem: allHaveAlt ? undefined : `Add alt text to ${images.length - imagesWithAlt.length} images`
        };
    }

    private checkContentLength(content: string): SEOBestPractice {
        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

        let status: SEOBestPractice['status'] = 'passed';
        let actionItem: string | undefined;

        if (wordCount < 300) {
            status = 'failed';
            actionItem = `Add ${300 - wordCount} more words (current: ${wordCount})`;
        } else if (wordCount < 500) {
            status = 'warning';
            actionItem = 'Consider adding more comprehensive content (aim for 500+ words)';
        }

        return {
            id: this.generateId(),
            category: 'content',
            title: 'Content Length',
            description: 'Content should be at least 300 words (500+ is ideal)',
            status,
            impact: 'high',
            actionItem
        };
    }

    private checkKeywordStuffing(content: string): SEOBestPractice {
        // Simple check: no word should appear more than 5% of total words
        const words = content.toLowerCase().split(/\s+/);
        const frequencies = new Map<string, number>();

        words.forEach(word => {
            if (word.length > 3) {
                frequencies.set(word, (frequencies.get(word) || 0) + 1);
            }
        });

        const stuffing = Array.from(frequencies.values()).some(count => count / words.length > 0.05);

        return {
            id: this.generateId(),
            category: 'content',
            title: 'Keyword Stuffing',
            description: 'Avoid repeating keywords too frequently (max 3-5%)',
            status: stuffing ? 'warning' : 'passed',
            impact: 'medium',
            actionItem: stuffing ? 'Reduce keyword repetition and use synonyms' : undefined
        };
    }

    private checkExternalLinks(content: string): SEOBestPractice {
        const externalLinks = content.match(/\[.*?\]\(https?:\/\/[^\)]+\)/g) || [];

        return {
            id: this.generateId(),
            category: 'links',
            title: 'External Links',
            description: 'Include 1-3 relevant external links to authoritative sources',
            status: externalLinks.length > 0 ? 'passed' : 'warning',
            impact: 'low',
            actionItem: externalLinks.length === 0 ? 'Add links to relevant external sources' : undefined
        };
    }

    private checkInternalLinks(content: string): SEOBestPractice {
        const internalLinks = content.match(/\[.*?\]\(\/[^\)]+\)/g) || [];

        return {
            id: this.generateId(),
            category: 'links',
            title: 'Internal Links',
            description: 'Include internal links to related content on your site',
            status: internalLinks.length > 0 ? 'passed' : 'warning',
            impact: 'medium',
            actionItem: internalLinks.length === 0 ? 'Add internal links to related articles' : undefined
        };
    }

    private checkReadability(content: string): SEOBestPractice {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = content.split(/\s+/);
        const avgSentenceLength = words.length / Math.max(sentences.length, 1);

        const readable = avgSentenceLength >= 15 && avgSentenceLength <= 25;

        return {
            id: this.generateId(),
            category: 'content',
            title: 'Readability',
            description: 'Average sentence length should be 15-20 words',
            status: readable ? 'passed' : 'warning',
            impact: 'medium',
            actionItem: readable ? undefined : 'Adjust sentence length for better readability'
        };
    }

    // ========== Helper Methods ==========

    private isInsideLink(content: string, position: number): boolean {
        // Check if position is inside a markdown link [text](url)
        let bracketDepth = 0;
        for (let i = position; i >= 0; i--) {
            if (content[i] === ']') bracketDepth++;
            if (content[i] === '[') bracketDepth--;
            if (bracketDepth < 0) return true; // Inside link text
        }
        return false;
    }

    private calculateLinkRelevance(keyword: string, content: string): number {
        // Simple heuristic: keyword frequency
        const occurrences = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
        return Math.min(occurrences / 10, 1); // Normalize to 0-1
    }

    private calculateLinkImpact(keyword: string): 'high' | 'medium' | 'low' {
        // Keywords with more words = potentially higher impact
        const wordCount = keyword.split(/\s+/).length;
        if (wordCount >= 3) return 'high';
        if (wordCount === 2) return 'medium';
        return 'low';
    }

    private estimateEffort(category: string): 'low' | 'medium' | 'high' {
        switch (category) {
            case 'links':
                return 'low'; // Easy to add links
            case 'meta':
                return 'low'; // Quick meta tag updates
            case 'structure':
                return 'medium'; // Requires reorganization
            case 'content':
                return 'high'; // Requires writing
            case 'technical':
                return 'medium'; // Technical changes
            default:
                return 'medium';
        }
    }

    private calculateImpactEffortScore(
        impact: 'high' | 'medium' | 'low',
        effort: 'low' | 'medium' | 'high'
    ): number {
        const impactScore = impact === 'high' ? 10 : impact === 'medium' ? 5 : 2;
        const effortScore = effort === 'low' ? 1 : effort === 'medium' ? 3 : 5;

        // Impact / Effort ratio (higher is better)
        return impactScore / effortScore;
    }

    private generateId(): string {
        return `seo-opp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Create singleton instance
 */
let globalDetector: SEOOpportunityDetector | null = null;

export function getGlobalSEOOpportunityDetector(): SEOOpportunityDetector {
    if (!globalDetector) {
        globalDetector = new SEOOpportunityDetector();
    }
    return globalDetector;
}
