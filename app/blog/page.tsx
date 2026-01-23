import { getBlogPosts } from "@/app/lib/blog-service";
import BlogListClient from "../components/BlogListClient";
import { LanguageProvider } from "../lib/language/context";
import { DEFAULT_LANGUAGE } from "../lib/language/config";
import { BlogNavigation } from "../components/BlogNavigation";
import Footer from "../components/Footer";

// Revalidate every hour
export const revalidate = 3600;

export default async function BlogPage() {
  // Fetch posts directly from Appwrite (server-side)
  // We use the real service now that we know the shell is stable-ish
  const posts = await getBlogPosts();
  // const posts = MOCK_POSTS;

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <BlogNavigation />
        <main className="flex-grow">
          <BlogListClient initialLang={DEFAULT_LANGUAGE} initialPosts={posts} />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

