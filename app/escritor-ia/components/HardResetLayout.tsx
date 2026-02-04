'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const EditorPanel = dynamic(() => import('./EditorPanelV2'), {
    ssr: false,
    loading: () => <div>Loading Editor...</div>
});

const DocumentsPanel = dynamic(() => import('./DocumentsPanel'), { ssr: false });

export default function HardResetLayout() {
    return (
        <div className="h-screen w-full flex flex-col bg-background text-foreground">
            <div className="bg-red-600 text-white p-2 font-bold text-center">
                MODO RECUPERACIÓN (CACHE EXTINCTION)
            </div>
            <div className="flex-1 flex overflow-hidden">
                <div className="w-64 border-r hidden md:block">
                    <DocumentsPanel />
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 relative">
                    <EditorPanel />
                </div>
            </div>
        </div>
    );
}
