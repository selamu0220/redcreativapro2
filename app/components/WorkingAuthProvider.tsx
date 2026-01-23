'use client';

import React from 'react';

export function WorkingAuthProvider({ children }: { children: React.ReactNode }) {
    // Pass-through provider to fix build error
    return <>{children}</>;
}
