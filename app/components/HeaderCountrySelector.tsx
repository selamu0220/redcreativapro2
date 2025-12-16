'use client'

import React, { useState } from 'react'
import { useLocalization } from '../contexts/LocalizationContext'
import { CountryCode } from '@/app/lib/geo-detection'
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
  Globe, 
  MapPin, 
  Check,
  ChevronDown,
  Wifi,
  WifiOff
} from 'lucide-react'

interface HeaderCountrySelectorProps {
  className?: string
  compact?: boolean
}

interface CountryInfo {
  code: CountryCode
  name: string
  flag: string
  currency: string
  language: string
  region: string
}

/**
 * Header Country Selector Component
 * Compact country selector for header/navigation use
 */
export function HeaderCountrySelector({ 
  className = '',
  compact = false
}: HeaderCountrySelectorProps) {
  const { 
    country, 
    currency, 
    language, 
    setManualCountry, 
    isLoading, 
    error,
    confidence,
    source
  } = useLocalization()
  
  const [isChanging, setIsChanging] = useState(false)

  // Supported countries with metadata
  const supportedCountries: CountryInfo[] = [
    {
      code: 'MX',
      name: 'México',
      flag: '🇲🇽',
      currency: 'MXN',
      language: 'es',
      region: 'América del Norte'
    },
    {
      code: 'CO',
      name: 'Colombia',
      flag: '🇨🇴',
      currency: 'COP',
      language: 'es',
      region: 'América del Sur'
    },
    {
      code: 'AR',
      name: 'Argentina',
      flag: '🇦🇷',
      currency: 'ARS',
      language: 'es',
      region: 'América del Sur'
    },
    {
      code: 'BR',
      name: 'Brasil',
      flag: '🇧🇷',
      currency: 'BRL',
      language: 'pt',
      region: 'América del Sur'
    },
    {
      code: 'CL',
      name: 'Chile',
      flag: '🇨🇱',
      currency: 'CLP',
      language: 'es',
      region: 'América del Sur'
    },
    {
      code: 'PE',
      name: 'Perú',
      flag: '🇵🇪',
      currency: 'PEN',
      language: 'es',
      region: 'América del Sur'
    },
    {
      code: 'EC',
      name: 'Ecuador',
      flag: '🇪🇨',
      currency: 'USD',
      language: 'es',
      region: 'América del Sur'
    },
    {
      code: 'US',
      name: 'Estados Unidos',
      flag: '🇺🇸',
      currency: 'USD',
      language: 'en',
      region: 'América del Norte'
    }
  ]

  const currentCountryInfo = supportedCountries.find(c => c.code === country)

  const handleCountrySelect = async (newCountry: CountryCode) => {
    if (newCountry === country) return

    setIsChanging(true)
    try {
      await setManualCountry(newCountry)
    } catch (error) {
      console.error('Error changing country:', error)
    } finally {
      setIsChanging(false)
    }
  }

  const getDetectionStatusIcon = () => {
    if (error) return <WifiOff className="h-3 w-3 text-red-500" />
    if (source === 'manual') return <MapPin className="h-3 w-3 text-blue-500" />
    if (confidence > 80) return <Wifi className="h-3 w-3 text-green-500" />
    return <Wifi className="h-3 w-3 text-yellow-500" />
  }

  const getDetectionStatusText = () => {
    if (error) return 'Error de detección'
    if (source === 'manual') return 'Selección manual'
    if (confidence > 80) return 'Detección automática'
    return 'Detección aproximada'
  }

  const getConfidenceColor = () => {
    if (confidence > 80) return 'text-green-600'
    if (confidence > 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className={`flex items-center gap-1 h-8 px-2 ${className}`}
            disabled={isLoading || isChanging}
          >
            <span className="text-sm">{currentCountryInfo?.flag}</span>
            <span className="text-xs font-medium">{country}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-48" align="end">
          <DropdownMenuLabel className="text-xs">País/Región</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {supportedCountries.map((countryInfo) => {
            const isSelected = countryInfo.code === country
            
            return (
              <DropdownMenuItem
                key={countryInfo.code}
                onClick={() => handleCountrySelect(countryInfo.code)}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span>{countryInfo.flag}</span>
                  <span>{countryInfo.name}</span>
                </div>
                {isSelected && <Check className="h-3 w-3 text-green-500" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 min-w-[160px]"
            disabled={isLoading || isChanging}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentCountryInfo?.flag}</span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{currentCountryInfo?.name}</span>
                <div className="flex items-center gap-1">
                  {getDetectionStatusIcon()}
                  <span className="text-xs text-gray-500">{currency}</span>
                </div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Seleccionar País/Región
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Current Selection Status */}
          <div className="px-2 py-2 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                Actual: {currentCountryInfo?.name}
              </Badge>
              <div className="flex items-center gap-1">
                {getDetectionStatusIcon()}
                <span className="text-xs text-gray-500">
                  {getDetectionStatusText()}
                </span>
              </div>
            </div>
            
            {confidence && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Precisión:</span>
                <span className={`font-medium ${getConfidenceColor()}`}>
                  {confidence.toFixed(0)}%
                </span>
              </div>
            )}
          </div>
          <DropdownMenuSeparator />
          
          {/* Country Options by Region */}
          <div className="max-h-64 overflow-y-auto">
            {['América del Norte', 'América del Sur'].map(region => {
              const regionCountries = supportedCountries.filter(c => c.region === region)
              
              return (
                <div key={region}>
                  <div className="px-2 py-1">
                    <span className="text-xs font-medium text-gray-600">{region}</span>
                  </div>
                  
                  {regionCountries.map((countryInfo) => {
                    const isSelected = countryInfo.code === country
                    
                    return (
                      <DropdownMenuItem
                        key={countryInfo.code}
                        onClick={() => handleCountrySelect(countryInfo.code)}
                        className="flex items-center justify-between p-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{countryInfo.flag}</span>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{countryInfo.name}</span>
                              {isSelected && <Check className="h-3 w-3 text-green-500" />}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{countryInfo.currency}</span>
                              <span>•</span>
                              <span>{countryInfo.language === 'es' ? 'Español' : 
                                     countryInfo.language === 'pt' ? 'Português' : 'English'}</span>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    )
                  })}
                  
                  {region !== 'América del Sur' && <DropdownMenuSeparator />}
                </div>
              )
            })}
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Footer Info */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>Los precios y métodos de pago se adaptarán automáticamente</span>
            </div>
            {error && (
              <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                <span>Error de geo-detección. Usando configuración manual.</span>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function MobileHeaderCountrySelector(props: HeaderCountrySelectorProps) {
  return <HeaderCountrySelector {...props} compact={true} />
}

export default HeaderCountrySelector

export function CountryStatusIndicator() { return null; }
