'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp } from 'lucide-react'

interface Question {
  id: string;
  type: 'select' | 'multiselect' | 'text' | 'scale';
  question: string;
  options?: string[];
  required: boolean;
  category: 'interests' | 'communication' | 'demographics' | 'preferences';
}

interface QualificationFormConfig {
  enabled: boolean;
  questions: Question[];
  personalizedGreeting: boolean;
  segmentationEnabled: boolean;
}

interface Props {
  pageId: string;
  initialConfig?: QualificationFormConfig;
  onSave: (config: QualificationFormConfig) => void;
}

const PREDEFINED_QUESTIONS = {
  interests: [
    {
      question: "¿Cuáles son tus principales intereses profesionales?",
      type: 'multiselect' as const,
      options: ['Marketing Digital', 'Ventas', 'Emprendimiento', 'Productividad', 'Liderazgo', 'Tecnología', 'Finanzas', 'Desarrollo Personal']
    },
    {
      question: "¿En qué etapa se encuentra tu negocio?",
      type: 'select' as const,
      options: ['Idea/Concepto', 'Startup (0-2 años)', 'Crecimiento (2-5 años)', 'Establecido (5+ años)', 'Empleado/Profesional']
    }
  ],
  communication: [
    {
      question: "¿Qué estilo de comunicación prefieres?",
      type: 'select' as const,
      options: ['Formal y profesional', 'Casual y cercano', 'Directo y conciso', 'Detallado y explicativo', 'Motivacional e inspirador']
    },
    {
      question: "¿Con qué frecuencia te gusta recibir emails?",
      type: 'select' as const,
      options: ['Diario', '2-3 veces por semana', 'Semanal', 'Quincenal', 'Mensual']
    }
  ],
  preferences: [
    {
      question: "¿Qué tipo de contenido te resulta más valioso?",
      type: 'multiselect' as const,
      options: ['Tutoriales paso a paso', 'Casos de estudio', 'Tendencias del sector', 'Herramientas y recursos', 'Consejos prácticos', 'Análisis de mercado']
    },
    {
      question: "¿Cuál es tu principal objetivo actual?",
      type: 'select' as const,
      options: ['Aumentar ventas', 'Mejorar marketing', 'Optimizar procesos', 'Desarrollar equipo', 'Expandir negocio', 'Aprender nuevas habilidades']
    }
  ],
  demographics: [
    {
      question: "¿En qué sector trabajas?",
      type: 'select' as const,
      options: ['Tecnología', 'Servicios', 'Retail/Comercio', 'Salud', 'Educación', 'Finanzas', 'Consultoría', 'Manufactura', 'Otro']
    }
  ]
}

