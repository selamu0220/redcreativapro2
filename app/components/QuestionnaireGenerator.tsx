"use client";

import { useState } from "react";
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

interface QuestionField {
  id: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Para campos select
}

interface QuestionnaireGeneratorProps {
  onQuestionsGenerated: (questions: QuestionField[]) => void;
  className?: string;
}

export default function QuestionnaireGenerator({ onQuestionsGenerated, className = "" }: QuestionnaireGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { post } = useAuthenticatedFetch();

  const generateQuestionnaire = async () => {
    if (!prompt.trim()) {
      setError("Por favor describe qué información quieres recopilar");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await post('/api/generate-questionnaire', {
        prompt: prompt.trim(),
        maxQuestions: 8 // Limitar a 8 preguntas máximo
      });

      if (response.questions && Array.isArray(response.questions)) {
        setGeneratedQuestions(response.questions);
        onQuestionsGenerated(response.questions);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error generating questionnaire:', error);
      setError(error instanceof Error ? error.message : 'Error generando cuestionario');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuestionEdit = (index: number, field: keyof QuestionField, value: any) => {
    const updatedQuestions = [...generatedQuestions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setGeneratedQuestions(updatedQuestions);
    onQuestionsGenerated(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = generatedQuestions.filter((_, i) => i !== index);
    setGeneratedQuestions(updatedQuestions);
    onQuestionsGenerated(updatedQuestions);
  };

  const addCustomQuestion = () => {
    const newQuestion: QuestionField = {
      id: `custom_${Date.now()}`,
      type: 'text',
      label: 'Nueva pregunta',
      required: false
    };
    const updatedQuestions = [...generatedQuestions, newQuestion];
    setGeneratedQuestions(updatedQuestions);
    onQuestionsGenerated(updatedQuestions);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Generador con IA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🤖</span>
          Generar Cuestionario con IA
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe qué información quieres recopilar de tus leads:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ejemplo: Quiero saber la edad, profesión, intereses, presupuesto disponible, cuándo prefieren recibir emails, qué tipo de contenido les interesa más..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
            />
          </div>
          
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={generateQuestionnaire}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generando cuestionario...
              </span>
            ) : (
              'Generar Cuestionario con IA'
            )}
          </button>
        </div>
      </div>

      {/* Preguntas generadas */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Cuestionario Generado</h4>
            <button
              onClick={addCustomQuestion}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Agregar pregunta
            </button>
          </div>
          
          {generatedQuestions.map((question, index) => (
            <div key={question.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pregunta {index + 1}
                </span>
                <button
                  onClick={() => removeQuestion(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Eliminar
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pregunta:</label>
                  <input
                    type="text"
                    value={question.label}
                    onChange={(e) => handleQuestionEdit(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo:</label>
                  <select
                    value={question.type}
                    onChange={(e) => handleQuestionEdit(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="text">Texto</option>
                    <option value="email">Email</option>
                    <option value="textarea">Texto largo</option>
                    <option value="number">Número</option>
                    <option value="date">Fecha</option>
                    <option value="select">Selección múltiple</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Placeholder:</label>
                  <input
                    type="text"
                    value={question.placeholder || ''}
                    onChange={(e) => handleQuestionEdit(index, 'placeholder', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Texto de ayuda..."
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => handleQuestionEdit(index, 'required', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">Campo obligatorio</span>
                  </label>
                </div>
                
                {question.type === 'select' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Opciones (una por línea):</label>
                    <textarea
                      value={question.options?.join('\n') || ''}
                      onChange={(e) => handleQuestionEdit(index, 'options', e.target.value.split('\n').filter(o => o.trim()))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={3}
                      placeholder="Opción 1\nOpción 2\nOpción 3"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
