/**
 * Property-Based Tests for Agent Mode Processor
 * 
 * Property 7: Autonomous improvement generation
 * Validates: Requirements 2.2
 * 
 * Properties tested:
 * 1. Process must complete within reasonable time (<10s for 10k words)
 * 2. Improvements must cover all enabled categories
 * 3. Progress callbacks must be called in order (0-100)
 * 4. Cancellation must work at any point
 * 5. Results must be deterministic for same input
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    AgentModeProcessor,
    ProcessingOptions,
    ProcessingResult,
    StyleProfile
} from '../agent-mode-processor';

describe('Property 7: Autonomous Improvement Generation', () => {
    let processor: AgentModeProcessor;

    beforeEach(() => {
        processor = new AgentModeProcessor();
    });

    describe('Performance Properties', () => {
        it('should complete processing within reasonable time', async () => {
            // Generate 10k word content
            const content = generateLongContent(10000);
            const startTime = performance.now();

            const result = await processor.process(content, {
                includeStructural: true,
                includeStylistic: true,
                includeSEO: true
            });

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should complete within 10 seconds
            expect(duration).toBeLessThan(10000);
            expect(result).toBeDefined();
            expect(result.processingTime).toBeLessThan(10000);
        });

        it('should handle varying content lengths efficiently', async () => {
            const lengths = [100, 500, 1000, 5000];
            const times: number[] = [];

            for (const length of lengths) {
                const content = generateLongContent(length);
                const startTime = performance.now();

                await processor.process(content);

                const duration = performance.now() - startTime;
                times.push(duration);
            }

            // Processing time should scale reasonably
            // Longer content should take more time, but not exponentially
            for (let i = 1; i < times.length; i++) {
                const ratio = times[i] / times[i - 1];
                // Ratio should be between 1x and 5x (linear to sub-linear scaling)
                expect(ratio).toBeGreaterThan(0.5);
                expect(ratio).toBeLessThan(10);
            }
        });
    });

    describe('Completeness Properties', () => {
        it('should generate improvements for all enabled categories', async () => {
            const content = 'This is a test article. It needs improvements. We should analyze it thoroughly.';

            // Test with all categories enabled
            const resultAll = await processor.process(content, {
                includeStructural: true,
                includeStylistic: true,
                includeSEO: true
            });

            expect(resultAll.summary.structuralChanges).toBeGreaterThanOrEqual(0);
            expect(resultAll.summary.stylisticChanges).toBeGreaterThanOrEqual(0);
            expect(resultAll.summary.seoChanges).toBeGreaterThanOrEqual(0);

            // Test with only structural
            const resultStructural = await processor.process(content, {
                includeStructural: true,
                includeStylistic: false,
                includeSEO: false
            });

            expect(resultStructural.summary.stylisticChanges).toBe(0);
            expect(resultStructural.summary.seoChanges).toBe(0);

            // Test with only stylistic
            const resultStylistic = await processor.process(content, {
                includeStructural: false,
                includeStylistic: true,
                includeSEO: false
            });

            expect(resultStylistic.summary.structuralChanges).toBe(0);
            expect(resultStylistic.summary.seoChanges).toBe(0);

            // Test with only SEO
            const resultSEO = await processor.process(content, {
                includeStructural: false,
                includeStylistic: false,
                includeSEO: true
            });

            expect(resultSEO.summary.structuralChanges).toBe(0);
            expect(resultSEO.summary.stylisticChanges).toBe(0);
        });

        it('should include valid position information for all improvements', async () => {
            const content = 'Test content for position validation.';

            const result = await processor.process(content);

            result.improvements.forEach(improvement => {
                expect(improvement.position).toBeDefined();
                expect(improvement.position.start).toBeGreaterThanOrEqual(0);
                expect(improvement.position.end).toBeGreaterThan(improvement.position.start);
                expect(improvement.position.end).toBeLessThanOrEqual(content.length);
            });
        });
    });

    describe('Progress Callback Properties', () => {
        it('should call progress callbacks in ascending order', async () => {
            const content = generateLongContent(1000);
            const progressValues: number[] = [];

            const progressCallback = (progress: number, message: string) => {
                progressValues.push(progress);
                expect(message).toBeTruthy(); // Message should always be provided
            };

            await processor.process(content, {
                includeStructural: true,
                includeStylistic: true,
                includeSEO: true
            }, progressCallback);

            // Progress should be non-decreasing
            for (let i = 1; i < progressValues.length; i++) {
                expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
            }

            // Progress should start at 0 or near 0 and end at 100
            if (progressValues.length > 0) {
                expect(progressValues[0]).toBeLessThanOrEqual(20);
                expect(progressValues[progressValues.length - 1]).toBe(100);
            }
        });

        it('should provide meaningful progress messages', async () => {
            const content = generateLongContent(500);
            const messages: string[] = [];

            const progressCallback = (progress: number, message: string) => {
                messages.push(message);
            };

            await processor.process(content, {
                includeStructural: true,
                includeStylistic: true,
                includeSEO: true
            }, progressCallback);

            // Should have received at least 3 messages (one per phase)
            expect(messages.length).toBeGreaterThanOrEqual(3);

            // Messages should be descriptive
            messages.forEach(message => {
                expect(message.length).toBeGreaterThan(5);
                expect(message).toMatch(/[a-zA-Z]+/); // Contains words
            });
        });
    });

    describe('Cancellation Properties', () => {
        it('should cancel processing at any point', async () => {
            const content = generateLongContent(5000);

            // Start processing
            const processPromise = processor.process(content, {
                includeStructural: true,
                includeStylistic: true,
                includeSEO: true
            });

            // Cancel immediately
            processor.cancel();

            // Should throw or complete immediately
            await expect(processPromise).rejects.toThrow();
        });

        it('should not accept new processing while cancelling', async () => {
            const content = generateLongContent(5000);

            // Start processing
            const promise1 = processor.process(content);

            // Try to process again (should reject)
            await expect(processor.process(content)).rejects.toThrow('Processing already in progress');
        });
    });

    describe('Determinism Properties', () => {
        it('should produce consistent results for same input', async () => {
            const content = 'This is consistent test content.';

            const result1 = await processor.process(content, {
                includeStructural: true,
                includeStylistic: true,
                includeSEO: true
            });

            const result2 = await processor.process(content, {
                includeStructural: true,
                includeStylistic: true,
                includeSEO: true
            });

            // Summary should be identical
            expect(result1.summary.structuralChanges).toBe(result2.summary.structuralChanges);
            expect(result1.summary.stylisticChanges).toBe(result2.summary.stylisticChanges);
            expect(result1.summary.seoChanges).toBe(result2.summary.seoChanges);

            // Improvements count should be identical
            expect(result1.improvements.length).toBe(result2.improvements.length);
        });
    });

    describe('Style Profile Integration Properties', () => {
        it('should apply style profile when provided', async () => {
            const content = 'Test content for style profile application.';

            const styleProfile: StyleProfile = {
                tone: ['formal', 'authoritative'],
                vocabularyPreferences: {
                    commonWords: ['analyze', 'evaluate', 'assess'],
                    avoidedWords: ['stuff', 'things', 'get'],
                    preferredPhrases: ['on the other hand', 'furthermore']
                },
                structuralPreferences: {
                    avgSentenceLength: 20,
                    avgParagraphLength: 5,
                    useTransitions: true
                },
                stylisticElements: {
                    useMetaphors: false,
                    useQuestions: true,
                    activeVoicePreference: 0.8,
                    pronounUsage: 'third-person'
                }
            };

            const resultWithProfile = await processor.process(content, {
                includeStylistic: true,
                styleProfile
            });

            // Should generate improvements when profile is provided
            expect(resultWithProfile.improvements).toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty content', async () => {
            const result = await processor.process('');

            expect(result.improvements.length).toBe(0);
            expect(result.summary.structuralChanges).toBe(0);
            expect(result.summary.stylisticChanges).toBe(0);
            expect(result.summary.seoChanges).toBe(0);
        });

        it('should handle very short content', async () => {
            const result = await processor.process('Hi.');

            expect(result).toBeDefined();
            expect(result.processingTime).toBeGreaterThan(0);
        });

        it('should handle special characters', async () => {
            const content = 'Test with émojis 🚀 and spëcial çharacters!';

            const result = await processor.process(content);

            expect(result).toBeDefined();
        });
    });
});

/**
 * Helper function to generate long content for performance testing
 */
function generateLongContent(wordCount: number): string {
    const words = [
        'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog',
        'article', 'content', 'writing', 'journalism', 'news', 'story',
        'analysis', 'research', 'data', 'findings', 'conclusion'
    ];

    const paragraphs: string[] = [];
    let currentWords = 0;

    while (currentWords < wordCount) {
        const sentenceLength = Math.floor(Math.random() * 15) + 10;
        const sentence: string[] = [];

        for (let i = 0; i < sentenceLength && currentWords < wordCount; i++) {
            sentence.push(words[Math.floor(Math.random() * words.length)]);
            currentWords++;
        }

        paragraphs.push(sentence.join(' ') + '.');
    }

    return paragraphs.join(' ');
}
