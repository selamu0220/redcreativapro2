'use client';

import React, { useEffect, useState } from 'react';
import { VoiceGuideProvider, useVoiceGuide } from '../components/voice-guide/VoiceGuideProvider';
import { TutorialManager } from '../../src/components/voice-guide/TutorialManager';
import { HotspotsOverlay } from '../../src/components/voice-guide/HotspotsOverlay';
import { AudioPlayer } from '../../src/components/voice-guide/AudioPlayer';
import VisualGuideSystem from '../components/voice-guide/VisualGuideSystem';
import {
  Mic,
  Volume2,
  Settings,
  Info,
  Play,
  Pause,
  Eye,
  EyeOff
} from 'lucide-react';

function VoiceGuideDashboard() {
  const [showHotspots, setShowHotspots] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showVisualGuide, setShowVisualGuide] = useState(true);
  const { playText, isPlaying, pauseAudio, stopAudio } = useVoiceGuide();

  const testAudio = async () => {
    try {
      await playText('¡Hola! Esta es una prueba del sistema de guía de voz. El audio está funcionando correctamente.');
    } catch (error) {
      console.error('Error testing audio:', error);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Toggle hotspots with 'H' key
      if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey) {
        setShowHotspots(prev => !prev);
      }
      // Toggle welcome with 'W' key
      if (e.key.toLowerCase() === 'w' && !e.ctrlKey && !e.metaKey) {
        setShowWelcome(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  AI Voice Guide
                </h1>
                <p className="text-sm text-gray-600">
                  Interactive tutorials with voice guidance
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={testAudio}
                disabled={isPlaying}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors
                  ${
                    isPlaying
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }
                `}
                title="Test Audio System"
              >
                <Volume2 className="w-4 h-4" />
                {isPlaying ? 'Playing...' : 'Test Audio'}
              </button>

              <button
                onClick={() => setShowHotspots(!showHotspots)}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors
                  ${
                    showHotspots
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                title="Toggle Hotspots (H)"
              >
                {showHotspots ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Hotspots
              </button>

              <button
                onClick={() => setShowVisualGuide(!showVisualGuide)}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors
                  ${
                    showVisualGuide
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                title="Toggle Visual Guide (Ctrl+V)"
              >
                <Eye className="w-4 h-4" />
                Visual Guide
              </button>

              <button
                onClick={() => setShowWelcome(!showWelcome)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                title="Toggle Welcome Panel (W)"
              >
                <Info className="w-4 h-4" />
                Help
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tutorial Manager */}
          <div className="lg:col-span-2">
            <TutorialManager />
          </div>

          {/* Welcome Panel */}
          {showWelcome && (
            <div className="lg:col-span-1">
              <WelcomePanel onClose={() => setShowWelcome(false)} />
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Volume2 className="w-8 h-8 text-blue-500" />}
            title="Voice Guidance"
            description="High-quality AI-generated voice explanations for every feature"
          />
          
          <FeatureCard
            icon={<Eye className="w-8 h-8 text-green-500" />}
            title="Interactive Hotspots"
            description="Visual indicators that guide you through the interface"
          />
          
          <FeatureCard
            icon={<Settings className="w-8 h-8 text-purple-500" />}
            title="Customizable"
            description="Adjust voice speed, language, and tutorial preferences"
          />
          
          <FeatureCard
            icon={<Play className="w-8 h-8 text-orange-500" />}
            title="Progress Tracking"
            description="Keep track of your learning progress across all tutorials"
          />
        </div>
      </main>

      {/* Visual Guide System */}
      <VisualGuideSystem 
        autoShow={showVisualGuide}
        className="voice-guide-integration"
      />

      {/* Hotspots Overlay */}
      {showHotspots && <HotspotsOverlay />}

      {/* Audio Player */}
      <AudioPlayer position="bottom-center" />

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
          <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
          <div>H - Toggle Hotspots</div>
          <div>W - Toggle Help Panel</div>
          <div>Ctrl+V - Toggle Visual Guide</div>
          <div>Ctrl+H - Toggle Visual Hotspots</div>
          <div>Space - Play/Pause Audio</div>
          <div>Esc - Stop Audio</div>
        </div>
      </div>
    </div>
  );
}

// Welcome Panel Component
function WelcomePanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Welcome to AI Voice Guide</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4 text-sm text-gray-600">
        <p>
          Get started with interactive voice tutorials that guide you through 
          every feature of the application.
        </p>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Select a tutorial from the list</li>
            <li>Follow the visual hotspots on screen</li>
            <li>Listen to voice explanations</li>
            <li>Track your progress as you learn</li>
          </ol>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Multi-language support (EN, ES, FR, DE)</li>
            <li>Adjustable playback speed</li>
            <li>Voice selection options</li>
            <li>Progress tracking</li>
            <li>Keyboard shortcuts</li>
          </ul>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Tip: Use the keyboard shortcuts shown in the bottom-left corner 
            for quick navigation.
          </p>
        </div>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

// Main Page Component with Provider
export default function VoiceGuidePage() {
  return (
    <VoiceGuideProvider>
      <VoiceGuideDashboard />
    </VoiceGuideProvider>
  );
}
