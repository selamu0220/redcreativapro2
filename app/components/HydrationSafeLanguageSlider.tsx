'use client';

import React from 'react';
import { FallbackLanguageSlider } from './FallbackLanguageSlider';

interface HydrationSafeLanguageSliderProps {
  onLanguageChange?: (locale: string) => void;
  className?: string;
}

export function HydrationSafeLanguageSlider({ onLanguageChange, className }: HydrationSafeLanguageSliderProps) {
  // Always use the fallback slider since we disabled i18n routing
  // This ensures language switching works correctly without route prefixes
  return <FallbackLanguageSlider onLanguageChange={onLanguageChange} className={className} />;
}
