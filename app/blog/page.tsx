"use client";
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
// Definir tipos que faltan
interface SearchFilters {
  category: string;
  subcategory: string;
  tags: string[];
  sortBy: string;
  sortOrder: string;
}
// Componentes simplificados para evitar errores
const ThemeToggle = () => (
  <button 
    type="button"
    aria-label="Cambiar tema"
    className="p-2 rounded-md bg-muted dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
  >
    🌙
  </button>
);
const SearchBar = ({ onSearch }: { onSearch: (query: string, filters: SearchFilters) => void }) => (
  <div className="max-w-md mx-auto">
    <input aria-label="Campo de entrada"
      type="text"
      placeholder="Buscar artículos..."
      className="w-full px-4 py-2 border rounded-lg"
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
  <div className="bg-muted dark:bg-gray-800 p-8 rounded-lg text-center mobile-spacing">
    <h3 className="text-xl font-semibold mb-4">Suscríbete a nuestro newsletter</h3>
    <p className="text-muted-foreground dark:text-gray-400 mb-4">
      Recibe las últimas noticias sobre IA y creatividad digital
    </p>
    <div className="flex gap-2 max-w-md mx-auto">
      <input
        type="email"
        placeholder="Tu email"
        aria-label="Email para newsletter"
        className="flex-1 px-4 py-2 border rounded-lg"
      />
      <button 
        type="button"
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Suscribirse
      </button>
    </div>
  </div>
);
const ScrollRevealAnimation = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={className}>{children}</div>
);
const StaggeredAnimation = ({ children, staggerDelay }: { children: React.ReactNode, staggerDelay: number }) => (
  <div>{children}</div>
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
  // Get posts based on active tab and search
  const filteredPosts = useMemo(() => {
    let posts: BlogPost[] = [];
    if (
      searchQuery ||
      searchFilters.category ||
      searchFilters.subcategory ||
      searchFilters.tags.length > 0
    ) {
      // If there's a search query or filters, search through all posts
      posts = searchQuery ? searchPosts(searchQuery) : blogPosts;
      // Apply filters
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
      // No search, use tab-based filtering
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
    // Apply sorting
    const sortedPosts = [...posts].sort((a, b) => {
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
      if (searchFilters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    return sortedPosts;
  }, [searchQuery, searchFilters, activeTab]);
  // Pagination
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
    <div className="min-h-screen bg-card dark:bg-black transition-colors duration-300">
      {/* Header with theme toggle */}
      <div className="sticky top-0 z-40 bg-card/80 dark:bg-black/80 backdrop-blur-md border-b border-border dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center responsive-container">
          <h1 className="text-2xl font-bold text-foreground dark:text-white">
            Blog
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 responsive-container">
        {/* Hero Section */}
        <ScrollRevealAnimation className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-foreground dark:text-white mb-6 text-2xl md:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Descubre el Futuro de la Creatividad
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground dark:text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Artículos, tutoriales y recursos sobre inteligencia artificial,
              creatividad digital y las últimas tendencias tecnológicas.
            </motion.p>
          </div>
        </ScrollRevealAnimation>
        {/* Search Bar */}
        <ScrollRevealAnimation className="mb-12">
          <SearchBar onSearch={handleSearch} />
        </ScrollRevealAnimation>
        {/* Category Tabs */}
        <ScrollRevealAnimation className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { key: "all", label: "Todos", icon: BookOpen },
              { key: "featured", label: "Destacados", icon: Star },
              { key: "trending", label: "Tendencias", icon: TrendingUp },
              { key: "popular", label: "Populares", icon: Award },
              { key: "recent", label: "Recientes", icon: Clock },
            ].map(({ key, label, icon: Icon }) => (
              <motion.button
                key={key}
                type="button"
                onClick={() => handleTabChange(key as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === key
                    ? "bg-gray-900 dark:bg-muted text-white dark:text-foreground shadow-lg"
                    : "bg-muted dark:bg-gray-800 text-muted-foreground dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </motion.button>
            ))}
          </div>
        </ScrollRevealAnimation>
        {/* Stats Section */}
        <ScrollRevealAnimation className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                label: "Artículos Totales",
                value: blogPosts.length,
                icon: BookOpen,
              },
              {
                label: "Categorías",
                value: categories.length,
                icon: Award,
              },
              {
                label: "Autores",
                value: authors.length,
                icon: Users,
              },
              {
                label: "Lecturas Totales",
                value: "50K+",
                icon: Zap,
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-card dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-border dark:border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              >
                <div className="w-12 h-12 rounded-lg bg-muted dark:bg-gray-800 flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-muted-foreground dark:text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground dark:text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-muted-foreground dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </ScrollRevealAnimation>
        {/* Articles Grid */}
        {paginatedPosts.length > 0 ? (
          <StaggeredAnimation staggerDelay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 mobile-spacing">
              {paginatedPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  className="bg-card dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-border dark:border-gray-800 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gray-900 dark:bg-muted text-white dark:text-foreground px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                      <span>•</span>
                      <span>{post.views} vistas</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground dark:text-white mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground dark:text-gray-300 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-muted dark:bg-gray-700 text-muted-foreground dark:text-gray-300 px-2 py-1 rounded-md text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center gap-2 text-foreground dark:text-gray-100 font-medium hover:text-muted-foreground dark:hover:text-gray-300 transition-colors"
                    >
                      Leer más
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </StaggeredAnimation>
        ) : (
          <ScrollRevealAnimation>
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 dark:text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                No se encontraron artículos
              </h3>
              <p className="text-muted-foreground dark:text-gray-400">
                Intenta ajustar tus filtros de búsqueda o explora otras
                categorías.
              </p>
            </div>
          </ScrollRevealAnimation>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <ScrollRevealAnimation>
            <div className="flex justify-center items-center gap-2 mb-12">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-muted dark:bg-gray-800 text-muted-foreground dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-gray-900 dark:bg-muted text-white dark:text-foreground"
                        : "bg-muted dark:bg-gray-800 text-muted-foreground dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-muted dark:bg-gray-800 text-muted-foreground dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </ScrollRevealAnimation>
        )}
        {/* Newsletter */}
        <ScrollRevealAnimation>
          <Newsletter />
        </ScrollRevealAnimation>
      </div>
    </div>
  );
}