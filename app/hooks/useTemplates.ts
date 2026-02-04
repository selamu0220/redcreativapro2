'use client'

import { useState, useEffect, useCallback } from 'react'
import { PromptTemplate, TemplateCategory } from '../data/promptTemplates'
import { Prompt } from '../types/prompts'
import { BUILT_IN_TEMPLATES } from '../data/builtInTemplates'
// import { validateTemplateData } from '../utils/debugLocalStorage' // Using local implementation

const STORAGE_KEY = 'prompt-manager-templates'



interface UseTemplatesReturn {
  templates: PromptTemplate[]
  getTemplatesByCategory: (category: PromptTemplate['category']) => PromptTemplate[]
  getTemplate: (id: string) => PromptTemplate | undefined
  createPromptFromTemplate: (templateId: string, variables: Record<string, string>) => Omit<Prompt, 'id' | 'userId' | 'createdAt' | 'updatedAt'> | null
  addCustomTemplate: (template: Omit<PromptTemplate, 'id' | 'isBuiltIn' | 'usageCount' | 'createdAt'>) => void
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => void
  deleteTemplate: (id: string) => void
  incrementUsage: (id: string) => void
  exportTemplates: () => string
  importTemplates: (jsonData: string) => { success: boolean; imported?: number; error?: string }
  resetToDefaults: () => void
}

// Validation function for localStorage data
const validateTemplateData = () => {
  const result = {
    isValid: true,
    errors: [] as string[],
    fixedItems: 0
  };
  
  try {
    // Check if localStorage is accessible
    if (typeof window === 'undefined' || !window.localStorage) {
      result.errors.push('localStorage not available');
      result.isValid = false;
      return result;
    }
    
    // Check templates data
    const templatesData = localStorage.getItem(STORAGE_KEY);
    if (templatesData) {
      try {
        const parsed = JSON.parse(templatesData);
        if (!Array.isArray(parsed)) {
          result.errors.push('Templates data is not an array');
          result.isValid = false;
          localStorage.removeItem(STORAGE_KEY);
          result.fixedItems++;
        } else {
          // Validate each template object
          const validTemplates = parsed.filter((template, index) => {
            if (!template || typeof template !== 'object') {
              result.errors.push(`Template at index ${index} is not a valid object`);
              result.fixedItems++;
              return false;
            }
            
            // Check for required properties that might cause localeCompare errors
            if (template.name === null || template.name === undefined) {
              result.errors.push(`Template at index ${index} has null/undefined name`);
              template.name = 'Unnamed Template';
              result.fixedItems++;
            }
            
            if (template.category === null || template.category === undefined) {
              result.errors.push(`Template at index ${index} has null/undefined category`);
              template.category = 'general';
              result.fixedItems++;
            }
            
            return true;
          });
          
          if (validTemplates.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(validTemplates));
          }
        }
      } catch (parseError) {
        result.errors.push('Failed to parse templates JSON data');
        result.isValid = false;
        localStorage.removeItem(STORAGE_KEY);
        result.fixedItems++;
      }
    }
    
    // Check conversations data
    const conversationsData = localStorage.getItem('conversations');
    if (conversationsData) {
      try {
        const parsed = JSON.parse(conversationsData);
        if (!Array.isArray(parsed)) {
          result.errors.push('Conversations data is not an array');
          result.isValid = false;
          localStorage.removeItem('conversations');
          result.fixedItems++;
        } else {
          // Validate each conversation object
          const validConversations = parsed.filter((conversation, index) => {
            if (!conversation || typeof conversation !== 'object') {
              result.errors.push(`Conversation at index ${index} is not a valid object`);
              result.fixedItems++;
              return false;
            }
            
            // Check for properties that might cause localeCompare errors
            if (conversation.title === null || conversation.title === undefined) {
              result.errors.push(`Conversation at index ${index} has null/undefined title`);
              conversation.title = 'Untitled Conversation';
              result.fixedItems++;
            }
            
            return true;
          });
          
          if (validConversations.length !== parsed.length) {
            localStorage.setItem('conversations', JSON.stringify(validConversations));
          }
        }
      } catch (parseError) {
        result.errors.push('Failed to parse conversations JSON data');
        result.isValid = false;
        localStorage.removeItem('conversations');
        result.fixedItems++;
      }
    }
    
  } catch (error) {
    result.errors.push(`Validation error: ${error}`);
    result.isValid = false;
  }
  
  return result;
};

