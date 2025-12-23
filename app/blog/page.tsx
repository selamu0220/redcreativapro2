"use client";
import ArticleWrapper from "@/app/components/ArticleWrapper";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  TrendingUp,
  Star,
  Clock,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Zap,
  Search,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import {
  blogPosts,
  categories,
  authors,
  getFeaturedPosts,
  getTrendingPosts,
  getPopularPosts,
  getRecentPosts,
  searchPosts,
  type BlogPost,
} from "@/lib/blog-data";
import { SimpleMainNavigation } from "../components/SimpleMainNavigation";
import Footer from "../components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { LanguageProvider } from "../lib/language/context";
import { DEFAULT_LANGUAGE } from "../lib/language/config";

interface SearchFilters {
  category: string;
  subcategory: string;
  tags: string[];
  sortBy: string;
  sortOrder: string;
}

const SearchBar = ({ onSearch }: { onSearch: (query: string, filters: SearchFilters) => void }) => (
  <div className="relative max-w-xl mx-auto">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      type="text"
      placeholder="Buscar artículos..."
      className="pl-10 h-12"
      onChange={(e) => onSearch(e.target.value, {
        category: "",
        subcategory: "",
        tags: [],
        sortBy: "date",
        sortOrder: "desc",
      })}
    />
  </div>
);

const Newsletter = () => (
  <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
    <CardContent className="p-12 text-center">
      <h3 className="text-2xl font-bold mb-4">Suscríbete a nuestro newsletter</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Recibe las últimas noticias sobre IA y creatividad digital directamente en tu bandeja de entrada.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="Tu email profesional"
          className="flex-1"
        />
        <Button className="bg-zinc-900 text-white dark:bg-white dark:text-black">
          Suscribirse
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    category: "",
    subcategory: "",
    tags: [],
    sortBy: "date",
    sortOrder: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "all" | "featured" | "trending" | "popular" | "recent"
  >("all");
  const postsPerPage = 12;

  const filteredPosts = useMemo(() => {
    let posts: BlogPost[] = [];
    if (
      searchQuery ||
      searchFilters.category ||
      searchFilters.subcategory ||
      searchFilters.tags.length > 0
    ) {
      posts = searchQuery ? searchPosts(searchQuery) : blogPosts;
      if (searchFilters.category) {
        posts = posts.filter(
          (post) => post.category === searchFilters.category
        );
      }
      if (searchFilters.subcategory) {
        posts = posts.filter(
          (post) => post.subcategory === searchFilters.subcategory
        );
      }
      if (searchFilters.tags.length > 0) {
        posts = posts.filter((post) =>
          searchFilters.tags.some((tag) => post.tags.includes(tag))
        );
      }
    } else {
      switch (activeTab) {
        case "featured":
          posts = getFeaturedPosts();
          break;
        case "trending":
          posts = getTrendingPosts();
          break;
        case "popular":
          posts = getPopularPosts();
          break;
        case "recent":
          posts = getRecentPosts();
          break;
        default:
          posts = blogPosts;
      }
    }
    return [...posts].sort((a, b) => {
      let aValue: any, bValue: any;
      switch (searchFilters.sortBy) {
        case "readTime":
          aValue = parseInt(a.readTime);
          bValue = parseInt(b.readTime);
          break;
        case "views":
          aValue = a.views;
          bValue = b.views;
          break;
        case "likes":
          aValue = a.likes;
          bValue = b.likes;
          break;
        case "date":
        default:
          aValue = new Date(a.publishedAt);
          bValue = new Date(b.publishedAt);
      }
      return searchFilters.sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
  }, [searchQuery, searchFilters, activeTab]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleSearch = (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    setCurrentPage(1);
    setActiveTab("all");
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
    setSearchFilters({
      category: "",
      subcategory: "",
      tags: [],
      sortBy: "date",
      sortOrder: "desc",
    });
  };

  return (
    <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
      <div className="min-h-screen bg-background flex flex-col">
        <SimpleMainNavigation />

        <main className="flex-grow container mx-auto px-4 py-24">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Descubre el Futuro de la Creatividad
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Artículos, tutoriales y recursos sobre inteligencia artificial, creatividad digital y tendencias tecnológicas.
            </p>
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-16">
            {[
              { key: "all", label: "Todos", icon: BookOpen },
              { key: "featured", label: "Destacados", icon: Star },
              { key: "trending", label: "Tendencias", icon: TrendingUp },
              { key: "popular", label: "Populares", icon: Award },
              { key: "recent", label: "Recientes", icon: Clock },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeTab === key ? "default" : "outline"}
                onClick={() => handleTabChange(key as typeof activeTab)}
                className="rounded-full gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Articles Grid */}
          {paginatedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {paginatedPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="group">
                  <Card className="h-full overflow-hidden border-zinc-200 dark:border-zinc-800 transition-all hover:border-zinc-900 dark:hover:border-zinc-100">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-black/80 backdrop-blur text-white border-none">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-6 pb-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <CardTitle className="text-xl group-hover:underline underline-offset-4 decoration-1 leading-tight">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center text-sm font-medium">
                        Leer artículo <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border rounded-xl border-dashed">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-semibold mb-2">No se encontraron artículos</h3>
              <p className="text-muted-foreground">Intenta ajustar tu búsqueda o explora otras categorías.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-24">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  onClick={() => setCurrentPage(page)}
                  className="w-10 h-10 p-0"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}

          <Newsletter />
        </main>

        <Footer />
      </div>
    </LanguageProvider>
  );
}
