'use client';

import React, { useState } from 'react';
import { CheckCircle, Star, ExternalLink, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface SimpleToolRecommendationProps {
  toolName: string;
  description: string;
  useCase: string;
  steps: string[];
  isRecommended?: boolean;
}

export default function SimpleToolRecommendation({
  toolName,
  description,
  useCase,
  steps,
  isRecommended = false
}: SimpleToolRecommendationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`
      border rounded-lg transition-all duration-200 hover:shadow-sm
      ${isRecommended 
        ? 'border-blue-300 bg-blue-50' 
        : 'border-gray-200 bg-white'
      }
    `}>
      <div className="p-6">
        {/* Tool header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="text-lg font-semibold text-gray-900">
                {toolName}
              </h4>
              
              {/* Recommended badge */}
              {isRecommended && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Recomendado
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-3">{description}</p>
          </div>

          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors ml-4"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Use case */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-1">Mejor Caso de Uso</h5>
          <p className="text-sm text-gray-700">{useCase}</p>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="pt-4 border-t border-gray-200">
            {/* Step-by-step process */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Proceso Paso a Paso
              </h5>
              <ol className="space-y-2">
                {steps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 text-sm font-medium rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
