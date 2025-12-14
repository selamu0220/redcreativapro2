'use client'

import React, { useState } from 'react'
import { useLocalization } from '../contexts/LocalizationContext'
import { CurrencyCode } from '@/app/lib/geo-detection'
import { currencyService } from '@/lib/currency-service'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { 
  ChevronDown, 
  DollarSign, 
  TrendingUp,
  Globe,
  Check
} from 'lucide-react'

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: CurrencyCode) => void
  showExchangeRates?: boolean
  className?: string
}

interface CurrencyInfo {
  code: CurrencyCode
  name: string
  symbol: string
  flag: string
  countries: string[]
  exchangeRate?: number
  trend?: 'up' | 'down' | 'stable'
}

/**
 * Currency Selector Component
 * Allows manual currency selection with exchange rate information
 */
export function CurrencySelector({ 
  onCurrencyChange,
  showExchangeRates = true,
  className = ''
}: CurrencySelectorProps) {
  const { currency, country, formatCurrency } = useLocalization()
  const [isLoading, setIsLoading] = useState(false)
  const [exchangeRates, setExchangeRates] = useState<Record<CurrencyCode, number>>({})

  // Supported currencies with metadata
  const supportedCurrencies: CurrencyInfo[] = [
    {
      code: 'USD',
      name: 'Dólar Estadounidense',
      symbol: '$',
      flag: '🇺🇸',
      countries: ['Estados Unidos']
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      flag: '🇪🇺',
      countries: ['España', 'Unión Europea']
    },
    {
      code: 'MXN',
      name: 'Peso Mexicano',
      symbol: '$',
      flag: '🇲🇽',
      countries: ['México']
    },
    {
      code: 'COP',
      name: 'Peso Colombiano',
      symbol: '$',
      flag: '🇨🇴',
      countries: ['Colombia']
    },
    {
      code: 'ARS',
      name: 'Peso Argentino',
      symbol: '$',
      flag: '🇦🇷',
      countries: ['Argentina']
    },
    {
      code: 'BRL',
      name: 'Real Brasileño',
      symbol: 'R$',
      flag: '🇧🇷',
      countries: ['Brasil']
    },
    {
      code: 'CLP',
      name: 'Peso Chileno',
      symbol: '$',
      flag: '🇨🇱',
      countries: ['Chile']
    },
    {
      code: 'PEN',
      name: 'Sol Peruano',
      symbol: 'S/',
      flag: '🇵🇪',
      countries: ['Perú']
    }
  ]

  const currentCurrencyInfo = supportedCurrencies.find(c => c.code === currency)

  const handleCurrencySelect = async (newCurrency: CurrencyCode) => {
    if (newCurrency === currency) return

    setIsLoading(true)
    try {
      // Load exchange rate for the new currency
      if (showExchangeRates && newCurrency !== 'USD') {
        const rate = await currencyService.getExchangeRate('USD', newCurrency)
        setExchangeRates(prev => ({
          ...prev,
          [newCurrency]: rate
        }))
      }

      // Call the callback
      onCurrencyChange?.(newCurrency)
    } catch (error) {
      console.error('Error changing currency:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadExchangeRates = async () => {
    if (!showExchangeRates) return

    setIsLoading(true)
    try {
      const rates: Record<CurrencyCode, number> = {}
      
      // Load exchange rates for all currencies (using USD as base)
      for (const currencyInfo of supportedCurrencies) {
        if (currencyInfo.code !== 'USD') {
          try {
            const rate = await currencyService.getExchangeRate('USD', currencyInfo.code)
            rates[currencyInfo.code] = rate
          } catch (error) {
            console.error(`Error loading rate for ${currencyInfo.code}:`, error)
          }
        }
      }
      
      setExchangeRates(rates)
    } catch (error) {
      console.error('Error loading exchange rates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load exchange rates on mount
  React.useEffect(() => {
    if (showExchangeRates) {
      loadExchangeRates()
    }
  }, [showExchangeRates])

  const formatExchangeRate = (rate: number, currencyCode: CurrencyCode): string => {
    const currencyInfo = supportedCurrencies.find(c => c.code === currencyCode)
    return `1 USD = ${rate.toFixed(2)} ${currencyInfo?.symbol || currencyCode}`
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
      case 'stable':
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />
      default:
        return null
    }
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 min-w-[140px]"
            disabled={isLoading}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentCurrencyInfo?.flag}</span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{currency}</span>
                <span className="text-xs text-gray-500">{currentCurrencyInfo?.symbol}</span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Seleccionar Moneda
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Current Selection */}
          <div className="px-2 py-1">
            <Badge variant="secondary" className="text-xs">
              Actual: {currentCurrencyInfo?.name} ({currency})
            </Badge>
          </div>
          <DropdownMenuSeparator />
          
          {/* Currency Options */}
          {supportedCurrencies.map((currencyInfo) => {
            const isSelected = currencyInfo.code === currency
            const exchangeRate = exchangeRates[currencyInfo.code]
            
            return (
              <DropdownMenuItem
                key={currencyInfo.code}
                onClick={() => handleCurrencySelect(currencyInfo.code)}
                className="flex items-center justify-between p-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{currencyInfo.flag}</span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currencyInfo.code}</span>
                      {isSelected && <Check className="h-3 w-3 text-green-500" />}
                    </div>
                    <span className="text-xs text-gray-600">{currencyInfo.name}</span>
                    <span className="text-xs text-gray-500">
                      {currencyInfo.countries.join(', ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-mono">{currencyInfo.symbol}</span>
                  </div>
                  
                  {showExchangeRates && exchangeRate && currencyInfo.code !== 'USD' && (
                    <div className="flex items-center gap-1">
                      {getTrendIcon(currencyInfo.trend)}
                      <span className="text-xs text-gray-500 font-mono">
                        {formatExchangeRate(exchangeRate, currencyInfo.code)}
                      </span>
                    </div>
                  )}
                  
                  {currencyInfo.code === 'USD' && showExchangeRates && (
                    <span className="text-xs text-gray-500">Base</span>
                  )}
                </div>
              </DropdownMenuItem>
            )
          })}
          
          <DropdownMenuSeparator />
          
          {/* Footer Info */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3" />
              <span>Tipos de cambio actualizados en tiempo real</span>
            </div>
            {showExchangeRates && (
              <div className="text-xs text-gray-400 mt-1">
                Los precios se convertirán automáticamente
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default CurrencySelector