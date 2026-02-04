"use client";

import { useState } from "react";

interface Question {
  id: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface QuestionnaireResponse {
  [questionId: string]: string;
}

interface DynamicQuestionnaireProps {
  questions: Question[];
  onSubmit: (responses: QuestionnaireResponse) => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function DynamicQuestionnaire({ 
  questions, 
  onSubmit, 
  isSubmitting = false, 
  className = "" 
}: DynamicQuestionnaireProps) {
  const [responses, setResponses] = useState<QuestionnaireResponse>({});
  const [errors, setErrors] = useState<{ [questionId: string]: string }>({});

  const handleInputChange = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    
    // Limpiar error si existe
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [questionId: string]: string } = {};
    
    questions.forEach(question => {
      if (question.required) {
        const value = responses[question.id]?.trim();
        
        if (!value) {
          newErrors[question.id] = 'Este campo es obligatorio';
        } else if (question.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            newErrors[question.id] = 'Por favor ingresa un email válido';
          }
        } else if (question.type === 'number') {
          if (isNaN(Number(value))) {
            newErrors[question.id] = 'Por favor ingresa un número válido';
          }
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(responses);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = responses[question.id] || '';
    const error = errors[question.id];
    const baseInputClasses = `flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
      error ? 'border-red-500 focus-visible:ring-red-500' : ''
    }`;

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className={`${baseInputClasses} min-h-[80px]`}
            rows={3}
            disabled={isSubmitting}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={`${baseInputClasses} h-10`}
            disabled={isSubmitting}
          >
            <option value="">Selecciona una opción...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={`${baseInputClasses} h-10`}
            disabled={isSubmitting}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className={`${baseInputClasses} h-10`}
            disabled={isSubmitting}
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className={`${baseInputClasses} h-10`}
            disabled={isSubmitting}
          />
        );
      
      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className={`${baseInputClasses} h-10`}
            disabled={isSubmitting}
          />
        );
    }
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {question.label}
              {question.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            
            {renderQuestion(question)}
            
            {errors[question.id] && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors[question.id]}
              </p>
            )}
          </div>
        ))}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Enviando...
          </>
        ) : (
          'Enviar Información'
        )}
      </button>
    </form>
  );
}
