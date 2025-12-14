'use client'

import React from 'react'
import { TaxConfigTable } from '../components/TaxConfigTable'
import { PaymentMethodManager } from '../components/PaymentMethodManager'
import { AnalyticsOverview } from '../components/AnalyticsOverview'

export default function AdminPage() {
    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
                <p className="text-muted-foreground">
                    Gestión centralizada de localización y pagos para Latinoamérica.
                </p>
            </div>

            <AnalyticsOverview />

            <div className="grid gap-6">
                <TaxConfigTable />
                <PaymentMethodManager />
            </div>
        </div>
    )
}
