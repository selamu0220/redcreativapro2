'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Hash, Trash2 } from 'lucide-react';
import CreateChannelModal from './CreateChannelModal';
import { toast } from 'sonner';

interface ChannelListProps {
    selectedChannelId: string | null;
    onSelectChannel: (id: string) => void;
}

export default function ChannelList({ selectedChannelId, onSelectChannel }: ChannelListProps) {
    const [channels, setChannels] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetchChannels();
        fetchCurrentUser();
    }, []);

    async function fetchChannels() {
        try {
            const res = await fetch('/api/community/channels');
            if (res.ok) {
                const data = await res.json();
                setChannels(data);
            }
        } catch (error) {
            console.error('Failed to fetch channels', error);
            toast.error('Failed to load channels');
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchCurrentUser() {
        try {
            const res = await fetch('/api/current-user');
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data.user);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function handleDelete(e: React.MouseEvent, channelId: string) {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this channel?')) return;

        try {
            const res = await fetch(`/api/community/channels/${channelId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Channel deleted');
                fetchChannels();
                if (selectedChannelId === channelId) onSelectChannel('');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to delete');
            }
        } catch (e) {
            toast.error('Error deleting channel');
        }
    }

    const isAdmin = currentUser?.email === 'selamu.garciabravo@gmail.com';

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border/40 flex items-center justify-between backdrop-blur-sm bg-background/30">
                <h2 className="font-bold text-lg text-foreground">Canales</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Crear Canal"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="animate-spin text-muted-foreground" />
                    </div>
                ) : channels.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground text-sm">
                        No hay canales aún. ¡Sé el primero en crear uno!
                    </div>
                ) : (
                    channels.map((channel) => {
                        const channelId = channel.id || channel.$id;
                        return (
                            <div
                                key={channelId}
                                onClick={() => onSelectChannel(channelId)}
                                className={`
                group flex items-center justify-between w-full p-3 rounded-xl text-left transition-all cursor-pointer border border-transparent
                ${selectedChannelId === channelId
                                        ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                                        : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}
              `}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`
                  p-1.5 rounded-lg flex-shrink-0 transition-colors
                  ${selectedChannelId === channelId ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground group-hover:bg-background'}
                `}>
                                        <Hash size={16} />
                                    </div>
                                    <div className="truncate">
                                        <div className="font-medium truncate">{channel.name}</div>
                                        {channel.description && (
                                            <div className="text-xs truncate max-w-[200px] opacity-70">
                                                {channel.description}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Delete Button (Only for owner or admin) */}
                                {(isAdmin || currentUser?.id === channel.owner_id) && (
                                    <button
                                        onClick={(e) => handleDelete(e, channelId)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <CreateChannelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onChannelCreated={(newChannel) => {
                    setChannels([newChannel, ...channels]);
                    const newId = newChannel.id || newChannel.$id;
                    onSelectChannel(newId);
                }}
            />
        </div>
    );
}
