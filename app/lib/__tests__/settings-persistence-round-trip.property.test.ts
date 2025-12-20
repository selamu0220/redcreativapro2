/**
 * Property-Based Test: Settings Persistence Round-Trip
 * Feature: ai-writer-rebuild, Property 3: Settings Persistence Round-Trip
 * 
 * Validates: Requirements 4.2, 4.3, 5.2
 * 
 * Property: For any valid settings object, saving to localStorage and then loading
 * should produce an equivalent settings object with all fields preserved.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { saveSettings, loadSettings, clearSettings, type AISettings } from '../settings-manager';

describe('Feature: ai-writer-rebuild, Property 3: Settings Persistence Round-Trip', () => {
  beforeEach(() => {
    clearSettings();
    localStorage.clear();
  });

  it('should preserve all settings fields after save and load', () => {
    fc.assert(
      fc.property(
        fc.record({
          provider: fc.constantFrom('openai', 'anthropic', 'google'),
          model: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          temperature: fc.float({ min: 0, max: 1 }),
          apiKey: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
          usePersonalKey: fc.boolean(),
          lastUpdated: fc.date().map(d => d.toISOString()),
        }),
        (settings) => {
          // Save settings
          saveSettings(settings as AISettings);

          // Load settings
          const loaded = loadSettings();

          // Verify all fields are preserved
          expect(loaded).not.toBeNull();
          expect(loaded?.provider).toBe(settings.provider);
          expect(loaded?.model).toBe(settings.model);
          expect(loaded?.temperature).toBeCloseTo(settings.temperature, 5);
          expect(loaded?.apiKey).toBe(settings.apiKey);
          expect(loaded?.usePersonalKey).toBe(settings.usePersonalKey);
          // lastUpdated will be different (updated on save), so we just check it exists
          expect(loaded?.lastUpdated).toBeDefined();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should handle settings with and without API keys', () => {
    fc.assert(
      fc.property(
        fc.record({
          provider: fc.constantFrom('openai', 'anthropic', 'google'),
          model: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          temperature: fc.float({ min: 0, max: 1 }),
          usePersonalKey: fc.boolean(),
        }),
        fc.boolean(),
        (baseSettings, hasApiKey) => {
          const settings: AISettings = {
            ...baseSettings,
            apiKey: hasApiKey ? `sk-${Math.random().toString(36).substring(7)}` : undefined,
            lastUpdated: new Date().toISOString(),
          };

          // Save and load
          saveSettings(settings);
          const loaded = loadSettings();

          // Verify API key handling
          expect(loaded).not.toBeNull();
          if (hasApiKey) {
            expect(loaded?.apiKey).toBeDefined();
            expect(loaded?.apiKey).toBe(settings.apiKey);
          } else {
            expect(loaded?.apiKey).toBeUndefined();
          }
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should maintain temperature precision', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1 }),
        (temperature) => {
          const settings: AISettings = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature,
            usePersonalKey: false,
            lastUpdated: new Date().toISOString(),
          };

          // Save and load
          saveSettings(settings);
          const loaded = loadSettings();

          // Verify temperature is preserved with high precision
          expect(loaded).not.toBeNull();
          expect(loaded?.temperature).toBeCloseTo(temperature, 10);
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should handle multiple save/load cycles', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            provider: fc.constantFrom('openai', 'anthropic', 'google'),
            model: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            temperature: fc.float({ min: 0, max: 1 }),
            apiKey: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
            usePersonalKey: fc.boolean(),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (settingsArray) => {
          let lastSaved: AISettings | null = null;

          // Perform multiple save/load cycles
          for (const settings of settingsArray) {
            const fullSettings: AISettings = {
              ...settings,
              lastUpdated: new Date().toISOString(),
            };

            saveSettings(fullSettings);
            const loaded = loadSettings();

            // Verify each cycle preserves data
            expect(loaded).not.toBeNull();
            expect(loaded?.provider).toBe(fullSettings.provider);
            expect(loaded?.model).toBe(fullSettings.model);
            expect(loaded?.temperature).toBeCloseTo(fullSettings.temperature, 5);
            expect(loaded?.apiKey).toBe(fullSettings.apiKey);
            expect(loaded?.usePersonalKey).toBe(fullSettings.usePersonalKey);

            lastSaved = loaded;
          }

          // Verify final state matches last save
          const finalLoaded = loadSettings();
          expect(finalLoaded).toEqual(lastSaved);
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should return null for corrupted data and clear storage', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('invalid json'),
          fc.constant('{"incomplete": '),
          fc.constant('null'),
          fc.constant('undefined'),
          fc.constant('[]'),
          fc.constant('123'),
        ),
        (corruptedData) => {
          // Manually set corrupted data in localStorage
          localStorage.setItem('ai-writer-settings', corruptedData);

          // Attempt to load
          const loaded = loadSettings();

          // Should return null for corrupted data
          expect(loaded).toBeNull();

          // Storage should be cleared
          expect(localStorage.getItem('ai-writer-settings')).toBeNull();
        }
      ),
      { numRuns: 1 }
    );
  });
});
