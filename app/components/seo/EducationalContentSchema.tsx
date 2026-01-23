'use client';

import { useEffect } from 'react';

interface EducationalContentSchemaProps {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo?: string;
  };
  educationalLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  learningResourceType?: 'Course' | 'Tutorial' | 'Guide' | 'Article';
  teaches?: string[];
  timeRequired?: string;
  inLanguage?: string;
}

export default function EducationalContentSchema({
  title,
  description,
  url,
  datePublished = new Date().toISOString(),
  dateModified = new Date().toISOString(),
  author = { name: 'Red Creativa Pro', url: 'https://www.redcreativa.pro' },
  publisher = { 
    name: 'Red Creativa Pro', 
    logo: 'https://redcreativa.pro/logo.png' 
  },
  educationalLevel = 'Beginner',
  learningResourceType = 'Course',
  teaches = [],
  timeRequired = 'PT15M',
  inLanguage = 'es'
}: EducationalContentSchemaProps) {
  
  useEffect(() => {
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: title,
      description: description,
      url: url,
      datePublished: datePublished,
      dateModified: dateModified,
      author: {
        '@type': 'Organization',
        name: author.name,
        url: author.url
      },
      publisher: {
        '@type': 'Organization',
        name: publisher.name,
        logo: {
          '@type': 'ImageObject',
          url: publisher.logo
        }
      },
      educationalLevel: educationalLevel,
      learningResourceType: learningResourceType,
      teaches: teaches,
      timeRequired: timeRequired,
      inLanguage: inLanguage,
      isPartOf: {
        '@type': 'Course',
        name: 'Fundamentos de SEO',
        description: 'Curso completo de fundamentos de SEO para principiantes y profesionales',
        provider: {
          '@type': 'Organization',
          name: 'Red Creativa Pro'
        }
      },
      educationalUse: 'instruction',
      interactivityType: 'mixed',
      typicalAgeRange: '18-65'
    };

    // Remove existing schema if present
    const existingSchema = document.querySelector('script[type="application/ld+json"][data-schema="educational"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Add new schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'educational');
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const schemaToRemove = document.querySelector('script[type="application/ld+json"][data-schema="educational"]');
      if (schemaToRemove) {
        schemaToRemove.remove();
      }
    };
  }, [title, description, url, datePublished, dateModified, author, publisher, educationalLevel, learningResourceType, teaches, timeRequired, inLanguage]);

  return null; // This component doesn't render anything visible
}