'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home, CheckCircle } from 'lucide-react';
import './seo-components.css';

interface SEOModuleLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  nextModule?: {
    title: string;
    href: string;
  };
  previousModule?: {
    title: string;
    href: string;
  };
  currentModule: string;
  progress?: number; // 0-100
}

interface ModuleNavItem {
  title: string;
  href: string;
  id: string;
  completed?: boolean;
}

const moduleNavigation: ModuleNavItem[] = [
  { title: 'Introduction', href: '/seo-fundamentals/introduction', id: 'introduction' },
  { title: 'Keyword Research', href: '/seo-fundamentals/keyword-research', id: 'keyword-research' },
  { title: 'On-Page SEO', href: '/seo-fundamentals/on-page-seo', id: 'on-page-seo' },
  { title: 'Link Building', href: '/seo-fundamentals/link-building', id: 'link-building' },
  { title: 'Technical SEO', href: '/seo-fundamentals/technical-seo', id: 'technical-seo' }
];

export default function SEOModuleLayout({
  title,
  description,
  children,
  nextModule,
  previousModule,
  currentModule,
  progress = 0
}: SEOModuleLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with breadcrumbs */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm">
              <Link 
                href="/" 
                className="text-gray-500 hover:text-gray-700 flex items-center"
                title="Go to home page"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link 
                href="/seo-fundamentals" 
                className="text-gray-500 hover:text-gray-700"
                title="Go to SEO Fundamentals overview"
              >
                SEO Fundamentals
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">{title}</span>
            </nav>

            {/* Progress indicator */}
            {progress > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Progress:</span>
                <div className="seo-progress-bar-container">
                  <div 
                    className="seo-progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{progress}%</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                SEO Modules
              </h3>
              <nav className="space-y-2">
                {moduleNavigation.map((item) => {
                  const isActive = item.id === currentModule;
                  const isCompleted = item.completed;
                  
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      title={`Go to ${item.title} module`}
                      className={`
                        flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      {isCompleted && (
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      )}
                      <span className={isCompleted ? 'line-through' : ''}>
                        {item.title}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Module Header */}
              <div className="px-8 py-6 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
                <p className="text-lg text-gray-600">
                  {description}
                </p>
              </div>

              {/* Module Content */}
              <div className="px-8 py-6">
                {children}
              </div>

              {/* Navigation Footer */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  {previousModule ? (
                    <Link
                      href={previousModule.href}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous: {previousModule.title}
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextModule ? (
                    <Link
                      href={nextModule.href}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Next: {nextModule.title}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
