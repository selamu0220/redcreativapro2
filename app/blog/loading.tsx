import { Skeleton } from "@/components/ui/Skeleton"

export default function BlogLoading() {
    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl h-16" />

            <main className="container mx-auto px-4 py-12 max-w-7xl">
                <div className="text-center mb-10 space-y-4">
                    <Skeleton className="h-6 w-32 mx-auto rounded-full" />
                    <Skeleton className="h-16 w-3/4 mx-auto rounded-lg" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                    {/* Featured Post Skeleton */}
                    <div className="lg:col-span-8">
                        <Skeleton className="w-full aspect-[16/9] rounded-2xl mb-4" />
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                    {/* Sub-featured Skeletons */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="space-y-3">
                            <Skeleton className="w-full aspect-video rounded-xl" />
                            <Skeleton className="h-6 w-2/3" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="w-full aspect-video rounded-xl" />
                            <Skeleton className="h-6 w-2/3" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
