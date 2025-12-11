'use client'

import { useState, useRef } from 'react'
import { X, Download, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from './ToastProvider'
import { exportPromptsToJSON, importPromptsFromJSON, downloadJSONFile, readJSONFile } from '../utils/promptExport'

interface ExportImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

export default function ExportImportModal({ isOpen, onClose, onImportComplete }: ExportImportModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: boolean; imported: { prompts: number; groups: number; chains: number } } | null>(null)

  if (!isOpen) return null

  const handleExport = async () => {
    if (!user) {
      showToast({ title: 'Debes estar autenticado para exportar prompts', type: 'error' })
      return
    }

    setIsExporting(true)
    try {
      const jsonData = await exportPromptsToJSON(user.id)
      const filename = `prompts-export-${new Date().toISOString().split('T')[0]}.json`
      downloadJSONFile(jsonData, filename)
      showToast({ title: 'Prompts exportados exitosamente', type: 'success' })
    } catch (error) {
      console.error('Export error:', error)
      showToast({ title: 'Error al exportar prompts', type: 'error' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!user) {
      showToast({ title: 'Debes estar autenticado para importar prompts', type: 'error' })
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const jsonData = await readJSONFile(file)
      const result = await importPromptsFromJSON(jsonData, user.id)
      setImportResult(result)
      
      if (result.success) {
        showToast({
          title: `Importación exitosa: ${result.imported.prompts} prompts, ${result.imported.groups} grupos, ${result.imported.chains} cadenas`,
          type: 'success'
        })
        onImportComplete()
      }
    } catch (error) {
      console.error('Import error:', error)
      showToast({ title: 'Error al importar prompts: ' + (error as Error).message, type: 'error' })
    } finally {
      setIsImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Export/Import Prompts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Export Section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Download className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Exportar Prompts</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Descarga todos tus prompts, grupos y cadenas en formato JSON.
            </p>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Exportar
                </>
              )}
            </button>
          </div>

          {/* Import Section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Upload className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Importar Prompts</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Sube un archivo JSON para importar prompts, grupos y cadenas.
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Seleccionar Archivo
                </>
              )}
            </button>

            {/* Import Result */}
            {importResult && (
              <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Importación Exitosa</span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  <div>• {importResult.imported.prompts} prompts importados</div>
                  <div>• {importResult.imported.groups} grupos importados</div>
                  <div>• {importResult.imported.chains} cadenas importadas</div>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Información importante:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Los prompts importados se añadirán a tu colección existente</li>
                  <li>• Se generarán nuevos IDs para evitar conflictos</li>
                  <li>• El archivo debe ser un JSON válido exportado desde esta aplicación</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}