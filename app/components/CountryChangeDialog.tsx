'use client'

import React, { useState } from 'react'
import { CountryCode, getCountryDisplayName } from '@/app/lib/geo-detection'
import { useLocalization } from '@/app/contexts/LocalizationContext'
import { useLegalCompliance } from '@/app/contexts/LocalizationContext'
import { LanguageCode } from '@/app/lib/language/config'

interface CountryChangeDialogProps {
  isOpen: boolean
  onClose: () => void
  newCountry: CountryCode
  onConfirm: () => void
}

/**
 * Country Change Confirmation Dialog
 * Shows legal implications and consent requirements when changing country
 */
export function CountryChangeDialog({
  isOpen,
  onClose,
  newCountry,
  onConfirm
}: CountryChangeDialogProps) {
  const { country, language } = useLocalization()
  const { requirements } = useLegalCompliance()
  const [hasReadImplications, setHasReadImplications] = useState(false)

  if (!isOpen) return null

  const currentCountryName = getCountryDisplayName(country as CountryCode, language as any)
  const newCountryName = getCountryDisplayName(newCountry as CountryCode, language as any)

  // Get legal implications for the new country
  const getLegalImplications = (countryCode: CountryCode) => {
    const implications: Record<CountryCode, string[]> = {
      BR: [
        'Se aplicará la Ley General de Protección de Datos (LGPD) de Brasil',
        'Los precios se mostrarán en Reales Brasileños (BRL)',
        'Métodos de pago: PIX, Boleto, Tarjetas de crédito'
      ],
      MX: [
        'Se aplicará la Ley Federal de Protección de Datos Personales (LFPDPPP)',
        'Los precios se mostrarán en Pesos Mexicanos (MXN)',
        'Métodos de pago: OXXO, SPEI, Tarjetas de crédito'
      ],
      CO: [
        'Se aplicará la Ley 1581 de 2012 de Colombia',
        'Los precios se mostrarán en Pesos Colombianos (COP)',
        'Métodos de pago: PSE, Efecty, Tarjetas de crédito'
      ],
      AR: [
        'Se aplicará la Ley de Protección de Datos Personales (PDPA)',
        'Los precios se mostrarán en Pesos Argentinos (ARS)',
        'Métodos de pago: Mercado Pago, Rapipago, Tarjetas de crédito'
      ],
      CL: [
        'Se aplicarán las regulaciones de protección de datos de Chile',
        'Los precios se mostrarán en Pesos Chilenos (CLP)',
        'Métodos de pago: Webpay, Tarjetas de crédito'
      ],
      PE: [
        'Se aplicarán las regulaciones de protección de datos de Perú',
        'Los precios se mostrarán en Soles Peruanos (PEN)',
        'Métodos de pago: PagoEfectivo, Tarjetas de crédito'
      ],
      EC: [
        'Se aplicarán las regulaciones de protección de datos de Ecuador',
        'Los precios se mostrarán en Dólares Estadounidenses (USD)',
        'Métodos de pago: Tarjetas de crédito, Transferencias bancarias'
      ],
      US: [
        'Se aplicarán las regulaciones de protección de datos de Estados Unidos',
        'Los precios se mostrarán en Dólares Estadounidenses (USD)',
        'Métodos de pago: Tarjetas de crédito, PayPal'
      ],
      UNKNOWN: []
    }

    return implications[countryCode] || []
  }

  const newCountryImplications = getLegalImplications(newCountry)

  const handleConfirm = () => {
    if (!hasReadImplications) return
    onConfirm()
    onClose()
    setHasReadImplications(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {language === 'es' ? 'Cambiar País' :
                language === 'pt' ? 'Alterar País' :
                  'Change Country'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'es' ?
                `¿Deseas cambiar tu ubicación de ${currentCountryName} a ${newCountryName}?` :
                language === 'pt' ?
                  `Deseja alterar sua localização de ${currentCountryName} para ${newCountryName}?` :
                  `Do you want to change your location from ${currentCountryName} to ${newCountryName}?`
              }
            </p>
          </div>

          {/* Legal Implications */}
          {newCountryImplications.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {language === 'es' ? 'Implicaciones del cambio:' :
                  language === 'pt' ? 'Implicações da mudança:' :
                    'Change implications:'}
              </h3>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                {newCountryImplications.map((implication, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{implication}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Consent Checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="read-implications"
              checked={hasReadImplications}
              onChange={(e) => setHasReadImplications(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="read-implications" className="text-sm text-gray-600 dark:text-gray-300">
              {language === 'es' ?
                'He leído y entiendo las implicaciones de cambiar mi ubicación. Acepto que se apliquen las regulaciones y métodos de pago del nuevo país.' :
                language === 'pt' ?
                  'Li e entendo as implicações de alterar minha localização. Aceito que se apliquem as regulamentações e métodos de pagamento do novo país.' :
                  'I have read and understand the implications of changing my location. I accept that the regulations and payment methods of the new country will apply.'
              }
            </label>
          </div>

          {/* Warning for data implications */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {language === 'es' ?
                  'Este cambio afectará cómo procesamos tus datos personales y los métodos de pago disponibles.' :
                  language === 'pt' ?
                    'Esta mudança afetará como processamos seus dados pessoais e os métodos de pagamento disponíveis.' :
                    'This change will affect how we process your personal data and available payment methods.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {language === 'es' ? 'Cancelar' :
              language === 'pt' ? 'Cancelar' :
                'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasReadImplications}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {language === 'es' ? 'Confirmar Cambio' :
              language === 'pt' ? 'Confirmar Mudança' :
                'Confirm Change'}
          </button>
        </div>
      </div>
    </div>
  )
}