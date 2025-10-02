'use client'

import { useState, useEffect, useCallback } from 'react'
import { PromptTemplate, TemplateCategory } from '../data/promptTemplates'
import { Prompt } from '../types/prompts'
import { BUILT_IN_TEMPLATES } from '../data/builtInTemplates'
import { validateTemplateData } from '../utils/debugLocalStorage'

const STORAGE_KEY = 'prompt-manager-templates'

// Built-in templates
const BUILT_IN_TEMPLATES: PromptTemplate[] = [
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Review code for best practices, bugs, and improvements',
    category: 'coding',
    icon: '🔍',
    template: {
      title: 'Code Review Assistant',
      description: 'Review code for best practices, bugs, and improvements',
      content: `Please review the following code and provide feedback on:

1. **Code Quality & Best Practices**
   - Code structure and organization
   - Naming conventions
   - Code readability and maintainability

2. **Potential Issues**
   - Bugs or logical errors
   - Performance concerns
   - Security vulnerabilities

3. **Improvements**
   - Optimization opportunities
   - Better algorithms or approaches
   - Code simplification

**Code to review:**
\`\`\`{{language}}
{{code}}
\`\`\`

Please provide specific, actionable feedback with examples where possible.`,
      category: 'coding',
      tags: ['code-review', 'development', 'quality-assurance'],
      variables: [],
      isPublic: true,
      isFavorite: false,
      userId: 'system'
    },
    variables: ['language', 'code'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bug-debugging',
    name: 'Bug Debugging',
    description: 'Systematic approach to debug and fix code issues',
    category: 'coding',
    icon: '🐛',
    template: {
      title: 'Bug Debugging Assistant',
      description: 'Systematic approach to debug and fix code issues',
      content: `I'm experiencing a bug in my code. Please help me debug it systematically:

**Problem Description:**
{{problem_description}}

**Expected Behavior:**
{{expected_behavior}}

**Actual Behavior:**
{{actual_behavior}}

**Code:**
\`\`\`{{language}}
{{code}}
\`\`\`

**Error Messages (if any):**
\`\`\`
{{error_messages}}
\`\`\`

**Environment:**
- Language/Framework: {{environment}}
- Version: {{version}}

Please provide:
1. Potential root causes
2. Step-by-step debugging approach
3. Possible solutions
4. Prevention strategies for similar issues`,
      category: 'coding',
      tags: ['debugging', 'troubleshooting', 'development'],
      variables: [],
      isPublic: true,
      isFavorite: false,
      userId: 'system'
    },
    variables: ['problem_description', 'expected_behavior', 'actual_behavior', 'language', 'code', 'error_messages', 'environment', 'version'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'api-documentation',
    name: 'API Documentation',
    description: 'Generate comprehensive API documentation',
    category: 'coding',
    icon: '📚',
    template: {
      title: 'API Documentation Generator',
      description: 'Generate comprehensive API documentation',
      content: `Please create comprehensive API documentation for the following endpoint:

**Endpoint:** {{method}} {{endpoint}}

**Code:**
\`\`\`{{language}}
{{code}}
\`\`\`

Please include:

1. **Overview**
   - Brief description of what this endpoint does
   - Use cases

2. **Request Details**
   - HTTP method and URL
   - Headers required
   - Request body schema (if applicable)
   - Query parameters

3. **Response Details**
   - Success response format
   - Error response formats
   - Status codes

4. **Examples**
   - Sample request
   - Sample response
   - Error examples

5. **Authentication**
   - Required permissions
   - Authentication method

Format the documentation in a clear, professional manner.`,
      category: 'coding',
      tags: ['api', 'documentation', 'development'],
      variables: [],
      isPublic: true,
      isFavorite: false,
      userId: 'system'
    },
    variables: ['method', 'endpoint', 'language', 'code'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'blog-post-writer',
    name: 'Blog Post Writer',
    description: 'Create engaging blog posts on any topic',
    category: 'writing',
    icon: '✍️',
    template: {
      title: 'Blog Post Writer',
      description: 'Create engaging blog posts on any topic',
      content: `Write a comprehensive blog post about "{{topic}}" with the following specifications:

**Target Audience:** {{target_audience}}
**Tone:** {{tone}}
**Word Count:** {{word_count}} words
**SEO Keywords:** {{keywords}}

**Structure Requirements:**
1. **Compelling Headline** - Attention-grabbing and SEO-friendly
2. **Introduction** - Hook the reader and outline what they'll learn
3. **Main Content** - {{main_points}} main sections with:
   - Clear subheadings
   - Practical examples
   - Actionable insights
4. **Conclusion** - Summarize key points and include a call-to-action

**Additional Requirements:**
- Include relevant statistics or data points
- Add practical tips or actionable advice
- Use engaging storytelling where appropriate
- Optimize for readability with short paragraphs
- Include meta description (150-160 characters)

Please create an engaging, informative, and well-structured blog post.`,
      category: 'writing',
      tags: ['blog', 'writing', 'content-creation'],
      variables: [],
      isPublic: true,
      isFavorite: false,
      userId: 'system'
    },
    variables: ['topic', 'target_audience', 'tone', 'word_count', 'keywords', 'main_points'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Analyze data and provide insights',
    category: 'analysis',
    icon: '📊',
    template: {
      title: 'Data Analysis Assistant',
      description: 'Analyze data and provide insights',
      content: `Please analyze the following data and provide comprehensive insights:

**Dataset Description:**
{{dataset_description}}

**Analysis Objectives:**
{{objectives}}

**Data:**
\`\`\`
{{data}}
\`\`\`

**Specific Questions to Address:**
{{questions}}

Please provide:

1. **Data Overview**
   - Summary statistics
   - Data quality assessment
   - Key observations

2. **Analysis Results**
   - Trends and patterns
   - Correlations
   - Anomalies or outliers

3. **Insights & Interpretations**
   - What the data tells us
   - Business implications
   - Actionable recommendations

4. **Visualizations**
   - Suggest appropriate charts/graphs
   - Key metrics to track

5. **Next Steps**
   - Further analysis recommendations
   - Data collection suggestions

Present findings in a clear, structured format with supporting evidence.`,
      category: 'analysis',
      tags: ['data-analysis', 'insights', 'statistics'],
      variables: [],
      isPublic: true,
      isFavorite: false,
      userId: 'system'
    },
    variables: ['dataset_description', 'objectives', 'data', 'questions'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'creative-brainstorm',
    name: 'Creative Brainstorming',
    description: 'Generate creative ideas and solutions',
    category: 'creative',
    icon: '💡',
    template: {
      title: 'Creative Brainstorming Session',
      description: 'Generate creative ideas and solutions',
      content: `Let's have a creative brainstorming session for: "{{challenge}}"

**Context:**
{{context}}

**Target Audience:**
{{target_audience}}

**Constraints:**
{{constraints}}

**Goals:**
{{goals}}

Please generate creative ideas using these approaches:

1. **Traditional Solutions** (3-5 ideas)
   - Proven approaches that work
   - Industry best practices

2. **Innovative Approaches** (3-5 ideas)
   - Fresh perspectives
   - Unconventional methods
   - Technology-enabled solutions

3. **Wild Ideas** (2-3 ideas)
   - Think outside the box
   - No constraints
   - Blue-sky thinking

**For each idea, provide:**
- Brief description
- Potential benefits
- Implementation difficulty (1-5 scale)
- Unique value proposition

**Follow-up Questions:**
- Which ideas could be combined?
- What would make these ideas even better?
- What are the potential risks or challenges?

Let's think creatively and explore all possibilities!`,
      category: 'creative',
      tags: ['brainstorming', 'creativity', 'innovation'],
      variables: [],
      isPublic: true,
      isFavorite: false,
      userId: 'system'
    },
    variables: ['challenge', 'context', 'target_audience', 'constraints', 'goals'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'business-plan',
    name: 'Business Plan Section',
    description: 'Create sections for business plans',
    category: 'general',
    icon: '📈',
    template: {
      title: 'Business Plan Assistant',
      description: 'Create comprehensive business plans with detailed sections and analysis',
      content: `Create a comprehensive {{section}} section for a business plan:

**Business Overview:**
- Company Name: {{company_name}}
- Industry: {{industry}}
- Business Model: {{business_model}}
- Target Market: {{target_market}}

**Specific Focus for {{section}}:**
{{specific_requirements}}

**Key Information to Include:**
{{key_information}}

Please create a professional, detailed {{section}} section that includes:

1. **Clear Structure** - Well-organized with appropriate headings
2. **Comprehensive Content** - Cover all relevant aspects
3. **Data-Driven Insights** - Include relevant statistics and market data
4. **Professional Tone** - Suitable for investors and stakeholders
5. **Actionable Information** - Specific, measurable, and realistic

**Format Requirements:**
- Use bullet points for key information
- Include relevant metrics and KPIs
- Provide timeline where applicable
- Address potential risks and mitigation strategies

Make it compelling and investor-ready!`,
      category: 'general',
      tags: ['business-plan', 'strategy', 'entrepreneurship'],
      variables: [],
      isPublic: true,
      isFavorite: false,
      userId: 'system'
    },
    variables: ['section', 'company_name', 'industry', 'business_model', 'target_market', 'specific_requirements', 'key_information'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'lesson-plan',
    name: 'Lesson Plan Creator',
    description: 'Create structured lesson plans for education',
    category: 'general',
    icon: '🎓',
    template: {
      title: 'Lesson Plan Creator',
      description: 'Create structured lesson plans for education with detailed activities and assessments',
      content: `Create a comprehensive lesson plan for:

**Subject:** {{subject}}
**Topic:** {{topic}}
**Grade Level:** {{grade_level}}
**Duration:** {{duration}}
**Class Size:** {{class_size}}

**Learning Objectives:**
{{learning_objectives}}

**Prerequisites:**
{{prerequisites}}

Please create a detailed lesson plan with:

**1. Lesson Overview**
- Brief description
- Key concepts to be covered
- Connection to curriculum standards

**2. Materials Needed**
- Required resources
- Technology requirements
- Handouts or worksheets

**3. Lesson Structure**
- **Opening ({{opening_time}} minutes)**
  - Hook/attention grabber
  - Review of previous learning
  - Introduction of objectives

- **Main Activity ({{main_time}} minutes)**
  - Step-by-step instruction
  - Student activities
  - Guided practice

- **Closing ({{closing_time}} minutes)**
  - Summary of key points
  - Assessment of understanding
  - Preview of next lesson

**4. Assessment Methods**
- Formative assessment strategies
- Summative assessment options
- Success criteria

**5. Differentiation**
- Accommodations for different learning styles
- Extensions for advanced learners
- Support for struggling students

**6. Homework/Follow-up**
- Practice activities
- Preparation for next lesson

Make it engaging, age-appropriate, and educationally sound!`,
      category: 'general',
      tags: ['lesson-plan', 'education', 'teaching'],
      variables: [],
      isPublic: true,
      isFavorite: false,
      userId: 'system'
    },
    variables: ['subject', 'topic', 'grade_level', 'duration', 'class_size', 'learning_objectives', 'prerequisites', 'opening_time', 'main_time', 'closing_time'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  }
]

interface UseTemplatesReturn {
  templates: PromptTemplate[]
  getTemplatesByCategory: (category: PromptTemplate['category']) => PromptTemplate[]
  getTemplate: (id: string) => PromptTemplate | undefined
  createPromptFromTemplate: (templateId: string, variables: Record<string, string>) => Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> | null
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
        ? { ...template, usageCount: template.usageCount + 1 }
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