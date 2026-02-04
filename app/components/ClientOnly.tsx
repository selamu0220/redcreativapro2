"use client";

import { useEffect, useState, ReactNode } from "react";

interface ClientOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Wrapper component to ensure children are only rendered on the client side.
 * This effectively prevents hydration mismatches for components that depend on browser-specific APIs
 * or have non-deterministic rendering (like Tiptap/ProseMirror).
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
