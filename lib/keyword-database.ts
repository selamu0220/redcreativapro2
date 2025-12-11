/**
 * Keyword Database Schema and Storage Management
 * Handles keyword data persistence, tracking, and analytics
 */

import { KeywordData, KeywordCluster, CompetitorAnalysis } from './keyword-research';

export interface KeywordRankingHistory {
  id: string;
  keyword: string;
  url: string;
  position: number;
  searchEngine: 'google' | 'bing' | 'yahoo';
  location: string;
  device: 'desktop' | 'mobile';
  date: Date;
  previousPosition?: number;
  change: number;
}

export interface KeywordOpportunity {
  id: string;
  keyword: string;
  clusterId?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'identified' | 'in_progress' | 'optimized' | 'ranking';
  targetUrl?: string;
  contentBrief?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedTraffic: number;
  actualTraffic?: number;
}

export interface ContentOptimizationTask {
  id: string;
  url: string;
  targetKeywords: string[];
  currentKeywords: string[];
  optimizationSuggestions: {
    type: 'title' | 'meta_description' | 'headers' | 'content' | 'internal_links';
    suggestion: string;
    priority: number;
  }[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}

export class KeywordDatabase {
  private dbConnection: any; // Replace with actual database connection

  constructor() {
    // Initialize database connection
    this.initializeDatabase();
  }

  /**
   * Store discovered keywords with metadata
   */
  async storeKeywords(keywords: KeywordData[]): Promise<void> {
    const query = `
      INSERT INTO keywords (
        keyword, search_volume, difficulty, cpc, competition, 
        intent, opportunity_score, related_keywords, competitor_urls, 
        current_ranking, trend, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        search_volume = VALUES(search_volume),
        difficulty = VALUES(difficulty),
        opportunity_score = VALUES(opportunity_score),
        updated_at = NOW()
    `;

    for (const keyword of keywords) {
      await this.executeQuery(query, [
        keyword.keyword,
        keyword.searchVolume,
        keyword.difficulty,
        keyword.cpc,
        keyword.competition,
        keyword.intent,
        keyword.opportunityScore,
        JSON.stringify(keyword.relatedKeywords),
        JSON.stringify(keyword.competitorUrls),
        keyword.currentRanking,
        keyword.trend
      ]);
    }
  }

  /**
   * Store keyword clusters for content planning
   */
  async storeClusters(clusters: KeywordCluster[]): Promise<void> {
    const clusterQuery = `
      INSERT INTO keyword_clusters (
        id, primary_keyword, theme, total_search_volume, 
        average_difficulty, opportunity_score, content_gaps, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        opportunity_score = VALUES(opportunity_score),
        content_gaps = VALUES(content_gaps),
        updated_at = NOW()
    `;

    const keywordClusterQuery = `
      INSERT INTO cluster_keywords (cluster_id, keyword, created_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE keyword = keyword
    `;

    for (const cluster of clusters) {
      // Store cluster
      await this.executeQuery(clusterQuery, [
        cluster.id,
        cluster.primaryKeyword,
        cluster.theme,
        cluster.totalSearchVolume,
        cluster.averageDifficulty,
        cluster.opportunityScore,
        JSON.stringify(cluster.contentGaps)
      ]);

      // Store cluster keywords
      for (const keyword of cluster.keywords) {
        await this.executeQuery(keywordClusterQuery, [
          cluster.id,
          keyword.keyword
        ]);
      }
    }
  }

