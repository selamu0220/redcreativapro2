import { Skeleton } from "@/components/ui/Skeleton"

export function EditorSkeleton() {
    return (
        <div className="flex flex-col w-full h-full relative bg-background/50 backdrop-blur-sm animate-pulse">
            {/* Toolbar Skeleton */}
            <div className="flex flex-wrap items-center gap-2 p-2 border-b border-border/40 bg-muted/20 h-[50px] shrink-0">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <div className="w-px h-6 bg-border/40 mx-1" />
                <Skeleton className="h-8 w-24 rounded-md" />
                <span className="ml-auto" />
                <Skeleton className="h-8 w-8 rounded-md" />
            </div>

            {/* Editor Content Skeleton */}
            <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-4 pt-12">
                <Skeleton className="h-10 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <div className="h-8" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-11/12 rounded" />
                <Skeleton className="h-4 w-full rounded" />
            </div>
        </div>
    )
}
