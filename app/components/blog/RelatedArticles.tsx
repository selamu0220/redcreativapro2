"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RelatedArticle {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  readTime: string;
  emoji: string;
}

interface RelatedArticlesProps {
  currentPostId?: string;
  category?: string;
  tags?: string[];
}

// Mock data for related articles
const mockArticles: RelatedArticle[] = [
  {
    id: "1",
    title: "Cómo escribir títulos que generen clics con IA",
    excerpt: "Aprende a crear títulos irresistibles que aumenten tu CTR y mejoren el posicionamiento SEO.",
    slug: "como-escribir-titulos-que-generen-clics-con-ia",
    category: "Copywriting",
    readTime: "5 min",
    emoji: "🎯"
  },
  {
    id: "2",
    title: "Guía completa de prompts para escritores",
    excerpt: "Descubre los mejores prompts de IA para crear contenido de calidad en menos tiempo.",
    slug: "guia-completa-de-prompts-para-escritores",
    category: "Prompts",
    readTime: "8 min",
    emoji: "📝"
  },
  {
    id: "3",
    title: "SEO para contenido generado con IA",
    excerpt: "Optimiza tu contenido creado con inteligencia artificial para mejorar el posicionamiento.",
    slug: "seo-para-contenido-generado-con-ia",
    category: "SEO",
    readTime: "6 min",
    emoji: "🔍"
  }
];

export default function RelatedArticles({ currentPostId, category, tags }: RelatedArticlesProps) {
  // Filter out current article and get related ones from same category
  const relatedArticles = mockArticles
    .filter(article => article.id !== currentPostId)
    .filter(article => category ? article.category === category : true)
    .slice(0, 3);

  if (relatedArticles.length === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Artículos relacionados
      </h3>
      <div className="space-y-4">
        {relatedArticles.map((article) => (
          <article key={article.id} className="group">
            <Link 
              href={`/blog/${article.slug}`}
              className="block p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{article.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{article.category}</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex-shrink-0" />
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}