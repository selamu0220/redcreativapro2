'use client'

import React, { useEffect, useState } from 'react'
import { useLocalization } from '../contexts/LocalizationContext'
import { currencyService } from '@/lib/currency-service'
import { CurrencyCode, getCountryDisplayName } from '@/app/lib/geo-detection'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeftRight, TrendingUp } from 'lucide-react'

export function CurrencyComparisonTable({ className = '' }: { className?: string }) {
    const { currency, country } = useLocalization()
    const [rates, setRates] = useState<Array<{ code: CurrencyCode, rate: number, inverted: number }>>([])
    const [isLoading, setIsLoading] = useState(true)

    const compareCurrencies: CurrencyCode[] = ['USD', 'EUR', 'MXN', 'COP', 'BRL', 'ARS', 'CLP', 'PEN']

    useEffect(() => {
        loadRates()
    }, [currency])

    const loadRates = async () => {
        setIsLoading(true)
        try {
            const newRates = []

            for (const targetCode of compareCurrencies) {
                if (targetCode === currency) continue

                // 1 Local = X Target
                const exchange = await currencyService.getExchangeRate(currency, targetCode)
                // 1 Target = Y Local
                const inverted = await currencyService.getExchangeRate(targetCode, currency)

                newRates.push({
                    code: targetCode,
                    rate: exchange.rate,
                    inverted: inverted.rate
                })
            }

            setRates(newRates)
        } catch (error) {
            console.error('Error loading comparison rates', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className={`w-full ${className}`}>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5" />
                    Comparativa de Divisas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    {/* Note: We assume Table components exist in ./ui/table or we use standard HTML tables if not available. 
               The context provided showed ./ui/card etc but not specifically table.tsx in list_dir, 
               but "create missing UI components" task suggests I might need to create it if it doesn't exist.
               Checking list_dir from Step 31: It does NOT contain table.tsx.
               I should simpler HTML or create table.tsx. 
               I'll use simple HTML for now to be safe and fast.
           */}
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Moneda</th>
                                <th className="px-4 py-3">1 {currency} =</th>
                                <th className="px-4 py-3">1 ... =</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                                        Cargando tasas de cambio...
                                    </td>
                                </tr>
                            ) : (
                                rates.map((item) => (
                                    <tr key={item.code} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {item.code}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.rate.toFixed(4)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {item.inverted.toFixed(4)} {currency}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
