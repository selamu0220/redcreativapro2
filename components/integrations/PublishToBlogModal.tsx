'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getStockImage } from '@/lib/stock-images';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Loader2, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PublishToBlogModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialTitle: string;
    content: string; // HTML content
}

export function PublishToBlogModal({ open, onOpenChange, initialTitle, content }: PublishToBlogModalProps) {
    const [title, setTitle] = useState(initialTitle);
    const [excerpt, setExcerpt] = useState('');
    const [category, setCategory] = useState('General');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePublish = async () => {
        if (!title || !content) {
            toast.error('Título y contenido son requeridos');
            return;
        }

        setLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('Debes iniciar sesión para publicar');
                return;
            }

            // 1. Calculate read time
            const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
            const readTime = `${Math.ceil(words / 200)} min`;

            // 2. Generate slug
            const slug = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

            // 3. Insert into blog_posts
            const { error } = await supabase.from('blog_posts').insert({
                title,
                slug,
                excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
                content,
                image: imageUrl || getStockImage(category), // Smart default
                category,
                author: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Autor',
                user_id: user.id,
                read_time: readTime,
                published_at: new Date().toISOString(),
                status: 'published',
                views: 0,
                likes: 0,
                featured: false,
                trending: false,
                tags: []
            });

            if (error) throw error;

            toast.success('¡Artículo publicado con éxito!');
            onOpenChange(false);
            router.push(`/blog/${slug}`);

        } catch (error: any) {
            console.error('Error publishing:', error);
            toast.error('Error al publicar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Publicar en el Blog</DialogTitle>
                    <DialogDescription>
                        Publica tu artículo para que sea visible en el blog de la comunidad.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Inteligencia Artificial">Inteligencia Artificial</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Copywriting">Copywriting</SelectItem>
                                <SelectItem value="Tutoriales">Tutoriales</SelectItem>
                                <SelectItem value="General">General</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="excerpt">Extracto (Opcional)</Label>
                        <Textarea
                            id="excerpt"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Breve descripción para la tarjeta del blog..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="image">URL de Imagen (Opcional)</Label>
                        <Input
                            id="image"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                        />
                        <p className="text-xs text-muted-foreground">Deja en blanco para usar una imagen por defecto.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handlePublish} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        Publicar Ahora
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
