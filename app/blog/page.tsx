import { getBlogPosts } from "@/app/lib/blog-service";
import BlogPageClient from "../components/BlogPageClient";
import { LanguageProvider } from "../lib/language/context";
import { DEFAULT_LANGUAGE } from "../lib/language/config";
import { SimpleMainNavigation } from "../components/SimpleMainNavigation";
import Footer from "../components/Footer";

// Revalidate every hour
export const revalidate = 3600;

export default async function BlogPage() {
  // Fetch posts directly from Appwrite (server-side)
  const posts = await getBlogPosts();

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <SimpleMainNavigation />
        <main className="flex-grow">
          <BlogPageClient initialLang={DEFAULT_LANGUAGE} initialPosts={posts} />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
