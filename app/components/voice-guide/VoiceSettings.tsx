'use client';

import React, { useState, useEffect } from 'react';
import { useVoiceGuide } from './VoiceGuideProvider';
import { UserPreferences, VoiceModel, SupportedLanguage } from '../../types/voice-guide';
import { Settings, Volume2, Mic, Play, Loader2 } from 'lucide-react';

interface VoiceSettingsProps {
  userPreferences: UserPreferences | null;
  onPreferencesUpdate: (preferences: UserPreferences) => void;
  language: SupportedLanguage;
}

export function VoiceSettings({ userPreferences, onPreferencesUpdate, language }: VoiceSettingsProps) {
  const {
    availableVoices,
    selectedVoice,
    loadVoices,
    selectVoice,
    playText
  } = useVoiceGuide();

  const [loading, setLoading] = useState(false);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const [localPreferences, setLocalPreferences] = useState<UserPreferences | null>(userPreferences);

  useEffect(() => {
    setLocalPreferences(userPreferences);
  }, [userPreferences]);

  useEffect(() => {
    if (availableVoices.length === 0) {
      loadVoices();
    }
  }, [availableVoices, loadVoices]);

  const handleVoiceChange = (voice: VoiceModel) => {
    selectVoice(voice);
    if (localPreferences) {
      const updatedPreferences = {
        ...localPreferences,
        voice_id: voice.voice_id
      };
      setLocalPreferences(updatedPreferences);
      onPreferencesUpdate(updatedPreferences);
    }
  };

  const handleSettingChange = (key: keyof UserPreferences, value: any) => {
    if (localPreferences) {
      const updatedPreferences = {
        ...localPreferences,
        [key]: value
      };
      setLocalPreferences(updatedPreferences);
      onPreferencesUpdate(updatedPreferences);
    }
  };

  const testVoice = async (voice: VoiceModel) => {
    setTestingVoice(voice.voice_id);
    try {
      // Temporarily select the voice for testing
      const previousVoice = selectedVoice;
      selectVoice(voice);
      
      const testText = getTestText();
      await playText(testText);
      
      // Restore previous voice if it was different
      if (previousVoice && previousVoice.voice_id !== voice.voice_id) {
        selectVoice(previousVoice);
      }
    } catch (error) {
      console.error('Error testing voice:', error);
    } finally {
      setTestingVoice(null);
    }
  };

  const getTestText = () => {
    switch (language) {
      case 'es':
        return 'Hola, esta es una prueba de voz. ¿Te gusta cómo sueno?';
      case 'fr':
        return 'Bonjour, ceci est un test de voix. Aimez-vous mon son?';
      case 'de':
        return 'Hallo, das ist ein Stimmtest. Gefällt Ihnen, wie ich klinge?';
      default:
        return 'Hello, this is a voice test. Do you like how I sound?';
    }
  };

  const getLabels = () => {
    switch (language) {
      case 'es':
        return {
          title: 'Configuración de Voz',
          voiceSelection: 'Selección de Voz',
          testVoice: 'Probar Voz',
          testing: 'Probando...',
          autoPlay: 'Reproducción Automática',
          autoPlayDesc: 'Reproducir automáticamente las explicaciones',
          showHotspots: 'Mostrar Puntos Interactivos',
          hotspotsDesc: 'Mostrar indicadores visuales en elementos interactivos',
          voiceSpeed: 'Velocidad de Voz',
          voiceVolume: 'Volumen de Voz',
          loadingVoices: 'Cargando voces...',
          noVoices: 'No se encontraron voces disponibles'
        };
      case 'fr':
        return {
          title: 'Paramètres Vocaux',
          voiceSelection: 'Sélection de Voix',
          testVoice: 'Tester la Voix',
          testing: 'Test en cours...',
          autoPlay: 'Lecture Automatique',
          autoPlayDesc: 'Lire automatiquement les explications',
          showHotspots: 'Afficher les Points Interactifs',
          hotspotsDesc: 'Afficher les indicateurs visuels sur les éléments interactifs',
          voiceSpeed: 'Vitesse de la Voix',
          voiceVolume: 'Volume de la Voix',
          loadingVoices: 'Chargement des voix...',
          noVoices: 'Aucune voix disponible trouvée'
        };
      case 'de':
        return {
          title: 'Spracheinstellungen',
          voiceSelection: 'Stimmauswahl',
          testVoice: 'Stimme Testen',
          testing: 'Teste...',
          autoPlay: 'Automatische Wiedergabe',
          autoPlayDesc: 'Erklärungen automatisch abspielen',
          showHotspots: 'Interaktive Punkte Anzeigen',
          hotspotsDesc: 'Visuelle Indikatoren auf interaktiven Elementen anzeigen',
          voiceSpeed: 'Sprachgeschwindigkeit',
          voiceVolume: 'Sprachlautstärke',
          loadingVoices: 'Stimmen laden...',
          noVoices: 'Keine verfügbaren Stimmen gefunden'
        };
      default:
        return {
          title: 'Voice Settings',
          voiceSelection: 'Voice Selection',
          testVoice: 'Test Voice',
          testing: 'Testing...',
          autoPlay: 'Auto Play',
          autoPlayDesc: 'Automatically play explanations',
          showHotspots: 'Show Hotspots',
          hotspotsDesc: 'Display visual indicators on interactive elements',
          voiceSpeed: 'Voice Speed',
          voiceVolume: 'Voice Volume',
          loadingVoices: 'Loading voices...',
          noVoices: 'No available voices found'
        };
    }
  };

  const labels = getLabels();

  if (!localPreferences) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Settings className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">{labels.title}</h3>
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">{labels.voiceSelection}</label>
        
        {availableVoices.length === 0 ? (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{labels.loadingVoices}</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableVoices.map((voice) => (
              <div
                key={voice.voice_id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedVoice?.voice_id === voice.voice_id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleVoiceChange(voice)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Mic className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900">{voice.name}</span>
                    </div>
                    {voice.description && (
                      <p className="text-xs text-gray-600 mt-1">{voice.description}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {voice.category}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      testVoice(voice);
                    }}
                    disabled={testingVoice === voice.voice_id}
                    className="ml-2 p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors disabled:opacity-50"
                    title={labels.testVoice}
                  >
                    {testingVoice === voice.voice_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto Play Setting */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">{labels.autoPlay}</label>
          <p className="text-xs text-gray-600">{labels.autoPlayDesc}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localPreferences.auto_play}
            onChange={(e) => handleSettingChange('auto_play', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* Show Hotspots Setting */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">{labels.showHotspots}</label>
          <p className="text-xs text-gray-600">{labels.hotspotsDesc}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localPreferences.show_hotspots}
            onChange={(e) => handleSettingChange('show_hotspots', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* Voice Speed */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{labels.voiceSpeed}</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={localPreferences.voice_speed}
            onChange={(e) => handleSettingChange('voice_speed', parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-600 w-12 text-right">
            {localPreferences.voice_speed.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Voice Volume */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{labels.voiceVolume}</label>
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-gray-600" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={localPreferences.voice_volume}
            onChange={(e) => handleSettingChange('voice_volume', parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-600 w-12 text-right">
            {Math.round(localPreferences.voice_volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}