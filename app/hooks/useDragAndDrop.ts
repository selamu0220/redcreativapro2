'use client'

import { useState, useRef, useCallback } from 'react'

interface DragItem {
  id: string
  index: number
  type: string
}

interface UseDragAndDropProps {
  onReorder: (fromIndex: number, toIndex: number) => void
  itemType?: string
}

interface UseDragAndDropReturn {
  draggedItem: DragItem | null
  dragOverIndex: number | null
  handleDragStart: (e: React.DragEvent, id: string, index: number) => void
  handleDragEnd: () => void
  handleDragOver: (e: React.DragEvent, index: number) => void
  handleDragLeave: () => void
  handleDrop: (e: React.DragEvent, index: number) => void
  isDragging: (id: string) => boolean
  isDragOver: (index: number) => boolean
}

export const useDragAndDrop = ({ 
  onReorder, 
  itemType = 'item' 
}: UseDragAndDropProps): UseDragAndDropReturn => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragCounter = useRef(0)

  const handleDragStart = useCallback((e: React.DragEvent, id: string, index: number) => {
    const item: DragItem = { id, index, type: itemType }
    setDraggedItem(item)
    
    // Set drag data
    e.dataTransfer.setData('text/plain', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'move'
    
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }, [itemType])

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDragOverIndex(null)
    dragCounter.current = 0
    
    // Reset visual feedback
    document.querySelectorAll('[draggable="true"]').forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.opacity = ''
      }
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedItem && draggedItem.index !== index) {
      setDragOverIndex(index)
    }
  }, [draggedItem])

  const handleDragLeave = useCallback(() => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverIndex(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    
    try {
      const data = e.dataTransfer.getData('text/plain')
      const item: DragItem = JSON.parse(data)
      
      if (item.type === itemType && item.index !== index) {
        onReorder(item.index, index)
      }
    } catch (error) {
      console.error('Error parsing drag data:', error)
    }
    
    handleDragEnd()
  }, [itemType, onReorder, handleDragEnd])

  const isDragging = useCallback((id: string) => {
    return draggedItem?.id === id
  }, [draggedItem])

  const isDragOver = useCallback((index: number) => {
    return dragOverIndex === index
  }, [dragOverIndex])

  return {
    draggedItem,
    dragOverIndex,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragging,
    isDragOver
  }
}

// Hook for keyboard navigation during drag operations
export const useDragKeyboard = (items: any[], onReorder: (fromIndex: number, toIndex: number) => void) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isDragMode, setIsDragMode] = useState(false)

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (!isDragMode) {
        // Start drag mode
        setSelectedIndex(index)
        setIsDragMode(true)
      } else if (selectedIndex !== null && selectedIndex !== index) {
        // Drop at new position
        onReorder(selectedIndex, index)
        setSelectedIndex(null)
        setIsDragMode(false)
      } else {
        // Cancel drag mode
        setSelectedIndex(null)
        setIsDragMode(false)
      }
    } else if (isDragMode && selectedIndex !== null) {
      if (e.key === 'ArrowUp' && selectedIndex > 0) {
        e.preventDefault()
        onReorder(selectedIndex, selectedIndex - 1)
        setSelectedIndex(selectedIndex - 1)
      } else if (e.key === 'ArrowDown' && selectedIndex < items.length - 1) {
        e.preventDefault()
        onReorder(selectedIndex, selectedIndex + 1)
        setSelectedIndex(selectedIndex + 1)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setSelectedIndex(null)
        setIsDragMode(false)
      }
    }
  }, [isDragMode, selectedIndex, items.length, onReorder])

  return {
    selectedIndex,
    isDragMode,
    handleKeyDown,
    cancelDrag: () => {
      setSelectedIndex(null)
      setIsDragMode(false)
    }
  }
}

// Utility function to get drag handle props
export const getDragHandleProps = (isEnabled: boolean = true) => {
  if (!isEnabled) {
    return {}
  }

  return {
    draggable: true,
    role: 'button',
    tabIndex: 0,
    'aria-label': 'Drag to reorder. Press space or enter to start dragging, arrow keys to move, space or enter to drop, escape to cancel.',
    style: {
      cursor: 'grab'
    },
    onMouseDown: (e: React.MouseEvent) => {
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.cursor = 'grabbing'
      }
    },
    onMouseUp: (e: React.MouseEvent) => {
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.cursor = 'grab'
      }
    }
  }
}

// Utility function to get drop zone props
export const getDropZoneProps = (index: number, dragHandlers: any) => {
  return {
    onDragOver: (e: React.DragEvent) => dragHandlers.handleDragOver(e, index),
    onDragLeave: dragHandlers.handleDragLeave,
    onDrop: (e: React.DragEvent) => dragHandlers.handleDrop(e, index),
    className: dragHandlers.isDragOver(index) 
      ? 'border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
      : ''
  }
}