'use client';

/**
 * GEO Performance Dashboard Component
 * 
 * Comprehensive dashboard for monitoring GEO performance metrics
 */

import React, { useState, useEffect } from 'react';
import { geoAnalyticsAlerting, type GEOAnalyticsReport, type GEOAlert } from '../../lib/geo-analytics-alerting';
import { generativeSearchTracker } from '../../lib/generative-search-tracker';

interface GEOPerformanceDashboardProps {
  contentIds?: string[];
  className?: string;
}

export default function GEOPerformanceDashboard({ 
  contentIds = [], 
  className = '' 
}: GEOPerformanceDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedContent, setSelectedContent] = useState<string>('all');
  const [reports, setReports] = useState<Record<string, GEOAnalyticsReport>>({});
  const [alerts, setAlerts] = useState<GEOAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod, selectedContent, contentIds]);

  // Real-time data updates
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, selectedPeriod, selectedContent, contentIds]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      // Calculate date range based on selected period
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      startDate.setDate(endDate.getDate() - days);

      const previousEndDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
      const previousStartDate = new Date(previousEndDate.getTime() - days * 24 * 60 * 60 * 1000);

      // Load reports for each content piece
      const newReports: Record<string, GEOAnalyticsReport> = {};
      const allAlerts: GEOAlert[] = [];

      const targetContentIds = selectedContent === 'all' ? contentIds : [selectedContent];

      for (const contentId of targetContentIds) {
        const report = await geoAnalyticsAlerting.generateAnalyticsReport(
          contentId,
          startDate,
          endDate,
          previousStartDate,
          previousEndDate
        );
        newReports[contentId] = report;
        allAlerts.push(...report.alerts);
      }

      setReports(newReports);
      setAlerts(allAlerts);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const aggregatedMetrics = React.useMemo(() => {
    const reportValues = Object.values(reports);
    if (reportValues.length === 0) {
      return {
        totalAppearances: 0,
        averageSemanticRelevance: 0,
        averageCitationRate: 0,
        averagePerformanceScore: 0,
        totalAlerts: 0
      };
    }

    return {
      totalAppearances: reportValues.reduce((sum, r) => sum + r.summary.totalAppearances, 0),
      averageSemanticRelevance: reportValues.reduce((sum, r) => sum + r.summary.averageSemanticRelevance, 0) / reportValues.length,
      averageCitationRate: reportValues.reduce((sum, r) => sum + r.summary.citationRate, 0) / reportValues.length,
      averagePerformanceScore: reportValues.reduce((sum, r) => sum + r.summary.performanceScore, 0) / reportValues.length,
      totalAlerts: alerts.filter(a => !a.acknowledged).length
    };
  }, [reports, alerts]);

  return (
    <div className={`geo-performance-dashboard space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">GEO Performance Dashboard</h2>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-600">Monitor your Generative Engine Optimization performance</p>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full ${isRealTimeEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border ${
              isRealTimeEnabled 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-gray-50 text-gray-700 border-gray-200'
            }`}
            title={isRealTimeEnabled ? 'Disable real-time updates' : 'Enable real-time updates'}
          >
            {isRealTimeEnabled ? '🟢 Live' : '⏸️ Paused'}
          </button>
          <PeriodSelector 
            selected={selectedPeriod} 
            onChange={setSelectedPeriod} 
          />
          <ContentSelector 
            contentIds={contentIds}
            selected={selectedContent}
            onChange={setSelectedContent}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {/* Key Metrics */}
          <MetricsOverview metrics={aggregatedMetrics} />

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <AlertsSection 
              alerts={alerts} 
              onAcknowledgeAlert={(alertId) => {
                geoAnalyticsAlerting.acknowledgeAlert(alertId);
                setAlerts(prev => prev.map(a => 
                  a.id === alertId ? { ...a, acknowledged: true } : a
                ));
              }}
            />
          )}

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceTrendChart reports={reports} />
            <PlatformDistributionChart reports={reports} />
          </div>

          {/* Content Performance Table */}
          <ContentPerformanceTable reports={reports} />
        </>
      )}
    </div>
  );
}

