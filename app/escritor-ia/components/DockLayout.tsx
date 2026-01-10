"use client";

import React, { useState, useEffect } from "react";
import type { LayoutData, TabData, BoxData } from "rc-dock";
import { DockLayout as RcDockLayout } from "rc-dock";
import "rc-dock/dist/rc-dock.css";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { RichEditorPanel } from "./panels/RichEditorPanel";
import { PagesPanel } from "./panels/PagesPanel";
import { SeoPanel } from "./panels/SeoPanel";
import { ExportPanel } from "./panels/ExportPanel";
import { AgentPanel } from "./panels/AgentPanel";
import { CreativityPanel } from "./panels/CreativityPanel";
import { PromptPanel } from "./panels/PromptPanel";
import { ChatPanel } from "./panels/ChatPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, FileEdit, Files, BarChart, Download, MessageSquare, Settings, Wand2, FileText } from "lucide-react";

// Helper to define tab content
const tabComponents: Record<string, React.ReactNode> = {
    editor: <RichEditorPanel />,
    pages: <PagesPanel />,
    seo: <SeoPanel />,
    export: <ExportPanel />,
    agent: <AgentPanel />,
    creativity: <CreativityPanel />,
    prompt: <PromptPanel />,
    chat: <ChatPanel />
};

const tabTitles: Record<string, string> = {
    editor: "Editor Avanzado",
    pages: "Gestor de Páginas",
    seo: "Análisis SEO",
    export: "Exportar Documento",
    agent: "Configuración y Modelos",
    creativity: "Nivel de Creatividad",
    prompt: "Instrucciones",
    chat: "Chat con IA"
};

const defaultLayout: LayoutData = {
    dockbox: {
        mode: "horizontal",
        children: [
            {
                mode: "vertical",
                size: 70,
                children: [
                    {
                        tabs: [{ id: "pages", title: "Páginas", closable: true }],
                        size: 200,
                    },
                    {
                        tabs: [{ id: "editor", title: "Editor Avanzado", closable: false }],
                        size: 800,
                    },
                ],
            },
            {
                mode: "vertical",
                size: 30,
                children: [
                    {
                        tabs: [
                            { id: "agent", title: "Agente y Modelos", closable: true },
                            { id: "export", title: "Exportar", closable: true }
                        ],
                        size: 200,
                    },
                    {
                        tabs: [
                            { id: "chat", title: "Chat IA", closable: true },
                            { id: "seo", title: "SEO", closable: true }
                        ],
                        size: 400,
                    },
                    {
                        tabs: [
                            { id: "creativity", title: "Creatividad", closable: true },
                            { id: "prompt", title: "Instrucciones", closable: true }
                        ],
                        size: 300,
                    },
                ],
            },
        ],
    },
} as any;

