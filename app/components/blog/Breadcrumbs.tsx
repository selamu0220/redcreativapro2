"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  category?: string;
  subcategory?: string;
  postTitle?: string;
}

export default function Breadcrumbs({ items, category, subcategory, postTitle }: BreadcrumbsProps) {
  // If using the new props format, build items from category/subcategory/postTitle
  let breadcrumbItems = items || []

  if (category && !items) {
    breadcrumbItems = [
      { label: category, href: `/blog?category=${category}` }
    ]

    if (subcategory) {
      breadcrumbItems.push({
        label: subcategory,
        href: `/blog?category=${category}&subcategory=${subcategory}`
      })
    }

    if (postTitle) {
      breadcrumbItems.push({ label: postTitle })
    }
  }

  if (breadcrumbItems.length === 0) return null;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: baseUrl
      },
      ...breadcrumbItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: item.href ? `${baseUrl}${item.href}` : undefined
      }))
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
          Inicio
        </Link>

        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight size={16} />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
