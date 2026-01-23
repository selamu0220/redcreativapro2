import ArticleContent from "@/components/convex/ArticleContent";
import { Metadata } from "next";

// Force dynamic rendering since we are fetching data client-side (mostly) 
// but want the shell to be consistent. 
// Note: For full SEO with Convex, we'd fetch on server, but for "error-free" 
// robustness as requested, client-side with a good skeleton is safe.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    // Basic metadata stub - in a real prod app we'd fetch the article here too
    // but to keep it "error free" and simple we use a generic template that 
    // is still better than nothing.
    const title = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    return {
        title: `${title} | Red Creativa Pro`,
        description: `Lee nuestro artículo sobre ${title}. Inteligencia Artificial y Marketing.`,
    };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return (
        <main className="min-h-screen bg-white">
            <ArticleContent slug={slug} />
        </main>
    );
}
