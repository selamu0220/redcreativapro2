/**
 * Test for enhanced language context with error handling
 * This test verifies that the enhanced language context provider
 * handles errors gracefully and provides fallback functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorRecoveryManager } from '../language/ErrorRecoveryManager';
import { FallbackTranslationSystem } from '../language/FallbackTranslationSystem';
import { ErrorType, RecoveryStrategy } from '../language/types';

describe('Enhanced Language Context Error Handling', () => {
  let errorRecoveryManager: ErrorRecoveryManager;
  let fallbackSystem: FallbackTranslationSystem;

  beforeEach(() => {
    errorRecoveryManager = ErrorRecoveryManager.getInstance();
    fallbackSystem = FallbackTranslationSystem.getInstance();
  });

  describe('ErrorRecoveryManager', () => {
    it('should handle translation loading errors', () => {
      const error = new Error('Network error');
      const strategy = errorRecoveryManager.handleTranslationError(error, 'common', 'es');
      
      expect(strategy).toBe(RecoveryStrategy.RETRY_WITH_BACKOFF);
    });

    it('should handle context initialization errors', () => {
      const error = new Error('Initialization failed');
      const strategy = errorRecoveryManager.handleContextInitializationError(error);
      
      expect(strategy).toBe(RecoveryStrategy.ENABLE_FALLBACK_MODE);
    });

    it('should log errors with context', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      
      errorRecoveryManager.logError(error, {
        component: 'LanguageProvider',
        action: 'test',
        language: 'es',
        url: 'http://test.com',
        userAgent: 'test-agent',
        timestamp: Date.now()
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('FallbackTranslationSystem', () => {
    it('should provide fallback translations', () => {
      const fallback = fallbackSystem.getFallbackTranslation('test.key', 'common', 'es');
      expect(typeof fallback).toBe('string');
    });

    it('should provide minimal fallback translations', () => {
      const minimal = fallbackSystem.getMinimalFallbackTranslations('common');
      expect(minimal).toHaveProperty('loading');
      expect(minimal).toHaveProperty('error');
    });

    it('should handle caching', () => {
      const testData = { test: 'value' };
      fallbackSystem.setCachedTranslations('es', 'common', testData);
      
      const cached = fallbackSystem.getCachedTranslations('es', 'common');
      expect(cached).toEqual(testData);
    });
  });

  describe('Error Recovery Strategies', () => {
    it('should return correct strategy for different error types', () => {
      expect(errorRecoveryManager.getRecoveryStrategy(ErrorType.TRANSLATION_LOADING_FAILED))
        .toBe(RecoveryStrategy.USE_FALLBACK_TRANSLATIONS);
      
      expect(errorRecoveryManager.getRecoveryStrategy(ErrorType.CONTEXT_INITIALIZATION_FAILED))
        .toBe(RecoveryStrategy.ENABLE_FALLBACK_MODE);
      
      expect(errorRecoveryManager.getRecoveryStrategy(ErrorType.SSR_HYDRATION_MISMATCH))
        .toBe(RecoveryStrategy.USE_DEFAULT_LANGUAGE);
    });
  });

  describe('Error Statistics', () => {
    it('should track error statistics', () => {
      const error = new Error('Test error');
      errorRecoveryManager.logError(error, {
        component: 'test',
        action: 'test',
        language: 'es',
        url: 'test',
        userAgent: 'test',
        timestamp: Date.now()
      });

      const stats = errorRecoveryManager.getErrorStats();
      expect(stats.totalErrors).toBeGreaterThan(0);
      expect(stats.errorsByLanguage).toHaveProperty('es');
    });
  });
});
