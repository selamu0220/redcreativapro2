'use client'

import { useState } from 'react'
import { ChevronRight, User, Mail, CheckCircle } from 'lucide-react'

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

interface QualificationResponse {
  questionId: string;
  answer: string | string[];
}

interface Props {
  config: QualificationFormConfig;
  userName: string;
  onComplete: (responses: QualificationResponse[]) => void;
  onSkip: () => void;
}

export default function QualificationForm({ config, userName, onComplete, onSkip }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<QualificationResponse[]>([])
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('')
  const [isCompleting, setIsCompleting] = useState(false)

  if (!config.enabled || config.questions.length === 0) {
    return null
  }

  const currentQuestion = config.questions[currentStep]
  const isLastQuestion = currentStep === config.questions.length - 1
  const progress = ((currentStep + 1) / config.questions.length) * 100

  const handleAnswerChange = (value: string | string[]) => {
    setCurrentAnswer(value)
  }

  const handleNext = () => {
    // Validar respuesta requerida
    if (currentQuestion.required && (!currentAnswer || 
        (Array.isArray(currentAnswer) && currentAnswer.length === 0) ||
        (typeof currentAnswer === 'string' && currentAnswer.trim() === ''))) {
      return
    }

    // Guardar respuesta
    const newResponse: QualificationResponse = {
      questionId: currentQuestion.id,
      answer: currentAnswer
    }

    const updatedResponses = [...responses.filter(r => r.questionId !== currentQuestion.id), newResponse]
    setResponses(updatedResponses)

    if (isLastQuestion) {
      setIsCompleting(true)
      setTimeout(() => {
        onComplete(updatedResponses)
      }, 1000)
    } else {
      setCurrentStep(currentStep + 1)
      setCurrentAnswer('')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      // Cargar respuesta anterior si existe
      const previousResponse = responses.find(r => r.questionId === config.questions[currentStep - 1].id)
      setCurrentAnswer(previousResponse?.answer || '')
    }
  }

  const isAnswerValid = () => {
    if (!currentQuestion.required) return true
    if (Array.isArray(currentAnswer)) return currentAnswer.length > 0
    return typeof currentAnswer === 'string' && currentAnswer.trim() !== ''
  }

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'select':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'multiselect':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => {
              const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : []
              return (
                <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    value={option}
                    checked={selectedOptions.includes(option)}
                    onChange={(e) => {
                      const currentSelected = Array.isArray(currentAnswer) ? currentAnswer : []
                      if (e.target.checked) {
                        handleAnswerChange([...currentSelected, option])
                      } else {
                        handleAnswerChange(currentSelected.filter(item => item !== option))
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </label>
              )
            })}
          </div>
        )

      case 'text':
        return (
          <textarea
            value={typeof currentAnswer === 'string' ? currentAnswer : ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
        )

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>1 - Muy bajo</span>
              <span>10 - Muy alto</span>
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <button
                  key={num}
                  onClick={() => handleAnswerChange(num.toString())}
                  className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                    currentAnswer === num.toString()
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (isCompleting) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            ¡Perfecto, {userName}!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Hemos guardado tus preferencias. Ahora podremos enviarte contenido mucho más personalizado.
          </p>
        </div>
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header con progreso */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-6 h-6" />
          <h2 className="text-xl font-semibold">
            {config.personalizedGreeting ? `¡Hola ${userName}!` : '¡Hola!'}
          </h2>
        </div>
        <p className="text-blue-100 mb-4">
          Ayúdanos a personalizar tu experiencia respondiendo algunas preguntas rápidas
        </p>
        
        {/* Barra de progreso */}
        <div className="w-full bg-blue-800 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-blue-100 mt-2">
          <span>Pregunta {currentStep + 1} de {config.questions.length}</span>
          <span>{Math.round(progress)}% completado</span>
        </div>
      </div>

      {/* Contenido de la pregunta */}
      <div className="p-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium">
              {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
            </span>
            {currentQuestion.required && (
              <span className="text-red-600 text-xs">* Requerida</span>
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Input de la pregunta */}
        <div className="mb-8">
          {renderQuestionInput()}
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                ← Anterior
              </button>
            )}
            
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Omitir cuestionario
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={!isAnswerValid()}
            className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all ${
              isAnswerValid()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>{isLastQuestion ? 'Finalizar' : 'Siguiente'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}