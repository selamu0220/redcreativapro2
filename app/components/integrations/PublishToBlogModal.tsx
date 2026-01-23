'use client';

import { useState, useEffect } from 'react';
import { X, Send, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { BlogPlatform } from '@/app/lib/blog-integrations-schema';

interface Integration {
    id: string;
    platform: BlogPlatform;
    name: string;
    site_url: string;
    is_active: boolean;
}

interface PublishToBlogModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string; // HTML content
    documentId?: string;
}

export function PublishToBlogModal({
    isOpen,
    onClose,
    title,
    content,
    documentId
}: PublishToBlogModalProps) {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [selectedIntegration, setSelectedIntegration] = useState<string>('');
    const [publishStatus, setPublishStatus] = useState<'draft' | 'publish'>('draft');
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        externalUrl?: string;
    } | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchIntegrations();
            setResult(null);
        }
    }, [isOpen]);

    async function fetchIntegrations() {
        setLoading(true);
        try {
            const res = await fetch('/api/integrations/blog');
            const data = await res.json();
            const active = (data.integrations || []).filter((i: Integration) => i.is_active);
            setIntegrations(active);
            if (active.length === 1) {
                setSelectedIntegration(active[0].id);
            }
        } catch (error) {
            console.error('Error fetching integrations:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handlePublish() {
        if (!selectedIntegration) return;

        setPublishing(true);
        setResult(null);

        try {
            const res = await fetch('/api/integrations/blog/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    integration_id: selectedIntegration,
                    document_id: documentId,
                    title,
                    content,
                    status: publishStatus,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setResult({
                    success: true,
                    message: data.message || '¡Artículo publicado correctamente!',
                    externalUrl: data.external_url,
                });
            } else {
                setResult({
                    success: false,
                    message: data.message || 'Error al publicar',
                });
            }
        } catch (error: any) {
            setResult({
                success: false,
                message: error.message || 'Error de conexión',
            });
        } finally {
            setPublishing(false);
        }
    }

    if (!isOpen) return null;

    const selectedBlog = integrations.find(i => i.id === selectedIntegration);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Publicar en Blog</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-muted-foreground" size={24} />
                        </div>
                    ) : integrations.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground mb-4">
                                No tienes blogs conectados.
                            </p>
                            <a
                                href="/dashboard/integrations"
                                className="inline-flex items-center gap-2 text-primary hover:underline"
                            >
                                Configurar integraciones
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* Article Preview */}
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Artículo</p>
                                <p className="font-medium truncate">{title || 'Sin título'}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {content.replace(/<[^>]*>/g, '').slice(0, 100)}...
                                </p>
                            </div>

                            {/* Blog Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Publicar en:</label>
                                <select
                                    value={selectedIntegration}
                                    onChange={(e) => setSelectedIntegration(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                >
                                    <option value="">Selecciona un blog...</option>
                                    {integrations.map((integration) => (
                                        <option key={integration.id} value={integration.id}>
                                            {integration.name} ({integration.site_url.replace(/^https?:\/\//, '')})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Publish Status */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Estado:</label>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="draft"
                                            checked={publishStatus === 'draft'}
                                            onChange={() => setPublishStatus('draft')}
                                            className="accent-primary"
                                        />
                                        <span className="text-sm">Borrador</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="publish"
                                            checked={publishStatus === 'publish'}
                                            onChange={() => setPublishStatus('publish')}
                                            className="accent-primary"
                                        />
                                        <span className="text-sm">Publicar ahora</span>
                                    </label>
                                </div>
                            </div>

                            {/* Result Message */}
                            {result && (
                                <div className={`flex items-start gap-2 p-3 rounded-lg ${result.success
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {result.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                    <div className="flex-1">
                                        <p className="text-sm">{result.message}</p>
                                        {result.externalUrl && (
                                            <a
                                                href={result.externalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-sm font-medium mt-1 hover:underline"
                                            >
                                                Ver artículo
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {integrations.length > 0 && !result?.success && (
                    <div className="p-4 border-t border-border">
                        <button
                            onClick={handlePublish}
                            disabled={!selectedIntegration || publishing}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {publishing ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Publicando...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    {publishStatus === 'draft' ? 'Guardar como borrador' : 'Publicar ahora'}
                                </>
                            )}
                        </button>
                    </div>
                )}

                {result?.success && (
                    <div className="p-4 border-t border-border">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
