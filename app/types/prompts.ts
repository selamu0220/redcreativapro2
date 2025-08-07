export interface PromptVariable {
  name: string;
  description: string;
  required: boolean;
}

export interface Prompt {
  id: string;
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