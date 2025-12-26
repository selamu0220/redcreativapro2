'use client';

import React from 'react';
import PremiumArticleTemplate from './PremiumArticleTemplate';

export default function ArticleTemplate({
  title,
  description,
  children,
  faqJsonLd,
  relatedLinks,
  breadcrumbsItems,
  category = "IA & Estrategia",
  readingTime = "7 min de lectura",
  date = "Diciembre 2025"
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  faqJsonLd?: any;
  relatedLinks?: { href: string; label: string }[];
  breadcrumbsItems?: { href?: string; label: string }[];
  category?: string;
  readingTime?: string;
  date?: string;
}) {
  return (
    <PremiumArticleTemplate
      title={title}
      description={description}
      category={category}
      readingTime={readingTime}
      date={date}
      faqJsonLd={faqJsonLd}
      relatedLinks={relatedLinks}
    >
      {children}
    </PremiumArticleTemplate>
  );
}
