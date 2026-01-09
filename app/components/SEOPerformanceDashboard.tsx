'use client';

import { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useTranslation } from '@/app/lib/language/context';
import { formatDate, formatNumber, formatPercentage } from '@/app/lib/localization';
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
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SEOMetrics {
  date: string;
  ctr: number;
  impressions: number;
  clicks: number;
  averagePosition: number;
  optimizedArticles: number;
}

interface ArticlePerformance {
  id: string;
  title: string;
  url: string;
  ctrBefore: number;
  ctrAfter: number;
  positionBefore: number;
  positionAfter: number;
  optimizationDate: string;
  improvement: number;
}

export default function SEOPerformanceDashboard() {
  const { t, currentLocale: currentLanguage } = useTranslation('dashboard');
  const [metrics, setMetrics] = useState<SEOMetrics[]>([]);
  const [articlePerformance, setArticlePerformance] = useState<ArticlePerformance[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [selectedPeriod]);

  const loadPerformanceData = async () => {
    setIsLoading(true);

    // Simulated data - replace with actual API calls
    const mockMetrics: SEOMetrics[] = [
      { date: '2024-01-01', ctr: 4.8, impressions: 12500, clicks: 600, averagePosition: 8.2, optimizedArticles: 0 },
      { date: '2024-01-08', ctr: 5.1, impressions: 13200, clicks: 673, averagePosition: 7.9, optimizedArticles: 5 },
      { date: '2024-01-15', ctr: 5.6, impressions: 14100, clicks: 790, averagePosition: 7.4, optimizedArticles: 12 },
      { date: '2024-01-22', ctr: 6.2, impressions: 15300, clicks: 949, averagePosition: 6.8, optimizedArticles: 18 },
      { date: '2024-01-29', ctr: 6.8, impressions: 16800, clicks: 1142, averagePosition: 6.2, optimizedArticles: 25 },
    ];

    const mockArticlePerformance: ArticlePerformance[] = [
      {
        id: '1',
        title: 'Cómo usar ChatGPT para escribir contenido de calidad',
        url: '/chatgpt-escribir-contenido',
        ctrBefore: 4.2,
        ctrAfter: 7.1,
        positionBefore: 9,
        positionAfter: 5,
        optimizationDate: '2024-01-15',
        improvement: 69
      },
      {
        id: '2',
        title: 'Las mejores herramientas de IA para escritores',
        url: '/herramientas-ia-escritores',
        ctrBefore: 3.8,
        ctrAfter: 6.4,
        positionBefore: 12,
        positionAfter: 7,
        optimizationDate: '2024-01-18',
        improvement: 68
      },
      {
        id: '3',
        title: 'Guía completa de SEO con inteligencia artificial',
        url: '/seo-inteligencia-artificial',
        ctrBefore: 5.1,
        ctrAfter: 8.2,
        positionBefore: 6,
        positionAfter: 3,
        optimizationDate: '2024-01-22',
        improvement: 61
      }
    ];

    setMetrics(mockMetrics);
    setArticlePerformance(mockArticlePerformance);
    setIsLoading(false);
  };

  const ctrChartData = {
    labels: metrics.map(m => formatDate(new Date(m.date), currentLanguage as any, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'CTR (%)',
        data: metrics.map(m => m.ctr),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const impressionsClicksData = {
    labels: metrics.map(m => formatDate(new Date(m.date), currentLanguage as any, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: t('seoPerformance.charts.impressions'),
        data: metrics.map(m => m.impressions),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        yAxisID: 'y',
      },
      {
        label: t('seoPerformance.charts.clicks'),
        data: metrics.map(m => m.clicks),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        yAxisID: 'y1',
      },
    ],
  };

  const positionData = {
    labels: metrics.map(m => formatDate(new Date(m.date), currentLanguage as any, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: t('seoPerformance.charts.averagePosition'),
        data: metrics.map(m => m.averagePosition),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const improvementDistribution = {
    labels: ['0-25%', '26-50%', '51-75%', '76-100%'],
    datasets: [
      {
        data: [
          articlePerformance.filter(a => a.improvement <= 25).length,
          articlePerformance.filter(a => a.improvement > 25 && a.improvement <= 50).length,
          articlePerformance.filter(a => a.improvement > 50 && a.improvement <= 75).length,
          articlePerformance.filter(a => a.improvement > 75).length,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
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

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const currentCTR = metrics.length > 0 ? metrics[metrics.length - 1].ctr : 0;
  const initialCTR = metrics.length > 0 ? metrics[0].ctr : 0;
  const ctrImprovement = currentCTR - initialCTR;
  const ctrImprovementPercent = initialCTR > 0 ? (ctrImprovement / initialCTR) * 100 : 0;

  const totalOptimizedArticles = metrics.length > 0 ? metrics[metrics.length - 1].optimizedArticles : 0;
  const averageImprovement = articlePerformance.length > 0
    ? articlePerformance.reduce((sum, article) => sum + article.improvement, 0) / articlePerformance.length
    : 0;

  if (isLoading) {
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('seoPerformance.title')}
          </h1>
          <p className="text-gray-600">
            {t('seoPerformance.subtitle')}
          </p>
        </div>

        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedPeriod === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t(`seoPerformance.periods.${period}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('seoPerformance.metrics.currentCTR')}</p>
              <p className="text-3xl font-bold text-blue-600">{formatPercentage(currentCTR, currentLanguage as any)}</p>
              <p className="text-sm text-green-600">
                +{formatPercentage(ctrImprovementPercent, currentLanguage as any)} vs inicial
              </p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('seoPerformance.metrics.optimizedArticles')}</p>
              <p className="text-3xl font-bold text-green-600">{formatNumber(totalOptimizedArticles, currentLanguage as any)}</p>
              <p className="text-sm text-gray-500">{t('seoPerformance.metrics.totalImplemented')}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('seoPerformance.metrics.averageImprovement')}</p>
              <p className="text-3xl font-bold text-purple-600">{formatPercentage(averageImprovement, currentLanguage as any)}</p>
              <p className="text-sm text-gray-500">{t('seoPerformance.metrics.ctrPerArticle')}</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('seoPerformance.metrics.averagePosition')}</p>
              <p className="text-3xl font-bold text-orange-600">
                {metrics.length > 0 ? formatNumber(metrics[metrics.length - 1].averagePosition, currentLanguage as any, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0'}
              </p>
              <p className="text-sm text-green-600">{t('seoPerformance.metrics.improving')}</p>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('seoPerformance.charts.ctrEvolution')}</h3>
          <Line data={ctrChartData} options={chartOptions} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('seoPerformance.charts.averagePosition')}</h3>
          <Line data={positionData} options={chartOptions} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('seoPerformance.charts.impressionsVsClicks')}</h3>
          <Bar data={impressionsClicksData} options={barChartOptions} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('seoPerformance.charts.improvementDistribution')}</h3>
          <Doughnut data={improvementDistribution} />
        </div>
      </div>

      {/* Article Performance Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{t('seoPerformance.table.title')}</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('seoPerformance.table.article')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('seoPerformance.table.ctrBefore')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('seoPerformance.table.ctrAfter')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('seoPerformance.table.positionBefore')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('seoPerformance.table.positionAfter')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('seoPerformance.table.improvement')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('seoPerformance.table.date')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articlePerformance.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {article.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {article.url}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercentage(article.ctrBefore, currentLanguage as any)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {formatPercentage(article.ctrAfter, currentLanguage as any)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{formatNumber(article.positionBefore, currentLanguage as any)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    #{formatNumber(article.positionAfter, currentLanguage as any)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${article.improvement >= 50
                      ? 'bg-green-100 text-green-800'
                      : article.improvement >= 25
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      +{formatPercentage(article.improvement, currentLanguage as any)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(new Date(article.optimizationDate), currentLanguage as any)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}