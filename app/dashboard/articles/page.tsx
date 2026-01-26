'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, ExternalLink, Eye, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import WorkingClientLayout from '@/app/components/WorkingClientLayout';
import { LanguageProvider } from '@/app/lib/language/context';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/app/hooks/useAuth';

interface BlogPost {
    id: string; // Using slug as ID or actual ID
    slug: string;
    title: string;
    published_at: string;
    views: number;
    status: string;
    image?: string;
}

function MyArticles() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchPosts();
        }
    }, [user]);

    const fetchPosts = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('user_id', user?.id)
                .order('published_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Error al cargar artículos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteSlug) return;
        setIsDeleting(true);

        try {
            const response = await fetch('/api/blog/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: deleteSlug })
            });

            if (!response.ok) throw new Error('Error deleting post');

            toast.success('Compromiso eliminado (Artículo borrado)');
            setPosts(posts.filter(p => p.slug !== deleteSlug));
        } catch (error) {
            console.error(error);
            toast.error('No se pudo eliminar el artículo');
        } finally {
            setIsDeleting(false);
            setDeleteSlug(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mis Artículos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona tus publicaciones del blog.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/escritor-ia">
                        <FileText className="mr-2 h-4 w-4" />
                        Escribir Nuevo
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : posts.length === 0 ? (
                <Card className="border-zinc-200 dark:border-zinc-800 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="p-4 bg-muted/50 rounded-full mb-4">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No tienes artículos publicados</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Usa el Escritor IA para generar y publicar contenido increíble en segundos.
                        </p>
                        <Button asChild>
                            <Link href="/escritor-ia">Ir al Escritor IA</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {posts.map((post) => (
                        <Card key={post.slug} className="group overflow-hidden border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md">
                            <div className="flex flex-col sm:flex-row sm:items-center p-6 gap-4">
                                {/* Image / Thumbnail */}
                                <div className="h-20 w-32 bg-muted rounded-md overflow-hidden flex-shrink-0 relative">
                                    {post.image ? (
                                        <img src={post.image} alt="" className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                            <FileText className="w-6 h-6 text-muted-foreground/30" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg truncate pr-4">
                                        <Link href={`/blog/${post.slug}`} className="hover:underline">
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                        <Badge variant="secondary" className="font-normal text-xs">
                                            {new Date(post.published_at).toLocaleDateString()}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" /> {post.views} vistas
                                        </span>
                                        <span className={`flex items-center gap-1 capitalize ${post.status === 'published' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                            {post.status === 'published' ? 'Publicado' : post.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                                    <Button size="sm" variant="outline" asChild>
                                        <Link href={`/blog/${post.slug}`} target="_blank">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Ver
                                        </Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setDeleteSlug(post.slug)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={!!deleteSlug} onOpenChange={() => setDeleteSlug(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el artículo del blog. No se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleDelete(); }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function MyArticlesPage() {
    return (
        <WorkingClientLayout>
            <LanguageProvider>
                <MyArticles />
            </LanguageProvider>
        </WorkingClientLayout>
    );
}
