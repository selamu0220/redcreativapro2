/**
 * Suggestion Queue Manager
 * 
 * Manages suggestion queuing to prevent overwhelming users.
 * Implements priority-based display and automatic rotation.
 * 
 * Requirements: 1.2, 1.4
 */

import { Suggestion } from "./real-time-analysis-engine";

/**
 * Priority order for suggestion types
 * Higher priority suggestions are shown first
 */
const TYPE_PRIORITY: Record<Suggestion['type'], number> = {
  grammar: 4, // Highest priority - correctness issues
  clarity: 3, // High priority - comprehension issues
  style: 2,   // Medium priority - improvement suggestions
  seo: 1      // Lower priority - optimization suggestions
};

/**
 * Suggestion Queue Class
 * 
 * Manages a queue of suggestions with:
 * - Maximum visible limit
 * - Priority-based ordering
 * - Automatic deduplication
 * - FIFO rotation when queue is full
 */
export class SuggestionQueue {
  private queue: Suggestion[] = [];
  private maxVisible: number;
  private seenIds: Set<string> = new Set();

  constructor(maxVisible: number = 3) {
    this.maxVisible = maxVisible;
  }

  /**
   * Add suggestions to the queue
   * 
   * @param suggestions - Array of suggestions to add
   */
  addSuggestions(suggestions: Suggestion[]): void {
    // Filter out duplicates
    const newSuggestions = suggestions.filter(s => !this.seenIds.has(s.id));

    // Add to queue
    this.queue.push(...newSuggestions);

    // Mark as seen
    newSuggestions.forEach(s => this.seenIds.add(s.id));

    // Sort by priority and confidence
    this.sortQueue();
  }

  /**
   * Add a single suggestion to the queue
   * 
   * @param suggestion - Suggestion to add
   */
  addSuggestion(suggestion: Suggestion): void {
    this.addSuggestions([suggestion]);
  }

  /**
   * Remove a suggestion from the queue
   * 
   * @param id - ID of suggestion to remove
   */
  remove(id: string): void {
    this.queue = this.queue.filter(s => s.id !== id);
  }

  /**
   * Get visible suggestions (up to maxVisible)
   * 
   * @returns Array of visible suggestions
   */
  getVisible(): Suggestion[] {
    return this.queue.slice(0, this.maxVisible);
  }

  /**
   * Get count of queued (non-visible) suggestions
   * 
   * @returns Number of queued suggestions
   */
  getQueuedCount(): number {
    return Math.max(0, this.queue.length - this.maxVisible);
  }

  /**
   * Get total count of suggestions
   * 
   * @returns Total number of suggestions
   */
  getTotalCount(): number {
    return this.queue.length;
  }

  /**
   * Clear all suggestions from the queue
   */
  clear(): void {
    this.queue = [];
    this.seenIds.clear();
  }

  /**
   * Check if queue is empty
   * 
   * @returns True if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Sort queue by priority and confidence
   * 
   * Priority order:
   * 1. Suggestion type priority (grammar > clarity > style > seo)
   * 2. Confidence score (higher is better)
   * 3. Position in text (earlier is better)
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // First, sort by type priority
      const priorityDiff = TYPE_PRIORITY[b.type] - TYPE_PRIORITY[a.type];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by confidence
      const confidenceDiff = b.confidence - a.confidence;
      if (confidenceDiff !== 0) return confidenceDiff;

      // Finally by position (earlier in text is better)
      return a.position.start - b.position.start;
    });
  }

  /**
   * Get suggestions by type
   * 
   * @param type - Suggestion type to filter by
   * @returns Array of suggestions of the specified type
   */
  getByType(type: Suggestion['type']): Suggestion[] {
    return this.queue.filter(s => s.type === type);
  }

  /**
   * Get count of suggestions by type
   * 
   * @returns Object with counts for each type
   */
  getCountByType(): Record<Suggestion['type'], number> {
    return {
      grammar: this.getByType('grammar').length,
      style: this.getByType('style').length,
      seo: this.getByType('seo').length,
      clarity: this.getByType('clarity').length
    };
  }

  /**
   * Update max visible count
   * 
   * @param maxVisible - New maximum visible count
   */
  setMaxVisible(maxVisible: number): void {
    this.maxVisible = Math.max(1, maxVisible);
  }

  /**
   * Get max visible count
   * 
   * @returns Current maximum visible count
   */
  getMaxVisible(): number {
    return this.maxVisible;
  }
}
