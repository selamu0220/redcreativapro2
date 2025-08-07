'use client';

import React, { useState, useEffect } from 'react';
import { Prompt, PromptVariable } from '../../types/prompts';

interface PromptEditorProps {
  prompt?: Prompt;
  onSave: (prompt: Prompt) => void;
  onCancel: () => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<Prompt>>({
    title: '',
    description: '',
    content: '',
    category: 'general',
    tags: [],
    variables: [],
    isPublic: false,
    isFavorite: false
  });

  const [newTag, setNewTag] = useState('');
  const [newVariable, setNewVariable] = useState<Partial<PromptVariable>>({
    name: '',
    description: '',
    required: false
  });

  useEffect(() => {
    if (prompt) {
      setFormData(prompt);
    }
  }, [prompt]);

  const handleInputChange = (field: keyof Prompt, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const addVariable = () => {
    if (newVariable.name?.trim()) {
      const variable: PromptVariable = {
        name: newVariable.name.trim(),
        description: newVariable.description || '',
        required: newVariable.required || false
      };
      handleInputChange('variables', [...(formData.variables || []), variable]);
      setNewVariable({ name: '', description: '', required: false });
    }
  };

  const removeVariable = (variableName: string) => {
    handleInputChange('variables', formData.variables?.filter(v => v.name !== variableName) || []);
  };

  const handleSave = () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      alert('Title and content are required');
      return;
    }

    const promptToSave: Prompt = {
      id: prompt?.id || Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description || '',
      content: formData.content.trim(),
      category: formData.category || 'general',
      tags: formData.tags || [],
      variables: formData.variables || [],
      isPublic: formData.isPublic || false,
      isFavorite: formData.isFavorite || false,
      createdAt: prompt?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: prompt?.userId || 'current-user'
    };

    onSave(promptToSave);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {prompt ? 'Edit Prompt' : 'Create New Prompt'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter prompt title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of the prompt"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category || 'general'}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="general">General</option>
            <option value="writing">Writing</option>
            <option value="coding">Coding</option>
            <option value="analysis">Analysis</option>
            <option value="creative">Creative</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <textarea
            value={formData.content || ''}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the prompt content..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a tag"
            />
            <button
              onClick={addTag}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variables
          </label>
          <div className="space-y-2 mb-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newVariable.name || ''}
                onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Variable name"
              />
              <input
                type="text"
                value={newVariable.description || ''}
                onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description"
              />
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={newVariable.required || false}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, required: e.target.checked }))}
                />
                Required
              </label>
              <button
                onClick={addVariable}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {formData.variables?.map((variable) => (
              <div key={variable.name} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <code className="px-2 py-1 bg-white rounded text-sm">
                  {variable.name}
                </code>
                <span className="text-sm text-gray-600 flex-1">
                  {variable.description}
                </span>
                {variable.required && (
                  <span className="text-xs text-red-600">Required</span>
                )}
                <button
                  onClick={() => removeVariable(variable.name)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPublic || false}
              onChange={(e) => handleInputChange('isPublic', e.target.checked)}
            />
            <span className="text-sm text-gray-700">Make public</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isFavorite || false}
              onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
            />
            <span className="text-sm text-gray-700">Add to favorites</span>
          </label>
        </div>
      </div>
    </div>
  );
};