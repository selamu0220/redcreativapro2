import { wisp } from "@/app/lib/wisp";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Calendar, Tag, ArrowLeft } from "lucide-react";
import { SimpleMainNavigation } from "../../components/SimpleMainNavigation";
import Footer from "../../components/Footer";
import { Badge } from "../../components/ui/badge";
import { LanguageProvider } from "../../lib/language/context";
import { DEFAULT_LANGUAGE } from "../../lib/language/config";
import SimpleLanguageToggle from "@/app/components/SimpleLanguageToggle";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const result = await wisp.getPost(slug);

  if (!result.post) {
    notFound();
  }

  const { title, publishedAt, createdAt, content, tags, image, description } = result.post;

  return (
    <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
      <div className="min-h-screen bg-black text-white">
        <SimpleMainNavigation />

        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-12 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Volver al blog
          </Link>

          <article>
            <header className="mb-12">
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 mb-8 pb-8 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(publishedAt || createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{Math.ceil(content.length / 1000)} min de lectura</span>
                </div>
              </div>

              {image && (
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-12 border border-zinc-800">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </header>

            <div className="prose prose-invert prose-zinc max-w-none">
              <div
                className="blog-content text-zinc-300 leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </article>
        </main>

        <Footer />
        <SimpleLanguageToggle />
      </div>
    </LanguageProvider>
  );
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const result = await wisp.getPost(slug);

  if (!result.post) {
    return {
      title: "Artículo no encontrado",
    };
  }

  const { title, description, image } = result.post;

  return {
    title: `${title} | Red Creativa Pro`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: image ? [{ url: image }] : [],
    },
  };
}

export async function generateStaticParams() {
  const result = await wisp.getPosts({ limit: 100 });
  return result.posts.map((post) => ({
    slug: post.slug,
  }));
}
