'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    ExternalLink,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Power,
    Settings2
} from 'lucide-react';
import { PLATFORM_INFO, getCredentialFields } from '@/app/lib/blog-adapters';
import type { BlogPlatform } from '@/app/lib/blog-integrations-schema';
import { MainNavigation } from '@/app/components/MainNavigation';

interface Integration {
    id: string;
    platform: BlogPlatform;
    name: string;
    site_url: string;
    is_active: boolean;
    last_used?: string;
    created_at: string;
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<BlogPlatform | null>(null);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    async function fetchIntegrations() {
        try {
            const res = await fetch('/api/integrations/blog');
            const data = await res.json();
            setIntegrations(data.integrations || []);
        } catch (error) {
            console.error('Error fetching integrations:', error);
        } finally {
            setLoading(false);
        }
    }

    async function toggleIntegration(id: string, currentStatus: boolean) {
        try {
            await fetch('/api/integrations/blog', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_active: !currentStatus }),
            });
            fetchIntegrations();
        } catch (error) {
            console.error('Error toggling integration:', error);
        }
    }

    async function deleteIntegration(id: string) {
        if (!confirm('¿Eliminar esta integración? Esta acción no se puede deshacer.')) return;

        try {
            await fetch(`/api/integrations/blog?id=${id}`, { method: 'DELETE' });
            fetchIntegrations();
        } catch (error) {
            console.error('Error deleting integration:', error);
        }
    }

    const availablePlatforms: BlogPlatform[] = ['wordpress', 'ghost', 'strapi'];

    return (
        <div className="min-h-screen bg-background">
            <MainNavigation />
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Integraciones de Blog</h1>
                        <p className="text-muted-foreground mt-1">
                            Conecta tus blogs para publicar directamente desde RedCreativa Pro
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={20} />
                        Añadir Integración
                    </button>
                </div>

                {/* Integrations Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="animate-spin text-muted-foreground" size={32} />
                    </div>
                ) : integrations.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">🔗</div>
                        <h2 className="text-xl font-semibold mb-2">No tienes integraciones configuradas</h2>
                        <p className="text-muted-foreground mb-6">
                            Conecta tu blog de WordPress, Ghost o Strapi para publicar artículos directamente.
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                        >
                            <Plus size={20} />
                            Añadir tu primera integración
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {integrations.map((integration) => (
                            <IntegrationCard
                                key={integration.id}
                                integration={integration}
                                onToggle={() => toggleIntegration(integration.id, integration.is_active)}
                                onDelete={() => deleteIntegration(integration.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Add Integration Modal */}
                {showAddModal && (
                    <AddIntegrationModal
                        onClose={() => {
                            setShowAddModal(false);
                            setSelectedPlatform(null);
                        }}
                        onSuccess={() => {
                            setShowAddModal(false);
                            setSelectedPlatform(null);
                            fetchIntegrations();
                        }}
                        selectedPlatform={selectedPlatform}
                        onSelectPlatform={setSelectedPlatform}
                        availablePlatforms={availablePlatforms}
                    />
                )}
            </div>
        </div>
    );
}

function IntegrationCard({
    integration,
    onToggle,
    onDelete
}: {
    integration: Integration;
    onToggle: () => void;
    onDelete: () => void;
}) {
    const platformInfo = PLATFORM_INFO[integration.platform];

    return (
        <div className={`bg-card border rounded-xl p-5 transition-all ${integration.is_active ? 'border-border' : 'border-border/50 opacity-60'
            }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{platformInfo?.icon || '📝'}</span>
                    <div>
                        <h3 className="font-semibold text-foreground">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{platformInfo?.name || integration.platform}</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${integration.is_active
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                    {integration.is_active ? 'Activa' : 'Inactiva'}
                </div>
            </div>

            <a
                href={integration.site_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline mb-4"
            >
                {integration.site_url.replace(/^https?:\/\//, '')}
                <ExternalLink size={14} />
            </a>

            {integration.last_used && (
                <p className="text-xs text-muted-foreground mb-4">
                    Última publicación: {formatDateSafe(integration.last_used)}
                </p>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-border">
                <button
                    onClick={onToggle}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${integration.is_active
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300'
                        : 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400'
                        }`}
                >
                    <Power size={14} />
                    {integration.is_active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                    onClick={onDelete}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 transition-colors"
                >
                    <Trash2 size={14} />
                    Eliminar
                </button>
            </div>
        </div>
    );
}

function formatDateSafe(dateString: string | undefined): string {
    if (!dateString) return 'Nunca';
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }
        return date.toLocaleDateString();
    } catch (e) {
        return 'Fecha inválida';
    }
}

