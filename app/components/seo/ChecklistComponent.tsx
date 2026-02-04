'use client';

import React, { useState, useEffect } from 'react';
import { Check, Square, CheckSquare, Info } from 'lucide-react';
import './seo-components.css';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isCompleted?: boolean;
  priority?: 'high' | 'medium' | 'low';
  tooltip?: string;
}

interface ChecklistComponentProps {
  title: string;
  items: ChecklistItem[];
  type: 'keyword-research' | 'on-page' | 'technical';
  description?: string;
  onProgressChange?: (completedCount: number, totalCount: number) => void;
}

const typeStyles = {
  'keyword-research': {
    color: 'blue',
    icon: '🔍',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800'
  },
  'on-page': {
    color: 'green',
    icon: '📝',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800'
  },
  'technical': {
    color: 'purple',
    icon: '⚙️',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800'
  }
};

const priorityStyles = {
  high: 'border-l-4 border-l-red-500 bg-red-50',
  medium: 'border-l-4 border-l-yellow-500 bg-yellow-50',
  low: 'border-l-4 border-l-gray-500 bg-gray-50'
};

export default function ChecklistComponent({
  title,
  items,
  type,
  description,
  onProgressChange
}: ChecklistComponentProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  const style = typeStyles[type];
  const storageKey = `seo-checklist-${type}`;

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const savedItems = JSON.parse(saved);
        setCheckedItems(new Set(savedItems));
      } catch (error) {
        console.error('Error loading checklist progress:', error);
      }
    }
  }, [storageKey]);

  // Save progress to localStorage and notify parent
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(checkedItems)));
    onProgressChange?.(checkedItems.size, items.length);
  }, [checkedItems, items.length, onProgressChange, storageKey]);

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const completedCount = checkedItems.size;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const resetProgress = () => {
    setCheckedItems(new Set());
    localStorage.removeItem(storageKey);
  };

  return (
    <div className={`rounded-lg border ${style.borderColor} ${style.bgColor} p-6 mb-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{style.icon}</span>
          <div>
            <h3 className={`text-lg font-semibold ${style.textColor}`}>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Progress indicator */}
          <div className="flex items-center space-x-2">
            <div className="checklist-progress-bar">
              <div 
                className={`checklist-progress-bar-fill checklist-progress-bar-fill-${style.color}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {completedCount}/{totalCount}
            </span>
          </div>
          
          {/* Reset button */}
          {completedCount > 0 && (
            <button
              type="button"
              onClick={resetProgress}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              title="Reset all checklist progress"
              aria-label="Reset all checklist progress"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="checklist-full-progress-bar">
          <div 
            className={`checklist-full-progress-bar-fill checklist-full-progress-bar-fill-${style.color}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {items.map((item) => {
          const isChecked = checkedItems.has(item.id);
          const priorityStyle = item.priority ? priorityStyles[item.priority] : '';
          
          return (
            <div
              key={item.id}
              className={`
                relative p-4 rounded-md border border-gray-200 bg-white transition-all duration-200
                ${isChecked ? 'opacity-75' : 'hover:shadow-sm'}
                ${priorityStyle}
              `}
            >
              <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`
                    flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${isChecked 
                      ? `bg-${style.color}-500 border-${style.color}-500 text-white` 
                      : `border-gray-300 hover:border-${style.color}-400`
                    }
                  `}
                  aria-label={`${isChecked ? 'Uncheck' : 'Check'} ${item.title}`}
                  title={`${isChecked ? 'Uncheck' : 'Check'} ${item.title}`}
                >
                  {isChecked && <Check className="w-3 h-3" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`
                      font-medium text-gray-900 
                      ${isChecked ? 'line-through text-gray-500' : ''}
                    `}>
                      {item.title}
                    </h4>
                    
                    {/* Priority badge and tooltip */}
                    <div className="flex items-center space-x-2">
                      {item.priority && (
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded-full
                          ${item.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
                          ${item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${item.priority === 'low' ? 'bg-gray-100 text-gray-800' : ''}
                        `}>
                          {item.priority}
                        </span>
                      )}
                      
                      {item.tooltip && (
                        <div className="relative">
                          <button
                            type="button"
                            onMouseEnter={() => setShowTooltip(item.id)}
                            onMouseLeave={() => setShowTooltip(null)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label={`Show tooltip for ${item.title}`}
                            title={`Show tooltip for ${item.title}`}
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          
                          {showTooltip === item.id && (
                            <div className="absolute right-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                              {item.tooltip}
                              <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className={`
                    text-sm text-gray-600 mt-1
                    ${isChecked ? 'line-through' : ''}
                  `}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className={`mt-6 p-4 bg-${style.color}-100 border border-${style.color}-200 rounded-md`}>
          <div className="flex items-center space-x-2">
            <CheckSquare className={`w-5 h-5 text-${style.color}-600`} />
            <span className={`font-medium text-${style.color}-800`}>
              Checklist Complete! 🎉
            </span>
          </div>
          <p className={`text-sm text-${style.color}-700 mt-1`}>
            Great job! You've completed all items in this {type.replace('-', ' ')} checklist.
          </p>
        </div>
      )}
    </div>
  );
}
