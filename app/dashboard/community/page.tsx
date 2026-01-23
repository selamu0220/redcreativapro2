'use client';

import { useState } from 'react';
import ChannelList from './components/ChannelList';
import ChatInterface from './components/ChatInterface';
import { useSearchParams } from 'next/navigation';

export default function CommunityPage() {
    const searchParams = useSearchParams();
    const initialChannelId = searchParams.get('channel');
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(initialChannelId);

    return (
        <>
            {/* Sidebar */}
            <div className={`
        w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-background/50 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden ml-4 my-4
        ${selectedChannelId ? 'hidden md:flex' : 'flex'}
      `}>
                <ChannelList
                    selectedChannelId={selectedChannelId}
                    onSelectChannel={setSelectedChannelId}
                />
            </div>

            {/* Main Chat Area */}
            <div className={`
        flex-1 bg-background/50 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden m-4 ml-0
        ${!selectedChannelId ? 'hidden md:flex' : 'flex'}
      `}>
                {selectedChannelId ? (
                    <ChatInterface
                        channelId={selectedChannelId}
                        onBack={() => setSelectedChannelId(null)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4 text-3xl animate-in zoom-in-50 duration-500">
                            👋
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-foreground">Bienvenido a la Comunidad</h2>
                        <p className="max-w-md">
                            Selecciona un canal de la lista para empezar a chatear, compartir tips y conectar con otros creadores.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
