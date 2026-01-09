'use client'

import React, { useState } from 'react'
import { CountryCode, getCountryDisplayName } from '@/app/lib/geo-detection'
import { useLocalization } from '@/app/contexts/LocalizationContext'

interface CountrySelectorProps {
  className?: string
  showFlag?: boolean
  compact?: boolean
  onCountryChange?: (country: CountryCode) => void
}

// Country flag emojis
const COUNTRY_FLAGS: Record<CountryCode, string> = {
  MX: '🇲🇽',
  CO: '🇨🇴',
  AR: '🇦🇷',
  CL: '🇨🇱',
  PE: '🇵🇪',
  EC: '🇪🇨',
  BR: '🇧🇷',
  US: '🇺🇸',
  UNKNOWN: '🌍'
}

// Supported countries for selection
const SUPPORTED_COUNTRIES: CountryCode[] = ['MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR']

/**
 * Country Selector Component
 * Allows users to manually select their country for localization
 */
export function CountrySelector({
  className = '',
  showFlag = true,
  compact = false,
  onCountryChange
}: CountrySelectorProps) {
  const { country, language, setManualCountry, isLoading } = useLocalization()

  // Import components locally to avoid top-level circular dependencies if any
  const {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } = require('./ui/dropdown-menu')

  const handleCountrySelect = (selectedCountry: CountryCode) => {
    onCountryChange?.(selectedCountry)
    setManualCountry(selectedCountry)
  }

  const currentFlag = COUNTRY_FLAGS[country] || COUNTRY_FLAGS.UNKNOWN
  const currentName = getCountryDisplayName(country as any, language as any)

  if (compact) {
    return (
      <div className={className}>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-1 px-2 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 outline-none focus:ring-2 focus:ring-blue-500">
            {showFlag && <span className="text-lg">{currentFlag}</span>}
            <span className="hidden sm:inline">{currentName}</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px] bg-white">
            {SUPPORTED_COUNTRIES.map((countryCode) => (
              <DropdownMenuItem
                key={countryCode}
                onClick={() => handleCountrySelect(countryCode)}
                className={`cursor-pointer ${country === countryCode ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                {showFlag && <span className="text-lg mr-2">{COUNTRY_FLAGS[countryCode]}</span>}
                <span>{getCountryDisplayName(countryCode, language as any)}</span>
                {country === countryCode && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {language === 'es' ? 'País' : language === 'pt' ? 'País' : 'Country'}
      </label>

      <DropdownMenu>
        <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50">
          <div className="flex items-center space-x-2">
            {showFlag && <span className="text-xl">{currentFlag}</span>}
            <span>{currentName}</span>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[300px] bg-white">
          {SUPPORTED_COUNTRIES.map((countryCode) => (
            <DropdownMenuItem
              key={countryCode}
              onClick={() => handleCountrySelect(countryCode)}
              className={`cursor-pointer py-2 ${country === countryCode ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              {showFlag && <span className="text-xl mr-3">{COUNTRY_FLAGS[countryCode]}</span>}
              <span className="flex-1">{getCountryDisplayName(countryCode, language as any)}</span>
              {country === countryCode && (
                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {isLoading && (
        <p className="mt-1 text-sm text-gray-500">
          {language === 'es' ? 'Detectando ubicación...' :
            language === 'pt' ? 'Detectando localização...' :
              'Detecting location...'}
        </p>
      )}
    </div>
  )
}

/**
 * Simple country flag display component
 */
export function CountryFlag({ country, size = 'md' }: { country: CountryCode; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <span className={`inline-block ${sizeClasses[size]}`}>
      {COUNTRY_FLAGS[country as any] || COUNTRY_FLAGS.UNKNOWN}
    </span>
  )
}

/**
 * Country detection status indicator
 */
export function GeoDetectionStatus() {
  const { country, confidence, source, isLoading, error } = useLocalization()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span>Detecting location...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>Detection failed</span>
      </div>
    )
  }

  const confidenceColor = confidence > 0.8 ? 'text-green-500' :
    confidence > 0.5 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <CountryFlag country={country as any} size="sm" />
      <span>Detected via {source}</span>
      <span className={`font-medium ${confidenceColor}`}>
        ({Math.round(confidence * 100)}%)
      </span>
    </div>
  )
}