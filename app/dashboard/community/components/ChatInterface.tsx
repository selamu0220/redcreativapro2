import { useEffect, useState, useRef } from 'react';
import { Loader2, Send, ArrowLeft, MoreVertical, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import UserProfileModal from './UserProfileModal';
import { useAuth } from '@/app/hooks/useAuth';
import { ChannelSettingsModal } from './ChannelSettingsModal';

interface Message {
    id: string;
    content: string;
    sender_name: string;
    sender_avatar: string;
    user_id: string;
    created_at: string;
}

interface ChatInterfaceProps {
    channelId: string;
    onBack: () => void;
}

export default function ChatInterface({ channelId, onBack }: ChatInterfaceProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [channelInfo, setChannelInfo] = useState<any>(null);
    const [userRole, setUserRole] = useState<'admin' | 'participant' | 'viewer' | null>(null);

    // Profile Modal State
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Settings Modal State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (channelId) {
            fetchChannelInfo();
            fetchMessages();
            fetchMyRole();
            // Set up polling every 5 seconds for new messages
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [channelId]);

    useEffect(() => {
        if (channelId && user) {
            fetchMyRole();
        }
    }, [channelId, user]);

    useEffect(() => {
        if (messages.length > 0 && !isLoading) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    async function fetchChannelInfo() {
        try {
            const res = await fetch(`/api/community/channels/${channelId}`);
            if (res.ok) setChannelInfo(await res.json());
        } catch (e) { console.error(e); }
    }

    async function fetchMyRole() {
        if (!user) return;
        try {
            const res = await fetch(`/api/community/channels/${channelId}/members`);
            if (res.ok) {
                const members = await res.json();
                const myMember = members.find((m: any) => m.user_id === user.id);
                if (myMember) {
                    setUserRole(myMember.role);
                } else {
                    await joinChannel();
                }
            }
        } catch (e) { console.error(e); }
    }

    async function joinChannel() {
        try {
            const res = await fetch(`/api/community/channels/${channelId}/members`, { method: 'POST' });
            if (res.ok) {
                setUserRole('participant');
            } else {
                setUserRole('viewer');
            }
        } catch (e) { setUserRole('viewer'); }
    }

    async function fetchMessages() {
        try {
            const res = await fetch(`/api/community/messages?channelId=${channelId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(data)) return data;
                    return prev;
                });
            }
        } catch (error) {
            console.error('Failed to fetch messages');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/community/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelId, content: newMessage }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error('[ChatInterface] Failed to send message:', data);
                toast.error(data.error || 'Failed to send message');
                return;
            }

            setNewMessage('');
            setMessages(prev => [...prev, data]);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    }

    async function handleUpdateChannel(name: string, description: string) {
        try {
            const res = await fetch(`/api/community/channels/${channelId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });

            if (res.ok) {
                setChannelInfo({ ...channelInfo, name, description });
                setIsSettingsOpen(false);
                toast.success('Canal actualizado');
            } else {
                toast.error('Error al actualizar');
            }
        } catch (e) { toast.error('Error de red'); }
    }

    function handleUserClick(userId: string) {
        setSelectedUserId(userId);
        setIsProfileOpen(true);
    }

    if (isLoading && messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 bg-background/50">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    const isSuperAdmin = user?.email === 'selamu.garciabravo@gmail.com';
    const isOwner = channelInfo?.owner_id === user?.id;
    const canManage = userRole === 'admin' || isOwner || isSuperAdmin;
    const canChat = userRole === 'admin' || userRole === 'participant' || isOwner || isSuperAdmin;

    return (
        <div className="flex flex-col h-full bg-transparent relative">
            {/* Header */}
            <div className="h-16 px-6 border-b border-border/40 flex items-center justify-between flex-shrink-0 bg-background/40 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 text-muted-foreground hover:bg-secondary rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="font-bold text-foreground flex items-center gap-2">
                            <span className="text-muted-foreground/50">#</span>
                            {channelInfo?.name || 'Channel'}
                        </h2>
                        {channelInfo?.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{channelInfo.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Settings Button */}
                    {canManage && (
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-primary transition-colors"
                            title="Ajustes del Canal"
                        >
                            <SettingsIcon size={20} />
                        </button>
                    )}

                    {/* My Profile Button */}
                    <button
                        onClick={() => { setSelectedUserId(undefined); setIsProfileOpen(true); }}
                        className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
                        title="My Profile"
                    >
                        <UserIcon size={20} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/20 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
                {messages.map((msg) => {
                    const isMe = user?.id === msg.user_id;
                    return (
                        <div key={msg.id} className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div
                                className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-transparent group-hover:ring-primary/20"
                                onClick={() => handleUserClick(msg.user_id)}
                            >
                                {msg.sender_avatar ? (
                                    <img src={msg.sender_avatar} alt={msg.sender_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary font-bold uppercase text-sm bg-primary/10">
                                        {msg.sender_name[0]}
                                    </div>
                                )}
                            </div>
                            <div className={`flex-1 max-w-[85%] ${isMe ? 'text-right' : ''}`}>
                                <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <span
                                        className="font-semibold text-sm text-foreground cursor-pointer hover:underline"
                                        onClick={() => handleUserClick(msg.user_id)}
                                    >
                                        {msg.sender_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`
                                    inline-block text-left whitespace-pre-wrap break-words leading-relaxed text-[15px] px-4 py-2 rounded-2xl shadow-sm
                                    ${isMe
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-card border border-border/50 text-card-foreground rounded-tl-none'}
                                `}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-background/40 backdrop-blur-md border-t border-border/40">
                {canChat ? (
                    <>
                        <form onSubmit={handleSend} className="flex gap-2 relative">
                            <input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={`Enviar mensaje a #${channelInfo?.name || 'channel'}`}
                                className="flex-1 px-4 py-3 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                                disabled={isSending}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || isSending}
                                className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                            >
                                {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            </button>
                        </form>
                        <p className="text-xs text-center text-muted-foreground mt-2 opacity-60">
                            Ambiente profesional. El contenido inapropiado es moderado automáticamente.
                        </p>
                    </>
                ) : (
                    <div className="text-center py-4 text-muted-foreground bg-secondary/30 rounded-xl border border-border/50">
                        Solo los participantes pueden escribir en este canal.
                    </div>
                )}
            </div>

            <UserProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                userId={selectedUserId}
            />

            {channelInfo && (
                <ChannelSettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    channelId={channelId}
                    channelName={channelInfo.name}
                    channelDescription={channelInfo.description}
                    onUpdateChannel={handleUpdateChannel}
                />
            )}
        </div>
    );
}
