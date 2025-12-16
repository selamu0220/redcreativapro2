'use client'

import React, { useState, useEffect } from 'react'
import { useLocalization } from '../contexts/LocalizationContext'
import { currencyService } from '@/lib/currency-service'
import { Badge } from './ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import {
  Info,
  TrendingUp,
  Clock,
  DollarSign,
  RefreshCw
} from 'lucide-react'

interface PricingTooltipProps {
  originalAmount: number
  originalCurrency: string
  children: React.ReactNode
  showConversionDetails?: boolean
  className?: string
}

interface ConversionDetails {
  convertedAmount: number
  exchangeRate: number
  lastUpdated: Date
  savings?: number
  trend?: 'up' | 'down' | 'stable'
}

/**
 * Pricing Tooltip Component
 * Shows currency conversion details and exchange rate information
 */
export function PricingTooltip({
  originalAmount,
  originalCurrency,
  children,
  showConversionDetails = true,
  className = ''
}: PricingTooltipProps) {
  const { currency, formatCurrency, country } = useLocalization()
  const [conversionDetails, setConversionDetails] = useState<ConversionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currency !== originalCurrency && showConversionDetails) {
      loadConversionDetails()
    }
  }, [currency, originalCurrency, originalAmount, showConversionDetails])

  const loadConversionDetails = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get converted amount
      const convertedAmount = await currencyService.convertPrice(
        originalAmount,
        originalCurrency as any,
        currency
      )

      // Get exchange rate
      const { rate } = await currencyService.getExchangeRate(
        originalCurrency as any,
        currency
      )

      // Calculate potential savings (if applicable)
      const savings = calculateSavings(originalAmount, convertedAmount, originalCurrency, currency)

      // Get trend (simulated for now)
      const trend = getTrendForCurrency(originalCurrency, currency)

      setConversionDetails({
        convertedAmount,
        exchangeRate: rate,
        lastUpdated: new Date(),
        savings,
        trend
      })
    } catch (error) {
      console.error('Error loading conversion details:', error)
      setError('Error al cargar detalles de conversión')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateSavings = (
    originalAmount: number,
    convertedAmount: number,
    fromCurrency: string,
    toCurrency: string
  ): number | undefined => {
    // Calculate savings based on regional pricing advantages
    // This is a simplified calculation - in reality, you'd have more complex logic
    const regionalDiscounts: Record<string, Record<string, number>> = {
      'EUR': {
        'MXN': 0.15, // 15% savings due to regional pricing
        'COP': 0.20, // 20% savings
        'ARS': 0.25, // 25% savings
        'BRL': 0.10, // 10% savings
        'CLP': 0.18, // 18% savings
        'PEN': 0.22, // 22% savings
      }
    }

    const discountRate = regionalDiscounts[fromCurrency]?.[toCurrency]
    if (discountRate) {
      return originalAmount * discountRate
    }

    return undefined
  }

  const getTrendForCurrency = (fromCurrency: string, toCurrency: string): 'up' | 'down' | 'stable' => {
    // Simulated trend data - in reality, you'd get this from your exchange rate API
    const trends: Record<string, 'up' | 'down' | 'stable'> = {
      [`${fromCurrency}_${toCurrency}`]: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
    }

    return trends[`${fromCurrency}_${toCurrency}`] || 'stable'
  }

  const formatExchangeRate = (rate: number, fromCurrency: string, toCurrency: string): string => {
    // Defensive check to avoid runtime errors if rate is undefined/null
    const safeRate = typeof rate === 'number' ? rate : 0
    return `1 ${fromCurrency} = ${safeRate.toFixed(4)} ${toCurrency}`
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
      case 'stable':
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />
    }
  }

  const getTrendText = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'Subiendo'
      case 'down':
        return 'Bajando'
      case 'stable':
        return 'Estable'
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'stable':
        return 'text-gray-600'
    }
  }

  // If same currency, no tooltip needed
  if (currency === originalCurrency || !showConversionDetails) {
    return <>{children}</>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`relative inline-flex items-center gap-1 ${className}`}>
            {children}
            <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4" side="top">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Detalles de Conversión</h4>
              {isLoading && (
                <RefreshCw className="h-3 w-3 animate-spin text-gray-400" />
              )}
            </div>

            {error ? (
              <div className="text-xs text-red-600">{error}</div>
            ) : conversionDetails ? (
              <>
                {/* Converted Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Precio original:</span>
                    <span className="text-xs font-medium">
                      {originalAmount.toFixed(2)} {originalCurrency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Precio local:</span>
                    <span className="text-xs font-medium text-blue-600">
                      {formatCurrency(conversionDetails.convertedAmount)}
                    </span>
                  </div>
                </div>

                {/* Exchange Rate */}
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Tipo de cambio:</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(conversionDetails.trend || 'stable')}
                      <span className={`text-xs ${getTrendColor(conversionDetails.trend || 'stable')}`}>
                        {getTrendText(conversionDetails.trend || 'stable')}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-700">
                    {formatExchangeRate(conversionDetails.exchangeRate, originalCurrency, currency)}
                  </div>
                </div>

                {/* Savings */}
                {conversionDetails.savings && conversionDetails.savings > 0 && (
                  <div className="border-t pt-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Ahorro Regional
                      </Badge>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Ahorras aproximadamente {formatCurrency(conversionDetails.savings)}
                      por precios regionales
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                <div className="border-t pt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Actualizado: {conversionDetails.lastUpdated.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Regional Context */}
                <div className="border-t pt-2">
                  <div className="text-xs text-blue-600">
                    💡 Precios optimizados para {getCountryName(country)}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-500">Cargando detalles...</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function getCountryName(country: string): string {
  const countryNames: Record<string, string> = {
    MX: 'México',
    CO: 'Colombia',
    BR: 'Brasil',
    AR: 'Argentina',
    CL: 'Chile',
    PE: 'Perú',
    EC: 'Ecuador',
    US: 'Estados Unidos'
  }

  return countryNames[country] || country
}

export default PricingTooltip