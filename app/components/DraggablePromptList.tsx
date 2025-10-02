'use client'

import React from 'react'
import { Prompt } from '../types/prompts'
import { DraggablePromptItem } from './DraggablePromptItem'
import { Button } from '@/components/ui/button'
import { RotateCcw, GripVertical } from 'lucide-react'
import { useDragAndDrop, useDragKeyboard } from '../hooks/useDragAndDrop'

interface DraggablePromptListProps {
  prompts: Prompt[]
  groups?: any[]
  chains?: any[]
  selectedPrompt?: Prompt | null
  selectedGroup?: any | null
  selectedChain?: any | null
  onReorder: (prompts: Prompt[]) => void
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
  onDuplicate: (prompt: Prompt) => void
  onUse: (prompt: Prompt) => void
  onEditGroup?: (group: any) => void
  onEditChain?: (chain: any) => void
  onDeletePrompt?: (id: string) => void
  onDeleteGroup?: (id: string) => void
  onDeleteChain?: (id: string) => void
  onDuplicatePrompt?: (prompt: Prompt) => void
  onDuplicateGroup?: (group: any) => void
  onDuplicateChain?: (chain: any) => void
  onToggleFavorite?: (id: string, type: 'prompt' | 'group' | 'chain') => void
  showDrafts?: () => void
  showVariables?: () => void
  showExportImport?: () => void
  showTemplates?: () => void
  className?: string
  enableDragAndDrop?: boolean
}

export const DraggablePromptList: React.FC<DraggablePromptListProps> = ({
  prompts,
  onReorder,
  onEdit,
  onDelete,
  onDuplicate,
  onUse,
  className = '',
  enableDragAndDrop = true
}) => {
  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newPrompts = [...prompts]
    const [draggedPrompt] = newPrompts.splice(fromIndex, 1)
    newPrompts.splice(toIndex, 0, draggedPrompt)
    onReorder(newPrompts)
  }

  const dragHandlers = useDragAndDrop({
    onReorder: handleReorder,
    itemType: 'prompt'
  })

  const keyboardHandlers = useDragKeyboard(prompts, handleReorder)

  const resetOrder = () => {
    const sortedPrompts = [...prompts].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    onReorder(sortedPrompts)
  }

  if (prompts.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        <p>No prompts available</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header with reset button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <GripVertical className="w-4 h-4" />
          <span>Drag to reorder prompts</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetOrder}
          className="text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset Order
        </Button>
      </div>

      {/* Draggable prompt list */}
      <div className="space-y-2">
        {prompts.map((prompt, index) => (
          <div
            key={prompt.id}
            className={`relative transition-all duration-200 ${
              dragHandlers.isDragging(prompt.id) ? 'opacity-50 scale-95' : ''
            } ${
              dragHandlers.isDragOver(index) 
                ? 'transform translate-y-1 border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg' 
                : ''
            }`}
            onDragOver={(e) => enableDragAndDrop && dragHandlers.handleDragOver(e, index)}
            onDragLeave={enableDragAndDrop ? dragHandlers.handleDragLeave : undefined}
            onDrop={(e) => enableDragAndDrop && dragHandlers.handleDrop(e, index)}
          >
            <DraggablePromptItem
              prompt={prompt}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onUse={onUse}
              enableDragAndDrop={enableDragAndDrop}
              dragHandlers={enableDragAndDrop ? {
                onDragStart: (e) => dragHandlers.handleDragStart(e, prompt.id, index),
                onDragEnd: dragHandlers.handleDragEnd,
                isDragging: dragHandlers.isDragging(prompt.id)
              } : undefined}
              keyboardHandlers={enableDragAndDrop ? {
                onKeyDown: (e) => keyboardHandlers.handleKeyDown(e, index),
                isSelected: keyboardHandlers.selectedIndex === index,
                isDragMode: keyboardHandlers.isDragMode
              } : undefined}
            />
          </div>
        ))}
      </div>

      {/* Drag mode instructions */}
      {keyboardHandlers.isDragMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <p className="text-sm font-medium">Drag Mode Active</p>
          <p className="text-xs opacity-90">
            Use ↑↓ arrows to move, Space/Enter to drop, Esc to cancel
          </p>
        </div>
      )}
    </div>
  )
}