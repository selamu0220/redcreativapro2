'use client'

import { useEffect } from 'react'
import { useToast } from './ToastProvider'

interface KeyboardShortcutsProps {
  onNewPrompt: () => void
  onNewGroup: () => void
  onNewChain: () => void
  onExecute?: () => void
  onShowHelp?: () => void
  onCloseModal?: () => void
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onNewPrompt,
  onNewGroup,
  onNewChain,
  onExecute,
  onShowHelp,
  onCloseModal
}) => {
  const { showToast } = useToast()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        // Only allow Escape and Ctrl+Enter in input fields
        if (event.key === 'Escape' && onCloseModal) {
          event.preventDefault()
          onCloseModal()
          return
        }
        if (event.ctrlKey && event.key === 'Enter' && onExecute) {
          event.preventDefault()
          onExecute()
          showToast({ title: 'Ejecutando...', type: 'info' })
          return
        }
        return
      }

      // Global shortcuts
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'n':
            event.preventDefault()
            onNewPrompt()
            showToast({ title: 'Nuevo prompt creado', type: 'success' })
            break
          case 'g':
            event.preventDefault()
            onNewGroup()
            showToast({ title: 'Nuevo grupo creado', type: 'success' })
            break
          case 'c':
            // Only trigger if not copying text
            if (!window.getSelection()?.toString()) {
              event.preventDefault()
              onNewChain()
              showToast({ title: 'Nueva cadena creada', type: 'success' })
            }
            break
          case 'enter':
            if (onExecute) {
              event.preventDefault()
              onExecute()
              showToast({ title: 'Ejecutando...', type: 'info' })
            }
            break
          case '/':
            event.preventDefault()
            if (onShowHelp) {
              onShowHelp()
            } else {
              showToast({ title: 'Atajos de teclado: Ctrl+N (Nuevo), Ctrl+G (Grupo), Ctrl+C (Cadena), Ctrl+Enter (Ejecutar), Esc (Cerrar)', type: 'info' })
            }
            break
        }
      } else if (event.key === 'Escape' && onCloseModal) {
        event.preventDefault()
        onCloseModal()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onNewPrompt, onNewGroup, onNewChain, onExecute, onShowHelp, onCloseModal, showToast])

  return null // This component doesn't render anything
}

export default KeyboardShortcuts

// Hook for keyboard shortcuts help
export const useKeyboardShortcuts = () => {
  const shortcuts = [
    { key: 'Ctrl + N', description: 'Crear nuevo prompt' },
    { key: 'Ctrl + G', description: 'Crear nuevo grupo' },
    { key: 'Ctrl + C', description: 'Crear nueva cadena' },
    { key: 'Ctrl + Enter', description: 'Ejecutar prompt/cadena' },
    { key: 'Ctrl + /', description: 'Mostrar ayuda de shortcuts' },
    { key: 'Escape', description: 'Cerrar modales' },
    { key: 'Tab', description: 'Navegar entre elementos' }
  ]

  return shortcuts
}