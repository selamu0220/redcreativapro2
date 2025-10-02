'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcutsConfig {
  onNavigateToPanel?: (panelIndex: number) => void
  onNewPrompt?: () => void
  onSavePrompt?: () => void
  onSearch?: () => void
  onToggleTheme?: () => void
  onExport?: () => void
  onImport?: () => void
  onHelp?: () => void
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore shortcuts when user is typing in input fields
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      (target.contentEditable || '') === 'true'
    ) {
      return
    }

    const { ctrlKey, metaKey, shiftKey, altKey, key } = event
    const isModifierPressed = ctrlKey || metaKey

    // Panel navigation shortcuts (Ctrl/Cmd + 1-5)
    if (isModifierPressed && !shiftKey && !altKey) {
      const panelKeys = ['1', '2', '3', '4', '5']
      const panelIndex = panelKeys.indexOf(key)
      
      if (panelIndex !== -1 && config.onNavigateToPanel) {
        event.preventDefault()
        config.onNavigateToPanel(panelIndex)
        return
      }

      // Other shortcuts
      switch (key.toLowerCase()) {
        case 'n':
          if (config.onNewPrompt) {
            event.preventDefault()
            config.onNewPrompt()
          }
          break
        case 's':
          if (config.onSavePrompt) {
            event.preventDefault()
            config.onSavePrompt()
          }
          break
        case 'f':
          if (config.onSearch) {
            event.preventDefault()
            config.onSearch()
          }
          break
        case 't':
          if (config.onToggleTheme) {
            event.preventDefault()
            config.onToggleTheme()
          }
          break
        case 'e':
          if (shiftKey && config.onExport) {
            event.preventDefault()
            config.onExport()
          }
          break
        case 'i':
          if (shiftKey && config.onImport) {
            event.preventDefault()
            config.onImport()
          }
          break
        case '?':
        case '/':
          if (shiftKey && config.onHelp) {
            event.preventDefault()
            config.onHelp()
          }
          break
      }
    }

    // Escape key to close modals/panels
    if (key === 'Escape') {
      // This will be handled by individual components
      // but we can add global escape handling here if needed
    }
  }, [config])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // Return shortcut information for help/documentation
  const shortcuts = {
    navigation: [
      { key: 'Ctrl/Cmd + 1', description: 'Navigate to Prompts panel' },
      { key: 'Ctrl/Cmd + 2', description: 'Navigate to Favorites panel' },
      { key: 'Ctrl/Cmd + 3', description: 'Navigate to History panel' },
      { key: 'Ctrl/Cmd + 4', description: 'Navigate to Statistics panel' },
      { key: 'Ctrl/Cmd + 5', description: 'Navigate to Templates panel' },
    ],
    actions: [
      { key: 'Ctrl/Cmd + N', description: 'Create new prompt' },
      { key: 'Ctrl/Cmd + S', description: 'Save current prompt' },
      { key: 'Ctrl/Cmd + F', description: 'Focus search' },
      { key: 'Ctrl/Cmd + T', description: 'Toggle theme' },
      { key: 'Ctrl/Cmd + Shift + E', description: 'Export data' },
      { key: 'Ctrl/Cmd + Shift + I', description: 'Import data' },
      { key: 'Ctrl/Cmd + Shift + ?', description: 'Show help' },
    ],
    general: [
      { key: 'Escape', description: 'Close modal/panel' },
    ]
  }

  return { shortcuts }
}

// Hook for displaying keyboard shortcuts help
export const useShortcutsHelp = () => {
  const { shortcuts } = useKeyboardShortcuts({})
  
  return shortcuts
}