'use client';

import React, { useState, useCallback } from 'react';
import { useVoiceGuide } from './VoiceGuideProvider';
import { TUTORIAL_SCRIPTS, TutorialScript, TutorialStep } from '../../config/tutorial-scripts';
import { Play, Pause, SkipForward, SkipBack, Square, Volume2, BookOpen, Users, Zap } from 'lucide-react';

interface VoiceTutorialProps {
  onClose?: () => void;
}

const VoiceTutorial: React.FC<VoiceTutorialProps> = ({ onClose }) => {
  const [currentTutorial, setCurrentTutorial] = useState<'onboarding' | 'quickStart'>('onboarding');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { playText, stopAudio, pauseAudio, resumeAudio } = useVoiceGuide();

  const tutorials = {
    onboarding: TUTORIAL_SCRIPTS.onboarding,
    quickStart: TUTORIAL_SCRIPTS.quickStart
  };

  const currentTutorialData = tutorials[currentTutorial];
  const currentStepData = currentTutorialData.steps[currentStep];

  const playCurrentStep = useCallback(() => {
    if (currentStepData) {
      setIsPlaying(true);
      playText(currentStepData.content);
    }
  }, [currentStepData, playText]);

  const playFullTutorial = useCallback(() => {
    const fullContent = currentTutorialData.steps
      .map((step, index) => `Paso ${index + 1}: ${step.content}`)
      .join('. ');
    
    setIsPlaying(true);
    playText(`${currentTutorialData.title}. ${currentTutorialData.description}. ${fullContent}`);
  }, [currentTutorialData, playText]);

  const nextStep = () => {
    if (currentStep < currentTutorialData.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsPlaying(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    stopAudio();
    setIsPlaying(false);
  };

  const handlePause = () => {
    pauseAudio();
    setIsPlaying(false);
  };

  const handleResume = () => {
    resumeAudio();
    setIsPlaying(true);
  };

  const switchTutorial = (tutorial: 'onboarding' | 'quickStart') => {
    setCurrentTutorial(tutorial);
    setCurrentStep(0);
    setIsPlaying(false);
    stopAudio();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Volume2 className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tutorial de Voz
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Tutorial Selection */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => switchTutorial('onboarding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentTutorial === 'onboarding'
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Introducción Completa
        </button>
        <button
          onClick={() => switchTutorial('quickStart')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentTutorial === 'quickStart'
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Zap className="w-4 h-4" />
          Inicio Rápido
        </button>
      </div>

      {/* Tutorial Info */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {currentTutorialData.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {currentTutorialData.description}
        </p>
        
        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Paso {currentStep + 1} de {currentTutorialData.steps.length}
          </span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / currentTutorialData.steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          {currentStepData?.title}
        </h4>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {currentStepData?.content}
        </p>

      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Paso anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          {isPlaying ? (
            <>
              <button
                onClick={handlePause}
                className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 transition-colors"
                title="Pausar"
              >
                <Pause className="w-4 h-4" />
              </button>
              <button
                onClick={handleStop}
                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 transition-colors"
                title="Detener"
              >
                <Square className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={playCurrentStep}
              className="p-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 transition-colors"
              title="Reproducir paso actual"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={nextStep}
            disabled={currentStep === currentTutorialData.steps.length - 1}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Siguiente paso"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={playFullTutorial}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Reproducir Todo
        </button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Atajos de Teclado</h5>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Espacio</kbd> - Reproducir/Pausar</div>
          <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">→</kbd> - Siguiente paso</div>
          <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">←</kbd> - Paso anterior</div>
          <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Esc</kbd> - Detener</div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTutorial;
