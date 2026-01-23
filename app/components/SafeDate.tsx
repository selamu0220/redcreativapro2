"use client";

import { useEffect, useState } from "react";

interface SafeDateProps {
    date: string | Date;
    options?: Intl.DateTimeFormatOptions;
    className?: string;
    fallback?: string;
}

export default function SafeDate({
    date,
    options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    },
    className = "",
    fallback = ""
}: SafeDateProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Always render fallback during SSR to avoid hydration mismatch
    if (!mounted) {
        return <span className={className}>{fallback}</span>;
    }

    if (!date) {
        return <span className={className}>{fallback}</span>;
    }

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        // Check for invalid date
        if (isNaN(dateObj.getTime())) {
            return <span className={className}>{fallback}</span>;
        }

        return (
            <span className={className}>
                {dateObj.toLocaleDateString(undefined, options)}
            </span>
        );
    } catch (error) {
        console.error("Error parsing date:", date);
        return <span className={className}>{fallback}</span>;
    }
}
