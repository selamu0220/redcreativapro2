'use client';

import { useState, useEffect } from 'react';
import { Loader2, X, User, Instagram, Save } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
}

export default function UserProfileModal({ isOpen, onClose, userId }: UserProfileModalProps) {
    const [profile, setProfile] = useState<any>({
        handle: '',
        bio: '',
        instagram: '',
        why_i_use_app: '',
        avatar_url: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditable, setIsEditable] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
        }
    }, [isOpen, userId]);

    async function fetchProfile() {
        setIsLoading(true);
        try {
            const userRes = await fetch('/api/current-user');
            const userData = await userRes.json();
            const currentUserId = userData.user?.id;

            const targetId = userId || currentUserId;
            setIsEditable(!userId || userId === currentUserId);

            const res = await fetch(`/api/community/profile?userId=${targetId}`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setProfile(data);
                } else if (isEditable) {
                    setProfile({
                        handle: `${userData.user.given_name || 'Usuario'}`,
                        avatar_url: userData.user.picture || ''
                    });
                }
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isEditable) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/community/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });

            if (!res.ok) throw new Error('Failed to update');

            toast.success('Profile updated!');
            onClose();
        } catch (e) {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg border border-border animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                    <h3 className="text-xl font-bold text-card-foreground">
                        {isEditable ? 'Editar Perfil' : 'Perfil de Usuario'}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Avatar & Handle info */}
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-secondary overflow-hidden border-2 border-primary/20 flex-shrink-0">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <User size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Display Name</label>
                                    {isEditable ? (
                                        <input
                                            value={profile.handle || ''}
                                            onChange={e => setProfile({ ...profile, handle: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-bold text-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                        />
                                    ) : (
                                        <div className="text-xl font-bold text-foreground">{profile.handle || 'Unknown'}</div>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1 block">Bio</label>
                                {isEditable ? (
                                    <textarea
                                        value={profile.bio || ''}
                                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground placeholder:text-muted-foreground/50"
                                        rows={3}
                                        placeholder="Cuéntanos sobre ti..."
                                    />
                                ) : (
                                    <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio || 'Sin biografía.'}</p>
                                )}
                            </div>

                            {/* Instagram */}
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1 block flex items-center gap-2">
                                    <Instagram size={14} /> Usuario Instagram
                                </label>
                                {isEditable ? (
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
                                        <input
                                            value={profile.instagram || ''}
                                            onChange={e => setProfile({ ...profile, instagram: e.target.value })}
                                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground"
                                            placeholder="username"
                                        />
                                    </div>
                                ) : (
                                    profile.instagram ? (
                                        <a
                                            href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            @{profile.instagram.replace('@', '')}
                                        </a>
                                    ) : <span className="text-muted-foreground text-sm">No vinculado</span>
                                )}
                            </div>

                            {/* Why Use App */}
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1 block">
                                    ¿Por qué uso RedCreativaPro?
                                </label>
                                {isEditable ? (
                                    <textarea
                                        value={profile.why_i_use_app || ''}
                                        onChange={e => setProfile({ ...profile, why_i_use_app: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground placeholder:text-muted-foreground/50"
                                        rows={2}
                                        placeholder="Lo uso para potenciar mi agencia..."
                                    />
                                ) : (
                                    <p className="text-muted-foreground italic">
                                        "{profile.why_i_use_app || 'Solo mirando!'}"
                                    </p>
                                )}
                            </div>

                            {/* Footer Actions */}
                            {isEditable && (
                                <div className="flex justify-end pt-4 border-t border-border/50">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground mr-2 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Guardar Perfil
                                    </button>
                                </div>
                            )}

                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
