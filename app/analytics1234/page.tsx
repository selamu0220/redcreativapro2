'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { Lock, ShieldX, LogIn, LogOut } from 'lucide-react';
import FounderAnalyticsDashboard from './components/FounderAnalyticsDashboard';

// Email autorizado (fundador)
const FOUNDER_EMAIL = 'selamu.garciabravo@gmail.com';

export default function Analytics1234Page() {
    const { user, isLoading, isAuthenticated, login, logout } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Evitar hydration mismatch
    if (!isMounted) {
        return null;
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    // No autenticado - Mostrar pantalla de login
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
                <div className="w-full max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 mb-4">
                        <Lock className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h1>
                    <p className="text-gray-400 mb-8">Panel de Analytics del Fundador</p>

                    <button
                        onClick={() => login()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/25"
                    >
                        <LogIn className="w-5 h-5" />
                        Iniciar Sesión
                    </button>

                    <p className="text-gray-500 text-xs mt-6">
                        Esta página no está indexada y es de uso exclusivo del fundador.
                    </p>
                </div>
            </div>
        );
    }

    // Autenticado pero no es el fundador - Acceso denegado
    if (user?.email !== FOUNDER_EMAIL) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900 p-4">
                <div className="w-full max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30 mb-4">
                        <ShieldX className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h1>
                    <p className="text-gray-400 mb-2">Esta página es exclusiva para el fundador.</p>
                    <p className="text-gray-500 text-sm mb-8">
                        Logueado como: <span className="text-gray-300">{user?.email}</span>
                    </p>

                    <button
                        onClick={() => logout()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        );
    }

    // Autenticado como fundador - Mostrar Dashboard
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">R</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Red Creativa Pro</h1>
                            <p className="text-xs text-gray-400">Panel del Fundador</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">{user?.email}</span>
                        <button
                            onClick={() => logout()}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <FounderAnalyticsDashboard />
            </main>
        </div>
    );
}
