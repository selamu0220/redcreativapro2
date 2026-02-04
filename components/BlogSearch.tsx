'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, X, Sparkles, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimpleTranslations } from '@/app/lib/simple-translations';

interface BlogPost {
    title: string;
    excerpt: string;
    category: string;
    tags?: string[];
    [key: string]: any;
}

interface BlogSearchProps<T> {
    posts: T[];
    onFilter: (filteredPosts: T[]) => void;
    categories: string[];
}

export function BlogSearch<T extends BlogPost>({ posts, onFilter, categories }: BlogSearchProps<T>) {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const { t } = useSimpleTranslations(); // We might need to add keys for search placeholders if not present, or hardcode/fallback for now.

    const fuse = useMemo(() => {
        return new Fuse(posts, {
            keys: ['title', 'excerpt', 'category', 'tags'],
            threshold: 0.3, // 0.0 is perfect match, 1.0 is match anything. 0.3 is good for "fuzzy" but relevant.
            includeScore: true,
        });
    }, [posts]);

    // Combined Filtering Logic
    useMemo(() => {
        let result = posts;

        // 1. Text Search
        if (query.trim()) {
            const fuseResults = fuse.search(query);
            result = fuseResults.map(r => r.item);
        }

        // 2. Category Filter
        if (activeCategory) {
            result = result.filter(post => post.category === activeCategory);
        }

        onFilter(result);
    }, [query, activeCategory, fuse, posts, onFilter]);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 mb-12">
            {/* Search Bar */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur-lg"></div>
                <div className="relative flex items-center bg-background/80 backdrop-blur-xl border border-border rounded-xl px-4 h-14 shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">
                    <Sparkles className="w-5 h-5 text-primary mr-3 animate-pulse" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('blog_search_placeholder') || "Search articles with AI..."} // Fallback if key missing
                        className="flex-1 bg-transparent border-none h-full text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-1 hover:bg-muted rounded-full transition-colors mr-2"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    )}
                    <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground border-l border-border pl-4">
                        <span className="px-1.5 py-0.5 rounded border border-border bg-muted/50">⌘</span>
                        <span>K</span>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center">
                <Button
                    variant={activeCategory === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory(null)}
                    className="rounded-full"
                >
                    {t('blog_category_all')}
                </Button>
                {categories.map((cat) => (
                    <Button
                        key={cat}
                        variant={activeCategory === cat ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                        className="rounded-full transition-all hover:scale-105"
                    >
                        {cat}
                    </Button>
                ))}
            </div>
        </div>
    );
}
