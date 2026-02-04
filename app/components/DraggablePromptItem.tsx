'use client'

import React from 'react'
import { Prompt } from '../types/prompts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Edit,
  Trash2,
  Copy,
  Heart,
  Play,
  GripVertical,
  Tag,
  Calendar,
  User,
  Star,
  Clipboard
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { getDragHandleProps } from '../hooks/useDragAndDrop'
import { useToast } from './ToastProvider'

interface DragHandlers {
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  isDragging: boolean
}

interface KeyboardHandlers {
  onKeyDown: (e: React.KeyboardEvent) => void
  isSelected: boolean
  isDragMode: boolean
}

interface DraggablePromptItemProps {
  prompt: Prompt
  index: number
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
  onDuplicate: (prompt: Prompt) => void
  onUse: (prompt: Prompt) => void
  enableDragAndDrop?: boolean
  dragHandlers?: DragHandlers
  keyboardHandlers?: KeyboardHandlers
}

export const DraggablePromptItem: React.FC<DraggablePromptItemProps> = ({
  prompt,
  index,
  onEdit,
  onDelete,
  onDuplicate,
  onUse,
  enableDragAndDrop = true,
  dragHandlers,
  keyboardHandlers
}) => {

  const dragHandleProps = getDragHandleProps(enableDragAndDrop)
  const isSelected = keyboardHandlers?.isSelected || false
  const isDragMode = keyboardHandlers?.isDragMode || false
  const isDragging = dragHandlers?.isDragging || false
  const { showToast } = useToast()

  const handleCopyContent = async () => {
    console.log('Copy button clicked, prompt content:', prompt.content)
    
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        console.log('Using navigator.clipboard API')
        await navigator.clipboard.writeText(prompt.content)
        console.log('Content copied successfully with clipboard API')
        showToast({ type: 'success', title: 'Éxito', message: 'Contenido copiado al portapapeles' })
      } else {
        // Fallback for older browsers or non-secure contexts
        console.log('Using fallback copy method')
        const textArea = document.createElement('textarea')
        textArea.value = prompt.content
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          console.log('Content copied successfully with fallback method')
          showToast({ type: 'success', title: 'Éxito', message: 'Contenido copiado al portapapeles' })
        } else {
          throw new Error('Fallback copy method failed')
        }
      }
    } catch (error) {
      console.error('Error copying content:', error)
      console.error('Error details:', {
        clipboardAvailable: !!navigator.clipboard,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol
      })
      showToast({ type: 'error', title: 'Error', message: 'Error al copiar el contenido. Intenta copiar manualmente.' })
    }
  }

  return (
    <Card 
      className={`group relative transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      } ${
        isDragging ? 'opacity-50 scale-95 shadow-lg' : ''
      } ${
        isDragMode && isSelected ? 'bg-muted border-primary' : ''
      }`}
      onKeyDown={keyboardHandlers?.onKeyDown}
      tabIndex={enableDragAndDrop ? 0 : -1}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Drag Handle */}
            {enableDragAndDrop && (
              <div
                {...dragHandleProps}
                onDragStart={dragHandlers?.onDragStart}
                onDragEnd={dragHandlers?.onDragEnd}
                className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isDragMode ? 'opacity-100' : ''
                } ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {prompt.title}
                </h3>
                {prompt.isFavorite && (
                  <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                )}
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {prompt.content}
              </p>
              
              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{prompt.category || 'General'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
              
              {/* Tags */}
              {prompt.tags && prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {prompt.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs px-1 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {prompt.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{prompt.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUse(prompt)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Use prompt"
            >
              <Play className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyContent}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Copy content to clipboard"
            >
              <Clipboard className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(prompt)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Edit prompt"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(prompt)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Duplicate prompt"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(prompt.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Delete prompt"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {/* Drag mode indicator */}
      {isDragMode && isSelected && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-lg">
          Selected
        </div>
      )}
    </Card>
  )
}
