'use client';

import React, { useState } from 'react';
import { LocalizedTemplateSelector } from '../components/LocalizedTemplateSelector';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types/language';
import { PromptTemplate } from '../data/promptTemplates';

export default function TestLocalizedTemplatesPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('es');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [processedResults, setProcessedResults] = useState<Array<{
    templateId: string;
    variables: Record<string, string>;
    result: string;
    timestamp: Date;
  }>>([]);

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
  };

  const handleTemplateProcess = (templateId: string, variables: Record<string, string>, result: string) => {
    setProcessedResults(prev => [{
      templateId,
      variables,
      result,
      timestamp: new Date()
    }, ...prev.slice(0, 4)]); // Keep only last 5 results
  };

  const languageNames: Record<SupportedLanguage, string> = {
    es: 'Español',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    zh: '中文',
    pt: 'Português'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Localized Template System Test
          </h1>
          <p className="mt-2 text-gray-600">
            Test the multi-language template system with dynamic content generation
          </p>
        </div>

        {/* Language selector */}
        <div className="mb-6">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Select Language
          </label>
          <select
            id="language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang} value={lang}>
                {languageNames[lang]} ({lang.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template selector */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <LocalizedTemplateSelector
                language={selectedLanguage}
                onTemplateSelect={handleTemplateSelect}
                onTemplateProcess={handleTemplateProcess}
              />
            </div>
          </div>

          {/* Sidebar with info */}
          <div className="space-y-6">
            {/* Selected template info */}
            {selectedTemplate && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Selected Template
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">{selectedTemplate.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-2 text-gray-900">{selectedTemplate.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Language:</span>
                    <span className="ml-2 text-gray-900">{selectedLanguage.toUpperCase()}</span>
                  </div>
                  {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Variables:</span>
                      <div className="ml-2 mt-1">
                        {selectedTemplate.variables.map(variable => (
                          <span
                            key={variable}
                            className="inline-block mr-2 mb-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent results */}
            {processedResults.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Results
                </h3>
                <div className="space-y-4">
                  {processedResults.map((result, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="text-sm text-gray-600 mb-2">
                        {result.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Variables:</div>
                        <div className="text-xs text-gray-600 mb-2">
                          {Object.entries(result.variables).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                        <div className="font-medium text-gray-700 mb-1">Result:</div>
                        <div className="text-xs text-gray-600 line-clamp-3">
                          {result.result}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Language info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Language Support
              </h3>
              <div className="space-y-2">
                {SUPPORTED_LANGUAGES.map(lang => (
                  <div
                    key={lang}
                    className={`flex items-center justify-between p-2 rounded ${
                      lang === selectedLanguage ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {languageNames[lang]}
                    </span>
                    <span className="text-xs text-gray-500 uppercase">
                      {lang}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4">
                How to Test
              </h3>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>1. Select a language from the dropdown above</li>
                <li>2. Browse templates by category or search</li>
                <li>3. Click on a template to select it</li>
                <li>4. Fill in the template variables</li>
                <li>5. Click "Generate Content" to see the result</li>
                <li>6. Switch languages to see localized templates</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}