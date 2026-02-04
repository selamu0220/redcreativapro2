'use client'

import React, { useState, KeyboardEvent } from 'react'
import { X, Tag } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  className?: string
}

export default function TagInput({ 
  tags, 
  onChange, 
  placeholder = "Agregar etiquetas...", 
  maxTags = 10,
  className = ""
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag])
    }
    setInputValue('')
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
    if (inputValue.trim()) {
      addTag(inputValue)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`
        flex flex-wrap items-center gap-2 p-3 min-h-[42px] 
        bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
        rounded-lg transition-colors
        ${isInputFocused ? 'ring-2 ring-blue-500 dark:ring-blue-400 border-transparent' : ''}
      `}>
        {/* Tags existentes */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-md"
          >
            <Tag className="w-3 h-3" />
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        {/* Input para nuevas etiquetas */}
        {tags.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={handleInputBlur}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm placeholder-gray-400 dark:placeholder-gray-500"
          />
        )}
      </div>
      
      {/* Contador de etiquetas */}
      <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
        <span>Presiona Enter o coma para agregar etiquetas</span>
        <span>{tags.length}/{maxTags}</span>
      </div>
    </div>
  )
}
