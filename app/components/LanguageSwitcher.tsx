'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, RefreshCw, MapPin } from 'lucide-react';
import { useLanguage } from '@/app/lib/language';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/app/lib/language/config';
import { forceLanguageDetection, forceHybridLanguageDetection } from '@/app/lib/language';
import { testGeolocationAPIs } from '@/app/lib/language/geolocation';

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (languageCode: LanguageCode) => {
    setIsOpen(false);
    await changeLanguage(languageCode);
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const detectedLanguage = forceLanguageDetection();
      await changeLanguage(detectedLanguage);
      setIsOpen(false);
    } catch (error) {
      console.error('Error en detección automática:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleLocationDetect = async () => {
    setIsDetecting(true);
    try {
      console.log('🌍 Iniciando detección por ubicación/VPN...');
      
      // Primero ejecutar la prueba de APIs
      await testGeolocationAPIs();
      
      const detectedLanguage = await forceHybridLanguageDetection();
      await changeLanguage(detectedLanguage);
      setIsOpen(false);
    } catch (error) {
      console.error('Error en detección por ubicación:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const currentLangInfo = SUPPORTED_LANGUAGES[currentLanguage];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border
          bg-white dark:bg-gray-800 
          border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-all duration-200
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        `}
        aria-label="Cambiar idioma"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Icono de globo en móvil, bandera en desktop */}
        <div className="flex items-center">
          <span className="hidden sm:inline text-lg" role="img" aria-label={currentLangInfo.nativeName}>
            {currentLangInfo.flag}
          </span>
          <Globe className="w-4 h-4 sm:hidden text-gray-600 dark:text-gray-400" />
        </div>
        
        {/* Texto del idioma (oculto en móvil) */}
        <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLangInfo.nativeName}
        </span>
        
        {/* Indicador de carga o flecha */}
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        ) : (
          <ChevronDown 
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1" role="listbox">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as LanguageCode)}
                disabled={isLoading}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 text-left
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700
                  transition-colors duration-150
                  ${code === currentLanguage 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                role="option"
                aria-selected={code === currentLanguage}
              >
                {/* Bandera */}
                <span className="text-lg" role="img" aria-label={info.nativeName}>
                  {info.flag}
                </span>
                
                {/* Información del idioma */}
                <div className="flex-1">
                  <div className="font-medium">{info.nativeName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {info.name}
                  </div>
                </div>
                
                {/* Indicador de selección */}
                {code === currentLanguage && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
            
            {/* Separador */}
            <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
            
            {/* Botón de detección automática */}
            <button
              onClick={handleAutoDetect}
              disabled={isLoading || isDetecting}
              className={`
                w-full flex items-center gap-3 px-4 py-2 text-left
                hover:bg-gray-50 dark:hover:bg-gray-700
                focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700
                transition-colors duration-150
                text-gray-700 dark:text-gray-300
                ${(isLoading || isDetecting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Icono */}
              <RefreshCw 
                className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} 
              />
              
              {/* Texto */}
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {isDetecting ? 'Detectando...' : 'Detectar por navegador'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Usar idioma del navegador
                </div>
              </div>
            </button>

            {/* Botón de detección por ubicación/VPN */}
            <button
              onClick={handleLocationDetect}
              disabled={isLoading || isDetecting}
              className={`
                w-full flex items-center gap-3 px-4 py-2 text-left
                hover:bg-gray-50 dark:hover:bg-gray-700
                focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700
                transition-colors duration-150
                text-gray-700 dark:text-gray-300
                ${(isLoading || isDetecting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Icono */}
              <MapPin 
                className={`w-4 h-4 ${isDetecting ? 'animate-pulse' : ''}`} 
              />
              
              {/* Texto */}
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {isDetecting ? 'Detectando ubicación...' : 'Detectar por ubicación'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Ideal para VPN - Detecta por IP
                </div>
              </div>
            </button>

            {/* Separador */}
            <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>

            {/* Opciones de forzado manual */}
            <div className="px-2 py-1">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Forzar idioma manualmente:
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('🇺🇸 Forzando inglés...');
                    localStorage.setItem('preferred-language', 'en');
                    changeLanguage('en');
                    setIsOpen(false);
                    setTimeout(() => window.location.reload(), 300);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                >
                  🇺🇸 EN
                </button>
                
                <button
                  onClick={() => {
                    console.log('🇪🇸 Forzando español...');
                    localStorage.setItem('preferred-language', 'es');
                    changeLanguage('es');
                    setIsOpen(false);
                    setTimeout(() => window.location.reload(), 300);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors"
                >
                  🇪🇸 ES
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}