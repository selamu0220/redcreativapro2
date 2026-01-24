'use client';

import React from 'react';
import Footer from '@/app/components/Footer';
import SimpleLanguageToggle from '@/app/components/SimpleLanguageToggle';


interface ArticleWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** Title for structured data and breadcrumbs */
  title?: string;
  /** Show footer (default: true) */
  showFooter?: boolean;
}

export default function ArticleWrapper({
  children,
  className = '',
  title,
  showFooter = true
}: ArticleWrapperProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className={`blog-article blog-content container mx-auto px-4 py-8 max-w-4xl ${className}`}>
        {children}
      </main>

      {showFooter && <Footer />}
      <SimpleLanguageToggle />

    </div>
  );
}
