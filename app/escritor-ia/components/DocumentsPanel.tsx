'use client';

import React from 'react';
import { useWriter } from '../context/WriterContext';
import { Button } from "@/app/components/ui/button";
import { Plus, FileText, Search, Trash2 } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { ScrollArea } from "@/app/components/ui/scroll-area";

export default function DocumentsPanel() {
    const { setContent, setDocTitle, setDocId, docId: currentDocId, lastSaved, startNewSession } = useWriter();
    const [documents, setDocuments] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/documents/list');
            if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents || []);
            }
        } catch (e) {
            console.error("Error fetching docs", e);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchDocuments();
        // Poll every 5 seconds to keep list updated (simple "realtime")
        const interval = setInterval(fetchDocuments, 5000);
        return () => clearInterval(interval);
    }, [lastSaved]);

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-2 border-b flex justify-between items-center">
                <h3 className="font-semibold text-sm">Mis Documentos</h3>
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
                    <Input placeholder="Buscar..." className="pl-7 h-8 text-xs" />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {loading && <div className="text-xs text-center text-muted-foreground p-2">Cargando...</div>}
                    {!loading && documents.length === 0 && (
                        <div className="text-xs text-center text-muted-foreground p-2">No hay documentos guardados.</div>
                    )}
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className={`flex justify-between items-center p-2 rounded-md hover:bg-muted cursor-pointer group ${currentDocId === doc.id ? 'bg-muted/80 ring-1 ring-primary/20' : ''}`}
                            onClick={() => {
                                setDocId(doc.id);
                                setDocTitle(doc.title);
                                setContent(doc.content || '');
                            }}
                        >
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-3 h-3 text-primary shrink-0" />
                                    <span className="text-sm font-medium truncate">{doc.title}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground truncate pl-5">
                                    {new Date(doc.updated_at).toLocaleDateString()}
                                </span>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (confirm('¿Eliminar documento?')) {
                                        await fetch(`/api/documents/delete?id=${doc.id}`, { method: 'DELETE' });
                                        fetchDocuments(); // Refresh list
                                        if (currentDocId === doc.id) {
                                            setDocId(null);
                                            setDocTitle('');
                                            setContent('');
                                        }
                                    }
                                }}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
