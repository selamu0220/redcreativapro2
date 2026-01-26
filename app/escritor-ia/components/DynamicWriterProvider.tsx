'use client';

import { WriterProvider } from '../context/WriterContext';

export default function DynamicWriterProvider({ children }: { children: React.ReactNode }) {
    return (
        <WriterProvider>
            {children}
        </WriterProvider>
    );
}
