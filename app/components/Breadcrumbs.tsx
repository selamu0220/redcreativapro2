'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ items, className = '', showHome = true }: BreadcrumbsProps) {
  const allItems = showHome 
    ? [{ label: 'Inicio', href: '/' }, ...items]
    : items;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://redcreativa.pro${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}
      >
        {allItems.map((item, index) => (
          <div key={item.href} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
            {index === allItems.length - 1 ? (
              <span className="font-medium text-gray-900 flex items-center">
                {index === 0 && showHome && <Home className="w-4 h-4 mr-1" />}
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-blue-600 transition-colors flex items-center"
              >
                {index === 0 && showHome && <Home className="w-4 h-4 mr-1" />}
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}