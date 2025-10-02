import { Prompt, Group, Chain } from '../types/prompts'
import { supabase } from '../lib/supabase'

export interface ExportData {
  prompts: Prompt[]
  groups: Group[]
  chains: Chain[]
  exportDate: string
  version: string
}

export const exportPromptsToJSON = async (userId: string): Promise<string> => {
  try {
    // Fetch all user's prompts
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (promptsError) throw promptsError

    // Fetch all user's groups
    const { data: groups, error: groupsError } = await supabase
      .from('prompt_groups')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (groupsError) throw groupsError

    // Fetch all user's chains
    const { data: chains, error: chainsError } = await supabase
      .from('prompt_chains')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (chainsError) throw chainsError

    const exportData: ExportData = {
      prompts: prompts || [],
      groups: groups || [],
      chains: chains || [],
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error('Error exporting prompts:', error)
    throw new Error('Failed to export prompts')
  }
}

export const importPromptsFromJSON = async (jsonData: string, userId: string): Promise<{ success: boolean; imported: { prompts: number; groups: number; chains: number } }> => {
  try {
    const data: ExportData = JSON.parse(jsonData)
    
    // Validate data structure
    if (!data.prompts || !data.groups || !data.chains) {
      throw new Error('Invalid export file format')
    }

    let importedCounts = { prompts: 0, groups: 0, chains: 0 }

    // Import groups first (they might be referenced by prompts)
    if (data.groups.length > 0) {
      const groupsToImport = data.groups.map(group => ({
        ...group,
        id: undefined, // Let Supabase generate new IDs
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { data: insertedGroups, error: groupsError } = await supabase
        .from('prompt_groups')
        .insert(groupsToImport as any)
        .select()

      if (groupsError) throw groupsError
      importedCounts.groups = insertedGroups?.length || 0
    }

    // Import prompts
    if (data.prompts.length > 0) {
      const promptsToImport = data.prompts.map(prompt => ({
        ...prompt,
        id: undefined, // Let Supabase generate new IDs
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { data: insertedPrompts, error: promptsError } = await supabase
        .from('prompts')
        .insert(promptsToImport as any)
        .select()

      if (promptsError) throw promptsError
      importedCounts.prompts = insertedPrompts?.length || 0
    }

    // Import chains
    if (data.chains.length > 0) {
      const chainsToImport = data.chains.map(chain => ({
        ...chain,
        id: undefined, // Let Supabase generate new IDs
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { data: insertedChains, error: chainsError } = await supabase
        .from('prompt_chains')
        .insert(chainsToImport as any)
        .select()

      if (chainsError) throw chainsError
      importedCounts.chains = insertedChains?.length || 0
    }

    return {
      success: true,
      imported: importedCounts
    }
  } catch (error) {
    console.error('Error importing prompts:', error)
    throw new Error('Failed to import prompts: ' + (error as Error).message)
  }
}

export const downloadJSONFile = (jsonData: string, filename: string = 'prompts-export.json') => {
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const readJSONFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}