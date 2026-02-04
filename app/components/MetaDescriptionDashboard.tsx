'use client';

import { useState, useEffect } from 'react';
import { MetaDescriptionOptimizer, OptimizedMetaDescription } from '@/lib/seo-optimization';
import { useTranslation } from '@/app/lib/language/context';
import { formatDate, formatNumber } from '@/app/lib/localization';

interface Article {
  id: string;
  title: string;
  currentMetaDescription: string;
  primaryKeyword: string;
  category: string;
  url: string;
  ctr?: number;
  impressions?: number;
}

export default function MetaDescriptionDashboard() {
  const { t, currentLocale: currentLanguage } = useTranslation('dashboard');
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [optimizedResult, setOptimizedResult] = useState<OptimizedMetaDescription | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizer] = useState(new MetaDescriptionOptimizer());

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    // Simulated data - replace with actual API call
    const mockArticles: Article[] = [
      {
        id: '1',
        title: 'Cómo usar ChatGPT para escribir contenido de calidad',
        currentMetaDescription: 'Aprende a usar ChatGPT para crear contenido de alta calidad para tu blog o sitio web.',
        primaryKeyword: 'ChatGPT para escribir',
        category: 'ai',
        url: '/chatgpt-escribir-contenido',
        ctr: 4.2,
        impressions: 1250
      },
      {
        id: '2',
        title: 'Las mejores herramientas de IA para escritores',
        currentMetaDescription: 'Descubre las herramientas de inteligencia artificial más útiles para escritores y creadores de contenido.',
        primaryKeyword: 'herramientas IA escritores',
        category: 'tools',
        url: '/herramientas-ia-escritores',
        ctr: 3.8,
        impressions: 890
      }
    ];
    setArticles(mockArticles);
  };

  const optimizeMetaDescription = async (article: Article) => {
    setIsOptimizing(true);
    setSelectedArticle(article);

    try {
      // Simulate content extraction - replace with actual content
      const mockContent = `${article.title}. Este artículo explica en detalle cómo ${article.primaryKeyword} puede ayudarte a mejorar tu productividad y crear contenido de mayor calidad. Incluye ejemplos prácticos, consejos avanzados y las mejores prácticas del sector.`;

      const result = optimizer.generateOptimized(
        mockContent,
        article.primaryKeyword,
        article.category as any
      );

      setOptimizedResult(result);
    } catch (error) {
      console.error('Error optimizing meta description:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const analyzeCurrentDescription = (article: Article) => {
    return optimizer.analyzeExistingDescription(
      article.currentMetaDescription,
      article.primaryKeyword
    );
  };

  const applyOptimization = async (articleId: string, newDescription: string) => {
    // Update article with new meta description
    setArticles(prev => prev.map(article =>
      article.id === articleId
        ? { ...article, currentMetaDescription: newDescription }
        : article
    ));

    // Here you would make an API call to update the actual article
    console.log(`Updating article ${articleId} with new meta description:`, newDescription);

    setOptimizedResult(null);
    setSelectedArticle(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('metaDescriptionOptimizer.scoreLabels.excellent');
    if (score >= 60) return t('metaDescriptionOptimizer.scoreLabels.good');
    if (score >= 40) return t('metaDescriptionOptimizer.scoreLabels.regular');
    return t('metaDescriptionOptimizer.scoreLabels.needsImprovement');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('metaDescriptionOptimizer.title')}
        </h1>
        <p className="text-gray-600">
          {t('metaDescriptionOptimizer.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Articles List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">{t('metaDescriptionOptimizer.articles')}</h2>

          <div className="space-y-4">
            {articles.map((article) => {
              const analysis = analyzeCurrentDescription(article);

              return (
                <div key={article.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 flex-1">
                      {article.title}
                    </h3>
                    <div className="ml-4 text-right">
                      <div className={`text-sm font-medium ${getScoreColor(analysis.score)}`}>
                        {analysis.score}/100
                      </div>
                      <div className="text-xs text-gray-500">
                        {getScoreLabel(analysis.score)}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <strong>{t('metaDescriptionOptimizer.keyword')}:</strong> {article.primaryKeyword}
                  </div>

                  <div className="text-sm text-gray-700 mb-3 bg-gray-100 p-2 rounded">
                    {article.currentMetaDescription}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                    <span>CTR: {formatNumber(article.ctr || 0, currentLanguage as any, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
                    <span>{t('seoPerformance.charts.impressions')}: {formatNumber(article.impressions || 0, currentLanguage as any)}</span>
                    <span>{formatNumber(article.currentMetaDescription.length, currentLanguage as any)} {t('metaDescriptionOptimizer.characters')}</span>
                  </div>

                  {analysis.issues.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-red-600 mb-1">{t('metaDescriptionOptimizer.problems')}:</div>
                      <ul className="text-xs text-red-500 space-y-1">
                        {analysis.issues.map((issue, idx) => (
                          <li key={idx}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => optimizeMetaDescription(article)}
                    disabled={isOptimizing}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {isOptimizing && selectedArticle?.id === article.id
                      ? t('metaDescriptionOptimizer.optimizing')
                      : t('metaDescriptionOptimizer.optimizeButton')
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optimization Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">{t('metaDescriptionOptimizer.optimizationResult')}</h2>

          {!optimizedResult ? (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-4">🎯</div>
              <p>{t('metaDescriptionOptimizer.selectArticle')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{t('metaDescriptionOptimizer.selectedArticle')}</h3>
                <p className="text-sm text-gray-600">{selectedArticle?.title}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">{t('metaDescriptionOptimizer.optimizedDescription')}</h3>
                  <div className={`text-lg font-bold ${getScoreColor(optimizedResult.score)}`}>
                    {formatNumber(optimizedResult.score, currentLanguage as any)}/100
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-gray-800">{optimizedResult.description}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatNumber(optimizedResult.length, currentLanguage as any)} {t('metaDescriptionOptimizer.characters')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{t('metaDescriptionOptimizer.emojisUsed')}</h4>
                  <div className="flex space-x-2">
                    {optimizedResult.emojis.map((emoji, idx) => (
                      <span key={idx} className="text-2xl">{emoji}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{t('metaDescriptionOptimizer.actionWords')}</h4>
                  <div className="flex flex-wrap gap-1">
                    {optimizedResult.actionWords.map((word, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">{t('metaDescriptionOptimizer.detectedKeywords')}</h4>
                <div className="flex flex-wrap gap-1">
                  {optimizedResult.keywords.map((keyword, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => selectedArticle && applyOptimization(selectedArticle.id, optimizedResult.description)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {t('metaDescriptionOptimizer.applyOptimization')}
                </button>
                <button
                  type="button"
                  onClick={() => selectedArticle && optimizeMetaDescription(selectedArticle)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  {t('metaDescriptionOptimizer.generateNew')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
