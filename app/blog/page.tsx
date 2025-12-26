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
          </main>

          <Footer />
        </div>
      </LanguageProvider>
    );
}
