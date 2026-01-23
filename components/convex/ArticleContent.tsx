"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function ArticleSkeleton() {
    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
        </div>
    );
}

function NotFoundState() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Artículo no encontrado</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                Lo sentimos, no pudimos encontrar el artículo que buscas. Puede que haya sido movido o eliminado.
            </p>
            <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
            </Link>
        </div>
    );
}

export default function ArticleContent({ slug }: { slug: string }) {
    // Safe query with robust error handling via default undefined/null checks
    const article = useQuery(api.articles.getBySlug, { slug });

    // 1. Loading State (undefined)
    if (article === undefined) {
        return <ArticleSkeleton />;
    }

    // 2. Not Found State (null)
    if (article === null) {
        return <NotFoundState />;
    }

    // 3. Success State
    return (
        <article className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            {/* Header */}
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-black transition-colors">
                        Inicio
                    </Link>
                    <span>/</span>
                    <span className="capitalize">{article.category}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                    {article.title}
                </h1>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <time dateTime={article.publishedAt}>
                        {format(new Date(article.publishedAt), "d 'de' MMMM, yyyy", { locale: es })}
                    </time>
                    <span>•</span>
                    <span>Lectura de 5 min</span>
                </div>
            </header>

            {/* Content */}
            <div
                className="prose prose-lg prose-slate mx-auto
        prose-headings:font-bold prose-headings:text-gray-900 
        prose-p:text-gray-600 prose-p:leading-relaxed
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-ul:list-disc prose-ul:pl-6
        prose-li:text-gray-600 prose-li:mb-2
        "
                dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {article.keywords && article.keywords.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                        Temas relacionados
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {article.keywords.map((keyword) => (
                            <span
                                key={keyword}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                #{keyword}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
}
