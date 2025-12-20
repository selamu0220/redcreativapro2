"use client";

interface AIWriterEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onImprove: () => void;
  onCopy: () => void;
  onOpenSettings: () => void;
  isProcessing: boolean;
  disabled?: boolean;
}

/**
 * Simplified AI Writer Editor Component
 * 
 * A minimal editor with:
 * - Simple textarea for content
 * - Character count
 * - Action buttons (Improve, Copy, Settings)
 * - Warning banner about no auto-save
 */
export default function AIWriterEditor({
  content,
  onContentChange,
  onImprove,
  onCopy,
  onOpenSettings,
  isProcessing,
  disabled = false
}: AIWriterEditorProps) {
  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          ⚠️ El contenido no se guarda automáticamente. Usa "Copiar Todo" para guardar tu trabajo.
        </p>
      </div>

      {/* Editor Card */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Textarea */}
        <div>
          <label 
            htmlFor="content" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tu contenido
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Escribe o pega tu texto aquí..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isProcessing || disabled}
          />
          <p className="mt-2 text-sm text-gray-500">
            {content.length} caracteres
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={onImprove}
            disabled={isProcessing || !content.trim() || disabled}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Procesando...
              </span>
            ) : (
              "Mejorar con IA"
            )}
          </button>

          <button
            type="button"
            onClick={onCopy}
            disabled={!content.trim() || disabled}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Copiar Todo
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            disabled={disabled}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
          >
            ⚙️ Configuración
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2 text-sm">
          ℹ️ Acerca de esta herramienta
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• El contenido solo existe en tu navegador (no se guarda en servidores)</li>
          <li>• Usa el botón "Copiar Todo" para guardar tu trabajo</li>
          <li>• La configuración de IA se guarda en tu dispositivo</li>
        </ul>
      </div>
    </div>
  );
}
