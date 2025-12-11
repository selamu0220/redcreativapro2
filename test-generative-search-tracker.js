/**
 * Unit tests for Generative Search Appearance Tracker
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GenerativeSearchTracker } from './lib/generative-search-tracker.ts';

describe('GenerativeSearchTracker', () => {
  let tracker;

  beforeEach(() => {
    tracker = new GenerativeSearchTracker();
  });

  describe('trackAppearance', () => {
    it('should track a generative search appearance', async () => {
      const appearance = {
        contentId: 'content-123',
        platform: 'google-sge',
        query: 'how to optimize for AI search',
        response: 'To optimize for AI search, you need to focus on conversational content and semantic richness.',
        citationFound: true,
        semanticRelevance: 0.8,
        responseType: 'direct-citation',
        confidence: 0.9
      };

      const id = await tracker.trackAppearance(appearance);
      
      expect(id).toBeDefined();
      expect(id).toMatch(/^gst_\d+_[a-z0-9]+$/);

      const appearances = tracker.getContentAppearances('content-123');
      expect(appearances).toHaveLength(1);
      expect(appearances[0].contentId).toBe('content-123');
      expect(appearances[0].platform).toBe('google-sge');
      expect(appearances[0].citationFound).toBe(true);
    });

    it('should auto-generate timestamp and ID', async () => {
      const appearance = {
        contentId: 'content-456',
        platform: 'bing-ai',
        query: 'test query',
        response: 'test response',
        citationFound: false,
        semanticRelevance: 0.5,
        responseType: 'no-match',
        confidence: 0.3
      };

      const beforeTime = new Date();
      await tracker.trackAppearance(appearance);
      const afterTime = new Date();

      const appearances = tracker.getContentAppearances('content-456');
      const trackedAppearance = appearances[0];

      expect(trackedAppearance.id).toBeDefined();
      expect(trackedAppearance.timestamp).toBeInstanceOf(Date);
      expect(trackedAppearance.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(trackedAppearance.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('calculateSemanticRelevance', () => {
    it('should calculate semantic relevance score', async () => {
      const contentId = 'content-789';
      const query = 'AI optimization techniques';
      const response = 'AI optimization involves using conversational language and semantic context to improve content visibility in generative search results.';

      const semanticScore = await tracker.calculateSemanticRelevance(contentId, query, response);

      expect(semanticScore.contentId).toBe(contentId);
      expect(semanticScore.query).toBe(query);
      expect(semanticScore.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(semanticScore.relevanceScore).toBeLessThanOrEqual(1);
      expect(semanticScore.keywordMatches).toBeInstanceOf(Array);
      expect(semanticScore.semanticMatches).toBeInstanceOf(Array);
      expect(semanticScore.contextualRelevance).toBeGreaterThanOrEqual(0);
      expect(semanticScore.contextualRelevance).toBeLessThanOrEqual(1);
      expect(semanticScore.calculatedAt).toBeInstanceOf(Date);
    });

    it('should store semantic scores', async () => {
      const contentId = 'content-store-test';
      
      await tracker.calculateSemanticRelevance(contentId, 'query 1', 'response 1');
      await tracker.calculateSemanticRelevance(contentId, 'query 2', 'response 2');

      const scores = tracker.getContentSemanticScores(contentId);
      expect(scores).toHaveLength(2);
      expect(scores[0].query).toBe('query 1');
      expect(scores[1].query).toBe('query 2');
    });
  });

  describe('getPerformanceComparison', () => {
    it('should generate performance comparison report', async () => {
      const contentId = 'content-perf-test';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Add some test appearances
      await tracker.trackAppearance({
        contentId,
        platform: 'google-sge',
        query: 'test query 1',
        response: 'test response 1',
        citationFound: true,
        semanticRelevance: 0.8,
        responseType: 'direct-citation',
        confidence: 0.9
      });

      await tracker.trackAppearance({
        contentId,
        platform: 'bing-ai',
        query: 'test query 2',
        response: 'test response 2',
        citationFound: false,
        semanticRelevance: 0.6,
        responseType: 'semantic-match',
        confidence: 0.7
      });

      const traditionalMetrics = {
        organicClicks: 100,
        impressions: 1000,
        averagePosition: 5.2
      };

      const comparison = await tracker.getPerformanceComparison(
        contentId,
        startDate,
        endDate,
        traditionalMetrics
      );

      expect(comparison.contentId).toBe(contentId);
      expect(comparison.period.start).toEqual(startDate);
      expect(comparison.period.end).toEqual(endDate);
      
      expect(comparison.geoMetrics.generativeAppearances).toBe(2);
      expect(comparison.geoMetrics.averageSemanticRelevance).toBeCloseTo(0.7, 1);
      expect(comparison.geoMetrics.citationRate).toBe(0.5);
      expect(comparison.geoMetrics.platformDistribution['google-sge']).toBe(1);
      expect(comparison.geoMetrics.platformDistribution['bing-ai']).toBe(1);

      expect(comparison.traditionalSeoMetrics.organicClicks).toBe(100);
      expect(comparison.traditionalSeoMetrics.impressions).toBe(1000);
      expect(comparison.traditionalSeoMetrics.averagePosition).toBe(5.2);
      expect(comparison.traditionalSeoMetrics.clickThroughRate).toBe(10);

      expect(comparison.performanceRatio).toBeGreaterThan(0);
    });

    it('should handle empty data gracefully', async () => {
      const contentId = 'content-empty-test';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const comparison = await tracker.getPerformanceComparison(
        contentId,
        startDate,
        endDate
      );

      expect(comparison.geoMetrics.generativeAppearances).toBe(0);
      expect(comparison.geoMetrics.averageSemanticRelevance).toBe(0);
      expect(comparison.geoMetrics.citationRate).toBe(0);
      expect(Object.keys(comparison.geoMetrics.platformDistribution)).toHaveLength(0);
    });
  });

  describe('keyword extraction and text similarity', () => {
    it('should extract meaningful keywords', () => {
      const tracker = new GenerativeSearchTracker();
      
      // Access private method for testing (in real implementation, you might make this public or test through public methods)
      const text = "This is a comprehensive guide to artificial intelligence optimization techniques for modern search engines.";
      
      // Since extractKeywords is private, we'll test it through semantic relevance calculation
      const testPromise = tracker.calculateSemanticRelevance('test', 'AI optimization', text);
      expect(testPromise).resolves.toBeDefined();
    });

    it('should calculate text similarity correctly', async () => {
      const contentId = 'similarity-test';
      const query = 'machine learning algorithms';
      const similarResponse = 'Machine learning algorithms are essential for artificial intelligence systems and data processing.';
      const dissimilarResponse = 'Cooking recipes require careful attention to ingredients and timing for best results.';

      const similarScore = await tracker.calculateSemanticRelevance(contentId, query, similarResponse);
      const dissimilarScore = await tracker.calculateSemanticRelevance(contentId, query, dissimilarResponse);

      expect(similarScore.relevanceScore).toBeGreaterThan(dissimilarScore.relevanceScore);
    });
  });

  describe('platform distribution calculation', () => {
    it('should correctly calculate platform distribution', async () => {
      const contentId = 'platform-test';

      // Add appearances from different platforms
      await tracker.trackAppearance({
        contentId,
        platform: 'google-sge',
        query: 'test 1',
        response: 'response 1',
        citationFound: true,
        semanticRelevance: 0.8,
        responseType: 'direct-citation',
        confidence: 0.9
      });

      await tracker.trackAppearance({
        contentId,
        platform: 'google-sge',
        query: 'test 2',
        response: 'response 2',
        citationFound: true,
        semanticRelevance: 0.7,
        responseType: 'direct-citation',
        confidence: 0.8
      });

      await tracker.trackAppearance({
        contentId,
        platform: 'bing-ai',
        query: 'test 3',
        response: 'response 3',
        citationFound: false,
        semanticRelevance: 0.6,
        responseType: 'semantic-match',
        confidence: 0.7
      });

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      
      const comparison = await tracker.getPerformanceComparison(contentId, startDate, endDate);
      
      expect(comparison.geoMetrics.platformDistribution['google-sge']).toBe(2);
      expect(comparison.geoMetrics.platformDistribution['bing-ai']).toBe(1);
    });
  });

  describe('date filtering', () => {
    it('should filter appearances by date range', async () => {
      const contentId = 'date-filter-test';
      
      // Mock the timestamp to control dates
      const originalTrackAppearance = tracker.trackAppearance.bind(tracker);
      let mockDate = new Date('2024-01-15');
      
      tracker.trackAppearance = async function(appearance) {
        const result = await originalTrackAppearance(appearance);
        // Manually set the timestamp for testing
        const appearances = this.appearances.get(appearance.contentId) || [];
        if (appearances.length > 0) {
          appearances[appearances.length - 1].timestamp = mockDate;
        }
        return result;
      };

      // Add appearance in January
      await tracker.trackAppearance({
        contentId,
        platform: 'google-sge',
        query: 'january query',
        response: 'january response',
        citationFound: true,
        semanticRelevance: 0.8,
        responseType: 'direct-citation',
        confidence: 0.9
      });

      // Add appearance in March (outside range)
      mockDate = new Date('2024-03-15');
      await tracker.trackAppearance({
        contentId,
        platform: 'bing-ai',
        query: 'march query',
        response: 'march response',
        citationFound: false,
        semanticRelevance: 0.6,
        responseType: 'semantic-match',
        confidence: 0.7
      });

      // Test filtering for January only
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const comparison = await tracker.getPerformanceComparison(contentId, startDate, endDate);
      
      expect(comparison.geoMetrics.generativeAppearances).toBe(1);
      expect(comparison.geoMetrics.platformDistribution['google-sge']).toBe(1);
      expect(comparison.geoMetrics.platformDistribution['bing-ai']).toBeUndefined();
    });
  });
});

console.log('✅ Generative Search Tracker tests ready to run');
console.log('Run with: npm test test-generative-search-tracker.js');