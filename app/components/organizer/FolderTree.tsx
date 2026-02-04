"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Folder, FolderOpen, MoreHorizontal, Plus, FileText, Delete, Edit, FolderPlus, Trash, GripVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/app/components/ui/context-menu";

// DND Kit
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragEndEvent,
    DragStartEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

export interface SimpleDocument {
    id: string;
    title: string;
    folderId?: string;
    updated_at?: string;
}

interface FolderNode {
    id: string;
    name: string;
    children: FolderNode[];
    documents: SimpleDocument[];
}

interface FolderTreeProps {
    documents: SimpleDocument[];
    onSelectDocument: (docId: string) => void;
    activeDocId?: string | null;
    onCreateFolder?: (parentId: string) => void;
    onRename?: (id: string, type: 'folder' | 'document', newName: string) => void;
    onDelete?: (id: string, type: 'folder' | 'document') => void;
    onMove?: (docId: string, folderId: string) => void;
}

// DRAGGABLE ITEM WRAPPER
function DraggableFile({ doc, isActive, onClick, onRename, onDelete }: {
    doc: SimpleDocument,
    isActive: boolean,
    onClick: () => void,
    onRename?: (id: string, type: 'document', name: string) => void,
    onDelete?: (id: string, type: 'document') => void
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `doc-${doc.id}`,
        data: { type: 'document', id: doc.id, title: doc.title }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        opacity: isDragging ? 0.5 : 1,
    } : undefined;

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div
                    ref={setNodeRef}
                    style={style}
                    {...listeners}
                    {...attributes}
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all ml-4 border-l border-border/40 touch-none",
                        isActive
                            ? "bg-primary/10 text-primary border-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
                    )}
                >
                    <GripVertical className="w-3 h-3 opacity-20" />
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-sm truncate flex-1">{doc.title || "Sin título"}</span>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={() => onRename?.(doc.id, 'document', prompt('Nuevo nombre:') || doc.title)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Renombrar
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete?.(doc.id, 'document')}>
                    <Trash className="w-4 h-4 mr-2" />
                    Eliminar
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}

// DROPPABLE FOLDER WRAPPER
function DroppableFolder({ node, depth, expanded, onToggle, activeDocId, onSelectDocument, onCreateFolder, onRename, onDelete, children }: any) {
    const { setNodeRef, isOver } = useDroppable({
        id: `folder-${node.id}`,
        data: { type: 'folder', id: node.id }
    });

    const isExpanded = expanded[node.id];
    const hasChildren = node.children.length > 0 || node.documents.length > 0;
    const paddingLeft = depth * 12 + 8;

    return (
        <div className="select-none">
            <ContextMenu>
                <ContextMenuTrigger>
                    <div
                        ref={setNodeRef}
                        className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group text-muted-foreground hover:text-foreground",
                            isOver ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-muted/50"
                        )}
                        style={{ paddingLeft: `${paddingLeft}px` }}
                        onClick={(e) => { e.stopPropagation(); onToggle(node.id, e); }}
                    >
                        <button
                            className={cn("p-0.5 rounded-sm hover:bg-muted/80 transition-transform", !hasChildren && "invisible")}
                        >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded || isOver ?
                            <FolderOpen className={cn("w-4 h-4", isOver ? "text-primary" : "text-amber-500/80")} /> :
                            <Folder className="w-4 h-4 text-amber-500/80" />
                        }

                        <span className="text-sm font-medium truncate flex-1">{node.name}</span>
                        <span className="text-[10px] text-muted-foreground opacity-50">{node.documents.length}</span>
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => onCreateFolder?.(node.id)}>
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Nueva Carpeta
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => onRename?.(node.id, 'folder', prompt('Nuevo nombre:') || node.name)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Renombrar
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete?.(node.id, 'folder')}>
                        <Trash className="w-4 h-4 mr-2" />
                        Eliminar
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function FolderTree({ documents, onSelectDocument, activeDocId, onCreateFolder, onRename, onDelete, onMove }: FolderTreeProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'root': true });
    const [activeDrag, setActiveDrag] = useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Organized Data into a Tree Structure (Virtual)
    const tree = useMemo(() => {
        const root: FolderNode = { id: 'root', name: 'Mis Documentos', children: [], documents: [] };
        const folders: Record<string, FolderNode> = { 'root': root };

        const draftsFolder: FolderNode = { id: 'drafts', name: 'Borradores', children: [], documents: [] };
        folders['drafts'] = draftsFolder;
        root.children.push(draftsFolder);

        documents.forEach(doc => {
            if (doc.folderId && folders[doc.folderId]) {
                folders[doc.folderId].documents.push(doc);
            } else {
                root.documents.push(doc);
            }
        });

        return root;
    }, [documents]);

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDrag(event.active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDrag(null);

        if (!over) return;

        const docId = active.id.toString().replace('doc-', '');
        const folderId = over.id.toString().replace('folder-', '');

        if (docId && folderId) {
            onMove?.(docId, folderId);
        }
    };

    const renderNode = (node: FolderNode, depth: number = 0) => {
        return (
            <DroppableFolder
                key={node.id}
                node={node}
                depth={depth}
                expanded={expanded}
                onToggle={toggleExpand}
                onCreateFolder={onCreateFolder}
                onRename={onRename}
                onDelete={onDelete}
            >
                {node.children.map(child => renderNode(child, depth + 1))}
                {node.documents.map(doc => (
                    <DraggableFile
                        key={doc.id}
                        doc={doc}
                        isActive={activeDocId === doc.id}
                        onClick={() => onSelectDocument(doc.id)}
                        onRename={onRename}
                        onDelete={onDelete}
                    />
                ))}
            </DroppableFolder>
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col gap-1 py-1">
                {renderNode(tree)}
            </div>

            <DragOverlay>
                {activeDrag ? (
                    <div className="bg-background border border-border p-2 rounded shadow-lg opacity-90 flex items-center gap-2 pointer-events-none">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">{activeDrag.title}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
