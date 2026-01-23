'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Shield, ShieldAlert, User, Trash2, Save, X } from 'lucide-react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

interface Member {
    $id: string; // Appwrite Document ID
    user_id: string;
    role: 'admin' | 'participant' | 'viewer';
    joined_at: string;
    profile?: { handle: string; avatar_url: string };
}

interface ChannelSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    channelId: string;
    channelName: string;
    channelDescription: string;
    onUpdateChannel: (name: string, description: string) => Promise<void>;
}

export function ChannelSettingsModal({
    isOpen, onClose, channelId, channelName, channelDescription, onUpdateChannel
}: ChannelSettingsModalProps) {
    const { user } = useKindeBrowserClient();
    const [name, setName] = useState(channelName);
    const [description, setDescription] = useState(channelDescription);
    const [members, setMembers] = useState<Member[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
            setName(channelName);
            setDescription(channelDescription);
        }
    }, [isOpen, channelId]);

    const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
            const res = await fetch(`/api/community/channels/${channelId}/members`);
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleSaveGeneral = async () => {
        setSaving(true);
        try {
            await onUpdateChannel(name, description);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: string) => {
        try {
            const res = await fetch(`/api/community/channels/${channelId}/members/${memberId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                setMembers(members.map(m => m.$id === memberId ? { ...m, role: newRole as any } : m));
            } else {
                alert('No tienes permisos para cambiar el rol');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleKickMember = async (memberId: string) => {
        if (!confirm('¿Seguro que quieres eliminar a este miembro?')) return;
        try {
            const res = await fetch(`/api/community/channels/${channelId}/members/${memberId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setMembers(members.filter(m => m.$id !== memberId));
            }
        } catch (e) { console.error(e); }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle>Ajustes del Canal</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="members">Miembros</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Nombre del Canal</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-background border-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-background border-input min-h-[100px] resize-none"
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={handleSaveGeneral}
                                disabled={saving}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {saving ? 'Guardando...' : <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="members" className="mt-4">
                        {loadingMembers ? (
                            <div className="text-center py-8 text-muted-foreground">Cargando miembros...</div>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {members.map((member) => (
                                    <div key={member.$id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-foreground">
                                                    {member.user_id === user?.id ? 'Tú' : (member.profile?.handle || 'Usuario')}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {member.role === 'admin' && <Shield className="w-3 h-3 text-amber-500" />}
                                                    <span className="capitalize">{member.role}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Role Toggles (Simple Implementation for MVP) */}
                                            {member.role !== 'admin' && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-muted-foreground hover:text-amber-500"
                                                    title="Hacer Admin"
                                                    onClick={() => handleUpdateRole(member.$id, 'admin')}
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {member.role === 'admin' && member.user_id !== user?.id && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-amber-500 hover:text-muted-foreground"
                                                    title="Quitar Admin"
                                                    onClick={() => handleUpdateRole(member.$id, 'participant')}
                                                >
                                                    <ShieldAlert className="w-4 h-4" />
                                                </Button>
                                            )}

                                            {member.user_id !== user?.id && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                    title="Expulsar"
                                                    onClick={() => handleKickMember(member.$id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
