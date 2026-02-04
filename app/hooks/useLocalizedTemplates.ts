'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PromptTemplate, TemplateCategory } from '../data/promptTemplates';
import { SupportedLanguage } from '../types/language';
import { templateManager } from '../lib/templateManager';

export interface UseLocalizedTemplatesOptions {
  language?: SupportedLanguage;
  enableCaching?: boolean;
  autoRefresh?: boolean;
}

export interface UseLocalizedTemplatesReturn {
  // Data
  templates: PromptTemplate[];
  categories: TemplateCategory[];
  isLoading: boolean;
  error: string | null;

  // Template operations
  getTemplate: (templateId: string) => PromptTemplate | null;
  getTemplatesByCategory: (categoryId: string) => PromptTemplate[];
  searchTemplates: (query: string) => PromptTemplate[];
  processTemplate: (templateId: string, variables: Record<string, string>) => string;
  
  // Template analysis
  extractVariables: (templateId: string) => string[];
  validateVariables: (templateId: string, variables: Record<string, string>) => { isValid: boolean; missingVariables: string[] };
  
  // Filtered templates
  popularTemplates: PromptTemplate[];
  recentTemplates: PromptTemplate[];
  builtInTemplates: PromptTemplate[];
  customTemplates: PromptTemplate[];
  
  // Statistics
  stats: {
    totalTemplates: number;
    builtInTemplates: number;
    customTemplates: number;
    categoriesCount: number;
    totalUsage: number;
  };
  
  // Actions
  refresh: () => void;
  clearCache: () => void;
}

export function useLocalizedTemplates(options: UseLocalizedTemplatesOptions = {}): UseLocalizedTemplatesReturn {
  const {
    language = 'es',
    enableCaching = true,
    autoRefresh = false
  } = options;

  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configure template manager
  useEffect(() => {
    templateManager.updateConfig({
      defaultLanguage: language,
      enableCaching
    });
  }, [language, enableCaching]);

  // Load templates and categories
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [templatesData, categoriesData] = await Promise.all([
        Promise.resolve(templateManager.getTemplates(language)),
        Promise.resolve(templateManager.getCategories(language))
      ]);

      setTemplates(templatesData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  // Template operations
  const getTemplate = useCallback((templateId: string): PromptTemplate | null => {
    return templateManager.getTemplate(templateId, language);
  }, [language]);

  const getTemplatesByCategory = useCallback((categoryId: string): PromptTemplate[] => {
    return templateManager.getTemplatesByCategory(categoryId, language);
  }, [language]);

  const searchTemplates = useCallback((query: string): PromptTemplate[] => {
    return templateManager.searchTemplates(query, language);
  }, [language]);

  const processTemplate = useCallback((templateId: string, variables: Record<string, string>): string => {
    return templateManager.processTemplate(templateId, variables, language);
  }, [language]);

  const extractVariables = useCallback((templateId: string): string[] => {
    return templateManager.extractVariables(templateId, language);
  }, [language]);

  const validateVariables = useCallback((templateId: string, variables: Record<string, string>) => {
    return templateManager.validateTemplateVariables(templateId, variables, language);
  }, [language]);

  // Filtered templates (memoized for performance)
  const popularTemplates = useMemo(() => {
    return templateManager.getPopularTemplates(10, language);
  }, [templates, language]);

  const recentTemplates = useMemo(() => {
    return templateManager.getRecentTemplates(10, language);
  }, [templates, language]);

  const builtInTemplates = useMemo(() => {
    return templateManager.getBuiltInTemplates(language);
  }, [templates, language]);

  const customTemplates = useMemo(() => {
    return templateManager.getCustomTemplates(language);
  }, [templates, language]);

  // Statistics
  const stats = useMemo(() => {
    return templateManager.getTemplateStats(language);
  }, [templates, categories, language]);

  // Actions
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const clearCache = useCallback(() => {
    templateManager.clearCache();
    loadData();
  }, [loadData]);

  return {
    // Data
    templates,
    categories,
    isLoading,
    error,

    // Template operations
    getTemplate,
    getTemplatesByCategory,
    searchTemplates,
    processTemplate,

    // Template analysis
    extractVariables,
    validateVariables,

    // Filtered templates
    popularTemplates,
    recentTemplates,
    builtInTemplates,
    customTemplates,

    // Statistics
    stats,

    // Actions
    refresh,
    clearCache
  };
}

// Specialized hooks for common use cases
export function useTemplatesByCategory(categoryId: string, language?: SupportedLanguage) {
  const { getTemplatesByCategory, isLoading, error } = useLocalizedTemplates({ language });
  
  const templates = useMemo(() => {
    return getTemplatesByCategory(categoryId);
  }, [getTemplatesByCategory, categoryId]);

  return { templates, isLoading, error };
}

export function useTemplateSearch(query: string, language?: SupportedLanguage) {
  const { searchTemplates, isLoading, error } = useLocalizedTemplates({ language });
  
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchTemplates(query);
  }, [searchTemplates, query]);

  return { results, isLoading, error };
}

export function useTemplateProcessor(templateId: string, language?: SupportedLanguage) {
  const { getTemplate, processTemplate, extractVariables, validateVariables, isLoading, error } = useLocalizedTemplates({ language });
  
  const template = useMemo(() => {
    return getTemplate(templateId);
  }, [getTemplate, templateId]);

  const variables = useMemo(() => {
    return extractVariables(templateId);
  }, [extractVariables, templateId]);

  const process = useCallback((variableValues: Record<string, string>) => {
    return processTemplate(templateId, variableValues);
  }, [processTemplate, templateId]);

  const validate = useCallback((variableValues: Record<string, string>) => {
    return validateVariables(templateId, variableValues);
  }, [validateVariables, templateId]);

  return {
    template,
    variables,
    process,
    validate,
    isLoading,
    error
  };
}
