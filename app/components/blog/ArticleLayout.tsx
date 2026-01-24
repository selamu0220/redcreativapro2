'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Calendar, Share2, Bookmark, User, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ArticleWrapper from '@/app/components/ArticleWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ArticleLayoutProps {
    children: React.ReactNode;
    meta: {
        title: string;
        description: string;
        category: string;
        author: {
            name: string;
            avatar?: string;
            role?: string;
        };
        date: string;
        readTime: string;
        image?: string;
    };
}

export default function ArticleLayout({ children, meta }: ArticleLayoutProps) {
    return (
        <ArticleWrapper title={meta.title} showFooter={true}>
            {/* 1. Rich Hero Section */}
            <header className="mb-12 text-center relative px-4">
                <Link
                    href="/blog"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Blog
                </Link>

                <div className="flex items-center justify-center gap-2 mb-6">
                    <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 transition-colors uppercase tracking-wider text-[10px] px-3 py-1">
                        {meta.category}
                    </Badge>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-xs font-medium text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {meta.readTime}
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-[1.1] tracking-tight max-w-4xl mx-auto text-balance">
                    {meta.title}
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8 text-balance">
                    {meta.description}
                </p>

                {/* Author & Meta Line */}
                <div className="flex flex-wrap items-center justify-center gap-6 border-y border-border/40 py-6 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-border/20">
                            <AvatarImage src={meta.author.avatar} />
                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <p className="text-sm font-bold text-foreground">{meta.author.name}</p>
                            <p className="text-xs text-muted-foreground">{meta.author.role || 'Author'}</p>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-8 bg-border/40" />

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 opacity-70" />
                            {new Date(meta.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>

                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                            <Bookmark className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Feature Image (Optional) */}
                {meta.image && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-10 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 aspect-video relative max-w-4xl mx-auto"
                    >
                        <Image
                            src={meta.image}
                            alt={meta.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </motion.div>
                )}
            </header>

            {/* 2. Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12 max-w-6xl mx-auto relative items-start">

                {/* Main Content */}
                <div className="min-w-0">
                    <div className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-8 prose-p:text-[1.1rem]
                prose-li:text-muted-foreground
                prose-strong:text-foreground prose-strong:font-bold
                prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-lg
                prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic
             ">
                        {children}
                    </div>

                    {/* Footer Bio */}
                    <div className="mt-16 p-8 bg-muted/30 rounded-3xl border border-border/50 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
                            <AvatarImage src={meta.author.avatar} />
                            <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">Escrito por {meta.author.name}</h3>
                            <p className="text-muted-foreground mb-4">
                                Experto en Inteligencia Artificial y Marketing Digital. Apasionado por ayudar a creadores a potenciar su trabajo con tecnología.
                            </p>
                            <Button variant="outline" size="sm" className="rounded-full">
                                Ver más artículos
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Desktop Only) */}
                <aside className="hidden lg:block sticky top-24 space-y-8">
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">En este artículo</h4>
                        <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                            {/* Note: In a real dynamic implementation, we'd parse headers. Static for now or passed as prop */}
                            <a href="#" className="hover:text-primary transition-colors">Introducción</a>
                            <a href="#" className="hover:text-primary transition-colors">Conceptos Clave</a>
                            <a href="#" className="hover:text-primary transition-colors">Estrategias</a>
                            <a href="#" className="hover:text-primary transition-colors">Conclusión</a>
                        </nav>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                        <h4 className="font-bold text-lg mb-2">¿Te gusta este contenido?</h4>
                        <p className="text-sm text-muted-foreground mb-4">Suscríbete para recibir las últimas novedades en IA.</p>
                        <Button className="w-full font-bold">Suscribirse</Button>
                    </div>
                </aside>

            </div>
        </ArticleWrapper>
    );
}
