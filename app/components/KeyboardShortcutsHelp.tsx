'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Keyboard, HelpCircle, X } from 'lucide-react'
import { useShortcutsHelp } from '../hooks/useKeyboardShortcuts'

interface KeyboardShortcutsHelpProps {
  variant?: 'button' | 'dropdown'
  className?: string
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  variant = 'dropdown',
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false)
  const shortcuts = useShortcutsHelp()

  const ShortcutModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </CardTitle>
            <CardDescription>
              Use these shortcuts to navigate and interact with the application more efficiently
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Shortcuts */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">
              Navigation
            </h3>
            <div className="space-y-2">
              {shortcuts.navigation.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {shortcut.description}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Action Shortcuts */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">
              Actions
            </h3>
            <div className="space-y-2">
              {shortcuts.actions.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {shortcut.description}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* General Shortcuts */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">
              General
            </h3>
            <div className="space-y-2">
              {shortcuts.general.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {shortcut.description}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Shortcuts work when not typing in input fields</li>
              <li>• Use Cmd instead of Ctrl on Mac</li>
              <li>• Press Escape to close this dialog</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (variant === 'button') {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 ${className}`}
          title="Show keyboard shortcuts (Ctrl+Shift+?)"
        >
          <Keyboard className="w-4 h-4" />
          Shortcuts
        </Button>
        {showModal && <ShortcutModal />}
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${className}`}
            title="Show keyboard shortcuts (Ctrl+Shift+?)"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Quick Shortcuts</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {shortcuts.navigation.slice(0, 3).map((shortcut, index) => (
            <DropdownMenuItem key={index} className="flex items-center justify-between">
              <span className="text-sm">{shortcut.description}</span>
              <Badge variant="outline" className="font-mono text-xs ml-2">
                {shortcut.key.replace('Ctrl/Cmd', '⌘')}
              </Badge>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Keyboard className="w-4 h-4" />
            <span>View all shortcuts</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {showModal && <ShortcutModal />}
    </>
  )
}

export default KeyboardShortcutsHelp