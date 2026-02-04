export interface PromptVariable {
  name: string;
  description: string;
  required: boolean;
}

export interface Prompt {
  id: string;
  name?: string; // For backward compatibility with types/prompts.ts
  title: string;
  description: string;
  content: string;
  category: 'general' | 'writing' | 'coding' | 'analysis' | 'creative';
  tags: string[];
  variables: PromptVariable[];
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface PromptLibraryState {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  isEditing: boolean;
  searchQuery: string;
  selectedCategory: string;
  selectedTags: string[];
}

export interface PromptFilters {
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  isFavorite?: boolean;
  userId?: string;
}

export interface PromptGroup {
  id: string;
  name: string;
  description: string;
  prompts: string[]; // Array de IDs de prompts
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptChain {
  id: string;
  name: string;
  description: string;
  steps: {
    id: string;
    promptId: string;
    order: number;
    waitForResponse: boolean;
    condition?: string;
  }[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Export aliases for backward compatibility
export type Group = PromptGroup;
export type Chain = PromptChain;
