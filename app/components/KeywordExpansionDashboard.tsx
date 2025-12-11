'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  Target, 
  BarChart3, 
  FileText, 
  Link, 
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  opportunityScore: number;
  currentRanking?: number;
  trend: 'rising' | 'stable' | 'declining';
}

interface KeywordCluster {
  id: string;
  primaryKeyword: string;
  keywords: KeywordData[];
  theme: string;
  totalSearchVolume: number;
  averageDifficulty: number;
  opportunityScore: number;
  contentGaps: string[];
}

interface OptimizationTask {
  id: string;
  url: string;
  targetKeywords: string[];
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  createdAt: Date;
}

export default function KeywordExpansionDashboard() {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [clusters, setClusters] = useState<KeywordCluster[]>([]);
  const [tasks, setTasks] = useState<OptimizationTask[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    intent: '',
    competition: '',
    minVolume: '',
    maxDifficulty: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalKeywords: 0,
    rankingKeywords: 0,
    averagePosition: 0,
    opportunitiesIdentified: 0,
    tasksCompleted: 0,
    progressToGoal: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await Promise.all([
        loadKeywords(),
        loadClusters(),
        loadTasks(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadKeywords = async () => {
    // Simulate keyword data
    const mockKeywords: KeywordData[] = [
      {
        keyword: 'SEO optimization',
        searchVolume: 8100,
        difficulty: 65,
        cpc: 4.20,
        competition: 'high',
        intent: 'informational',
        opportunityScore: 78,
        currentRanking: 15,
        trend: 'rising'
      },
      {
        keyword: 'keyword research tools',
        searchVolume: 3600,
        difficulty: 45,
        cpc: 6.50,
        competition: 'medium',
        intent: 'commercial',
        opportunityScore: 85,
        trend: 'stable'
      },
      {
        keyword: 'content optimization guide',
        searchVolume: 1200,
        difficulty: 35,
        cpc: 2.80,
        competition: 'low',
        intent: 'informational',
        opportunityScore: 92,
        trend: 'rising'
      }
    ];
    setKeywords(mockKeywords);
  };

  const loadClusters = async () => {
    // Simulate cluster data
    const mockClusters: KeywordCluster[] = [
      {
        id: 'seo-optimization',
        primaryKeyword: 'SEO optimization',
        keywords: keywords.slice(0, 5),
        theme: 'SEO Optimization',
        totalSearchVolume: 15000,
        averageDifficulty: 55,
        opportunityScore: 82,
        contentGaps: [
          'Create comprehensive SEO guide',
          'Develop tool comparison content',
          'Add case study examples'
        ]
      }
    ];
    setClusters(mockClusters);
  };

  const loadTasks = async () => {
    // Simulate task data
    const mockTasks: OptimizationTask[] = [
      {
        id: '1',
        url: '/blog/seo-basics',
        targetKeywords: ['SEO optimization', 'SEO guide'],
        status: 'in_progress',
        priority: 'high',
        estimatedImpact: 85,
        createdAt: new Date()
      },
      {
        id: '2',
        url: '/tools/keyword-research',
        targetKeywords: ['keyword research tools', 'SEO tools'],
        status: 'pending',
        priority: 'medium',
        estimatedImpact: 70,
        createdAt: new Date()
      }
    ];
    setTasks(mockTasks);
  };

  const loadStats = async () => {
    setStats({
      totalKeywords: 247,
      rankingKeywords: 89,
      averagePosition: 28,
      opportunitiesIdentified: 156,
      tasksCompleted: 23,
      progressToGoal: 49.4 // Progress toward 500 keywords
    });
  };

  const discoverKeywords = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      // Simulate keyword discovery
      const newKeywords = await simulateKeywordDiscovery(searchTerm);
      setKeywords(prev => [...prev, ...newKeywords]);
    } catch (error) {
      console.error('Error discovering keywords:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateKeywordDiscovery = async (seed: string): Promise<KeywordData[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        keyword: `${seed} guide`,
        searchVolume: Math.floor(Math.random() * 5000) + 500,
        difficulty: Math.floor(Math.random() * 100),
        cpc: Math.random() * 8,
        competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        intent: ['informational', 'commercial'][Math.floor(Math.random() * 2)] as any,
        opportunityScore: Math.floor(Math.random() * 100),
        trend: 'stable' as const
      },
      {
        keyword: `best ${seed}`,
        searchVolume: Math.floor(Math.random() * 3000) + 300,
        difficulty: Math.floor(Math.random() * 100),
        cpc: Math.random() * 6,
        competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        intent: 'commercial' as const,
        opportunityScore: Math.floor(Math.random() * 100),
        trend: 'rising' as const
      }
    ];
  };

  const filteredKeywords = keywords.filter(keyword => {
    if (searchTerm && !keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedFilters.intent && keyword.intent !== selectedFilters.intent) {
      return false;
    }
    if (selectedFilters.competition && keyword.competition !== selectedFilters.competition) {
      return false;
    }
    if (selectedFilters.minVolume && keyword.searchVolume < parseInt(selectedFilters.minVolume)) {
      return false;
    }
    if (selectedFilters.maxDifficulty && keyword.difficulty > parseInt(selectedFilters.maxDifficulty)) {
      return false;
    }
    return true;
  });

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'informational': return 'bg-blue-100 text-blue-800';
      case 'commercial': return 'bg-purple-100 text-purple-800';
      case 'transactional': return 'bg-green-100 text-green-800';
      case 'navigational': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organic Keyword Expansion</h1>
          <p className="text-gray-600 mt-2">
            Transform from 11 to 500+ ranking keywords through strategic optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Keywords</p>
                <p className="text-2xl font-bold">{stats.totalKeywords}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ranking Keywords</p>
                <p className="text-2xl font-bold">{stats.rankingKeywords}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Position</p>
                <p className="text-2xl font-bold">{stats.averagePosition}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Opportunities</p>
                <p className="text-2xl font-bold">{stats.opportunitiesIdentified}</p>
              </div>
              <Search className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasks Done</p>
                <p className="text-2xl font-bold">{stats.tasksCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progress to 500</p>
                <p className="text-2xl font-bold">{stats.progressToGoal}%</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">500</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="discovery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="discovery">Keyword Discovery</TabsTrigger>
          <TabsTrigger value="clusters">Keyword Clusters</TabsTrigger>
          <TabsTrigger value="optimization">Content Optimization</TabsTrigger>
          <TabsTrigger value="tracking">Ranking Tracking</TabsTrigger>
        </TabsList>

        {/* Keyword Discovery Tab */}
        <TabsContent value="discovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Research & Discovery</CardTitle>
              <CardDescription>
                Discover new keyword opportunities and analyze competition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    placeholder="Enter seed keyword to discover opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && discoverKeywords()}
                  />
                </div>
                <Button onClick={discoverKeywords} disabled={isLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  Discover
                </Button>
              </div>

              {/* Filters */}
              <div className="flex gap-4 items-center">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedFilters.intent}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, intent: e.target.value }))}
                  className="px-3 py-1 border rounded"
                >
                  <option value="">All Intents</option>
                  <option value="informational">Informational</option>
                  <option value="commercial">Commercial</option>
                  <option value="transactional">Transactional</option>
                  <option value="navigational">Navigational</option>
                </select>
                
                <select
                  value={selectedFilters.competition}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, competition: e.target.value }))}
                  className="px-3 py-1 border rounded"
                >
                  <option value="">All Competition</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <Input
                  type="number"
                  placeholder="Min Volume"
                  value={selectedFilters.minVolume}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, minVolume: e.target.value }))}
                  className="w-32"
                />

                <Input
                  type="number"
                  placeholder="Max Difficulty"
                  value={selectedFilters.maxDifficulty}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, maxDifficulty: e.target.value }))}
                  className="w-32"
                />
              </div>

              {/* Keywords Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Keyword</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Volume</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Difficulty</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Competition</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Intent</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Opportunity</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Trend</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Ranking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredKeywords.map((keyword, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {keyword.keyword}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {keyword.searchVolume.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              keyword.difficulty < 30 ? 'bg-green-500' :
                              keyword.difficulty < 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            {keyword.difficulty}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className={getCompetitionColor(keyword.competition)}>
                            {keyword.competition}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className={getIntentColor(keyword.intent)}>
                            {keyword.intent}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              keyword.opportunityScore > 80 ? 'bg-green-500' :
                              keyword.opportunityScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            {keyword.opportunityScore}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getTrendIcon(keyword.trend)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {keyword.currentRanking ? `#${keyword.currentRanking}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keyword Clusters Tab */}
        <TabsContent value="clusters" className="space-y-4">
          <div className="grid gap-4">
            {clusters.map((cluster) => (
              <Card key={cluster.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{cluster.theme}</CardTitle>
                      <CardDescription>
                        Primary: {cluster.primaryKeyword} • {cluster.keywords.length} keywords • 
                        {cluster.totalSearchVolume.toLocaleString()} total volume
                      </CardDescription>
                    </div>
                    <Badge className={`${
                      cluster.opportunityScore > 80 ? 'bg-green-100 text-green-800' :
                      cluster.opportunityScore > 60 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      Score: {cluster.opportunityScore}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Content Gaps Identified:</h4>
                      <ul className="space-y-1">
                        {cluster.contentGaps.map((gap, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <FileText className="h-3 w-3 mr-2" />
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Create Content Brief
                      </Button>
                      <Button size="sm" variant="outline">
                        <Link className="h-4 w-4 mr-2" />
                        Optimize Existing
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Content Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Optimization Tasks</CardTitle>
              <CardDescription>
                Track and manage content optimization for target keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{task.url}</h4>
                        <p className="text-sm text-gray-600">
                          Target: {task.targetKeywords.join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <Badge className={`${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Estimated Impact: {task.estimatedImpact}%
                      </span>
                      <Button size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ranking Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Ranking Tracking</CardTitle>
              <CardDescription>
                Monitor keyword positions and track progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ranking tracking data will appear here</p>
                <p className="text-sm">Connect to Google Search Console to start tracking</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}