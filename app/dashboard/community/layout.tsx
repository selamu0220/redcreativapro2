import { CommunityHeader } from './components/CommunityHeader';

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <CommunityHeader />
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {children}
            </div>
        </div>
    )
}
