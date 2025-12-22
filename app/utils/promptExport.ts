// Prompt Export/Import Utilities

export interface PromptData {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
}

export function exportPromptsToJSON(prompts: PromptData[]): string {
  return JSON.stringify(prompts, null, 2);
}

export function importPromptsFromJSON(jsonString: string): PromptData[] {
  try {
    const data = JSON.parse(jsonString);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error parsing prompts JSON:', error);
    return [];
  }
}

export function downloadJSONFile(data: string, filename: string): void {
  if (typeof window === 'undefined') return;
  
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function readJSONFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
