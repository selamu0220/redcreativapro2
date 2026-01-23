// Force all dashboard routes to be dynamically rendered
// This prevents SSG prerender errors with Kinde auth hooks
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
