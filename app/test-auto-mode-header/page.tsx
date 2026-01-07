'use client';

import { useState } from 'react';
import AIWriterEditor from '../escritor-ia/components/AIWriterEditor';
import { toast } from 'sonner';

/**
 * Test page for Auto Mode Header Integration
 * 
 * This page tests the integration of AutoModeToggle and AutoModeIndicator
 * into the editor header, including responsive design.
 */
export default function TestAutoModeHeaderPage() {
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImprove = async () => {
    setIsProcessing(true);
    toast.info('Mejorando contenido...');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setContent(prev => prev + '\n\n[Contenido mejorado por IA]');
    setIsProcessing(false);
    toast.success('Contenido mejorado exitosamente');
  };

  const handleSave = async () => {
    setIsSaving(true);
    toast.info('Guardando...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    toast.success('Guardado exitosamente');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success('Contenido copiado al portapapeles');
  };

  const handleOpenSettings = () => {
    toast.info('Abriendo configuración...');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Test: Auto Mode Header Integration</h1>
          <p className="text-muted-foreground">
            Testing the integration of AutoModeToggle and AutoModeIndicator into the editor header.
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Test Instructions:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>Check that AutoModeToggle appears next to character/word count</li>
              <li>Check that AutoModeIndicator appears next to the toggle</li>
              <li>Toggle auto mode on/off and verify visual states</li>
              <li>Type some text and verify auto mode triggers after 2 seconds</li>
              <li>Resize browser window to test responsive design</li>
              <li>On mobile: verify components stack properly</li>
              <li>On mobile: verify indicator shows only when auto mode is enabled</li>
            </ul>
          </div>
        </div>

        <div className="bg-card border rounded-lg shadow-lg overflow-hidden">
          <AIWriterEditor
            content={content}
            onContentChange={setContent}
            onImprove={handleImprove}
            onSave={handleSave}
            onCopy={handleCopy}
            onOpenSettings={handleOpenSettings}
            isProcessing={isProcessing}
            isSaving={isSaving}
            usageInfo={{
              usage: 5,
              limit: 10,
              isPremium: false
            }}
          />
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h2 className="font-semibold mb-2">Current State:</h2>
          <div className="space-y-1 text-sm">
            <p><strong>Content Length:</strong> {content.length} characters</p>
            <p><strong>Word Count:</strong> {content.trim() ? content.trim().split(/\s+/).length : 0} words</p>
            <p><strong>Is Processing:</strong> {isProcessing ? 'Yes' : 'No'}</p>
            <p><strong>Is Saving:</strong> {isSaving ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
