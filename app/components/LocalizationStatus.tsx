'use client'

import React from 'react'
import { useLocalization, useCurrency, usePaymentMethods, useLegalCompliance } from '../contexts/LocalizationContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { MapPin, CreditCard, Shield, RefreshCw, AlertCircle } from 'lucide-react'

interface LocalizationStatusProps {
  showDetails?: boolean
  className?: string
}

/**
 * Component to display current localization status and settings
 * Useful for debugging and user transparency
 */
export function LocalizationStatus({ showDetails = false, className = '' }: LocalizationStatusProps) {
  const { 
    country, 
    currency, 
    language, 
    locale, 
    timezone, 
    isLoading, 
    error, 
    confidence, 
    source, 
    isLatinAmerica,
    refreshLocation 
  } = useLocalization()
  
  const { formatCurrency } = useCurrency()
  const { paymentMethods, hasOxxo, hasPix, hasMercadoPago, hasPse } = usePaymentMethods()
  const { requirements, needsLgpd, needsPdpa, needsLfpdppp, needsLaw1581 } = useLegalCompliance()

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-gray-600">Detectando ubicación...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">Error de localización</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refreshLocation}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reintentar
            </Button>
          </div>
          {showDetails && (
            <p className="text-xs text-red-500 mt-2">{error}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Estado de Localización
        </CardTitle>
        {showDetails && (
          <CardDescription className="text-xs">
            Configuración regional detectada automáticamente
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Basic Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">País:</span>
          <div className="flex items-center gap-2">
            <Badge variant={isLatinAmerica ? "default" : "secondary"}>
              {country}
            </Badge>
            {isLatinAmerica && (
              <Badge variant="outline" className="text-xs">
                LATAM
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Moneda:</span>
          <Badge variant="outline">{currency}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Idioma:</span>
          <Badge variant="outline">{language}</Badge>
        </div>

        {/* Currency Test */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Precio ejemplo:</span>
          <span className="text-sm font-mono">{formatCurrency(9.99)}</span>
        </div>

        {showDetails && (
          <>
            {/* Payment Methods */}
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Métodos de Pago:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {hasOxxo && <Badge variant="secondary" className="text-xs">OXXO</Badge>}
                {hasPix && <Badge variant="secondary" className="text-xs">PIX</Badge>}
                {hasMercadoPago && <Badge variant="secondary" className="text-xs">Mercado Pago</Badge>}
                {hasPse && <Badge variant="secondary" className="text-xs">PSE</Badge>}
                <Badge variant="secondary" className="text-xs">Tarjetas</Badge>
              </div>
            </div>

            {/* Legal Requirements */}
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Cumplimiento Legal:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {needsLgpd && <Badge variant="secondary" className="text-xs">LGPD</Badge>}
                {needsPdpa && <Badge variant="secondary" className="text-xs">PDPA</Badge>}
                {needsLfpdppp && <Badge variant="secondary" className="text-xs">LFPDPPP</Badge>}
                {needsLaw1581 && <Badge variant="secondary" className="text-xs">Ley 1581</Badge>}
              </div>
            </div>

            {/* Detection Metadata */}
            <div className="pt-2 border-t">
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Confianza:</span> {Math.round(confidence * 100)}%
                </div>
                <div>
                  <span className="font-medium">Fuente:</span> {source || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Zona horaria:</span> {timezone}
                </div>
                <div>
                  <span className="font-medium">Locale:</span> {locale}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Refresh Button */}
        <div className="pt-2 border-t">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshLocation}
            className="w-full text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Actualizar Ubicación
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact version for headers or status bars
 */
export function LocalizationStatusCompact({ className = '' }: { className?: string }) {
  const { country, currency, isLoading, error, isLatinAmerica } = useLocalization()

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
        <span className="text-xs text-gray-600">Detectando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <AlertCircle className="h-3 w-3 text-red-500" />
        <span className="text-xs text-red-600">Error</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={isLatinAmerica ? "default" : "secondary"} className="text-xs">
        {country}
      </Badge>
      <Badge variant="outline" className="text-xs">
        {currency}
      </Badge>
    </div>
  )
}