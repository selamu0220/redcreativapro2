"use client";

import { useState } from "react";
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

interface Question {
  id: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Para preguntas tipo select
}

interface AIQuestionnaireBuilderProps {
  onQuestionsGenerated: (questions: Question[]) => void;
  className?: string;
}

export default function AIQuestionnaireBuilder({ onQuestionsGenerated, className = "" }: AIQuestionnaireBuilderProps) {
  const { post } = useAuthenticatedFetch();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        maxQuestions: 8 // Límite razonable
      });

      const questions: Question[] = response.questions.map((q: any, index: number) => ({
        id: `question_${Date.now()}_${index}`,
        type: q.type || 'text',
        label: q.label || q.question,
        placeholder: q.placeholder || '',
        required: q.required !== false, // Por defecto true
        options: q.options || []
      }));

      setGeneratedQuestions(questions);
      onQuestionsGenerated(questions);
    } catch (error) {
      console.error('Error generating questionnaire:', error);
      setError('Error al generar el cuestionario. Intenta con una descripción más específica.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuestionChange = (questionId: string, field: keyof Question, value: any) => {
    const updatedQuestions = generatedQuestions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    );
    setGeneratedQuestions(updatedQuestions);
    onQuestionsGenerated(updatedQuestions);
  };

  const removeQuestion = (questionId: string) => {
    const updatedQuestions = generatedQuestions.filter(q => q.id !== questionId);
    setGeneratedQuestions(updatedQuestions);
    onQuestionsGenerated(updatedQuestions);
  };

  const addCustomQuestion = () => {
    const newQuestion: Question = {
      id: `question_${Date.now()}`,
      type: 'text',
      label: 'Nueva pregunta',
      placeholder: '',
      required: false
    };
    const updatedQuestions = [...generatedQuestions, newQuestion];
    setGeneratedQuestions(updatedQuestions);
    onQuestionsGenerated(updatedQuestions);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Generador con IA */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">🤖 Generar Cuestionario con IA</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Describe qué información quieres recopilar
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ejemplo: Quiero saber la edad, profesión, intereses principales y presupuesto de mis leads para un curso de marketing digital"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              rows={3}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          
          <button
            onClick={generateQuestionnaire}
            disabled={isGenerating || !prompt.trim()}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generando...
              </>
            ) : (
              <>🎯 Generar Cuestionario</>
            )}
          </button>
        </div>
      </div>

      {/* Editor de preguntas */}
      {generatedQuestions.length > 0 && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📝 Editar Preguntas</h3>
            <button
              onClick={addCustomQuestion}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            >
              + Agregar Pregunta
            </button>
          </div>
          
          <div className="space-y-4">
            {generatedQuestions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Pregunta {index + 1}
                  </span>
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Pregunta</label>
                    <input
                      type="text"
                      value={question.label}
                      onChange={(e) => handleQuestionChange(question.id, 'label', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    >
                      <option value="text">Texto</option>
                      <option value="email">Email</option>
                      <option value="number">Número</option>
                      <option value="date">Fecha</option>
                      <option value="select">Selección</option>
                      <option value="textarea">Texto largo</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Placeholder (opcional)</label>
                  <input
                    type="text"
                    value={question.placeholder || ''}
                    onChange={(e) => handleQuestionChange(question.id, 'placeholder', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    placeholder="Texto de ayuda para el usuario"
                  />
                </div>
                
                {question.type === 'select' && (
                  <div>
                    <label className="text-sm font-medium">Opciones (una por línea)</label>
                    <textarea
                      value={(question.options || []).join('\n')}
                      onChange={(e) => handleQuestionChange(question.id, 'options', e.target.value.split('\n').filter(o => o.trim()))}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      placeholder="Opción 1\nOpción 2\nOpción 3"
                      rows={3}
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`required-${question.id}`}
                    checked={question.required}
                    onChange={(e) => handleQuestionChange(question.id, 'required', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={`required-${question.id}`} className="text-sm font-medium">
                    Campo obligatorio
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