export const useTemplates = (): UseTemplatesReturn => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])

  // Load templates from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Validate localStorage data first
        console.log('🔍 Validating template data before loading...');
        const validationResult = validateTemplateData();
        
        if (!validationResult.isValid) {
          console.error('❌ Template data validation failed:', validationResult.errors);
        }
        
        if (validationResult.fixedItems > 0) {
          console.log(`✅ Fixed ${validationResult.fixedItems} corrupted template items`);
        }
        
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsedTemplates = JSON.parse(stored)
          // Merge with built-in templates, ensuring built-ins are always present
          const mergedTemplates = [...BUILT_IN_TEMPLATES]
          parsedTemplates.forEach((template: PromptTemplate) => {
            // Additional validation for each template
            if (template && typeof template === 'object') {
              // Ensure required string properties exist and are valid
              const validatedTemplate = {
                ...template,
                name: template.name?.toString() || 'Unnamed Template',
                category: template.category?.toString() || 'general',
                description: template.description?.toString() || ''
              };
              
              if (!template.isBuiltIn) {
                mergedTemplates.push(validatedTemplate)
              } else {
                // Update usage count for built-in templates
                const builtInIndex = mergedTemplates.findIndex(t => t.id === template.id)
                if (builtInIndex !== -1) {
                  mergedTemplates[builtInIndex].usageCount = template.usageCount
                }
              }
            }
          })
          setTemplates(mergedTemplates)
        } else {
          setTemplates(BUILT_IN_TEMPLATES)
        }
      } catch (error) {
        console.error('Error loading templates from localStorage:', error)
        console.error('Falling back to built-in templates')
        setTemplates(BUILT_IN_TEMPLATES)
      }
    }
  }, [])

  // Save templates to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && templates.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
      } catch (error) {
        console.error('Error saving templates to localStorage:', error)
      }
    }
  }, [templates])

  const getTemplatesByCategory = (category: PromptTemplate['category']) => {
    return templates.filter(template => template.category === category)
  }

  const getTemplate = (id: string) => {
    return templates.find(template => template.id === id)
  }

  const createPromptFromTemplate = (templateId: string, variables: Record<string, string>): Omit<Prompt, 'id' | 'userId' | 'createdAt' | 'updatedAt'> | null => {
    const template = getTemplate(templateId)
    if (!template) return null

    let content = template.content
    
    // Replace variables in the content
    template.variables?.forEach(variable => {
      const value = variables[variable] || `{{${variable}}}`
      const regex = new RegExp(`{{${variable}}}`, 'g')
      content = content.replace(regex, value)
    })

    // Increment usage count
    incrementUsage(templateId)

    // Map template category to Prompt category
    const categoryMap: Record<string, 'general' | 'writing' | 'coding' | 'analysis' | 'creative'> = {
      'writing': 'writing',
      'business': 'general',
      'development': 'coding',
      'marketing': 'general',
      'education': 'general',
      'analysis': 'analysis'
    }

    return {
      title: template.name + (variables.topic ? ` - ${variables.topic}` : ''),
      description: template.description,
      content,
      category: categoryMap[template.category] || 'general',
      tags: template.tags || [],
      variables: template.variables?.map(v => ({ name: v, description: '', required: false })) || [],
      isPublic: false,
      isFavorite: false
    }
  }

  const addCustomTemplate = (templateData: Omit<PromptTemplate, 'id' | 'isBuiltIn' | 'usageCount' | 'createdAt'>) => {
    const newTemplate: PromptTemplate = {
      ...templateData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isBuiltIn: false,
      usageCount: 0,
      createdAt: new Date().toISOString()
    }

    setTemplates(prev => [...prev, newTemplate])
  }

  const updateTemplate = (id: string, updates: Partial<PromptTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates } : template
    ))
  }

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id || template.isBuiltIn))
  }

  const incrementUsage = (id: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === id 
        ? { ...template, usageCount: (template.usageCount || 0) + 1 }
        : template
    ))
  }

  const exportTemplates = () => {
    const customTemplates = templates.filter(t => !t.isBuiltIn)
    const exportData = {
      templates: customTemplates,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    return JSON.stringify(exportData, null, 2)
  }

  const importTemplates = (jsonData: string) => {
    try {
      const importData = JSON.parse(jsonData)
      
      if (!importData.templates || !Array.isArray(importData.templates)) {
        throw new Error('Invalid templates data format')
      }

      const importedTemplates = importData.templates as PromptTemplate[]
      
      setTemplates(prev => {
        const existingIds = new Set(prev.map(t => t.id))
        const uniqueImported = importedTemplates.filter(t => !existingIds.has(t.id))
        
        return [...prev, ...uniqueImported.map(t => ({
          ...t,
          isBuiltIn: false,
          usageCount: 0,
          createdAt: new Date().toISOString()
        }))]
      })
      
      return { success: true, imported: importedTemplates.length }
    } catch (error) {
      console.error('Error importing templates:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  const resetToDefaults = () => {
    setTemplates(BUILT_IN_TEMPLATES)
  }

  return {
    templates,
    getTemplatesByCategory,
    getTemplate,
    createPromptFromTemplate,
    addCustomTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    exportTemplates,
    importTemplates,
    resetToDefaults
  }
}
