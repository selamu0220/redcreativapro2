'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Eliminar documento?",
  description = "Esta acción no se puede deshacer. El documento se eliminará permanentemente de tu cuenta.",
  itemName
}: DeleteConfirmationModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className={`relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        {/* Header decoration */}
        <div className="h-2 bg-red-500" />
        
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            
            <div className="flex-grow pt-1">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {title}
              </h3>
              
              {itemName && (
                <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded border border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                    {itemName}
                  </p>
                </div>
              )}
              
              <p className="mt-3 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                {description}
              </p>
            </div>
            
            <button 
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-8 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-6 bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-500/20 font-bold gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
