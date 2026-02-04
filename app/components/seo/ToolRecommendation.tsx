'use client';

import React, { useState } from 'react';
import { 
  Star, 
  ExternalLink, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import './seo-components.css';

export interface ToolRecommendationData {
  id: string;
  toolName: string;
  description: string;
  useCase: string;
  steps: string[];
  isRecommended?: boolean;
  priority?: 'high' | 'medium' | 'low';
  pricing?: {
    type: 'free' | 'freemium' | 'paid';
    startingPrice?: string;
  };
  pros?: string[];
  cons?: string[];
  rating?: number;
  userCount?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  url?: string;
  alternativeTo?: string[];
  category?: string;
}

interface ToolRecommendationProps {
  tools: ToolRecommendationData[];
  title?: string;
  description?: string;
  showComparison?: boolean;
}

const priorityConfig = {
  high: {
    color: 'red',
    label: 'High Priority',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800'
  },
  medium: {
    color: 'yellow',
    label: 'Medium Priority',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800'
  },
  low: {
    color: 'gray',
    label: 'Low Priority',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800'
  }
};

const difficultyConfig = {
  beginner: { color: 'green', label: 'Beginner' },
  intermediate: { color: 'yellow', label: 'Intermediate' },
  advanced: { color: 'red', label: 'Advanced' }
};

const pricingConfig = {
  free: { color: 'green', label: 'Free', icon: '🆓' },
  freemium: { color: 'blue', label: 'Freemium', icon: '💎' },
  paid: { color: 'purple', label: 'Paid', icon: '💰' }
};

export default function ToolRecommendation({
  tools,
  title = "Recommended Tools",
  description,
  showComparison = false
}: ToolRecommendationProps) {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...new Set(tools.map(tool => tool.category).filter(Boolean))];
  
  // Filter tools by category
  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  // Sort tools by recommendation and priority
  const sortedTools = [...filteredTools].sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority || 'low'];
    const bPriority = priorityOrder[b.priority || 'low'];
    
    return bPriority - aPriority;
  });

  const toggleExpanded = (toolId: string) => {
    setExpandedTool(expandedTool === toolId ? null : toolId);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>

      {/* Category filter */}
      {categories.length > 2 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-3 py-1 text-sm font-medium rounded-full transition-colors
                  ${selectedCategory === category
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                aria-label={`Filter tools by ${category === 'all' ? 'all categories' : category}`}
                title={`Filter tools by ${category === 'all' ? 'all categories' : category}`}
              >
                {category === 'all' ? 'All Tools' : category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tools grid */}
      <div className="space-y-4">
        {sortedTools.map((tool) => {
          const isExpanded = expandedTool === tool.id;
          const priorityStyle = tool.priority ? priorityConfig[tool.priority] : null;
          const difficultyStyle = tool.difficulty ? difficultyConfig[tool.difficulty] : null;
          const pricingStyle = tool.pricing ? pricingConfig[tool.pricing.type] : null;

          return (
            <div
              key={tool.id}
              className={`
                border rounded-lg transition-all duration-200
                ${tool.isRecommended 
                  ? 'border-blue-300 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:shadow-sm'
                }
                ${priorityStyle ? `border-l-4 ${priorityStyle.borderColor}` : ''}
              `}
            >
              <div className="p-6">
                {/* Tool header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {tool.toolName}
                      </h4>
                      
                      {/* Badges */}
                      <div className="flex items-center space-x-2">
                        {tool.isRecommended && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Recommended
                          </span>
                        )}
                        
                        {tool.priority && (
                          <span className={`
                            inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
                            ${priorityStyle?.bgColor} ${priorityStyle?.textColor}
                          `}>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {priorityStyle?.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3">{tool.description}</p>

                    {/* Metadata row */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {/* Rating */}
                      {tool.rating && (
                        <div className="flex items-center space-x-1">
                          <div className="flex">{renderStars(tool.rating)}</div>
                          <span>{tool.rating}/5</span>
                        </div>
                      )}

                      {/* Pricing */}
                      {pricingStyle && (
                        <div className="flex items-center space-x-1">
                          <span>{pricingStyle.icon}</span>
                          <span>{pricingStyle.label}</span>
                          {tool.pricing?.startingPrice && (
                            <span>from {tool.pricing.startingPrice}</span>
                          )}
                        </div>
                      )}

                      {/* Difficulty */}
                      {difficultyStyle && (
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded-full
                          difficulty-badge-${difficultyStyle.color}
                        `}>
                          {difficultyStyle.label}
                        </span>
                      )}

                      {/* User count */}
                      {tool.userCount && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{tool.userCount} users</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {tool.url && (
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={`Visit ${tool.toolName} website`}
                        aria-label={`Visit ${tool.toolName} website`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => toggleExpanded(tool.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title={`${isExpanded ? 'Collapse' : 'Expand'} ${tool.toolName} details`}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${tool.toolName} details`}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Use case */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-1">Best Use Case</h5>
                  <p className="text-sm text-gray-700">{tool.useCase}</p>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    {/* Step-by-step process */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Step-by-Step Process
                      </h5>
                      <ol className="space-y-2">
                        {tool.steps.map((step, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 text-sm font-medium rounded-full flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-sm text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Pros and Cons */}
                    {(tool.pros || tool.cons) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tool.pros && (
                          <div>
                            <h5 className="font-medium text-green-800 mb-2">Pros</h5>
                            <ul className="space-y-1">
                              {tool.pros.map((pro, index) => (
                                <li key={index} className="flex items-start space-x-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700">{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {tool.cons && (
                          <div>
                            <h5 className="font-medium text-red-800 mb-2">Cons</h5>
                            <ul className="space-y-1">
                              {tool.cons.map((con, index) => (
                                <li key={index} className="flex items-start space-x-2 text-sm">
                                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700">{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Alternatives */}
                    {tool.alternativeTo && tool.alternativeTo.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Alternative to</h5>
                        <div className="flex flex-wrap gap-2">
                          {tool.alternativeTo.map((alt, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                            >
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      {showComparison && tools.length > 1 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Quick Comparison</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">
                {tools.filter(t => t.isRecommended).length}
              </div>
              <div className="text-gray-600">Recommended</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">
                {tools.filter(t => t.pricing?.type === 'free').length}
              </div>
              <div className="text-gray-600">Free Tools</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">
                {tools.filter(t => t.difficulty === 'beginner').length}
              </div>
              <div className="text-gray-600">Beginner-Friendly</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">
                {Math.round(tools.reduce((acc, t) => acc + (t.rating || 0), 0) / tools.length * 10) / 10}
              </div>
              <div className="text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
