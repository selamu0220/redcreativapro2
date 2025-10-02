'use client';

import React, { useState, useEffect } from 'react';
import { useVoiceGuide } from '../../../app/components/voice-guide/VoiceGuideProvider';
import { Tutorial } from '../../../app/types/voice-guide';
import {
  BookOpen,
  Play,
  CheckCircle,
  Circle,
  Clock,
  Users,
  Globe,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

interface TutorialManagerProps {
  className?: string;
}

export function TutorialManager({ className = '' }: TutorialManagerProps) {
  const {
    tutorials = [],
    currentTutorial,
    tutorialProgress = [],
    userPreferences,
    loadTutorial,
    resetTutorialProgress,
    updateUserPreferences
  } = useVoiceGuide();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    userPreferences?.language || 'en'
  );

  // Get unique categories
  const categories: string[] = ['all', ...new Set<string>(tutorials.map((t: Tutorial) => t.category || ''))];

  // Filter tutorials
  const filteredTutorials = tutorials.filter((tutorial: Tutorial) => {
    const categoryMatch = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const languageMatch = tutorial.language === selectedLanguage;
    return categoryMatch && languageMatch;
  });

  // Get progress for a tutorial
  const getTutorialProgress = (tutorialId: string) => {
    const progress = tutorialProgress.filter((p: any) => p.tutorial_id === tutorialId);
    return {
      completed: progress.filter((p: any) => p.completed).length,
      total: progress.length,
      lastAccessed: progress.reduce((latest: any, p: any) => 
        new Date(p.updated_at) > new Date(latest) ? p.updated_at : latest, 
        ''
      )
    };
  };

  // Handle tutorial selection
  const handleTutorialSelect = (tutorial: Tutorial) => {
    loadTutorial(tutorial.id);
  };

  // Handle language change
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    updateUserPreferences({ language });
  };

  // Handle reset progress
  const handleResetProgress = (tutorialId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to reset progress for this tutorial?')) {
      resetTutorialProgress(tutorialId);
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Get progress percentage
  const getProgressPercentage = (tutorialId: string) => {
    const progress = getTutorialProgress(tutorialId);
    return progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Voice Tutorials</h2>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category: string) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-3 py-1 text-sm rounded-full transition-colors capitalize
                ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category === 'all' ? 'All Categories' : category.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tutorial List */}
      <div className="p-6">
        {filteredTutorials.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tutorials available for the selected language.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTutorials.map((tutorial: Tutorial) => {
              const progress = getTutorialProgress(tutorial.id);
              const progressPercentage = getProgressPercentage(tutorial.id);
              const isActive = currentTutorial?.id === tutorial.id;

              return (
                <div
                  key={tutorial.id}
                  onClick={() => handleTutorialSelect(tutorial)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                    ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Title and Status */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {tutorial.title}
                        </h3>
                        
                        {progressPercentage === 100 && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        
                        {isActive && (
                          <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-3">
                        {tutorial.description}
                      </p>

                      {/* Meta Information */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(tutorial.estimated_duration)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className="capitalize">{tutorial.difficulty_level}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span className="uppercase">{tutorial.language}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {progress.total > 0 && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>
                              Progress: {progress.completed}/{progress.total} steps
                            </span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Last Accessed */}
                      {progress.lastAccessed && (
                        <p className="text-xs text-gray-500">
                          Last accessed: {new Date(progress.lastAccessed).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleTutorialSelect(tutorial)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        {isActive ? 'Continue' : 'Start'}
                      </button>
                      
                      {progress.total > 0 && (
                        <button
                          onClick={(e) => handleResetProgress(tutorial.id, e)}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                          title="Reset Progress"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredTutorials.length} tutorial{filteredTutorials.length !== 1 ? 's' : ''} available
          </span>
          
          {currentTutorial && (
            <div className="flex items-center gap-1">
              <span>Current:</span>
              <span className="font-medium">{currentTutorial.title}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TutorialManager;