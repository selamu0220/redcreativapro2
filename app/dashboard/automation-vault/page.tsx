'use client';

import { useState, useEffect } from 'react';
import { MainNavigation } from '@/app/components/MainNavigation';
import { Download, PlayCircle, ExternalLink, Box, Workflow, Zap, Clock, TrendingUp, Users, Mail } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface Blueprint {
    id: string;
    title: string;
    description: string;
    tool: 'make' | 'n8n' | 'zapier';
    category: 'lead-gen' | 'content' | 'operations';
    difficulty: 'Principante' | 'Intermedio' | 'Avanzado';
    tags: string[];
    timeSaved: string;
    downloadUrl: string;
    tutorialUrl?: string;
}

// Blueprints moved to API


export default function AutomationVaultPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/blueprints')
            .then(res => res.json())
            .then(data => {
                setBlueprints(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load blueprints', err);
                setLoading(false);
            });
    }, []);

    const filteredBlueprints = activeTab === 'all'
        ? blueprints
        : blueprints.filter(bp => bp.category === activeTab);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <MainNavigation />

            <main className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Box className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight">Bóveda de Automatización</h1>
                        </div>
                        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                            Escala tu agencia con workflows probados. Descarga los JSON, impórtalos en Make.com y ahorra cientos de horas hombre.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Guía de Importación
                        </Button>
                        <Button className="gap-2 bg-[#6f42c1] hover:bg-[#5a369e] text-white border-0">
                            <Workflow className="w-4 h-4" />
                            Abrir Make.com
                        </Button>
                    </div>
                </div>

                {/* Tabs & Filtering */}
                <Tabs defaultValue="all" className="space-y-8" onValueChange={setActiveTab}>
                    <TabsList className="bg-muted/50 p-1 h-auto">
                        <TabsTrigger value="all" className="data-[state=active]:bg-background py-2 px-4 shadow-none">Todos</TabsTrigger>
                        <TabsTrigger value="content" className="data-[state=active]:bg-background py-2 px-4 shadow-none gap-2">
                            <Zap className="w-4 h-4" /> Contenido
                        </TabsTrigger>
                        <TabsTrigger value="lead-gen" className="data-[state=active]:bg-background py-2 px-4 shadow-none gap-2">
                            <Users className="w-4 h-4" /> Lead Gen
                        </TabsTrigger>
                        <TabsTrigger value="operations" className="data-[state=active]:bg-background py-2 px-4 shadow-none gap-2">
                            <TrendingUp className="w-4 h-4" /> Operaciones
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading && Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="min-h-[350px] animate-pulse">
                                    <CardHeader>
                                        <div className="h-6 w-24 bg-muted rounded mb-4" />
                                        <div className="h-8 w-3/4 bg-muted rounded mb-2" />
                                        <div className="h-4 w-full bg-muted rounded" />
                                        <div className="h-4 w-2/3 bg-muted rounded mt-2" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-8 w-32 bg-muted rounded mb-4" />
                                        <div className="flex gap-2">
                                            <div className="h-6 w-16 bg-muted rounded-full" />
                                            <div className="h-6 w-16 bg-muted rounded-full" />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="grid grid-cols-2 gap-3 pt-4 border-t">
                                        <div className="h-10 bg-muted rounded" />
                                        <div className="h-10 bg-muted rounded" />
                                    </CardFooter>
                                </Card>
                            ))}

                            {!loading && filteredBlueprints.map((bp) => (
                                <Card key={bp.id} className="group flex flex-col border-border/60 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start mb-4">
                                            <Badge variant="secondary" className="bg-[#6f42c1]/10 text-[#6f42c1] hover:bg-[#6f42c1]/20 border border-[#6f42c1]/20 px-2 py-1">
                                                <Workflow className="w-3 h-3 mr-1.5" />
                                                Make.com
                                            </Badge>
                                            <Badge variant="outline" className={
                                                bp.difficulty === 'Principante' ? 'text-green-600 border-green-200 bg-green-50/50' :
                                                    bp.difficulty === 'Intermedio' ? 'text-amber-600 border-amber-200 bg-amber-50/50' :
                                                        'text-red-600 border-red-200 bg-red-50/50'
                                            }>
                                                {bp.difficulty}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{bp.title}</CardTitle>
                                        <CardDescription className="line-clamp-3 mt-2 text-base">
                                            {bp.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-1 pb-4">
                                        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded w-fit">
                                            <Clock className="w-4 h-4" />
                                            Ahorra {bp.timeSaved}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {bp.tags.map(tag => (
                                                <span key={tag} className="text-xs px-2.5 py-1 bg-muted rounded-full text-muted-foreground border border-border/50">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="grid grid-cols-2 gap-3 pt-4 border-t bg-muted/20">
                                        <Button variant="ghost" className="w-full gap-2 text-xs hover:bg-background hover:text-primary" onClick={() => alert('Tutorial: ' + bp.title)}>
                                            <PlayCircle className="w-4 h-4" />
                                            Ver Tutorial
                                        </Button>
                                        <Button className="w-full gap-2 text-xs font-semibold shadow-sm" onClick={() => alert('Descargando: ' + bp.id + '.json')}>
                                            <Download className="w-4 h-4" />
                                            Descargar JSON
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}

                            {/* CTA Card for Missing Blueprint */}
                            <Card className="flex flex-col justify-center items-center border-dashed border-2 bg-muted/5 min-h-[350px] hover:bg-muted/10 transition-colors cursor-pointer group" onClick={() => window.open('mailto:support@redcreativa.pro?subject=Request%20Blueprint')}>
                                <div className="text-center p-6 space-y-4">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                        <Mail className="w-7 h-7 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">¿Falta algún flujo?</h3>
                                        <p className="text-sm text-muted-foreground mt-1 max-w-[220px] mx-auto">
                                            Solicita una automatización a medida. Nuestros ingenieros la construirán para ti.
                                        </p>
                                    </div>
                                    <Button variant="link" className="text-primary">
                                        Solicitar Blueprint &rarr;
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