function AddIntegrationModal({
    onClose,
    onSuccess,
    selectedPlatform,
    onSelectPlatform,
    availablePlatforms,
}: {
    onClose: () => void;
    onSuccess: () => void;
    selectedPlatform: BlogPlatform | null;
    onSelectPlatform: (p: BlogPlatform | null) => void;
    availablePlatforms: BlogPlatform[];
}) {
    const [formData, setFormData] = useState<Record<string, string>>({
        name: '',
        site_url: '',
    });
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [saving, setSaving] = useState(false);

    const credentialFields = selectedPlatform ? getCredentialFields(selectedPlatform) : [];

    async function testConnection() {
        if (!selectedPlatform) return;

        setTesting(true);
        setTestResult(null);

        try {
            const credentials: Record<string, string> = {};
            credentialFields.forEach(field => {
                credentials[field.key] = formData[field.key] || '';
            });

            const res = await fetch('/api/integrations/blog/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: selectedPlatform,
                    site_url: formData.site_url,
                    credentials,
                }),
            });

            const result = await res.json();
            setTestResult(result);
        } catch (error: any) {
            setTestResult({ success: false, message: error.message });
        } finally {
            setTesting(false);
        }
    }

    async function saveIntegration() {
        if (!selectedPlatform || !testResult?.success) return;

        setSaving(true);
        try {
            const credentials: Record<string, string> = {};
            credentialFields.forEach(field => {
                credentials[field.key] = formData[field.key] || '';
            });

            const res = await fetch('/api/integrations/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: selectedPlatform,
                    name: formData.name,
                    site_url: formData.site_url,
                    credentials,
                }),
            });

            if (res.ok) {
                onSuccess();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al guardar');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-semibold">
                        {selectedPlatform ? `Configurar ${PLATFORM_INFO[selectedPlatform]?.name}` : 'Añadir Integración'}
                    </h2>
                </div>

                <div className="p-6">
                    {!selectedPlatform ? (
                        // Platform Selection
                        <div className="grid grid-cols-3 gap-4">
                            {availablePlatforms.map((platform) => (
                                <button
                                    key={platform}
                                    onClick={() => onSelectPlatform(platform)}
                                    className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                                >
                                    <span className="text-4xl">{PLATFORM_INFO[platform]?.icon}</span>
                                    <span className="font-medium">{PLATFORM_INFO[platform]?.name}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        // Configuration Form
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre de la integración</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Mi Blog Principal"
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">URL del sitio</label>
                                <input
                                    type="url"
                                    value={formData.site_url}
                                    onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                                    placeholder="https://miblog.com"
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                />
                            </div>

                            {credentialFields.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium mb-1">{field.label}</label>
                                    <input
                                        type={field.type}
                                        value={formData[field.key] || ''}
                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                        placeholder={field.placeholder}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                    />
                                    {field.helpText && (
                                        <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                                    )}
                                </div>
                            ))}

                            {testResult && (
                                <div className={`flex items-start gap-2 p-3 rounded-lg ${testResult.success
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {testResult.success ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                    <span className="text-sm">{testResult.message}</span>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={testConnection}
                                    disabled={testing || !formData.site_url}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                                >
                                    {testing ? <RefreshCw className="animate-spin" size={16} /> : <Settings2 size={16} />}
                                    Probar Conexión
                                </button>
                                <button
                                    onClick={saveIntegration}
                                    disabled={saving || !testResult?.success}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border flex justify-between">
                    {selectedPlatform && (
                        <button
                            onClick={() => onSelectPlatform(null)}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            ← Volver
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="text-sm text-muted-foreground hover:text-foreground ml-auto"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
