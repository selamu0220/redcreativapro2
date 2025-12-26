'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink,
  BookOpen,
  Wand2,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import RelatedLinks from '@/app/components/RelatedLinks';
import SchemaMarkup from '@/app/components/seo/SchemaMarkup';
import ArticleWrapper from '@/app/components/ArticleWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PremiumArticleTemplateProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  category?: string;
  readingTime?: string;
  date?: string;
  author?: {
    name: string;
    image?: string;
    role?: string;
  };
  process?: {
    title: string;
    steps: { title: string; description: string }[];
  };
  prompts?: {
    title: string;
    items: string[];
  };
  resources?: {
    title: string;
    items: { label: string; description: string; href: string; icon?: React.ReactNode }[];
  };
  relatedLinks?: { href: string; label: string }[];
  faqJsonLd?: any;
}

export default function PremiumArticleTemplate({
  title,
  description,
  children,
  category = "IA & Estrategia",
  readingTime = "8 min de lectura",
  date = "Diciembre 2025",
  author = { name: "Red Creativa Editorial", role: "Expertos en IA" },
  process,
  prompts,
  resources,
  relatedLinks,
  faqJsonLd
}: PremiumArticleTemplateProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Prompt copiado al portapapeles");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <ArticleWrapper className="bg-background min-h-screen pb-20">
      <SchemaMarkup
        breadcrumb={{
          items: [
            { name: 'Inicio', url: 'https://redcreativa.pro' },
            { name: 'Blog', url: 'https://redcreativa.pro/blog' },
            { name: title, url: '#' }
          ]
        }}
      />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      {/* Top Navigation */}
      <div className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/blog" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Blog
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Badge variant="outline" className="rounded-full px-3">{category}</Badge>
            <span className="text-xs text-muted-foreground">{readingTime}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Column */}
          <main className="lg:col-span-8">
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase tracking-widest text-[10px] py-1 px-3">
                  {category}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {readingTime}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {date}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-[1.1] text-foreground">
                {title}
              </h1>

              {description && (
                <div className="relative pl-6 border-l-4 border-primary/30">
                  <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed italic">
                    {description}
                  </p>
                </div>
              )}
            </header>

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-16 prose-headings:font-black prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-p:leading-relaxed prose-li:my-2">
              {children}
            </div>

            {/* Specialized Sections - Process */}
            {process && (
              <section className="mb-16 bg-muted/30 rounded-3xl p-8 border border-border/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-primary text-primary-foreground p-2 rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black">{process.title}</h2>
                </div>
                <div className="grid gap-6">
                  {process.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center font-black text-primary group-hover:border-primary transition-colors">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Specialized Sections - Prompts */}
            {prompts && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-orange-500 text-white p-2 rounded-xl shadow-lg shadow-orange-500/20">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black">{prompts.title}</h2>
                </div>
                <div className="space-y-4">
                    {prompts.items.map((prompt, idx) => (
                      <div key={idx} className="group relative bg-slate-950 dark:bg-slate-900 text-slate-50 p-6 rounded-2xl border border-slate-800 font-sans text-sm leading-relaxed overflow-hidden shadow-2xl">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                            onClick={() => handleCopy(prompt, idx)}
                          >
                            {copiedIndex === idx ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="pr-10 text-slate-50 font-medium">{prompt}</p>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Specialized Sections - Resources */}
            {resources && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-500/20">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black">{resources.title}</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {resources.items.map((item, idx) => (
                    <Link key={idx} href={item.href} className="block group">
                      <Card className="h-full border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group-hover:-translate-y-1">
                        <CardContent className="p-6 flex items-start gap-4">
                          <div className="p-3 rounded-2xl bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {item.icon || <ExternalLink className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className="font-bold mb-1 flex items-center gap-1">
                              {item.label}
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            </main>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              {/* Author Card */}
              <Card className="rounded-3xl border-border/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary text-xl">
                      RC
                    </div>
                    <div>
                      <h4 className="font-black text-lg">{author.name}</h4>
                      <p className="text-sm text-muted-foreground">{author.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ayudamos a creativos y agencias a escalar sus procesos mediante inteligencia artificial y automatización avanzada.
                  </p>
                </CardContent>
              </Card>

                  {/* Start Now CTA */}
                  <div className="bg-zinc-900 rounded-3xl p-8 text-white border border-zinc-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors" />
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black mb-3 italic tracking-tight">Pasa a la acción</h3>
                      <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-bold">
                        Prueba nuestras herramientas de IA diseñadas para automatizar tu flujo de trabajo creativo.
                      </p>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black py-7 group/btn shadow-xl shadow-primary/20 border-none" asChild>
                        <Link href="/creador">
                          Empezar ahora
                          <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </div>

              {/* Related Articles */}
              {relatedLinks && relatedLinks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Artículos Relacionados
                  </h3>
                  <div className="grid gap-3">
                    {relatedLinks.map((link, idx) => (
                      <Link key={idx} href={link.href} className="group p-4 rounded-2xl border border-transparent hover:border-border hover:bg-muted/50 transition-all">
                        <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">
                          {link.label}
                        </h4>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                          Leer artículo <ChevronRight className="w-3 h-3" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>
    </ArticleWrapper>
  );
}
