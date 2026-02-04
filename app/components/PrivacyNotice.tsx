'use client'

import React, { useState, useEffect } from 'react'
import { consentManagementService, PrivacyNoticeConfig } from '@/app/lib/consent-management'
import { useLocalization } from '@/app/contexts/LocalizationContext'

interface PrivacyNoticeProps {
  className?: string
  showAsModal?: boolean
  onClose?: () => void
}

/**
 * Privacy Notice Component
 * Displays dynamically generated privacy notice based on country-specific requirements
 */
export function PrivacyNotice({
  className = '',
  showAsModal = false,
  onClose
}: PrivacyNoticeProps) {
  const { country } = useLocalization()
  const [privacyNotice, setPrivacyNotice] = useState<PrivacyNoticeConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPrivacyNotice = async () => {
      try {
        setIsLoading(true)
        const notice = consentManagementService.generatePrivacyNotice(country as any)

        if (!notice) {
          throw new Error(`Privacy notice not available for country: ${country}`)
        }

        setPrivacyNotice(notice)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load privacy notice')
      } finally {
        setIsLoading(false)
      }
    }

    loadPrivacyNotice()
  }, [country])

  if (isLoading) {
    return (
      <div className={`${className} ${showAsModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' : ''}`}>
        <div className={`${showAsModal ? 'bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto' : ''}`}>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !privacyNotice) {
    return (
      <div className={`${className} ${showAsModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' : ''}`}>
        <div className={`${showAsModal ? 'bg-white rounded-lg p-6 max-w-2xl' : ''}`}>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar el aviso de privacidad
            </h3>
            <p className="text-gray-600 mb-4">
              {error || 'No se pudo cargar el aviso de privacidad para su región'}
            </p>
            {showAsModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const containerClasses = showAsModal
    ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
    : className

  const contentClasses = showAsModal
    ? 'bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'
    : 'w-full'

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {/* Header */}
        <div className={`${showAsModal ? 'p-6 border-b border-gray-200' : 'mb-6'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {privacyNotice.title}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>Versión: {privacyNotice.version}</span>
                <span>
                  Última actualización: {privacyNotice.lastUpdated.toLocaleDateString(privacyNotice.language)}
                </span>
              </div>
            </div>

            {showAsModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar aviso de privacidad"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={`${showAsModal ? 'flex-1 overflow-y-auto p-6' : ''}`}>
          <div className="prose prose-sm max-w-none">
            {privacyNotice.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <PrivacyNoticeSection
                  key={section.id}
                  section={section}
                />
              ))}
          </div>
        </div>

        {/* Footer */}
        {showAsModal && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Este aviso de privacidad cumple con las regulaciones locales de protección de datos.
              </p>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Entendido
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface PrivacyNoticeSectionProps {
  section: {
    id: string
    title: string
    content: string
    required: boolean
    order: number
  }
}

/**
 * Individual privacy notice section component
 */
function PrivacyNoticeSection({ section }: PrivacyNoticeSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold text-gray-900">
          {section.title}
        </h2>
        {section.required && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Requerido
          </span>
        )}
      </div>

      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
        {section.content}
      </div>
    </div>
  )
}

/**
 * Hook for privacy notice management
 */
export function usePrivacyNotice() {
  const { country } = useLocalization()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openPrivacyNotice = () => setIsModalOpen(true)
  const closePrivacyNotice = () => setIsModalOpen(false)

  const getPrivacyNoticeUrl = () => {
    // Generate URL for standalone privacy notice page
    return `/privacy-notice?country=${country}`
  }

  return {
    isModalOpen,
    openPrivacyNotice,
    closePrivacyNotice,
    getPrivacyNoticeUrl,
    PrivacyNoticeModal: () => (
      <PrivacyNotice
        showAsModal={true}
        onClose={closePrivacyNotice}
      />
    )
  }
}

export default PrivacyNotice
