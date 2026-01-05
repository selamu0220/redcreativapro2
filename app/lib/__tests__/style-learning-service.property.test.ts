/**
 * Property-Based Tests for Style Learning Service
 * 
 * Property 8: Style profile creation
 * Validates: Requirements 4.2, 4.3
 * 
 * Properties tested:
 * 1. Profile must contain all required characteristics
 * 2. Confidence must increase with sample size
 * 3. Reliability must be consistent across similar samples
 * 4. Tone detection must be accurate
 * 5. Vocabulary analysis must capture patterns
 * 6. Structural analysis must calculate correct statistics
 * 7. Stylistic elements must be detected correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    StyleLearningService,
    WritingSample,
    StyleProfile
} from '../style-learning-service';

describe('Property 8: Style Profile Creation', () => {
    let service: StyleLearningService;

    beforeEach(() => {
        service = new StyleLearningService();
    });

    describe('Profile Completeness Properties', () => {
        it('should create profile with all required characteristics', async () => {
            const samples: WritingSample[] = [
                {
                    id: '1',
                    content: createFormalContent(),
                    wordCount: 500,
                    addedAt: Date.now()
                }
            ];

            const profile = await service.createProfile(samples);

            // Verify all top-level properties exist
            expect(profile.id).toBeDefined();
            expect(profile.createdAt).toBeGreaterThan(0);
            expect(profile.updatedAt).toBeGreaterThan(0);
            expect(profile.sampleCount).toBe(1);
            expect(profile.totalWordCount).toBe(500);

            // Verify tone analysis
            expect(profile.tone).toBeDefined();
            expect(profile.tone.primary).toBeTruthy();
            expect(profile.tone.secondary).toBeInstanceOf(Array);
            expect(profile.tone.confidence).toBeGreaterThanOrEqual(0);
            expect(profile.tone.confidence).toBeLessThanOrEqual(1);
            expect(profile.tone.toneDistribution).toBeDefined();

            // Verify vocabulary analysis
            expect(profile.vocabulary).toBeDefined();
            expect(profile.vocabulary.commonWords).toBeInstanceOf(Array);
            expect(profile.vocabulary.avoidedWords).toBeInstanceOf(Array);
            expect(profile.vocabulary.preferredPhrases).toBeInstanceOf(Array);
            expect(profile.vocabulary.vocabularyRichness).toBeGreaterThanOrEqual(0);
            expect(profile.vocabulary.vocabularyRichness).toBeLessThanOrEqual(1);

            // Verify structural analysis
            expect(profile.structure).toBeDefined();
            expect(profile.structure.avgSentenceLength).toBeGreaterThan(0);
            expect(profile.structure.avgParagraphLength).toBeGreaterThan(0);
            expect(profile.structure.transitionWords).toBeInstanceOf(Array);

            // Verify stylistic elements
            expect(profile.stylistic).toBeDefined();
            expect(profile.stylistic.activeVoicePreference).toBeGreaterThanOrEqual(0);
            expect(profile.stylistic.activeVoicePreference).toBeLessThanOrEqual(1);
            expect(profile.stylistic.pronounUsage).toBeDefined();
            expect(profile.stylistic.punctuationStyle).toBeDefined();

            // Verify confidence and reliability
            expect(profile.confidence).toBeGreaterThanOrEqual(0);
            expect(profile.confidence).toBeLessThanOrEqual(1);
            expect(['low', 'medium', 'high']).toContain(profile.reliability);
        });

        it('should assign unique IDs to different profiles', async () => {
            const samples: WritingSample[] = [
                {
                    id: '1',
                    content: 'Sample content for testing.',
                    wordCount: 5,
                    addedAt: Date.now()
                }
            ];

            const profile1 = await service.createProfile(samples);
            const profile2 = await service.createProfile(samples);

            expect(profile1.id).not.toBe(profile2.id);
        });
    });

    describe('Confidence Properties', () => {
        it('should increase confidence with more words', async () => {
            const shortSample: WritingSample = {
                id: '1',
                content: generateContent(100), // 100 words
                wordCount: 100,
                addedAt: Date.now()
            };

            const mediumSample: WritingSample = {
                id: '2',
                content: generateContent(1000), // 1000 words
                wordCount: 1000,
                addedAt: Date.now()
            };

            const longSample: WritingSample = {
                id: '3',
                content: generateContent(5000), // 5000 words
                wordCount: 5000,
                addedAt: Date.now()
            };

            const shortProfile = await service.createProfile([shortSample]);
            const mediumProfile = await service.createProfile([mediumSample]);
            const longProfile = await service.createProfile([longSample]);

            // Confidence should increase with word count
            expect(mediumProfile.confidence).toBeGreaterThan(shortProfile.confidence);
            expect(longProfile.confidence).toBeGreaterThanOrEqual(mediumProfile.confidence);

            // Long sample should have maximum confidence
            expect(longProfile.confidence).toBe(1);
        });

        it('should have minimum confidence for very small samples', async () => {
            const tinySample: WritingSample = {
                id: '1',
                content: 'Tiny sample.',
                wordCount: 2,
                addedAt: Date.now()
            };

            const profile = await service.createProfile([tinySample]);

            expect(profile.confidence).toBeLessThan(0.5);
            expect(profile.reliability).toBe('low');
        });
    });

    describe('Tone Detection Properties', () => {
        it('should detect formal tone correctly', async () => {
            const formalSample: WritingSample = {
                id: '1',
                content: createFormalContent(),
                wordCount: 200,
                addedAt: Date.now()
            };

            const profile = await service.createProfile([formalSample]);

            // Should detect formal tone
            expect(['formal', 'serious', 'authoritative']).toContain(profile.tone.primary);
            expect(profile.tone.toneDistribution.formal).toBeGreaterThan(0);
        });

        it('should detect conversational tone correctly', async () => {
            const conversationalSample: WritingSample = {
                id: '1',
                content: createConversationalContent(),
                wordCount: 200,
                addedAt: Date.now()
            };

            const profile = await service.createProfile([conversationalSample]);

            // Should have higher conversational score
            expect(profile.tone.toneDistribution.conversational).toBeGreaterThan(0);
        });

        it('should normalize tone distribution', async () => {
            const samples: WritingSample[] = [
                {
                    id: '1',
                    content: createFormalContent(),
                    wordCount: 200,
                    addedAt: Date.now()
                }
            ];

            const profile = await service.createProfile(samples);

            // All tone values should be between 0 and 1
            Object.values(profile.tone.toneDistribution).forEach(value => {
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThanOrEqual(1);
            });
        });
    });

    describe('Vocabulary Analysis Properties', () => {
        it('should identify common words correctly', async () => {
            const samples: WritingSample[] = [
                {
                    id: '1',
                    content: 'Testing testing testing. Analysis analysis. Research research.',
                    wordCount: 7,
                    addedAt: Date.now()
                }
            ];

            const profile = await service.createProfile(samples);

            // Should have identified repeated words
            expect(profile.vocabulary.commonWords.length).toBeGreaterThan(0);

            // Common words should have frequency counts
            profile.vocabulary.commonWords.forEach(item => {
                expect(item.word).toBeTruthy();
                expect(item.frequency).toBeGreaterThan(0);
            });
        });

        it('should calculate vocabulary richness correctly', async () => {
            const repetitiveSample: WritingSample = {
                id: '1',
                content: 'test test test test test',
                wordCount: 5,
                addedAt: Date.now()
            };

            const diverseSample: WritingSample = {
                id: '2',
                content: 'unique different various distinct separate',
                wordCount: 5,
                addedAt: Date.now()
            };

            const repetitiveProfile = await service.createProfile([repetitiveSample]);
            const diverseProfile = await service.createProfile([diverseSample]);

            // Diverse sample should have higher vocabulary richness
            expect(diverseProfile.vocabulary.vocabularyRichness).toBeGreaterThan(
                repetitiveProfile.vocabulary.vocabularyRichness
            );
        });

        it('should extract meaningful phrases', async () => {
            const samples: WritingSample[] = [
                {
                    id: '1',
                    content: 'On the other hand, we can see that, on the other hand, the research shows. On the other hand, this is important.',
                    wordCount: 25,
                    addedAt: Date.now()
                }
            ];

            const profile = await service.createProfile(samples);

            // Should detect repeated phrases
            const hasRepeatedPhrase = profile.vocabulary.preferredPhrases.some(
                p => p.frequency > 1
            );
            expect(hasRepeatedPhrase).toBe(true);
        });
    });

    describe('Structural Analysis Properties', () => {
        it('should calculate average sentence length correctly', async () => {
            const shortSentences = 'Hi. I am here. This is short.';
            const longSentences = 'This is a much longer sentence with many words. Another lengthy sentence follows.';

            const shortProfile = await service.createProfile([{
                id: '1',
                content: shortSentences,
                wordCount: 9,
                addedAt: Date.now()
            }]);

            const longProfile = await service.createProfile([{
                id: '2',
                content: longSentences,
                wordCount: 16,
                addedAt: Date.now()
            }]);

            expect(longProfile.structure.avgSentenceLength).toBeGreaterThan(
                shortProfile.structure.avgSentenceLength
            );
        });

        it('should detect transition word usage', async () => {
            const withTransitions: WritingSample = {
                id: '1',
                content: 'However, this is important. Therefore, we must act. Furthermore, the data shows...',
                wordCount: 14,
                addedAt: Date.now()
            };

            const withoutTransitions: WritingSample = {
                id: '2',
                content: 'This is important. We must act. The data shows...',
                wordCount: 10,
                addedAt: Date.now()
            };

            const withProfile = await service.createProfile([withTransitions]);
            const withoutProfile = await service.createProfile([withoutTransitions]);

            expect(withProfile.structure.useTransitions).toBe(true);
            expect(withProfile.structure.transitionWords.length).toBeGreaterThan(0);
            expect(withoutProfile.structure.transitionWords.length).toBeLessThan(
                withProfile.structure.transitionWords.length
            );
        });

        it('should calculate paragraph statistics', async () => {
            const multiParagraph = `First paragraph is here. It has sentences.

Second paragraph follows. It also has content.

Third paragraph exists.`;

            const profile = await service.createProfile([{
                id: '1',
                content: multiParagraph,
                wordCount: 18,
                addedAt: Date.now()
            }]);

            expect(profile.structure.avgParagraphLength).toBeGreaterThan(0);
            expect(profile.structure.paragraphLengthVariation).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Stylistic Elements Properties', () => {
        it('should detect question usage', async () => {
            const withQuestions: WritingSample = {
                id: '1',
                content: 'What is this? Why do we care? How does it work?',
                wordCount: 11,
                addedAt: Date.now()
            };

            const withoutQuestions: WritingSample = {
                id: '2',
                content: 'This is a statement. We care about this. It works well.',
                wordCount: 12,
                addedAt: Date.now()
            };

            const withProfile = await service.createProfile([withQuestions]);
            const withoutProfile = await service.createProfile([withoutQuestions]);

            expect(withProfile.stylistic.useQuestions).toBe(true);
            expect(withProfile.stylistic.questionFrequency).toBeGreaterThan(0);
            expect(withProfile.stylistic.questionFrequency).toBeGreaterThan(
                withoutProfile.stylistic.questionFrequency
            );
        });

        it('should detect pronoun usage patterns', async () => {
            const firstPerson: WritingSample = {
                id: '1',
                content: 'I think we should analyze this. We can see the results.',
                wordCount: 12,
                addedAt: Date.now()
            };

            const thirdPerson: WritingSample = {
                id: '2',
                content: 'They should analyze this. He can see the results.',
                wordCount: 10,
                addedAt: Date.now()
            };

            const firstProfile = await service.createProfile([firstPerson]);
            const thirdProfile = await service.createProfile([thirdPerson]);

            expect(firstProfile.stylistic.pronounUsage.firstPerson).toBeGreaterThan(
                thirdProfile.stylistic.pronounUsage.firstPerson
            );
            expect(thirdProfile.stylistic.pronounUsage.thirdPerson).toBeGreaterThan(
                firstProfile.stylistic.pronounUsage.thirdPerson
            );
        });

        it('should detect punctuation style', async () => {
            const exclamatory: WritingSample = {
                id: '1',
                content: 'This is amazing! Great work! Excellent results!',
                wordCount: 8,
                addedAt: Date.now()
            };

            const neutral: WritingSample = {
                id: '2',
                content: 'This is good. Nice work. Good results.',
                wordCount: 7,
                addedAt: Date.now()
            };

            const exclamatoryProfile = await service.createProfile([exclamatory]);
            const neutralProfile = await service.createProfile([neutral]);

            expect(exclamatoryProfile.stylistic.punctuationStyle.exclamationMarks).toBeGreaterThan(
                neutralProfile.stylistic.punctuationStyle.exclamationMarks
            );
        });
    });

    describe('Profile Update Properties', () => {
        it('should update profile with new samples', async () => {
            const initialSamples: WritingSample[] = [
                { id: '1', content: generateContent(500), wordCount: 500, addedAt: Date.now() }
            ];

            const newSamples: WritingSample[] = [
                { id: '2', content: generateContent(500), wordCount: 500, addedAt: Date.now() }
            ];

            const initialProfile = await service.createProfile(initialSamples);
            const updatedProfile = await service.updateProfile(initialProfile, newSamples);

            // Should maintain ID
            expect(updatedProfile.id).toBe(initialProfile.id);

            // Should update timestamps
            expect(updatedProfile.updatedAt).toBeGreaterThanOrEqual(initialProfile.updatedAt);

            // Should increase counts
            expect(updatedProfile.sampleCount).toBeGreaterThan(initialProfile.sampleCount);
            expect(updatedProfile.totalWordCount).toBeGreaterThan(initialProfile.totalWordCount);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty sample content', async () => {
            const emptySample: WritingSample = {
                id: '1',
                content: '',
                wordCount: 0,
                addedAt: Date.now()
            };

            // Should handle gracefully
            const profile = await service.createProfile([emptySample]);
            expect(profile).toBeDefined();
        });

        it('should handle special characters', async () => {
            const specialSample: WritingSample = {
                id: '1',
                content: 'Test with émojis 🚀 and spëcial çharacters!',
                wordCount: 7,
                addedAt: Date.now()
            };

            const profile = await service.createProfile([specialSample]);
            expect(profile).toBeDefined();
        });

        it('should reject creation with no samples', async () => {
            await expect(service.createProfile([])).rejects.toThrow('No samples provided');
        });
    });
});

// ========== Helper Functions ==========

function createFormalContent(): string {
    return `
    Therefore, it is essential to analyze the data comprehensively. 
    Furthermore, the research indicates significant correlations. 
    Consequently, we must consider the implications carefully.
    Nevertheless, additional investigation is warranted.
    Moreover, the findings suggest important trends.
  `;
}

function createConversationalContent(): string {
    return `
    You know what's interesting? I mean, basically the data shows some cool stuff.
    Like, you can actually see the pattern if you look closely.
    I mean, it's literally right there in the results.
    You know, we should probably check this out more.
  `;
}

function generateContent(wordCount: number): string {
    const words = [
        'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog',
        'analysis', 'data', 'research', 'findings', 'conclusion', 'study',
        'however', 'therefore', 'furthermore', 'moreover', 'consequently'
    ];

    const result: string[] = [];
    for (let i = 0; i < wordCount; i++) {
        result.push(words[i % words.length]);

        // Add periods every 10-15 words
        if (i > 0 && i % (10 + Math.floor(Math.random() * 5)) === 0) {
            result[result.length - 1] += '.';
        }
    }

    return result.join(' ');
}
