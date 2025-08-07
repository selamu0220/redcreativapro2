'use client';

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'web' | 'article' | 'resource';
}

const AIBrowserPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      // Simulate AI-powered search
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'AI Writing Tools Guide',
          description: 'Comprehensive guide to AI writing tools and techniques',
          url: '#',
          type: 'article'
        },
        {
          id: '2',
          title: 'Content Creation with AI',
          description: 'Learn how to create engaging content using AI',
          url: '#',
          type: 'resource'
        }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">
              🤖 AI Browser
            </h1>
            
            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 mb-8">
              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search with AI..."
                  className="flex-1 px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {searchResults.map((result) => (
                <div key={result.id} className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-2">{result.title}</h3>
                  <p className="text-zinc-300 mb-3">{result.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                      {result.type}
                    </span>
                    <a
                      href={result.url}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AIBrowserPage;