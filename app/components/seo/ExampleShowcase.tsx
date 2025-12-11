'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Target, TrendingUp, ExternalLink, Copy, Check } from 'lucide-react';
import './seo-components.css';

export interface ExampleData {
  id: string;
  scenario: string;
  implementation: string;
  result: string;
  metrics?: {
    label: string;
    value: string;
    change?: string;
  }[];
  url?: string;
  tags?: string[];
}

interface ExampleShowcaseProps {
  title: string;
  examples: ExampleData[];
  type: '3c-technique' | 'backlink-analysis' | 'keyword-metrics';
  description?: string;
}

const typeConfig = {
  '3c-technique': {
    icon: Target,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    title: '3C Technique Examples'
  },
  'backlink-analysis': {
    icon: ExternalLink,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    title: 'Backlink Analysis Examples'
  },
  'keyword-metrics': {
    icon: TrendingUp,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    title: 'Keyword Metrics Examples'
  }
};

export default function ExampleShowcase({
  title,
  examples,
  type,
  description
}: ExampleShowcaseProps) {
  const [currentExample, setCurrentExample] = useState(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  const config = typeConfig[type];
  const IconComponent = config.icon;
  const example = examples[currentExample];

  const nextExample = () => {
    setCurrentExample((prev) => (prev + 1) % examples.length);
  };

  const previousExample = () => {
    setCurrentExample((prev) => (prev - 1 + examples.length) % examples.length);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  if (!examples.length) {
    return null;
  }

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-6 mb-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`example-icon-container-${config.color}`}>
            <IconComponent className={`example-icon-${config.color}`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${config.textColor}`}>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>

        {/* Navigation controls */}
        {examples.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {currentExample + 1} of {examples.length}
            </span>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={previousExample}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                disabled={examples.length <= 1}
                title="Previous example"
                aria-label="Previous example"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextExample}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                disabled={examples.length <= 1}
                title="Next example"
                aria-label="Next example"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Example content */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Example tabs/indicators */}
        {examples.length > 1 && (
          <div className="flex border-b border-gray-200 bg-gray-50">
            {examples.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentExample(index)}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors
                  ${index === currentExample
                    ? `example-tab-active-${config.color}`
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
                title={`View example ${index + 1}`}
                aria-label={`View example ${index + 1}`}
              >
                Example {index + 1}
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          {/* Tags */}
          {example.tags && example.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {example.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 text-xs font-medium rounded-full bg-${config.color}-100 text-${config.color}-800`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Three-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenario */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-gray-500" />
                  Scenario
                </h4>
                <button
                  type="button"
                  onClick={() => copyToClipboard(example.scenario, 'scenario')}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy scenario to clipboard"
                  aria-label="Copy scenario to clipboard"
                >
                  {copiedText === 'scenario' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {example.scenario}
                </p>
              </div>
            </div>

            {/* Implementation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-gray-500" />
                  Implementation
                </h4>
                <button
                  type="button"
                  onClick={() => copyToClipboard(example.implementation, 'implementation')}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy implementation to clipboard"
                  aria-label="Copy implementation to clipboard"
                >
                  {copiedText === 'implementation' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {example.implementation}
                </p>
              </div>
            </div>

            {/* Result */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
                  Result
                </h4>
                <button
                  type="button"
                  onClick={() => copyToClipboard(example.result, 'result')}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy result to clipboard"
                  aria-label="Copy result to clipboard"
                >
                  {copiedText === 'result' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {example.result}
                </p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          {example.metrics && example.metrics.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Key Metrics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {example.metrics.map((metric, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {metric.value}
                      </span>
                      {metric.change && (
                        <span className={`
                          text-sm font-medium px-2 py-1 rounded-full
                          ${metric.change.startsWith('+') 
                            ? 'bg-green-100 text-green-800' 
                            : metric.change.startsWith('-')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                          }
                        `}>
                          {metric.change}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* URL reference */}
          {example.url && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h4 className="font-medium text-gray-900">Reference URL</h4>
                  <p className="text-sm text-gray-600 truncate max-w-md">
                    {example.url}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(example.url, 'url')}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy URL to clipboard"
                    aria-label="Copy URL to clipboard"
                  >
                    {copiedText === 'url' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={example.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Visit reference URL"
                    aria-label="Visit reference URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick navigation dots */}
      {examples.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {examples.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentExample(index)}
              className={`
                example-nav-dot
                ${index === currentExample 
                  ? `example-nav-dot-active-${config.color}` 
                  : 'example-nav-dot-inactive'
                }
              `}
              title={`Go to example ${index + 1}`}
              aria-label={`Go to example ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}