'use client';

/**
 * SEO & Traffic Control Center
 * 
 * Main dashboard for traffic acceleration, SEO opportunities, and style management
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Sparkles, Settings, BarChart3 } from 'lucide-react';
import { TrafficDashboard } from '@/app/components/TrafficDashboard';
import { StyleProfileManager } from '@/app/components/StyleProfileManager';
import { OnboardingModal } from '@/app/components/OnboardingModal';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

export default function SEODashboardPage() {
    const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
    const [activeTab, setActiveTab] = useState('traffic');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Inicia Sesión</h2>
                    <p className="text-muted-foreground mb-6">
                        Necesitas iniciar sesión para acceder al panel de control
                    </p>
                    <a
                        href="/api/auth/login"
                        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Iniciar Sesión
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Onboarding Modal */}
            <OnboardingModal
                userId={user.id}
                onComplete={() => console.log('Onboarding completed')}
                onSkip={() => console.log('Onboarding skipped')}
            />

            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">
                            Centro de Control SEO & Tráfico
                        </h1>
                        <p className="text-muted-foreground">
                            Acelera tu tráfico web con estrategias personalizadas y escritura optimizada
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full max-w-2xl grid-cols-3">
                        <TabsTrigger value="traffic" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Acelerador de Tráfico
                        </TabsTrigger>

                        <TabsTrigger value="style" className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Perfil de Estilo
                        </TabsTrigger>

                        <TabsTrigger value="reports" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Reportes
                        </TabsTrigger>
                    </TabsList>

                    {/* Traffic Tab */}
                    <TabsContent value="traffic" className="space-y-6">
                        <TrafficDashboard userId={user.id} />
                    </TabsContent>

                    {/* Style Profile Tab */}
                    <TabsContent value="style" className="space-y-6">
                        <StyleProfileManager
                            userId={user.id}
                            onProfileUpdate={(profile) => {
                                console.log('Profile updated:', profile);
                            }}
                        />
                    </TabsContent>

                    {/* Reports Tab */}
                    <TabsContent value="reports" className="space-y-6">
                        <div className="rounded-lg border bg-card p-12 text-center">
                            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Reportes Mensuales</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                Los reportes mensuales estarán disponibles después de implementar al menos una acción SEO.
                                Ve a la pestaña "Acelerador de Tráfico" para comenzar.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
