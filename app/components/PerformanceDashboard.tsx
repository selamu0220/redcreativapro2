'use client';

import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTranslation } from '@/app/lib/language/context';
import { formatDate, formatNumber } from '@/app/lib/localization';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceMetrics {
  date: string;
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export default function PerformanceDashboard() {
  const { t, currentLocale: currentLanguage } = useTranslation('dashboard');
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<PerformanceMetrics[]>([]);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    setLoading(true);

    // Simulated data - replace with actual performance monitoring API
    const mockCurrentMetrics: PerformanceMetrics = {
      date: new Date().toISOString(),
      pageLoadTime: 2.3,
      firstContentfulPaint: 1.2,
      largestContentfulPaint: 2.8,
      cumulativeLayoutShift: 0.05,
      timeToInteractive: 3.1
    };

    const mockHistoricalData: PerformanceMetrics[] = [
      { date: '2024-01-01', pageLoadTime: 2.8, firstContentfulPaint: 1.5, largestContentfulPaint: 3.2, cumulativeLayoutShift: 0.08, timeToInteractive: 3.5 },
      { date: '2024-01-08', pageLoadTime: 2.6, firstContentfulPaint: 1.4, largestContentfulPaint: 3.0, cumulativeLayoutShift: 0.07, timeToInteractive: 3.3 },
      { date: '2024-01-15', pageLoadTime: 2.4, firstContentfulPaint: 1.3, largestContentfulPaint: 2.9, cumulativeLayoutShift: 0.06, timeToInteractive: 3.2 },
      { date: '2024-01-22', pageLoadTime: 2.3, firstContentfulPaint: 1.2, largestContentfulPaint: 2.8, cumulativeLayoutShift: 0.05, timeToInteractive: 3.1 },
    ];

    setMetrics(mockCurrentMetrics);
    setHistoricalData(mockHistoricalData);
    setLoading(false);
  };

  const getMetricStatus = (value: number, thresholds: { good: number; needsImprovement: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.needsImprovement) return 'needsImprovement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'needsImprovement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-50 border-green-200';
      case 'needsImprovement': return 'bg-yellow-50 border-yellow-200';
      case 'poor': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const performanceOverTimeData = {
    labels: historicalData.map(d => formatDate(new Date(d.date), currentLanguage as any, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: t('performanceDashboard.metrics.pageLoadTime'),
        data: historicalData.map(d => d.pageLoadTime),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: t('performanceDashboard.metrics.firstContentfulPaint'),
        data: historicalData.map(d => d.firstContentfulPaint),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: t('performanceDashboard.metrics.timeToInteractive'),
        data: historicalData.map(d => d.timeToInteractive),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const coreWebVitalsData = {
    labels: [
      t('performanceDashboard.metrics.largestContentfulPaint'),
      t('performanceDashboard.metrics.firstContentfulPaint'),
      t('performanceDashboard.metrics.cumulativeLayoutShift')
    ],
    datasets: [
      {
        label: t('performanceDashboard.charts.coreWebVitals'),
        data: metrics ? [
          metrics.largestContentfulPaint,
          metrics.firstContentfulPaint,
          metrics.cumulativeLayoutShift * 100 // Convert to percentage for better visualization
        ] : [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-500">{t('performanceDashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('performanceDashboard.title')}
        </h1>
        <p className="text-gray-600">
          {t('performanceDashboard.subtitle')}
        </p>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-lg shadow-md border ${getStatusBgColor(getMetricStatus(metrics.pageLoadTime, { good: 2.5, needsImprovement: 4.0 }))}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('performanceDashboard.metrics.pageLoadTime')}</p>
              <p className={`text-3xl font-bold ${getStatusColor(getMetricStatus(metrics.pageLoadTime, { good: 2.5, needsImprovement: 4.0 }))}`}>
                {formatNumber(metrics.pageLoadTime, currentLanguage as any, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}s
              </p>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-md border ${getStatusBgColor(getMetricStatus(metrics.firstContentfulPaint, { good: 1.8, needsImprovement: 3.0 }))}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('performanceDashboard.metrics.firstContentfulPaint')}</p>
              <p className={`text-3xl font-bold ${getStatusColor(getMetricStatus(metrics.firstContentfulPaint, { good: 1.8, needsImprovement: 3.0 }))}`}>
                {formatNumber(metrics.firstContentfulPaint, currentLanguage as any, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}s
              </p>
            </div>
            <div className="text-4xl">🎨</div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-md border ${getStatusBgColor(getMetricStatus(metrics.largestContentfulPaint, { good: 2.5, needsImprovement: 4.0 }))}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('performanceDashboard.metrics.largestContentfulPaint')}</p>
              <p className={`text-3xl font-bold ${getStatusColor(getMetricStatus(metrics.largestContentfulPaint, { good: 2.5, needsImprovement: 4.0 }))}`}>
                {formatNumber(metrics.largestContentfulPaint, currentLanguage as any, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}s
              </p>
            </div>
            <div className="text-4xl">🖼️</div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-md border ${getStatusBgColor(getMetricStatus(metrics.cumulativeLayoutShift, { good: 0.1, needsImprovement: 0.25 }))}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('performanceDashboard.metrics.cumulativeLayoutShift')}</p>
              <p className={`text-3xl font-bold ${getStatusColor(getMetricStatus(metrics.cumulativeLayoutShift, { good: 0.1, needsImprovement: 0.25 }))}`}>
                {formatNumber(metrics.cumulativeLayoutShift, currentLanguage as any, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              </p>
            </div>
            <div className="text-4xl">📐</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('performanceDashboard.charts.performanceOverTime')}</h3>
          <Line data={performanceOverTimeData} options={chartOptions} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('performanceDashboard.charts.coreWebVitals')}</h3>
          <Bar data={coreWebVitalsData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}