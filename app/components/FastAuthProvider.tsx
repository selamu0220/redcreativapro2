'use client';

import React from 'react';

export function FastAuthProvider({ children }: { children: React.ReactNode }) {
    // Pass-through provider to fix build error
    return <>{children}</>;
}
