import { wisp } from "@/app/lib/wisp";
import { strapi } from "@/app/lib/strapi";
import { blogPosts } from "@/lib/blog-data";
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
import { AlgoliaSearch } from "../components/AlgoliaSearch";

const Newsletter = () => (
    <Card className="border-border bg-card">
      <CardContent className="p-12 text-center">
        <h3 className="text-2xl font-bold mb-4 text-foreground">Suscríbete a nuestro newsletter</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Recibe las últimas noticias sobre IA y creatividad digital directamente en tu bandeja de entrada.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Tu email profesional"
            className="flex-1 bg-background border-border"
          />
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Suscribirse
          </button>
        </div>
      </CardContent>
    </Card>

);

export default async function BlogPage() {
    return (

      <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
        <div className="min-h-screen bg-background flex flex-col">
          <main className="flex-grow container mx-auto px-4 py-24">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Descubre el Futuro de la Creatividad
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                Artículos, tutoriales y recursos sobre inteligencia artificial, creatividad digital y tendencias tecnológicas.
              </p>
            </div>

            <AlgoliaSearch />

            <Newsletter />
          </main>

          <Footer />
        </div>
      </LanguageProvider>
    );
}
