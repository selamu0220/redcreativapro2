'use client';

import React from 'react';
import { Prompt } from '../../types/prompts';

interface PromptListProps {
  prompts: Prompt[];
  onSelectPrompt: (prompt: Prompt) => void;
  selectedPromptId?: string;
}

export const PromptList: React.FC<PromptListProps> = ({
  prompts,
  onSelectPrompt,
  selectedPromptId
}) => {
  return (
    <div className="space-y-2">
      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedPromptId === prompt.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onSelectPrompt(prompt)}
        >
          <h3 className="font-medium text-gray-900">{prompt.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              prompt.category === 'writing' ? 'bg-green-100 text-green-800' :
              prompt.category === 'coding' ? 'bg-blue-100 text-blue-800' :
              prompt.category === 'analysis' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {prompt.category}
            </span>
            <span className="text-xs text-gray-500">
              {prompt.tags.join(', ')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
