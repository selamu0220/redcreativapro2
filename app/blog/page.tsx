import { wisp } from "@/app/lib/wisp";
import { strapi } from "@/app/lib/strapi";
import Link from "next/link";
import { BookOpen, Star, TrendingUp, Award, Clock, ArrowRight, Search } from "lucide-react";
import { SimpleMainNavigation } from "../components/SimpleMainNavigation";
import Footer from "../components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { LanguageProvider } from "../lib/language/context";
import { DEFAULT_LANGUAGE } from "../lib/language/config";

const SearchBar = () => (
  <div className="relative max-w-xl mx-auto">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      type="text"
      placeholder="Buscar artículos..."
      className="pl-10 h-12"
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
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-10 px-4 py-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90">
          Suscribirse
        </button>
      </div>
    </CardContent>
  </Card>
);

export default async function BlogPage() {
  // Try to get posts from Strapi first
  let posts: any[] = [];
  try {
    const strapiResult = await strapi.getPosts({ limit: 20 });
    posts = strapiResult.posts;
  } catch (error) {
    console.error('Error fetching from Strapi:', error);
  }

  // If no posts from Strapi, fallback to Wisp
  if (posts.length === 0) {
    try {
      const wispResult = await wisp.getPosts({ limit: 20 });
      posts = wispResult.posts;
    } catch (error) {
      console.error('Error fetching from Wisp:', error);
    }
  }

  return (
    <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
      <div className="min-h-screen bg-background flex flex-col">
        <SimpleMainNavigation />

        <main className="flex-grow container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Descubre el Futuro de la Creatividad
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Artículos, tutoriales y recursos sobre inteligencia artificial, creatividad digital y tendencias tecnológicas.
            </p>
            <SearchBar />
          </div>

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
                variant={key === "all" ? "default" : "outline"}
                className="rounded-full gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <Card className="h-full overflow-hidden border-zinc-200 dark:border-zinc-800 transition-all hover:border-zinc-900 dark:hover:border-zinc-100">
                    <div className="relative h-48 overflow-hidden">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-zinc-300" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-black/80 backdrop-blur text-white border-none">
                          {post.tags[0]?.name || "Blog"}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-6 pb-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <CardTitle className="text-xl group-hover:underline underline-offset-4 decoration-1 leading-tight">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {post.description}
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
              <p className="text-muted-foreground">Estamos preparando contenido increíble para ti.</p>
            </div>
          )}

          <Newsletter />
        </main>

        <Footer />
      </div>
    </LanguageProvider>
  );
}
