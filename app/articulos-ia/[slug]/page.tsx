import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    // This route previously relied on Convex which has been removed.
    // Redirecting traffic to the main blog to preserve SEO value where possible
    // or to avod broken pages.
    redirect("/blog");
}
