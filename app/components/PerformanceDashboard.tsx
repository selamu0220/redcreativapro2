'use client';

import React, { useState, useEffect } from 'react';
import { getWebVitalsSnapshot } from '../../lib/web-vitals';

interface PerformanceMetrics {
  cls: number;
  lcp: number;
  fcp: number;
  ttfb: number;
  tbt?: number;
}

interface PerformanceThresholds {
  good: number;
  poor: number;
}

const THRESHOLDS: Record<string, PerformanceThresholds> = {
  cls: { good: 0.1, poor: 0.25 },
  lcp: { good: 2500, poor: 4000 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 },
  tbt: { good: 200, poor: 600 },
};

function getPerformanceRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'good': return 'text-green-600 bg-green-50';
    case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
    case 'poor': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

function formatMetricValue(metric: string, value: number): string {
  if (metric === 'cls') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const vitals = await getWebVitalsSnapshot();
        setMetrics({
          cls: vitals.CLS || 0,
          lcp: vitals.LCP || 0,
          fcp: vitals.FCP || 0,
          ttfb: vitals.TTFB || 0,
          tbt: vitals.TBT || 0,
        });
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to load performance metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();

    // Refresh metrics every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <p className="text-gray-500">Unable to load performance metrics</p>
      </div>
    );
  }

  const metricsData = [
    {
      key: 'cls',
      name: 'Cumulative Layout Shift',
      description: 'Visual stability of the page',
      value: metrics.cls,
    },
    {
      key: 'lcp',
      name: 'Largest Contentful Paint',
      description: 'Loading performance',
      value: metrics.lcp,
    },
    {
      key: 'fcp',
      name: 'First Contentful Paint',
      description: 'Time to first content',
      value: metrics.fcp,
    },
    {
      key: 'ttfb',
      name: 'Time to First Byte',
      description: 'Server response time',
      value: metrics.ttfb,
    },
  ];

  if (metrics.tbt && metrics.tbt > 0) {
    metricsData.push({
      key: 'tbt',
      name: 'Total Blocking Time',
      description: 'Main thread blocking time',
      value: metrics.tbt,
    });
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Performance Metrics</h3>
        {lastUpdated && (
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricsData.map((metric) => {
          const rating = getPerformanceRating(metric.key, metric.value);
          const colorClass = getRatingColor(rating);
          
          return (
            <div key={metric.key} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{metric.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                  {rating.replace('-', ' ')}
                </span>
              </div>
              
              <div className="text-2xl font-bold mb-1">
                {formatMetricValue(metric.key, metric.value)}
              </div>
              
              <p className="text-xs text-gray-500">{metric.description}</p>
              
              {/* Progress bar */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    rating === 'good' ? 'bg-green-500' :
                    rating === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (THRESHOLDS[metric.key]?.good || 100) / metric.value * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Score */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Overall Performance</h4>
        <div className="flex items-center space-x-4">
          {metricsData.map((metric) => {
            const rating = getPerformanceRating(metric.key, metric.value);
            return (
              <div key={metric.key} className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full ${
                  rating === 'good' ? 'bg-green-500' :
                  rating === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm">{metric.key.toUpperCase()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-4 text-sm text-gray-600">
        <h5 className="font-medium mb-2">💡 Performance Tips:</h5>
        <ul className="space-y-1 text-xs">
          <li>• Images are optimized with WebP/AVIF formats</li>
          <li>• Critical resources are preloaded for faster LCP</li>
          <li>• Service worker caches assets for repeat visits</li>
          <li>• Fonts use display: swap to prevent layout shifts</li>
          <li>• JavaScript is code-split and lazy-loaded</li>
        </ul>
      </div>
    </div>
  );
}