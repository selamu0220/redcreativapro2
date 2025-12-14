'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Save, RefreshCw } from 'lucide-react'
import type { AdminConfig } from '@/app/api/admin/config/route'

interface TaxConfigTableProps {
    initialConfig?: AdminConfig
}

export function TaxConfigTable({ initialConfig }: TaxConfigTableProps) {
    const [config, setConfig] = useState<AdminConfig | null>(initialConfig || null)
    const [loading, setLoading] = useState(!initialConfig)
    const [saving, setSaving] = useState(false)

    // Local state for edits before save
    const [editedRates, setEditedRates] = useState<Record<string, number>>({})

    const fetchConfig = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/config')
            if (res.ok) {
                const data = await res.json()
                setConfig(data)
                setEditedRates(data.taxRates || {})
            }
        } catch (error) {
            console.error('Failed to fetch config', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!initialConfig) {
            fetchConfig()
        } else if (initialConfig.taxRates) {
            setEditedRates(initialConfig.taxRates)
        }
    }, [])

    const handleRateChange = (country: string, value: string) => {
        const numValue = parseFloat(value)
        if (!isNaN(numValue)) {
            setEditedRates(prev => ({
                ...prev,
                [country]: numValue
            }))
        }
    }

    const handleSave = async () => {
        if (!config) return
        setSaving(true)
        try {
            const newConfig = {
                ...config,
                taxRates: editedRates
            }

            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newConfig)
            })

            if (res.ok) {
                // Show success toast (mock)
                const savedData = await res.json()
                setConfig(savedData.config)
                alert('Configuración guardada correctamente.')
            } else {
                alert('Error al guardar configuración.')
            }
        } catch (error) {
            console.error('Error saving:', error)
            alert('Error de conexión.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Cargando configuración...</div>

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Configuración de Impuestos (IVA/Tax)</span>
                    <Button variant="outline" size="sm" onClick={fetchConfig} disabled={saving}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Recargar
                    </Button>
                </CardTitle>
                <CardDescription>
                    Ajusta el porcentaje de impuestos aplicado por país. (0.16 = 16%)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(editedRates).map(([country, rate]) => (
                        <div key={country} className="space-y-2">
                            <Label htmlFor={`tax-${country}`}>{country}</Label>
                            <Input
                                id={`tax-${country}`}
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={rate}
                                onChange={(e) => handleRateChange(country, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