interface MetricsOverviewProps {
  metrics: {
    totalAppearances: number;
    averageSemanticRelevance: number;
    averageCitationRate: number;
    averagePerformanceScore: number;
    totalAlerts: number;
  };
}

function MetricsOverview({ metrics }: MetricsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="Total Appearances"
        value={metrics.totalAppearances.toString()}
        icon="📊"
        trend={null}
      />
      <MetricCard
        title="Avg Semantic Relevance"
        value={`${(metrics.averageSemanticRelevance * 100).toFixed(1)}%`}
        icon="🎯"
        trend={null}
      />
      <MetricCard
        title="Avg Citation Rate"
        value={`${(metrics.averageCitationRate * 100).toFixed(1)}%`}
        icon="📝"
        trend={null}
      />
      <MetricCard
        title="Performance Score"
        value={metrics.averagePerformanceScore.toFixed(0)}
        icon="⚡"
        trend={null}
      />
      <MetricCard
        title="Active Alerts"
        value={metrics.totalAlerts.toString()}
        icon="🚨"
        trend={null}
        isAlert={metrics.totalAlerts > 0}
      />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  trend: 'up' | 'down' | null;
  isAlert?: boolean;
}

function MetricCard({ title, value, icon, trend, isAlert = false }: MetricCardProps) {
  return (
    <div className={`bg-white p-4 rounded-lg border ${isAlert ? 'border-red-200 bg-red-50' : 'border-gray-200'} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      {trend && (
        <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          <span>{trend === 'up' ? '↗️' : '↘️'}</span>
          <span className="ml-1">vs previous period</span>
        </div>
      )}
    </div>
  );
}

interface AlertsSectionProps {
  alerts: GEOAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
}

function AlertsSection({ alerts, onAcknowledgeAlert }: AlertsSectionProps) {
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  if (unacknowledgedAlerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Active Alerts ({unacknowledgedAlerts.length})
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {unacknowledgedAlerts.slice(0, 5).map((alert) => (
          <AlertCard 
            key={alert.id} 
            alert={alert} 
            onAcknowledge={() => onAcknowledgeAlert(alert.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface AlertCardProps {
  alert: GEOAlert;
  onAcknowledge: () => void;
}

function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const severityColors = {
    low: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    medium: 'text-orange-600 bg-orange-50 border-orange-200',
    high: 'text-red-600 bg-red-50 border-red-200',
    critical: 'text-red-800 bg-red-100 border-red-300'
  };

  return (
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded border ${severityColors[alert.severity]}`}>
              {alert.severity}
            </span>
            <span className="text-xs text-gray-500">
              {alert.createdAt.toLocaleDateString()}
            </span>
          </div>
          <h4 className="font-medium text-gray-900">{alert.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>Current: {alert.metrics.current.toFixed(2)}</span>
            <span>Previous: {alert.metrics.previous.toFixed(2)}</span>
            <span>Change: {alert.metrics.change.toFixed(1)}%</span>
          </div>
        </div>
        
        <button
          type="button"
          onClick={onAcknowledge}
          className="ml-4 px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}

interface PeriodSelectorProps {
  selected: '7d' | '30d' | '90d';
  onChange: (period: '7d' | '30d' | '90d') => void;
}

function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
      {(['7d', '30d', '90d'] as const).map((period) => (
        <button
          key={period}
          type="button"
          onClick={() => onChange(period)}
          className={`px-3 py-2 text-sm font-medium ${
            selected === period
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
}

interface ContentSelectorProps {
  contentIds: string[];
  selected: string;
  onChange: (contentId: string) => void;
}

function ContentSelector({ contentIds, selected, onChange }: ContentSelectorProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
      aria-label="Select content to analyze"
    >
      <option value="all">All Content</option>
      {contentIds.map((id) => (
        <option key={id} value={id}>
          {id}
        </option>
      ))}
    </select>
  );
}

function PerformanceTrendChart({ reports }: { reports: Record<string, GEOAnalyticsReport> }) {
  const chartData = React.useMemo(() => {
    const reportValues = Object.values(reports);
    if (reportValues.length === 0) return [];

    // Generate mock time series data for demonstration
    const days = 30;
    const data = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Calculate average metrics for this day (mock data)
      const avgAppearances = reportValues.reduce((sum, r) => sum + r.summary.totalAppearances, 0) / reportValues.length;
      const avgSemanticRelevance = reportValues.reduce((sum, r) => sum + r.summary.averageSemanticRelevance, 0) / reportValues.length;
      
      // Add some variation to make it look realistic
      const variation = (Math.random() - 0.5) * 0.2;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        appearances: Math.max(0, Math.round(avgAppearances * (1 + variation))),
        semanticRelevance: Math.max(0, Math.min(1, avgSemanticRelevance * (1 + variation * 0.5)))
      });
    }
    
    return data;
  }, [reports]);

  const maxAppearances = Math.max(...chartData.map(d => d.appearances), 1);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend (Last 30 Days)</h3>
      
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p>No data available</p>
            <p className="text-sm mt-2">Performance trends will appear here once data is collected</p>
          </div>
        </div>
      ) : (
        <div className="h-64 relative">
          {/* Chart Legend */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Appearances</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Semantic Relevance</span>
            </div>
          </div>
          
          {/* Simple SVG Chart */}
          <svg className="w-full h-48" viewBox="0 0 800 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 40}
                x2="800"
                y2={i * 40}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}
            
            {/* Appearances line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={chartData.map((d, i) => 
                `${(i / (chartData.length - 1)) * 800},${200 - (d.appearances / maxAppearances) * 180}`
              ).join(' ')}
            />
            
            {/* Semantic relevance line */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              points={chartData.map((d, i) => 
                `${(i / (chartData.length - 1)) * 800},${200 - d.semanticRelevance * 180}`
              ).join(' ')}
            />
            
            {/* Data points */}
            {chartData.map((d, i) => (
              <g key={i}>
                <circle
                  cx={(i / (chartData.length - 1)) * 800}
                  cy={200 - (d.appearances / maxAppearances) * 180}
                  r="3"
                  fill="#3b82f6"
                />
                <circle
                  cx={(i / (chartData.length - 1)) * 800}
                  cy={200 - d.semanticRelevance * 180}
                  r="3"
                  fill="#10b981"
                />
              </g>
            ))}
          </svg>
          
          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {chartData.filter((_, i) => i % 5 === 0).map((d, i) => (
              <span key={i}>{d.date}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformDistributionChart({ reports }: { reports: Record<string, GEOAnalyticsReport> }) {
  const platformData = React.useMemo(() => {
    const platforms: Record<string, number> = {};
    
    Object.values(reports).forEach(report => {
      Object.entries(report.platformBreakdown).forEach(([platform, data]) => {
        platforms[platform] = (platforms[platform] || 0) + data.appearances;
      });
    });
    
    return platforms;
  }, [reports]);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
      <div className="space-y-3">
        {Object.entries(platformData).map(([platform, count]) => (
          <div key={platform} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 capitalize">{platform.replace('-', ' ')}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min((count / Math.max(...Object.values(platformData))) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentPerformanceTable({ reports }: { reports: Record<string, GEOAnalyticsReport> }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Content Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appearances
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Citation Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semantic Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(reports).map(([contentId, report]) => (
              <tr key={contentId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {contentId}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {report.summary.totalAppearances}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {(report.summary.citationRate * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {(report.summary.averageSemanticRelevance * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm">
                  <TrendIndicator trend={report.summary.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrendIndicator({ trend }: { trend: 'improving' | 'stable' | 'declining' }) {
  const colors = {
    improving: 'text-green-600 bg-green-100',
    stable: 'text-gray-600 bg-gray-100',
    declining: 'text-red-600 bg-red-100'
  };

  const icons = {
    improving: '↗️',
    stable: '➡️',
    declining: '↘️'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[trend]}`}>
      <span className="mr-1">{icons[trend]}</span>
      {trend}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse h-24 rounded-lg"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 animate-pulse h-80 rounded-lg"></div>
        <div className="bg-gray-200 animate-pulse h-80 rounded-lg"></div>
      </div>
    </div>
  );
}