export function DockLayout() {
    const [layout, setLayout] = useState<LayoutData | null>(null);
    const [showAddPanel, setShowAddPanel] = useState(false);
    const dockLayoutRef = React.useRef<RcDockLayout>(null);
    const { t } = useSimpleTranslations();

    useEffect(() => {
        const savedLayout = localStorage.getItem("escritor-dock-layout-v2"); // Versioned layout to reset old ones
        if (savedLayout) {
            try {
                setLayout(JSON.parse(savedLayout));
            } catch (e) {
                console.error("Error parsing saved layout", e);
                setLayout(defaultLayout);
            }
        } else {
            setLayout(defaultLayout);
        }
    }, []);

    const handleLayoutChange = (newLayout: LayoutData) => {
        setLayout(newLayout);
        localStorage.setItem("escritor-dock-layout-v2", JSON.stringify(newLayout));
    };

    const loadTab = (data: TabData): TabData => {
        const id = data.id || "";
        if (tabComponents[id]) {
            return {
                id,
                title: data.title || tabTitles[id] || id,
                content: (
                    <div className="h-full w-full overflow-hidden bg-background">
                        {tabComponents[id]}
                    </div>
                ),
                closable: data.closable ?? true,
            }
        }
        return {
            id,
            title: "Unknown",
            content: <div>Panel desconocido</div>,
            closable: true
        };
    };

    const resetLayout = () => {
        setLayout(defaultLayout);
        localStorage.setItem("escritor-dock-layout-v2", JSON.stringify(defaultLayout));
    };

    // Definir paneles disponibles para agregar
    const availablePanels = [
        { id: 'editor', title: 'Editor Avanzado', icon: FileEdit, description: 'Editor de texto enriquecido' },
        { id: 'pages', title: 'Gestor de Páginas', icon: Files, description: 'Administra múltiples páginas' },
        { id: 'seo', title: 'Análisis SEO', icon: BarChart, description: 'Métricas y análisis SEO' },
        { id: 'chat', title: 'Chat con IA', icon: MessageSquare, description: 'Asistente conversacional' },
        { id: 'agent', title: 'Configuración', icon: Settings, description: 'Modelos y ajustes' },
        { id: 'export', title: 'Exportar', icon: Download, description: 'Exportar documentos' },
        { id: 'creativity', title: 'Creatividad', icon: Wand2, description: 'Nivel de creatividad' },
        { id: 'prompt', title: 'Instrucciones', icon: FileText, description: 'Prompt personalizado' },
    ];

    // Función para agregar un nuevo panel
    const addPanel = (panelId: string) => {
        if (!dockLayoutRef.current || !layout) return;

        const panelInfo = availablePanels.find(p => p.id === panelId);
        if (!panelInfo) return;

        // Crear nuevo tab con contenido usando loadTab
        const baseTab: TabData = {
            id: `${panelId}-${Date.now()}`, // ID único
            title: panelInfo.title,
            closable: true,
            content: <div>Loading...</div> // Placeholder temporalque será reemplazado por loadTab
        };

        // loadTab agregará el contenido correcto
        const newTab = loadTab(baseTab);

        // Buscar el primer panel box para agregar el tab
        // Por simplicidad, lo agregamos al último box del layout
        const findLastBox = (node: any): any => {
            if (node.tabs) return node;
            if (node.children && node.children.length > 0) {
                return findLastBox(node.children[node.children.length - 1]);
            }
            return null;
        };

        const lastBox = findLastBox(layout.dockbox);
        if (lastBox && lastBox.tabs) {
            // Usar API de rc-dock para agregar tab
            dockLayoutRef.current.dockMove(newTab, lastBox, 'middle');
        }

        setShowAddPanel(false);
    };

    if (!layout) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] w-full relative group">
            <style jsx global>{`
        .dock-layout {
            background: transparent;
            height: 100%;
            width: 100%;
        }
        .dock-panel {
            background: hsl(var(--card));
            border: 1px solid hsl(var(--border));
        }
        .dock-bar {
            background: hsl(var(--muted));
            border-bottom: 1px solid hsl(var(--border));
            font-size: 0.875rem;
        }
        .dock-tab {
            background: transparent;
            color: hsl(var(--muted-foreground));
            border-right: 1px solid hsl(var(--border));
            padding: 6px 16px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .dock-tab:hover {
            background: hsl(var(--accent));
            color: hsl(var(--accent-foreground));
        }
        .dock-tab-active {
            background: hsl(var(--background));
            color: hsl(var(--primary));
            font-weight: 600;
            border-bottom: 2px solid hsl(var(--primary));
        }
        .dock-tab-close-btn {
           margin-left: 8px;
           opacity: 0.5;
           font-size: 0.8em;
        }
        .dock-tab-close-btn:hover {
           opacity: 1;
           color: hsl(var(--destructive));
        }
        .dock-drop-layer .dock-drop-square {
            background: hsl(var(--primary));
            opacity: 0.2;
        }
      `}</style>

            <div className="absolute top-[-30px] right-0 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Botón para agregar paneles */}
                <Popover open={showAddPanel} onOpenChange={setShowAddPanel}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Agregar Panel
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="end">
                        <div className="space-y-1">
                            <p className="text-sm font-medium mb-2">Selecciona un panel</p>
                            {availablePanels.map(panel => (
                                <Button
                                    key={panel.id}
                                    variant="ghost"
                                    className="w-full justify-start h-auto py-2"
                                    onClick={() => addPanel(panel.id)}
                                >
                                    <panel.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <div className="text-left">
                                        <div className="text-sm font-medium">{panel.title}</div>
                                        <div className="text-xs text-muted-foreground">{panel.description}</div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Botón para restaurar layout */}
                <button
                    onClick={resetLayout}
                    className="text-xs text-muted-foreground hover:text-primary underline px-2 py-1 bg-background/80 rounded"
                >
                    Restaurar diseño
                </button>
            </div>

            <RcDockLayout
                ref={dockLayoutRef}
                defaultLayout={layout}
                style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
                loadTab={loadTab}
                onLayoutChange={handleLayoutChange}
            />
        </div>
    );
}
