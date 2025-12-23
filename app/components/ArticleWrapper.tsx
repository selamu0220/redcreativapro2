'use client';

import React from 'react';

interface ArticleWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function ArticleWrapper({ children, className = '' }: ArticleWrapperProps) {
  return (
    <div className={`blog-article blog-content ${className}`}>
      {children}
    </div>
  );
}
