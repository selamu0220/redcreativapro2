'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Switch } from '@/app/components/ui/switch'
import { Label } from '@/app/components/ui/label'
import { Save, RefreshCw, CreditCard } from 'lucide-react'
import type { AdminConfig } from '@/app/api/admin/config/route'

interface PaymentMethodManagerProps {
    initialConfig?: AdminConfig
}

export function PaymentMethodManager({ initialConfig }: PaymentMethodManagerProps) {
    const [config, setConfig] = useState<AdminConfig | null>(initialConfig || null)
    const [loading, setLoading] = useState(!initialConfig)
    const [saving, setSaving] = useState(false)
    const [methods, setMethods] = useState<Record<string, boolean>>({})

    const fetchConfig = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/config')
            if (res.ok) {
                const data = await res.json()
                setConfig(data)
                setMethods(data.paymentMethods || {})
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
        } else if (initialConfig.paymentMethods) {
            setMethods(initialConfig.paymentMethods)
        }
    }, [])

    const handleToggle = (method: string) => {
        setMethods(prev => ({
            ...prev,
            [method]: !prev[method]
        }))
    }

    const handleSave = async () => {
        if (!config) return
        setSaving(true)
        try {
            const newConfig = {
                ...config,
                paymentMethods: methods
            }

            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newConfig)
            })

            if (res.ok) {
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

    if (loading) return <div>Cargando métodos de pago...</div>

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Métodos de Pago Globales</span>
                    <Button variant="outline" size="sm" onClick={fetchConfig} disabled={saving}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Recargar
                    </Button>
                </CardTitle>
                <CardDescription>
                    Activa o desactiva métodos de pago disponibles en la plataforma.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(methods).map(([method, enabled]) => (
                        <div key={method} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <Switch
                                id={`method-${method}`}
                                checked={enabled}
                                onCheckedChange={() => handleToggle(method)}
                            />
                            <div className="flex-1">
                                <Label htmlFor={`method-${method}`} className="text-base font-medium capitalize cursor-pointer">
                                    {method}
                                </Label>
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <CreditCard className="h-3 w-3" />
                                    <span>Pasarela</span>
                                </div>
                            </div>
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
