'use client';

/**
 * EEAT Enhancement Management Panel
 * 
 * Manages Expertise, Authoritativeness, and Trustworthiness signals
 */

import React, { useState, useEffect } from 'react';

interface AuthorProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  credentials: string[];
  expertise: string[];
  socialProfiles: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  publications: Publication[];
  lastUpdated: Date;
}

interface Publication {
  id: string;
  title: string;
  url: string;
  publishedDate: Date;
  type: 'article' | 'research' | 'book' | 'whitepaper';
  citations?: number;
}

interface AuthoritativeSource {
  id: string;
  domain: string;
  name: string;
  trustScore: number;
  category: string;
  lastVerified: Date;
  isActive: boolean;
}

interface ContentFreshness {
  contentId: string;
  lastUpdated: Date;
  nextReviewDate: Date;
  updateFrequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  isStale: boolean;
  stalenessScore: number;
}

interface EEATManagementPanelProps {
  className?: string;
}

export default function EEATManagementPanel({ className = '' }: EEATManagementPanelProps) {
  const [activeTab, setActiveTab] = useState<'authors' | 'sources' | 'freshness'>('authors');
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [sources, setSources] = useState<AuthoritativeSource[]>([]);
  const [freshness, setFreshness] = useState<ContentFreshness[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEEATData();
  }, []);

  const loadEEATData = async () => {
    setIsLoading(true);
    try {
      // Load data from localStorage or API
      const storedAuthors = localStorage.getItem('eeat-authors');
      const storedSources = localStorage.getItem('eeat-sources');
      const storedFreshness = localStorage.getItem('eeat-freshness');

      if (storedAuthors) {
        const parsedAuthors = JSON.parse(storedAuthors).map((author: any) => ({
          ...author,
          lastUpdated: new Date(author.lastUpdated),
          publications: author.publications.map((pub: any) => ({
            ...pub,
            publishedDate: new Date(pub.publishedDate)
          }))
        }));
        setAuthors(parsedAuthors);
      } else {
        // Initialize with default data
        const defaultAuthors = [
          {
            id: '1',
            name: 'Dr. Sarah Johnson',
            email: 'sarah@example.com',
            bio: 'AI researcher with 10+ years experience in machine learning and natural language processing.',
            credentials: ['PhD Computer Science', 'Google AI Researcher', 'Published 50+ papers'],
            expertise: ['Machine Learning', 'NLP', 'AI Ethics'],
            socialProfiles: {
              linkedin: 'https://linkedin.com/in/sarahjohnson',
              twitter: 'https://twitter.com/sarahjohnsonai'
            },
            publications: [],
            lastUpdated: new Date('2024-01-15')
          }
        ];
        setAuthors(defaultAuthors);
        localStorage.setItem('eeat-authors', JSON.stringify(defaultAuthors));
      }

      if (storedSources) {
        const parsedSources = JSON.parse(storedSources).map((source: any) => ({
          ...source,
          lastVerified: new Date(source.lastVerified)
        }));
        setSources(parsedSources);
      } else {
        const defaultSources = [
          {
            id: '1',
            domain: 'nature.com',
            name: 'Nature Publishing',
            trustScore: 95,
            category: 'Scientific Research',
            lastVerified: new Date('2024-01-10'),
            isActive: true
          },
          {
            id: '2',
            domain: 'arxiv.org',
            name: 'arXiv',
            trustScore: 88,
            category: 'Preprint Repository',
            lastVerified: new Date('2024-01-08'),
            isActive: true
          }
        ];
        setSources(defaultSources);
        localStorage.setItem('eeat-sources', JSON.stringify(defaultSources));
      }

      if (storedFreshness) {
        const parsedFreshness = JSON.parse(storedFreshness).map((item: any) => ({
          ...item,
          lastUpdated: new Date(item.lastUpdated),
          nextReviewDate: new Date(item.nextReviewDate)
        }));
        setFreshness(parsedFreshness);
      } else {
        const defaultFreshness = [
          {
            contentId: 'article-123',
            lastUpdated: new Date('2023-12-01'),
            nextReviewDate: new Date('2024-03-01'),
            updateFrequency: 'quarterly' as const,
            isStale: true,
            stalenessScore: 75
          }
        ];
        setFreshness(defaultFreshness);
        localStorage.setItem('eeat-freshness', JSON.stringify(defaultFreshness));
      }
    } catch (error) {
      console.error('Failed to load EEAT data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`eeat-management-panel bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">E-E-A-T Management</h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage Expertise, Experience, Authoritativeness, and Trustworthiness signals
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          {[
            { id: 'authors', label: 'Authors', icon: '👤' },
            { id: 'sources', label: 'Sources', icon: '🔗' },
            { id: 'freshness', label: 'Freshness', icon: '🔄' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {activeTab === 'authors' && (
              <AuthorsTab 
                authors={authors} 
                onUpdateAuthor={(author) => {
                  const updatedAuthors = authors.map(a => a.id === author.id ? author : a);
                  setAuthors(updatedAuthors);
                  localStorage.setItem('eeat-authors', JSON.stringify(updatedAuthors));
                }}
                onAddAuthor={(author) => {
                  const updatedAuthors = [...authors, author];
                  setAuthors(updatedAuthors);
                  localStorage.setItem('eeat-authors', JSON.stringify(updatedAuthors));
                }}
                onDeleteAuthor={(authorId) => {
                  const updatedAuthors = authors.filter(a => a.id !== authorId);
                  setAuthors(updatedAuthors);
                  localStorage.setItem('eeat-authors', JSON.stringify(updatedAuthors));
                }}
              />
            )}
            
            {activeTab === 'sources' && (
              <SourcesTab 
                sources={sources}
                onUpdateSource={(source) => {
                  const updatedSources = sources.map(s => s.id === source.id ? source : s);
                  setSources(updatedSources);
                  localStorage.setItem('eeat-sources', JSON.stringify(updatedSources));
                }}
                onAddSource={(source) => {
                  const updatedSources = [...sources, source];
                  setSources(updatedSources);
                  localStorage.setItem('eeat-sources', JSON.stringify(updatedSources));
                }}
                onDeleteSource={(sourceId) => {
                  const updatedSources = sources.filter(s => s.id !== sourceId);
                  setSources(updatedSources);
                  localStorage.setItem('eeat-sources', JSON.stringify(updatedSources));
                }}
              />
            )}
            
            {activeTab === 'freshness' && (
              <FreshnessTab 
                freshness={freshness}
                onUpdateFreshness={(item) => {
                  const updatedFreshness = freshness.map(f => f.contentId === item.contentId ? item : f);
                  setFreshness(updatedFreshness);
                  localStorage.setItem('eeat-freshness', JSON.stringify(updatedFreshness));
                }}
                onAddFreshness={(item) => {
                  const updatedFreshness = [...freshness, item];
                  setFreshness(updatedFreshness);
                  localStorage.setItem('eeat-freshness', JSON.stringify(updatedFreshness));
                }}
                onDeleteFreshness={(contentId) => {
                  const updatedFreshness = freshness.filter(f => f.contentId !== contentId);
                  setFreshness(updatedFreshness);
                  localStorage.setItem('eeat-freshness', JSON.stringify(updatedFreshness));
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface AuthorsTabProps {
  authors: AuthorProfile[];
  onUpdateAuthor: (author: AuthorProfile) => void;
  onAddAuthor: (author: AuthorProfile) => void;
  onDeleteAuthor: (authorId: string) => void;
}

function AuthorsTab({ authors, onUpdateAuthor, onAddAuthor, onDeleteAuthor }: AuthorsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<AuthorProfile | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-900">Author Profiles</h4>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
        >
          Add Author
        </button>
      </div>

      {authors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No authors configured</p>
          <p className="text-sm mt-1">Add author profiles to improve E-E-A-T signals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {authors.map((author) => (
            <AuthorCard
              key={author.id}
              author={author}
              onEdit={() => setEditingAuthor(author)}
              onDelete={() => onDeleteAuthor(author.id)}
            />
          ))}
        </div>
      )}

      {(showAddForm || editingAuthor) && (
        <AuthorForm
          author={editingAuthor}
          onSave={(author) => {
            if (editingAuthor) {
              onUpdateAuthor(author);
            } else {
              onAddAuthor({ ...author, id: Date.now().toString() });
            }
            setShowAddForm(false);
            setEditingAuthor(null);
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingAuthor(null);
          }}
        />
      )}
    </div>
  );
}

interface AuthorCardProps {
  author: AuthorProfile;
  onEdit: () => void;
  onDelete?: () => void;
}

function AuthorCard({ author, onEdit, onDelete }: AuthorCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h5 className="font-medium text-gray-900">{author.name}</h5>
          <p className="text-sm text-gray-600 mt-1">{author.bio}</p>
          
          <div className="mt-3 space-y-2">
            <div>
              <span className="text-xs font-medium text-gray-700">Credentials:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {author.credentials.map((credential, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {credential}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <span className="text-xs font-medium text-gray-700">Expertise:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {author.expertise.map((area, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Edit
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface AuthorFormProps {
  author: AuthorProfile | null;
  onSave: (author: AuthorProfile) => void;
  onCancel: () => void;
}

function AuthorForm({ author, onSave, onCancel }: AuthorFormProps) {
  const [formData, setFormData] = useState<Partial<AuthorProfile>>(
    author || {
      name: '',
      email: '',
      bio: '',
      credentials: [],
      expertise: [],
      socialProfiles: {},
      publications: []
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: author?.id || Date.now().toString(),
      lastUpdated: new Date()
    } as AuthorProfile);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {author ? 'Edit Author' : 'Add Author'}
        </h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-600 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface SourcesTabProps {
  sources: AuthoritativeSource[];
  onUpdateSource: (source: AuthoritativeSource) => void;
  onAddSource: (source: AuthoritativeSource) => void;
  onDeleteSource: (sourceId: string) => void;
}

function SourcesTab({ sources, onUpdateSource, onAddSource, onDeleteSource }: SourcesTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSource, setEditingSource] = useState<AuthoritativeSource | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-900">Authoritative Sources</h4>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
        >
          Add Source
        </button>
      </div>

      {sources.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No authoritative sources configured</p>
          <p className="text-sm mt-1">Add trusted sources to improve E-E-A-T signals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => (
            <div key={source.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h5 className="font-medium text-gray-900">{source.name}</h5>
                    <span className="text-sm text-gray-500">{source.domain}</span>
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-gray-700 mr-1">Trust Score:</span>
                      <span className={`text-xs font-bold ${
                        source.trustScore >= 90 ? 'text-green-600' :
                        source.trustScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {source.trustScore}/100
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{source.category}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last verified: {source.lastVerified.toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    source.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {source.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button 
                    onClick={() => setEditingSource(source)}
                    className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDeleteSource(source.id)}
                    className="px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAddForm || editingSource) && (
        <SourceForm
          source={editingSource}
          onSave={(source) => {
            if (editingSource) {
              onUpdateSource(source);
            } else {
              onAddSource({ ...source, id: Date.now().toString() });
            }
            setShowAddForm(false);
            setEditingSource(null);
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingSource(null);
          }}
        />
      )}
    </div>
  );
}

interface FreshnessTabProps {
  freshness: ContentFreshness[];
  onUpdateFreshness: (item: ContentFreshness) => void;
  onAddFreshness: (item: ContentFreshness) => void;
  onDeleteFreshness: (contentId: string) => void;
}

function FreshnessTab({ freshness, onUpdateFreshness, onAddFreshness, onDeleteFreshness }: FreshnessTabProps) {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingFreshness, setEditingFreshness] = useState<ContentFreshness | null>(null);

  const handleUpdateNow = (item: ContentFreshness) => {
    const now = new Date();
    const nextReviewDate = calculateNextReviewDate(now, item.updateFrequency);
    const updatedItem: ContentFreshness = {
      ...item,
      lastUpdated: now,
      nextReviewDate,
      isStale: false,
      stalenessScore: 0
    };
    onUpdateFreshness(updatedItem);
  };

  const calculateNextReviewDate = (lastUpdated: Date, frequency: ContentFreshness['updateFrequency']): Date => {
    const nextDate = new Date(lastUpdated);
    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    return nextDate;
  };

  const calculateStalenessScore = (lastUpdated: Date, nextReviewDate: Date): number => {
    const now = new Date();
    const totalPeriod = nextReviewDate.getTime() - lastUpdated.getTime();
    const elapsed = now.getTime() - lastUpdated.getTime();
    const score = Math.min((elapsed / totalPeriod) * 100, 100);
    return Math.round(score);
  };

  // Auto-update staleness scores
  React.useEffect(() => {
    const interval = setInterval(() => {
      freshness.forEach(item => {
        const newStalenessScore = calculateStalenessScore(item.lastUpdated, item.nextReviewDate);
        const isStale = new Date() > item.nextReviewDate;
        
        if (newStalenessScore !== item.stalenessScore || isStale !== item.isStale) {
          onUpdateFreshness({
            ...item,
            stalenessScore: newStalenessScore,
            isStale
          });
        }
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [freshness, onUpdateFreshness]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-900">Content Freshness</h4>
        <button 
          onClick={() => setShowScheduleForm(true)}
          className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
        >
          Schedule Review
        </button>
      </div>

      {freshness.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No content freshness tracking configured</p>
          <p className="text-sm mt-1">Schedule content reviews to maintain E-E-A-T signals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {freshness.map((item) => (
            <div key={item.contentId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{item.contentId}</h5>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>Last updated: {item.lastUpdated.toLocaleDateString()}</span>
                    <span>Next review: {item.nextReviewDate.toLocaleDateString()}</span>
                    <span>Frequency: {item.updateFrequency}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-700 mr-1">Staleness:</span>
                    <span className={`text-xs font-bold ${
                      item.stalenessScore >= 70 ? 'text-red-600' :
                      item.stalenessScore >= 40 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {item.stalenessScore}%
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    item.isStale ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.isStale ? 'Stale' : 'Fresh'}
                  </span>
                  <button 
                    onClick={() => handleUpdateNow(item)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                  >
                    Update Now
                  </button>
                  <button 
                    onClick={() => setEditingFreshness(item)}
                    className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDeleteFreshness(item.contentId)}
                    className="px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showScheduleForm || editingFreshness) && (
        <FreshnessForm
          freshness={editingFreshness}
          onSave={(item) => {
            if (editingFreshness) {
              onUpdateFreshness(item);
            } else {
              onAddFreshness(item);
            }
            setShowScheduleForm(false);
            setEditingFreshness(null);
          }}
          onCancel={() => {
            setShowScheduleForm(false);
            setEditingFreshness(null);
          }}
        />
      )}
    </div>
  );
}

interface SourceFormProps {
  source: AuthoritativeSource | null;
  onSave: (source: AuthoritativeSource) => void;
  onCancel: () => void;
}

function SourceForm({ source, onSave, onCancel }: SourceFormProps) {
  const [formData, setFormData] = useState<Partial<AuthoritativeSource>>(
    source || {
      domain: '',
      name: '',
      trustScore: 80,
      category: '',
      isActive: true
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: source?.id || Date.now().toString(),
      lastVerified: new Date()
    } as AuthoritativeSource);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {source ? 'Edit Source' : 'Add Source'}
        </h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Domain</label>
            <input
              type="text"
              value={formData.domain || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Source Name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Select category</option>
              <option value="Scientific Research">Scientific Research</option>
              <option value="News & Media">News & Media</option>
              <option value="Government">Government</option>
              <option value="Educational">Educational</option>
              <option value="Industry Report">Industry Report</option>
              <option value="Preprint Repository">Preprint Repository</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Trust Score (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.trustScore || 80}
              onChange={(e) => setFormData(prev => ({ ...prev, trustScore: parseInt(e.target.value) }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive || false}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active source
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-600 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FreshnessFormProps {
  freshness: ContentFreshness | null;
  onSave: (item: ContentFreshness) => void;
  onCancel: () => void;
}

function FreshnessForm({ freshness, onSave, onCancel }: FreshnessFormProps) {
  const [formData, setFormData] = useState<Partial<ContentFreshness>>(
    freshness || {
      contentId: '',
      updateFrequency: 'monthly',
      isStale: false,
      stalenessScore: 0
    }
  );

  const calculateNextReviewDate = (frequency: ContentFreshness['updateFrequency']): Date => {
    const nextDate = new Date();
    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    return nextDate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const nextReviewDate = calculateNextReviewDate(formData.updateFrequency || 'monthly');
    
    onSave({
      ...formData,
      contentId: formData.contentId || `content-${Date.now()}`,
      lastUpdated: freshness?.lastUpdated || now,
      nextReviewDate,
      isStale: freshness?.isStale || false,
      stalenessScore: freshness?.stalenessScore || 0
    } as ContentFreshness);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {freshness ? 'Edit Content Schedule' : 'Schedule Content Review'}
        </h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Content ID</label>
            <input
              type="text"
              value={formData.contentId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, contentId: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="article-123, page-about, etc."
              required
              disabled={!!freshness} // Don't allow editing content ID for existing items
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Update Frequency</label>
            <select
              value={formData.updateFrequency || 'monthly'}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                updateFrequency: e.target.value as ContentFreshness['updateFrequency']
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p><strong>Next review will be scheduled for:</strong></p>
            <p>{calculateNextReviewDate(formData.updateFrequency || 'monthly').toLocaleDateString()}</p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
            >
              {freshness ? 'Update Schedule' : 'Schedule Review'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-600 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-200 animate-pulse h-20 rounded-lg"></div>
      ))}
    </div>
  );
}