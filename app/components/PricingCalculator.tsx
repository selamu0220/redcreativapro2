'use client'

import React, { useState, useEffect } from 'react'
import { useLocalization } from '../contexts/LocalizationContext'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Calculator, Info } from 'lucide-react'

export function PricingCalculator({ className = '' }: { className?: string }) {
    const { currency, config, formatCurrency, country } = useLocalization()
    const [basePrice, setBasePrice] = useState<number>(100)
    const [quantity, setQuantity] = useState<number>(1)

    const taxRate = config.taxRate || 0
    const taxPercentage = Math.round(taxRate * 100)

    const subtotal = basePrice * quantity
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount

    return (
        <Card className={`w-full ${className}`}>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculadora de Precios
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Precio Base ({currency})</label>
                        <Input
                            type="number"
                            value={basePrice}
                            onChange={(e) => setBasePrice(Number(e.target.value))}
                            min={0}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Cantidad</label>
                        <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            min={1}
                        />
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                            Impuestos ({taxPercentage}%)
                            <Info className="h-3 w-3 text-gray-400" title={`Impuesto estimado para ${country}`} />
                        </span>
                        <span className="font-medium text-red-600">+{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
                    </div>
                </div>

                <p className="text-xs text-gray-400 text-center">
                    * Los impuestos son estimados basados en la tasa general de {country}.
                </p>
            </CardContent>
        </Card>
    )
}
