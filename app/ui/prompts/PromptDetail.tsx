'use client';

import React from 'react';
import { Prompt } from '../../types/prompts';

interface PromptDetailProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onUse: (prompt: Prompt) => void;
}

export const PromptDetail: React.FC<PromptDetailProps> = ({
  prompt,
  onEdit,
  onUse
}) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{prompt.title}</h2>
          <p className="text-gray-600 mt-1">{prompt.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(prompt)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Edit
          </button>
          <button
            onClick={() => onUse(prompt)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Use
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            prompt.category === 'writing' ? 'bg-green-100 text-green-800' :
            prompt.category === 'coding' ? 'bg-blue-100 text-blue-800' :
            prompt.category === 'analysis' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {prompt.category}
          </span>
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Prompt Content</h3>
          <button
            onClick={copyToClipboard}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Copy
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {prompt.content}
          </pre>
        </div>
      </div>

      {prompt.variables && prompt.variables.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Variables</h3>
          <div className="space-y-2">
            {prompt.variables.map((variable) => (
              <div key={variable.name} className="flex items-center gap-2">
                <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {variable.name}
                </code>
                <span className="text-sm text-gray-600">
                  {variable.description}
                </span>
                {variable.required && (
                  <span className="text-xs text-red-600">*required</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