export default function QualificationFormConfig({ pageId, initialConfig, onSave }: Props) {
  const [config, setConfig] = useState<QualificationFormConfig>({
    enabled: false,
    questions: [],
    personalizedGreeting: true,
    segmentationEnabled: true,
    ...initialConfig
  })
  
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: 'select',
    category: 'interests',
    required: true
  })
  const [showPredefined, setShowPredefined] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof PREDEFINED_QUESTIONS>('interests')

  const addQuestion = (question?: Partial<Question>) => {
    const questionToAdd = question || newQuestion
    if (!questionToAdd.question) return

    const newQ: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: questionToAdd.type || 'select',
      question: questionToAdd.question,
      options: questionToAdd.options || [],
      required: questionToAdd.required || false,
      category: questionToAdd.category || 'interests'
    }

    setConfig(prev => ({
      ...prev,
      questions: [...prev.questions, newQ]
    }))

    if (!question) {
      setNewQuestion({
        type: 'select',
        category: 'interests',
        required: true
      })
    }
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setConfig(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      )
    }))
  }

  const deleteQuestion = (id: string) => {
    setConfig(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }))
  }

  const addOption = (questionId: string, option: string) => {
    if (!option.trim()) return
    updateQuestion(questionId, {
      options: [...(config.questions.find(q => q.id === questionId)?.options || []), option]
    })
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = config.questions.find(q => q.id === questionId)
    if (!question) return
    
    updateQuestion(questionId, {
      options: question.options?.filter((_, i) => i !== optionIndex)
    })
  }

  const handleSave = () => {
    onSave(config)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cuestionario de Cualificación
        </h3>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Activar cuestionario</span>
        </label>
      </div>

      {config.enabled && (
        <>
          {/* Configuraciones generales */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Configuración General</h4>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.personalizedGreeting}
                onChange={(e) => setConfig(prev => ({ ...prev, personalizedGreeting: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Usar saludo personalizado con el nombre
              </span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.segmentationEnabled}
                onChange={(e) => setConfig(prev => ({ ...prev, segmentationEnabled: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Activar segmentación automática basada en respuestas
              </span>
            </label>
          </div>

          {/* Preguntas predefinidas */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => setShowPredefined(!showPredefined)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="font-medium text-gray-900 dark:text-white">
                Agregar Preguntas Predefinidas
              </span>
              {showPredefined ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {showPredefined && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <div className="flex space-x-2">
                  {Object.keys(PREDEFINED_QUESTIONS).map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category as keyof typeof PREDEFINED_QUESTIONS)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  {PREDEFINED_QUESTIONS[selectedCategory].map((predefinedQ, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {predefinedQ.question}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Tipo: {predefinedQ.type} | Opciones: {predefinedQ.options?.length || 0}
                        </p>
                      </div>
                      <button
                        onClick={() => addQuestion({ ...predefinedQ, category: selectedCategory })}
                        className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Agregar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lista de preguntas */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Preguntas del Cuestionario ({config.questions.length})
            </h4>
            
            {config.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {editingQuestion === question.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Pregunta"
                    />
                    
                    <div className="grid grid-cols-3 gap-3">
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, { type: e.target.value as Question['type'] })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="select">Selección única</option>
                        <option value="multiselect">Selección múltiple</option>
                        <option value="text">Texto libre</option>
                        <option value="scale">Escala 1-10</option>
                      </select>
                      
                      <select
                        value={question.category}
                        onChange={(e) => updateQuestion(question.id, { category: e.target.value as Question['category'] })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="interests">Intereses</option>
                        <option value="communication">Comunicación</option>
                        <option value="preferences">Preferencias</option>
                        <option value="demographics">Demografía</option>
                      </select>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Requerida</span>
                      </label>
                    </div>
                    
                    {(question.type === 'select' || question.type === 'multiselect') && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Opciones:</label>
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(question.options || [])]
                                newOptions[optionIndex] = e.target.value
                                updateQuestion(question.id, { options: newOptions })
                              }}
                              className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <button
                              onClick={() => removeOption(question.id, optionIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Nueva opción"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addOption(question.id, e.currentTarget.value)
                                e.currentTarget.value = ''
                              }
                            }}
                            className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement
                              addOption(question.id, input.value)
                              input.value = ''
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingQuestion(null)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-1"
                      >
                        <Save size={16} />
                        <span>Guardar</span>
                      </button>
                      <button
                        onClick={() => setEditingQuestion(null)}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center space-x-1"
                      >
                        <X size={16} />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {index + 1}. {question.question}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>Tipo: {question.type}</span>
                        <span>Categoría: {question.category}</span>
                        {question.required && <span className="text-red-600">Requerida</span>}
                        {question.options && <span>Opciones: {question.options.length}</span>}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingQuestion(question.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Agregar nueva pregunta personalizada */}
          <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Agregar Pregunta Personalizada</h5>
            <div className="space-y-3">
              <input
                type="text"
                value={newQuestion.question || ''}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Escribe tu pregunta personalizada"
              />
              
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as Question['type'] }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="select">Selección única</option>
                  <option value="multiselect">Selección múltiple</option>
                  <option value="text">Texto libre</option>
                  <option value="scale">Escala 1-10</option>
                </select>
                
                <select
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value as Question['category'] }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="interests">Intereses</option>
                  <option value="communication">Comunicación</option>
                  <option value="preferences">Preferencias</option>
                  <option value="demographics">Demografía</option>
                </select>
                
                <button
                  onClick={() => addQuestion()}
                  disabled={!newQuestion.question}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Agregar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Save size={20} />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
