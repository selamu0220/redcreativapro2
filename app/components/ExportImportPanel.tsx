'use client'

import React, { useState, useRef } from 'react'
import { Download, Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { useHistory } from '../hooks/useHistory'
import { useStatistics } from '../hooks/useStatistics'

interface ExportImportPanelProps {
  isOpen: boolean
  onClose: () => void
}

type ExportType = 'history' | 'statistics' | 'all'

const ExportImportPanel: React.FC<ExportImportPanelProps> = ({ isOpen, onClose }) => {
  const { exportHistory, importHistory, getHistoryStats } = useHistory()
  const { exportStatistics, clearStatistics } = useStatistics()
  const [exportType, setExportType] = useState<ExportType>('all')
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleExport = () => {
    try {
      let exportData: any = {
        exportDate: new Date().toISOString(),
        version: '1.0'
      }

      switch (exportType) {
        case 'history':
          const historyData = JSON.parse(exportHistory())
          exportData = { ...exportData, ...historyData }
          break
        case 'statistics':
          exportData.statistics = JSON.parse(exportStatistics())
          break
        case 'all':
          const allHistoryData = JSON.parse(exportHistory())
          exportData = { 
            ...exportData, 
            ...allHistoryData,
            statistics: JSON.parse(exportStatistics())
          }
          break
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `prompt-manager-${exportType}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setNotification({ type: 'success', message: `${exportType} data exported successfully!` })
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to export data' })
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string
        const importData = JSON.parse(jsonData)

        let successCount = 0
        let errors: string[] = []

        // Import history if present
        if (importData.history) {
          const historyResult = importHistory(JSON.stringify(importData), importMode === 'merge')
          if (historyResult.success) {
            successCount += historyResult.imported || 0
          } else {
            errors.push(`History import failed: ${historyResult.error}`)
          }
        }

        // Import statistics if present (note: statistics import would need to be implemented)
        if (importData.statistics) {
          // This would require implementing importStatistics in useStatistics hook
          console.log('Statistics import not yet implemented')
        }

        if (errors.length === 0) {
          setNotification({ 
            type: 'success', 
            message: `Successfully imported ${successCount} items!` 
          })
        } else {
          setNotification({ 
            type: 'error', 
            message: `Import completed with errors: ${errors.join(', ')}` 
          })
        }
      } catch (error) {
        setNotification({ type: 'error', message: 'Invalid JSON file format' })
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const historyStats = getHistoryStats()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Export & Import Data
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Notification */}
          {notification && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              notification.type === 'success' 
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-auto text-current opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Data Overview */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Current Data Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total History Items:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {historyStats.totalItems}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Favorite Items:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {historyStats.favoriteItems}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Usage:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {historyStats.usageStats.totalUsage}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Average Usage:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {historyStats.usageStats.averageUsage.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Data
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Type
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Data (History + Statistics)', desc: 'Complete backup of all your data' },
                    { value: 'history', label: 'History Only', desc: 'Prompts usage history and favorites' },
                    { value: 'statistics', label: 'Statistics Only', desc: 'Usage analytics and metrics' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="exportType"
                        value={option.value}
                        checked={exportType === option.value}
                        onChange={(e) => setExportType(e.target.value as ExportType)}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleExport}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export {exportType === 'all' ? 'All Data' : exportType === 'history' ? 'History' : 'Statistics'}
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Data
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Import Mode
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'merge', label: 'Merge with existing data', desc: 'Add imported items to current data' },
                    { value: 'replace', label: 'Replace existing data', desc: 'Replace all current data with imported data' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value={option.value}
                        checked={importMode === option.value}
                        onChange={(e) => setImportMode(e.target.value as 'replace' | 'merge')}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Select JSON File to Import
                </button>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                <strong>Warning:</strong> Importing data will modify your current data. 
                Make sure to export your current data as a backup before importing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportImportPanel
