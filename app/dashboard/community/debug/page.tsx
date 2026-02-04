"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

export default function DebugPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [apiCheck, setApiCheck] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/community/debug')
            .then(res => res.json())
            .then(data => {
                setApiCheck(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setApiCheck({ error: err.message });
                setLoading(false);
            });
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">Diagnóstico del Sistema de Comunidad</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Frontend State */}
                <div className="p-6 border rounded bg-card">
                    <h2 className="text-xl font-semibold mb-4">Frontend (Cliente)</h2>
                    <div className="space-y-2">
                        <p><strong>Cargando sesión:</strong> {isAuthLoading ? 'Sí' : 'No'}</p>
                        <p><strong>Usuario Detectado:</strong> {user ? 'Sí' : 'No'}</p>
                        {user && (
                            <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-auto">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        )}
                    </div>
                </div>

                {/* Backend State */}
                <div className="p-6 border rounded bg-card">
                    <h2 className="text-xl font-semibold mb-4">Backend (Servidor)</h2>
                    {loading ? (
                        <p>Analizando servidor...</p>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold">Variables de Entorno</h3>
                                <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-auto max-h-40">
                                    {JSON.stringify(apiCheck?.env, null, 2)}
                                </pre>
                            </div>

                            <div>
                                <h3 className="font-bold">Sesión en Servidor (Kinde)</h3>
                                <pre className={`p-2 rounded text-xs mt-1 ${apiCheck?.auth?.hasUser ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                    {JSON.stringify(apiCheck?.auth, null, 2)}
                                </pre>
                            </div>

                            <div>
                                <h3 className="font-bold">Conexión Base de Datos (Supabase Admin)</h3>
                                <pre className={`p-2 rounded text-xs mt-1 ${apiCheck?.database?.connected ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                    {JSON.stringify(apiCheck?.database, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
                <h3 className="font-bold mb-2">¿Qué buscar?</h3>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                    <li><strong>Frontend:</strong> ¿Aparece tu usuario aquí? Si no, el problema es el login en el navegador.</li>
                    <li><strong>Backend Auth:</strong> ¿Dice <code>hasUser: true</code>? Si dice <code>false</code> y en Frontend sí hay usuario, entonces las cookies no están llegando al servidor.</li>
                    <li><strong>Env Vars:</strong> ¿Alguna variable crítica dice <code>MISSING</code>?</li>
                    <li><strong>Database:</strong> ¿<code>connected: true</code>? Si es false, fallan las credenciales de Supabase.</li>
                </ul>
            </div>
        </div>
    );
}
