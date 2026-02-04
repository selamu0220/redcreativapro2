'use client';

import React from 'react';
import { Tutorial, SupportedLanguage } from '../../types/voice-guide';
import { CheckCircle, Circle, Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface TutorialProgressProps {
  tutorial: Tutorial | null;
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  language: SupportedLanguage;
  onStepChange?: (step: number) => void;
  onRestart?: () => void;
  onTogglePlay?: () => void;
}

export function TutorialProgress({
  tutorial,
  currentStep,
  totalSteps,
  isPlaying,
  language,
  onStepChange,
  onRestart,
  onTogglePlay
}: TutorialProgressProps) {
  const getLabels = () => {
    switch (language) {
      case 'es':
        return {
          progress: 'Progreso',
          step: 'Paso',
          of: 'de',
          completed: 'Completado',
          current: 'Actual',
          notStarted: 'No iniciado',
          restart: 'Reiniciar',
          play: 'Reproducir',
          pause: 'Pausar',
          duration: 'Duración',
          minutes: 'min'
        };
      case 'fr':
        return {
          progress: 'Progrès',
          step: 'Étape',
          of: 'sur',
          completed: 'Terminé',
          current: 'Actuel',
          notStarted: 'Non commencé',
          restart: 'Redémarrer',
          play: 'Lire',
          pause: 'Pause',
          duration: 'Durée',
          minutes: 'min'
        };
      case 'de':
        return {
          progress: 'Fortschritt',
          step: 'Schritt',
          of: 'von',
          completed: 'Abgeschlossen',
          current: 'Aktuell',
          notStarted: 'Nicht begonnen',
          restart: 'Neu starten',
          play: 'Abspielen',
          pause: 'Pausieren',
          duration: 'Dauer',
          minutes: 'Min'
        };
      default:
        return {
          progress: 'Progress',
          step: 'Step',
          of: 'of',
          completed: 'Completed',
          current: 'Current',
          notStarted: 'Not started',
          restart: 'Restart',
          play: 'Play',
          pause: 'Pause',
          duration: 'Duration',
          minutes: 'min'
        };
    }
  };

  const labels = getLabels();

  if (!tutorial) {
    return null;
  }

  const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const isCompleted = currentStep >= totalSteps;

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'current':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-400 bg-gray-100';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{tutorial.title}</h3>
          <p className="text-sm text-gray-600">
            {labels.step} {currentStep + 1} {labels.of} {totalSteps}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{tutorial.duration_minutes} {labels.minutes}</span>
          </div>
          
          {onRestart && (
            <button
              onClick={onRestart}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title={labels.restart}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          
          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              className={`p-2 rounded-full transition-colors ${
                isPlaying
                  ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isPlaying ? labels.pause : labels.play}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{labels.progress}</span>
          <span className={`font-medium ${
            isCompleted ? 'text-green-600' : 'text-purple-600'
          }`}>
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-purple-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      {totalSteps > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {labels.step}s
            </span>
            {isCompleted && (
              <span className="text-xs text-green-600 font-medium">
                {labels.completed}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {Array.from({ length: totalSteps }, (_, index) => {
              const status = getStepStatus(index);
              const isClickable = onStepChange && index <= currentStep;
              
              return (
                <button
                  key={index}
                  onClick={() => isClickable && onStepChange(index)}
                  disabled={!isClickable}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                    getStepColor(status)
                  } ${
                    isClickable
                      ? 'cursor-pointer hover:scale-110'
                      : 'cursor-default'
                  }`}
                  title={`${labels.step} ${index + 1}`}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : status === 'current' ? (
                    <Circle className="w-4 h-4 fill-current" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Message */}
      <div className="text-center">
        {isCompleted ? (
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{labels.completed}</span>
          </div>
        ) : currentStep === 0 ? (
          <div className="text-sm text-gray-500">
            {labels.notStarted}
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2 text-purple-600">
            <Circle className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">
              {labels.current}: {labels.step} {currentStep + 1}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
