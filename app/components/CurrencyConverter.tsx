'use client'

import React, { useState, useEffect } from 'react'
import { useLocalization } from '../contexts/LocalizationContext'
import { currencyService } from '@/lib/currency-service'
import { CurrencyCode } from '@/app/lib/geo-detection'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ArrowRightLeft, RefreshCw, TrendingUp } from 'lucide-react'
import { CurrencySelector } from './CurrencySelector'
import { useTranslation } from '@/app/lib/language/context'
import { FeatureGate } from '@/app/hooks/useFeatureFlag'
import { CurrencyComparisonTable } from './CurrencyComparisonTable'

interface CurrencyConverterProps {
    className?: string
    defaultAmount?: number
}

export function CurrencyConverter({ className = '', defaultAmount = 100 }: CurrencyConverterProps) {
    const { currency: regionalCurrency, country } = useLocalization()
    const { t } = useTranslation('common')

    const [amount, setAmount] = useState<number>(defaultAmount)
    const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD')
    const [toCurrency, setToCurrency] = useState<CurrencyCode>(regionalCurrency || 'MXN')
    const [result, setResult] = useState<number | null>(null)
    const [rate, setRate] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // Update target currency if regional currency changes
    useEffect(() => {
        if (regionalCurrency && regionalCurrency !== toCurrency) {
            // Optional: Auto-update target currency when region changes
            // setToCurrency(regionalCurrency) 
        }
    }, [regionalCurrency])

    useEffect(() => {
        convert()
    }, [amount, fromCurrency, toCurrency])

    const convert = async () => {
        setIsLoading(true)
        try {
            const conversionResult = await currencyService.convertPrice(amount, fromCurrency, toCurrency)
            const exchangeRate = await currencyService.getExchangeRate(fromCurrency, toCurrency)

            setResult(conversionResult)
            setRate(exchangeRate.rate)
            setLastUpdated(new Date())
        } catch (error) {
            console.error('Conversion failed', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSwap = () => {
        setFromCurrency(toCurrency)
        setToCurrency(fromCurrency)
    }

    return (
        <Card className={`w-full max-w-md ${className}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    {t('currency_converter.title')}
                </CardTitle>
                <CardDescription>
                    {t('currency_converter.subtitle')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Amount Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('currency_converter.amount')}</label>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        min={0}
                        className="text-lg"
                    />
                </div>

                {/* Currency Selection */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 md:gap-2 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{t('currency_converter.from')}</label>
                        <div className="w-full">
                            <CurrencySelector
                                onCurrencyChange={(c) => setFromCurrency(c)}
                                showExchangeRates={false}
                                className="h-12"
                            />
                        </div>
                        <div className="mt-1 text-sm font-bold text-gray-900 mx-1">{fromCurrency}</div>
                    </div>

                    <div className="flex justify-center md:mb-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSwap}
                            className="h-12 w-12 rounded-full hover:bg-gray-100 active:scale-95 transition-transform"
                        >
                            <ArrowRightLeft className="h-5 w-5 text-gray-500" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{t('currency_converter.to')}</label>
                        <div className="w-full">
                            <CurrencySelector
                                onCurrencyChange={(c) => setToCurrency(c)}
                                showExchangeRates={false}
                                className="h-12"
                            />
                        </div>
                        <div className="mt-1 text-sm font-bold text-gray-900 mx-1">{toCurrency}</div>
                    </div>
                </div>

                {/* Result */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">{t('currency_converter.result')}</p>
                            <div className="text-3xl font-bold text-gray-900">
                                {isLoading ? (
                                    <span className="animate-pulse text-gray-400">{t('currency_converter.calculating')}</span>
                                ) : (
                                    <>
                                        {new Intl.NumberFormat(undefined, {
                                            style: 'currency',
                                            currency: toCurrency
                                        }).format(result || 0)}
                                    </>
                                )}
                            </div>
                        </div>
                        {rate && (
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {lastUpdated && (
                        <p className="text-xs text-gray-400 mt-2 text-right">
                            {t('currency_converter.updated', { time: lastUpdated.toLocaleTimeString() })}
                        </p>
                    )}
                </div>

                {/* Comparative Table - Feature Gated */}
                <FeatureGate flag="localization_v2">
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 px-1">
                            {t('currency_converter.regional_rates')}
                        </h3>
                        {/* Use lazy loaded component for performance */}
                        <CurrencyComparisonTable />
                    </div>
                </FeatureGate>
            </CardContent>
        </Card>
    )
}
