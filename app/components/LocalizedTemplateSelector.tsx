'use client';

import React, { useState, useMemo } from 'react';
import { useLocalizedTemplates } from '../hooks/useLocalizedTemplates';
import { SupportedLanguage } from '../types/language';
import { PromptTemplate } from '../data/promptTemplates';

interface LocalizedTemplateSelectorProps {
  language: SupportedLanguage;
  onTemplateSelect?: (template: PromptTemplate) => void;
  onTemplateProcess?: (templateId: string, variables: Record<string, string>, result: string) => void;
  className?: string;
}

export function LocalizedTemplateSelector({
  language,
  onTemplateSelect,
  onTemplateProcess,
  className = ''
}: LocalizedTemplateSelectorProps) {
  const {
    templates,
    categories,
    isLoading,
    error,
    getTemplatesByCategory,
    searchTemplates,
    processTemplate,
    extractVariables,
    validateVariables,
    stats
  } = useLocalizedTemplates({ language });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [processedContent, setProcessedContent] = useState<string>('');

  // Filter templates based on category and search
  const filteredTemplates = useMemo(() => {
    let result = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = getTemplatesByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = searchTemplates(searchQuery);
    }

    return result;
  }, [templates, selectedCategory, searchQuery, getTemplatesByCategory, searchTemplates]);

  // Handle template selection
  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setTemplateVariables({});
    setProcessedContent('');
    
    // Initialize variables with empty values
    const variables = extractVariables(template.id);
    const initialVariables: Record<string, string> = {};
    variables.forEach(variable => {
      initialVariables[variable] = '';
    });
    setTemplateVariables(initialVariables);

    onTemplateSelect?.(template);
  };

  // Handle variable change
  const handleVariableChange = (variable: string, value: string) => {
    setTemplateVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  // Process template with variables
  const handleProcessTemplate = () => {
    if (!selectedTemplate) return;

    const validation = validateVariables(selectedTemplate.id, templateVariables);
    if (!validation.isValid) {
      alert(`Please fill in all required variables: ${validation.missingVariables.join(', ')}`);
      return;
    }

    try {
      const result = processTemplate(selectedTemplate.id, templateVariables);
      setProcessedContent(result);
      onTemplateProcess?.(selectedTemplate.id, templateVariables, result);
    } catch (err) {
      alert(`Error processing template: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading templates</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header with stats */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Templates ({language.toUpperCase()})
        </h2>
        <div className="mt-2 flex space-x-4 text-sm text-gray-600">
          <span>Total: {stats.totalTemplates}</span>
          <span>Built-in: {stats.builtInTemplates}</span>
          <span>Custom: {stats.customTemplates}</span>
          <span>Categories: {stats.categoriesCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category filter */}
        <div className="flex-1">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedTemplate?.id === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
              {template.isBuiltIn && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Built-in
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{template.description}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {template.tags?.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
            {template.usageCount && (
              <div className="mt-2 text-xs text-gray-500">
                Used {template.usageCount} times
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">No templates found</div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-blue-600 hover:text-blue-500"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Template editor */}
      {selectedTemplate && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Configure Template: {selectedTemplate.name}
          </h3>
          
          {/* Variables */}
          {Object.keys(templateVariables).length > 0 && (
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700">Template Variables</h4>
              {Object.entries(templateVariables).map(([variable, value]) => (
                <div key={variable}>
                  <label htmlFor={variable} className="block text-sm font-medium text-gray-700 mb-1">
                    {variable}
                  </label>
                  <input
                    type="text"
                    id={variable}
                    value={value}
                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                    placeholder={`Enter value for ${variable}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Process button */}
          <button
            type="button"
            onClick={handleProcessTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Content
          </button>

          {/* Processed content */}
          {processedContent && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Content</h4>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <pre className="whitespace-pre-wrap text-sm text-gray-900">{processedContent}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}