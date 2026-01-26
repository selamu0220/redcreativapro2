import { requireSubscription } from '@/app/lib/access-control';
import { ReactNode } from 'react';

export default async function EscritorIALayout({ children }: { children: ReactNode }) {
    // await requireSubscription(); // Removing blocking to allow Free Trial (3 attempts)

    return (
        <>
            {children}
        </>
    );
}
