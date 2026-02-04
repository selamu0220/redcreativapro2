/**
 * Utility functions to debug and fix localStorage data corruption
 * that might cause localeCompare errors
 */

export interface DebugResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixedItems: number;
}

/**
 * Check if a value is a valid string for localeCompare
 */
function isValidStringForCompare(value: any): boolean {
  return value !== null && value !== undefined && typeof value === 'string';
}

/**
 * Validate and fix template data
 */
export function validateTemplateData(): DebugResult {
  const result: DebugResult = {
    isValid: true,
    errors: [],
    warnings: [],
    fixedItems: 0
  };

  try {
    const templatesData = localStorage.getItem('promptTemplates');
    if (!templatesData) {
      result.warnings.push('No templates found in localStorage');
      return result;
    }

    const templates = JSON.parse(templatesData);
    if (!Array.isArray(templates)) {
      result.errors.push('Templates data is not an array');
      result.isValid = false;
      return result;
    }

    const fixedTemplates = templates.map((template, index) => {
      let fixed = false;
      const fixedTemplate = { ...template };

      // Check and fix name property
      if (!isValidStringForCompare(template.name)) {
        console.warn(`Template ${index}: Invalid name property:`, template.name);
        fixedTemplate.name = template.name?.toString() || `Template ${index}`;
        fixed = true;
      }

      // Check and fix category property
      if (!isValidStringForCompare(template.category)) {
        console.warn(`Template ${index}: Invalid category property:`, template.category);
        fixedTemplate.category = template.category?.toString() || 'General';
        fixed = true;
      }

      // Check and fix title property
      if (!isValidStringForCompare(template.title)) {
        console.warn(`Template ${index}: Invalid title property:`, template.title);
        fixedTemplate.title = template.title?.toString() || template.name || `Template ${index}`;
        fixed = true;
      }

      if (fixed) {
        result.fixedItems++;
        result.warnings.push(`Fixed template at index ${index}`);
      }

      return fixedTemplate;
    });

    if (result.fixedItems > 0) {
      localStorage.setItem('promptTemplates', JSON.stringify(fixedTemplates));
      console.log(`Fixed ${result.fixedItems} corrupted templates`);
    }

  } catch (error) {
    result.errors.push(`Error validating templates: ${error}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Validate and fix conversation data
 */
export function validateConversationData(): DebugResult {
  const result: DebugResult = {
    isValid: true,
    errors: [],
    warnings: [],
    fixedItems: 0
  };

  try {
    const conversationsData = localStorage.getItem('conversations');
    if (!conversationsData) {
      result.warnings.push('No conversations found in localStorage');
      return result;
    }

    const conversations = JSON.parse(conversationsData);
    if (!Array.isArray(conversations)) {
      result.errors.push('Conversations data is not an array');
      result.isValid = false;
      return result;
    }

    const fixedConversations = conversations.map((conversation, index) => {
      let fixed = false;
      const fixedConversation = { ...conversation };

      // Check and fix title property
      if (!isValidStringForCompare(conversation.title)) {
        console.warn(`Conversation ${index}: Invalid title property:`, conversation.title);
        fixedConversation.title = conversation.title?.toString() || `Conversación ${index}`;
        fixed = true;
      }

      // Check and fix category property
      if (conversation.category !== undefined && !isValidStringForCompare(conversation.category)) {
        console.warn(`Conversation ${index}: Invalid category property:`, conversation.category);
        fixedConversation.category = conversation.category?.toString() || 'General';
        fixed = true;
      }

      if (fixed) {
        result.fixedItems++;
        result.warnings.push(`Fixed conversation at index ${index}`);
      }

      return fixedConversation;
    });

    if (result.fixedItems > 0) {
      localStorage.setItem('conversations', JSON.stringify(fixedConversations));
      console.log(`Fixed ${result.fixedItems} corrupted conversations`);
    }

  } catch (error) {
    result.errors.push(`Error validating conversations: ${error}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Validate and fix all localStorage data
 */
export function validateAllLocalStorageData(): DebugResult {
  console.log('🔍 Starting localStorage validation...');
  
  const templateResult = validateTemplateData();
  const conversationResult = validateConversationData();

  const combinedResult: DebugResult = {
    isValid: templateResult.isValid && conversationResult.isValid,
    errors: [...templateResult.errors, ...conversationResult.errors],
    warnings: [...templateResult.warnings, ...conversationResult.warnings],
    fixedItems: templateResult.fixedItems + conversationResult.fixedItems
  };

  console.log('✅ localStorage validation completed:', combinedResult);
  return combinedResult;
}

/**
 * Clear all localStorage data (use with caution)
 */
export function clearAllLocalStorageData(): void {
  console.warn('🗑️ Clearing all localStorage data...');
  localStorage.removeItem('promptTemplates');
  localStorage.removeItem('conversations');
  localStorage.removeItem('favoriteItems');
  localStorage.removeItem('historyItems');
  console.log('✅ All localStorage data cleared');
}

/**
 * Add debugging to window object for manual testing
 */
if (typeof window !== 'undefined') {
  (window as any).debugLocalStorage = {
    validate: validateAllLocalStorageData,
    validateTemplates: validateTemplateData,
    validateConversations: validateConversationData,
    clearAll: clearAllLocalStorageData
  };
}
