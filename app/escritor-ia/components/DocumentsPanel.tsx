'use client';

import React from 'react';
import { useWriter } from '../context/WriterContext';
import { Button } from "@/app/components/ui/button";
import { Plus, FileText, Search, Trash2 } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { FolderTree } from "@/app/components/organizer/FolderTree";
import { useSimpleTranslations } from "@/app/lib/simple-translations"; // Added hook

export default function DocumentsPanel() {
    const { setContent, setDocTitle, setDocId, docId: currentDocId, lastSaved, startNewSession } = useWriter();
    const { t } = useSimpleTranslations(); // Hook usage
    const [documents, setDocuments] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchDocuments = React.useCallback(async () => {
        try {
            setError(null);
            const res = await fetch('/api/documents/list');

            if (res.status === 401) {
                // User not logged in - silent fail or empty list
                setDocuments([]);
                setLoading(false);
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents || []);
            } else {
                throw new Error(`Error ${res.status}`);
            }
        } catch (e) {
            console.error("Error fetching docs", e);
            setError("No se pudieron cargar los documentos");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchDocuments();
        const interval = setInterval(fetchDocuments, 10000); // Poll slower (10s)
        return () => clearInterval(interval);
    }, [fetchDocuments, lastSaved]);

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-2 border-b flex justify-between items-center">
                <h3 className="font-semibold text-sm">{t('docs_title')}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                    setDocId(null);
                    setDocTitle('');
                    setContent('');
                    startNewSession();
                }}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            <div className="p-2">
                <div className="relative">
                    <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                    <Input placeholder={t('docs_search_placeholder')} className="pl-7 h-8 text-xs" />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2">
                    {loading && <div className="text-xs text-center text-muted-foreground p-2">{t('docs_loading')}</div>}
                    {!loading && documents.length === 0 && (
                        <div className="text-xs text-center text-muted-foreground p-2">{t('docs_empty')}</div>
                    )}

                    {!loading && documents.length > 0 && (
                        <FolderTree
                            documents={documents}
                            activeDocId={currentDocId}
                            onSelectDocument={(id) => {
                                const doc = documents.find((d: any) => d.id === id);
                                if (doc) {
                                    setDocId(doc.id);
                                    setDocTitle(doc.title);
                                    setContent(doc.content || '');
                                }
                            }}
                            onCreateFolder={(parentId) => {
                                alert(`Crear carpeta nueva dentro de: ${parentId} (Lógica pendiente)`);
                            }}
                            onRename={(id, type, newName) => {
                                console.log(`Renombrar ${type} ${id} a ${newName}`);
                                alert(`Simulando renombrado de ${type} a "${newName}"`);
                            }}
                            onDelete={async (id, type) => {
                                if (type === 'document') {
                                    if (confirm(t('docs_delete_confirm'))) {
                                        try {
                                            await fetch(`/api/documents/delete?id=${id}`, { method: 'DELETE' });
                                            fetchDocuments();
                                            if (currentDocId === id) {
                                                setDocId(null);
                                                setDocTitle('');
                                                setContent('');
                                            }
                                        } catch (e) {
                                            console.error("Error deleting", e);
                                        }
                                    }
                                } else {
                                    alert("Eliminar carpeta aún no implementado");
                                }
                            }}
                            onMove={(docId, folderId) => {
                                console.log(`Moving doc ${docId} to folder ${folderId}`);
                                // Here we would call API to update folder_id
                                alert(`Documento movido a: ${folderId === 'root' ? 'Inicio' : folderId}`);
                            }}
                        />
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