  /**
   * Track keyword ranking positions over time
   */
  async trackRankings(rankings: KeywordRankingHistory[]): Promise<void> {
    const query = `
      INSERT INTO keyword_rankings (
        id, keyword, url, position, search_engine, location, 
        device, date, previous_position, change, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    for (const ranking of rankings) {
      await this.executeQuery(query, [
        ranking.id,
        ranking.keyword,
        ranking.url,
        ranking.position,
        ranking.searchEngine,
        ranking.location,
        ranking.device,
        ranking.date,
        ranking.previousPosition,
        ranking.change
      ]);
    }
  }

  /**
   * Get top keyword opportunities by score
   */
  async getTopOpportunities(limit: number = 50): Promise<KeywordData[]> {
    const query = `
      SELECT * FROM keywords 
      WHERE opportunity_score > 60 
      AND (current_ranking IS NULL OR current_ranking > 10)
      ORDER BY opportunity_score DESC 
      LIMIT ?
    `;

    const results = await this.executeQuery(query, [limit]);
    return this.mapToKeywordData(results);
  }

  /**
   * Get keywords by cluster for content planning
   */
  async getKeywordsByCluster(clusterId: string): Promise<KeywordData[]> {
    const query = `
      SELECT k.* FROM keywords k
      JOIN cluster_keywords ck ON k.keyword = ck.keyword
      WHERE ck.cluster_id = ?
      ORDER BY k.opportunity_score DESC
    `;

    const results = await this.executeQuery(query, [clusterId]);
    return this.mapToKeywordData(results);
  }

  /**
   * Get ranking history for keyword analysis
   */
  async getRankingHistory(keyword: string, days: number = 30): Promise<KeywordRankingHistory[]> {
    const query = `
      SELECT * FROM keyword_rankings 
      WHERE keyword = ? 
      AND date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY date DESC
    `;

    const results = await this.executeQuery(query, [keyword, days]);
    return results.map(this.mapToRankingHistory);
  }

  /**
   * Create content optimization tasks
   */
  async createOptimizationTasks(tasks: ContentOptimizationTask[]): Promise<void> {
    const query = `
      INSERT INTO content_optimization_tasks (
        id, url, target_keywords, current_keywords, 
        optimization_suggestions, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    for (const task of tasks) {
      await this.executeQuery(query, [
        task.id,
        task.url,
        JSON.stringify(task.targetKeywords),
        JSON.stringify(task.currentKeywords),
        JSON.stringify(task.optimizationSuggestions),
        task.status
      ]);
    }
  }

  /**
   * Get pending optimization tasks
   */
  async getPendingOptimizationTasks(): Promise<ContentOptimizationTask[]> {
    const query = `
      SELECT * FROM content_optimization_tasks 
      WHERE status IN ('pending', 'in_progress')
      ORDER BY created_at ASC
    `;

    const results = await this.executeQuery(query, []);
    return results.map(this.mapToOptimizationTask);
  }

  /**
   * Update keyword ranking position
   */
  async updateKeywordRanking(keyword: string, position: number, url?: string): Promise<void> {
    const query = `
      UPDATE keywords 
      SET current_ranking = ?, target_url = ?, updated_at = NOW()
      WHERE keyword = ?
    `;

    await this.executeQuery(query, [position, url, keyword]);
  }

  /**
   * Get keyword performance analytics
   */
  async getKeywordAnalytics(timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<{
    totalKeywords: number;
    rankingKeywords: number;
    averagePosition: number;
    topMovers: KeywordRankingHistory[];
    opportunitiesIdentified: number;
    tasksCompleted: number;
  }> {
    const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;

    const [
      totalKeywords,
      rankingKeywords,
      averagePosition,
      topMovers,
      opportunities,
      completedTasks
    ] = await Promise.all([
      this.getTotalKeywords(),
      this.getRankingKeywords(),
      this.getAveragePosition(),
      this.getTopMovers(days),
      this.getOpportunitiesCount(days),
      this.getCompletedTasksCount(days)
    ]);

    return {
      totalKeywords,
      rankingKeywords,
      averagePosition,
      topMovers,
      opportunitiesIdentified: opportunities,
      tasksCompleted: completedTasks
    };
  }

  /**
   * Search keywords by term or filter
   */
  async searchKeywords(searchTerm: string, filters: {
    minVolume?: number;
    maxDifficulty?: number;
    intent?: string;
    competition?: string;
  } = {}): Promise<KeywordData[]> {
    let query = `SELECT * FROM keywords WHERE keyword LIKE ?`;
    const params: any[] = [`%${searchTerm}%`];

    if (filters.minVolume) {
      query += ` AND search_volume >= ?`;
      params.push(filters.minVolume);
    }

    if (filters.maxDifficulty) {
      query += ` AND difficulty <= ?`;
      params.push(filters.maxDifficulty);
    }

    if (filters.intent) {
      query += ` AND intent = ?`;
      params.push(filters.intent);
    }

    if (filters.competition) {
      query += ` AND competition = ?`;
      params.push(filters.competition);
    }

    query += ` ORDER BY opportunity_score DESC LIMIT 100`;

    const results = await this.executeQuery(query, params);
    return this.mapToKeywordData(results);
  }

  private async initializeDatabase(): Promise<void> {
    // Create tables if they don't exist
    const tables = [
      `CREATE TABLE IF NOT EXISTS keywords (
        keyword VARCHAR(255) PRIMARY KEY,
        search_volume INT DEFAULT 0,
        difficulty INT DEFAULT 0,
        cpc DECIMAL(10,2) DEFAULT 0,
        competition ENUM('low', 'medium', 'high') DEFAULT 'medium',
        intent ENUM('informational', 'commercial', 'transactional', 'navigational') DEFAULT 'informational',
        opportunity_score INT DEFAULT 0,
        related_keywords JSON,
        competitor_urls JSON,
        current_ranking INT NULL,
        target_url VARCHAR(500) NULL,
        trend ENUM('rising', 'stable', 'declining') DEFAULT 'stable',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_opportunity_score (opportunity_score),
        INDEX idx_search_volume (search_volume),
        INDEX idx_difficulty (difficulty)
      )`,

      `CREATE TABLE IF NOT EXISTS keyword_clusters (
        id VARCHAR(255) PRIMARY KEY,
        primary_keyword VARCHAR(255),
        theme VARCHAR(255),
        total_search_volume INT DEFAULT 0,
        average_difficulty DECIMAL(5,2) DEFAULT 0,
        opportunity_score INT DEFAULT 0,
        content_gaps JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_opportunity_score (opportunity_score)
      )`,

      `CREATE TABLE IF NOT EXISTS cluster_keywords (
        cluster_id VARCHAR(255),
        keyword VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (cluster_id, keyword),
        FOREIGN KEY (cluster_id) REFERENCES keyword_clusters(id) ON DELETE CASCADE,
        FOREIGN KEY (keyword) REFERENCES keywords(keyword) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS keyword_rankings (
        id VARCHAR(255) PRIMARY KEY,
        keyword VARCHAR(255),
        url VARCHAR(500),
        position INT,
        search_engine ENUM('google', 'bing', 'yahoo') DEFAULT 'google',
        location VARCHAR(100) DEFAULT 'US',
        device ENUM('desktop', 'mobile') DEFAULT 'desktop',
        date DATE,
        previous_position INT NULL,
        change INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (keyword) REFERENCES keywords(keyword) ON DELETE CASCADE,
        INDEX idx_keyword_date (keyword, date),
        INDEX idx_position (position)
      )`,

      `CREATE TABLE IF NOT EXISTS content_optimization_tasks (
        id VARCHAR(255) PRIMARY KEY,
        url VARCHAR(500),
        target_keywords JSON,
        current_keywords JSON,
        optimization_suggestions JSON,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )`
    ];

    for (const table of tables) {
      await this.executeQuery(table, []);
    }
  }

  private async executeQuery(query: string, params: any[]): Promise<any[]> {
    // Simulate database query - replace with actual database implementation
    console.log('Executing query:', query, 'with params:', params);
    return [];
  }

  private mapToKeywordData(results: any[]): KeywordData[] {
    return results.map(row => ({
      keyword: row.keyword,
      searchVolume: row.search_volume,
      difficulty: row.difficulty,
      cpc: row.cpc,
      competition: row.competition,
      intent: row.intent,
      opportunityScore: row.opportunity_score,
      relatedKeywords: JSON.parse(row.related_keywords || '[]'),
      competitorUrls: JSON.parse(row.competitor_urls || '[]'),
      currentRanking: row.current_ranking,
      trend: row.trend
    }));
  }

  private mapToRankingHistory(row: any): KeywordRankingHistory {
    return {
      id: row.id,
      keyword: row.keyword,
      url: row.url,
      position: row.position,
      searchEngine: row.search_engine,
      location: row.location,
      device: row.device,
      date: row.date,
      previousPosition: row.previous_position,
      change: row.change
    };
  }

  private mapToOptimizationTask(row: any): ContentOptimizationTask {
    return {
      id: row.id,
      url: row.url,
      targetKeywords: JSON.parse(row.target_keywords || '[]'),
      currentKeywords: JSON.parse(row.current_keywords || '[]'),
      optimizationSuggestions: JSON.parse(row.optimization_suggestions || '[]'),
      status: row.status,
      createdAt: row.created_at,
      completedAt: row.completed_at
    };
  }

  private async getTotalKeywords(): Promise<number> {
    const result = await this.executeQuery('SELECT COUNT(*) as count FROM keywords', []);
    return result[0]?.count || 0;
  }

  private async getRankingKeywords(): Promise<number> {
    const result = await this.executeQuery('SELECT COUNT(*) as count FROM keywords WHERE current_ranking IS NOT NULL', []);
    return result[0]?.count || 0;
  }

  private async getAveragePosition(): Promise<number> {
    const result = await this.executeQuery('SELECT AVG(current_ranking) as avg_pos FROM keywords WHERE current_ranking IS NOT NULL', []);
    return Math.round(result[0]?.avg_pos || 0);
  }

  private async getTopMovers(days: number): Promise<KeywordRankingHistory[]> {
    const query = `
      SELECT * FROM keyword_rankings 
      WHERE date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      AND change != 0
      ORDER BY ABS(change) DESC 
      LIMIT 10
    `;
    const results = await this.executeQuery(query, [days]);
    return results.map(this.mapToRankingHistory);
  }

  private async getOpportunitiesCount(days: number): Promise<number> {
    const result = await this.executeQuery(
      'SELECT COUNT(*) as count FROM keywords WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)',
      [days]
    );
    return result[0]?.count || 0;
  }

  private async getCompletedTasksCount(days: number): Promise<number> {
    const result = await this.executeQuery(
      'SELECT COUNT(*) as count FROM content_optimization_tasks WHERE status = "completed" AND completed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)',
      [days]
    );
    return result[0]?.count || 0;
  }
}