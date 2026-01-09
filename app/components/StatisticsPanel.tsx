'use client'

import React, { useState } from 'react'
import { BarChart3, TrendingUp, Clock, Heart, Download, Trash2, Calendar, Users, Target } from 'lucide-react'
import { useStatistics, UsageStatistics } from '../hooks/useStatistics'
import Tooltip from './Tooltip'
import { Button } from './ui/button'
import { useTranslation } from '../lib/language/context'
import { formatNumber, formatDuration } from '../lib/localization'

interface StatisticsPanelProps {
  className?: string
}

type ViewMode = 'overview' | 'usage' | 'favorites' | 'time'

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ className = '' }) => {
  const { statistics, exportStatistics, clearStatistics } = useStatistics()
  const { t, currentLocale: currentLanguage } = useTranslation('dashboard')
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [showExportModal, setShowExportModal] = useState(false)

  const handleExport = () => {
    const data = exportStatistics()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompt-statistics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowExportModal(false)
  }

  const handleClearStats = () => {
    if (confirm(t('statistics.clearConfirm'))) {
      clearStatistics()
    }
  }



  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'overview': return <BarChart3 className="w-4 h-4" />
      case 'usage': return <TrendingUp className="w-4 h-4" />
      case 'favorites': return <Heart className="w-4 h-4" />
      case 'time': return <Clock className="w-4 h-4" />
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{t('statistics.totalUsage')}</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {statistics.totalUsage.toLocaleString()}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-900 dark:text-red-100">{t('statistics.totalFavorites')}</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {statistics.favoriteStats.totalFavorites}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">{t('statistics.averageSession')}</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {formatDuration(statistics.timeStats.averageSessionLength, currentLanguage as any)}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">{t('statistics.mostActiveDay')}</span>
          </div>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
            {statistics.timeStats.mostActiveDay}
          </p>
        </div>
      </div>

      {/* Top Items */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>{t('statistics.mostUsedItems')}</span>
        </h4>
        <div className="space-y-2">
          {statistics.topItems.slice(0, 5).map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                  #{index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                  {item.type}
                </span>
              </div>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {item.count} {t('statistics.uses')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('statistics.usageByType')}</h4>
          <div className="space-y-2">
            {statistics.typeUsage.map((type) => (
              <div key={type.type} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{type.type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(type.count / statistics.totalUsage) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {type.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('statistics.popularCategories')}</h4>
          <div className="space-y-2">
            {statistics.categoryUsage.slice(0, 5).map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {category.category}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(category.count / statistics.totalUsage) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {category.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderUsageView = () => (
    <div className="space-y-6">
      {/* Daily Usage Chart */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('statistics.dailyUsage')}</h4>
        <div className="flex items-end space-x-1 h-32">
          {statistics.dailyUsage.map((day, index) => {
            const maxCount = Math.max(...statistics.dailyUsage.map(d => d.count))
            const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
            return (
              <Tooltip key={day.date} content={`${day.date}: ${day.count} ${t('statistics.uses')}`} position="top">
                <div className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '2px' }}
                  />
                  {index % 5 === 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 transform rotate-45 origin-left">
                      {new Date(day.date).getDate()}
                    </span>
                  )}
                </div>
              </Tooltip>
            )
          })}
        </div>
      </div>

      {/* Weekly Usage */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('statistics.weeklyUsage')}</h4>
        <div className="space-y-2">
          {statistics.weeklyUsage.slice(-8).map((week) => (
            <div key={week.week} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('statistics.week')} {week.week}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full"
                    style={{
                      width: `${Math.max((week.count / Math.max(...statistics.weeklyUsage.map(w => w.count))) * 100, 2)}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                  {week.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderFavoritesView = () => (
    <div className="space-y-6">
      {/* Favorites Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">{t('statistics.favoritesByType')}</h4>
          <div className="space-y-2">
            {statistics.favoriteStats.favoritesByType.map((type) => (
              <div key={type.type} className="flex items-center justify-between">
                <span className="text-sm text-red-700 dark:text-red-300">{type.type}</span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  {type.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-pink-900 dark:text-pink-100 mb-3">{t('statistics.favoritesByCategory')}</h4>
          <div className="space-y-2">
            {statistics.favoriteStats.favoritesByCategory.slice(0, 5).map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <span className="text-sm text-pink-700 dark:text-pink-300 truncate">
                  {category.category}
                </span>
                <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Favorite Rate */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('statistics.favoriteRate')}</h4>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>{t('statistics.favoriteRateDescription')}</span>
              <span>{statistics.favoriteStats.totalFavorites} / {statistics.totalUsage}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-red-400 to-pink-500 h-3 rounded-full"
                style={{
                  width: `${statistics.totalUsage > 0 ? (statistics.favoriteStats.totalFavorites / statistics.totalUsage) * 100 : 0}%`
                }}
              />
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {statistics.totalUsage > 0 ? Math.round((statistics.favoriteStats.totalFavorites / statistics.totalUsage) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTimeView = () => (
    <div className="space-y-6">
      {/* Time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
          <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">{t('statistics.mostActiveHour')}</h4>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {statistics.timeStats.mostActiveHour}:00
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <Calendar className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">{t('statistics.mostActiveDay')}</h4>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {statistics.timeStats.mostActiveDay}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
          <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">{t('statistics.averageSession')}</h4>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {formatDuration(statistics.timeStats.averageSessionLength, currentLanguage as any)}
          </p>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('statistics.monthlyTrend')}</h4>
        <div className="space-y-2">
          {statistics.monthlyUsage.slice(-6).map((month) => (
            <div key={month.month} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">{month.month}</span>
              <div className="flex items-center space-x-2">
                <div className="w-40 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full"
                    style={{
                      width: `${Math.max((month.count / Math.max(...statistics.monthlyUsage.map(m => m.count))) * 100, 2)}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                  {month.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('statistics.usageStats')}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip content={t('statistics.export')} position="bottom">
              <button
                onClick={() => setShowExportModal(true)}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content={t('statistics.clear')} position="bottom">
              <button
                onClick={handleClearStats}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {[
            { mode: 'overview' as ViewMode, label: t('statistics.overview') },
            { mode: 'usage' as ViewMode, label: t('statistics.usage') },
            { mode: 'favorites' as ViewMode, label: t('statistics.favorites') },
            { mode: 'time' as ViewMode, label: t('statistics.time') }
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === mode
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {getViewModeIcon(mode)}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'usage' && renderUsageView()}
        {viewMode === 'favorites' && renderFavoritesView()}
        {viewMode === 'time' && renderTimeView()}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('statistics.exportModal.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('statistics.exportModal.description')}
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={handleExport}
                className="flex-1"
              >
                {t('statistics.exportModal.download')}
              </Button>
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                {t('statistics.exportModal.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatisticsPanel