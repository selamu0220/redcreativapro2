'use client';

import React from 'react';
import { Tutorial, SupportedLanguage } from '../../types/voice-guide';
import { BookOpen, Clock, Star, Play, Loader2 } from 'lucide-react';

interface TutorialListProps {
  tutorials: Tutorial[];
  selectedTutorial: Tutorial | null;
  onSelectTutorial: (tutorial: Tutorial) => void;
  loading: boolean;
  language: SupportedLanguage;
}

export function TutorialList({
  tutorials,
  selectedTutorial,
  onSelectTutorial,
  loading,
  language
}: TutorialListProps) {
  const getLabels = () => {
    switch (language) {
      case 'es':
        return {
          loading: 'Cargando tutoriales...',
          noTutorials: 'No hay tutoriales disponibles',
          minutes: 'min',
          beginner: 'Principiante',
          intermediate: 'Intermedio',
          advanced: 'Avanzado',
          categories: {
            navigation: 'Navegación',
            'ai-tools': 'Herramientas IA',
            management: 'Gestión',
            settings: 'Configuración',
            advanced: 'Avanzado'
          }
        };
      case 'fr':
        return {
          loading: 'Chargement des tutoriels...',
          noTutorials: 'Aucun tutoriel disponible',
          minutes: 'min',
          beginner: 'Débutant',
          intermediate: 'Intermédiaire',
          advanced: 'Avancé',
          categories: {
            navigation: 'Navigation',
            'ai-tools': 'Outils IA',
            management: 'Gestion',
            settings: 'Paramètres',
            advanced: 'Avancé'
          }
        };
      case 'de':
        return {
          loading: 'Tutorials laden...',
          noTutorials: 'Keine Tutorials verfügbar',
          minutes: 'Min',
          beginner: 'Anfänger',
          intermediate: 'Fortgeschritten',
          advanced: 'Experte',
          categories: {
            navigation: 'Navigation',
            'ai-tools': 'KI-Tools',
            management: 'Verwaltung',
            settings: 'Einstellungen',
            advanced: 'Erweitert'
          }
        };
      default:
        return {
          loading: 'Loading tutorials...',
          noTutorials: 'No tutorials available',
          minutes: 'min',
          beginner: 'Beginner',
          intermediate: 'Intermediate',
          advanced: 'Advanced',
          categories: {
            navigation: 'Navigation',
            'ai-tools': 'AI Tools',
            management: 'Management',
            settings: 'Settings',
            advanced: 'Advanced'
          }
        };
    }
  };

  const labels = getLabels();

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation':
        return 'bg-blue-100 text-blue-800';
      case 'ai-tools':
        return 'bg-purple-100 text-purple-800';
      case 'management':
        return 'bg-indigo-100 text-indigo-800';
      case 'settings':
        return 'bg-gray-100 text-gray-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return labels.beginner;
      case 'intermediate':
        return labels.intermediate;
      case 'advanced':
        return labels.advanced;
      default:
        return level;
    }
  };

  const getCategoryLabel = (category: string) => {
    return labels.categories[category as keyof typeof labels.categories] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{labels.loading}</span>
        </div>
      </div>
    );
  }

  if (tutorials.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{labels.noTutorials}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tutorials.map((tutorial) => (
        <div
          key={tutorial.id}
          onClick={() => onSelectTutorial(tutorial)}
          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedTutorial?.id === tutorial.id
              ? 'border-purple-500 bg-purple-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900">{tutorial.title}</h3>
                {selectedTutorial?.id === tutorial.id && (
                  <Play className="w-4 h-4 text-purple-600" />
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {tutorial.description}
              </p>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{tutorial.duration_minutes} {labels.minutes}</span>
                </div>
                
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  getDifficultyColor(tutorial.difficulty_level)
                }`}>
                  {getDifficultyLabel(tutorial.difficulty_level)}
                </span>
                
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  getCategoryColor(tutorial.category)
                }`}>
                  {getCategoryLabel(tutorial.category)}
                </span>
              </div>
            </div>
            
            <div className="ml-4 flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${
                selectedTutorial?.id === tutorial.id
                  ? 'bg-purple-600'
                  : 'bg-gray-300'
              }`} />
            </div>
          </div>
          
          {/* Progress indicator (placeholder for future implementation) */}
          {selectedTutorial?.id === tutorial.id && (
            <div className="mt-3 pt-3 border-t border-purple-200">
              <div className="flex items-center justify-between text-xs text-purple-600">
                <span>Ready to start</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                  <span>Interactive mode</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}