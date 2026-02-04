'use client';

import { ReactNode } from 'react';

// Safe standard provider without LazyMotion to avoid initialization errors
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
