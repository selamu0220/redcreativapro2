"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MobileOptimizedInput } from "../../components/MobileFormOptimizations";
import { MobileOptimizedLoader } from "../../components/MobileLoadingStates";
import { useViewport } from "../../hooks/useViewport";

interface UserPageSettings {
  userEmail: string;
  title: string;
  description: string;
  callToActionText: string;
  successMessage: string;
  customBranding?: {
    primaryColor?: string;
    logoUrl?: string;
  };

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface QuestionnaireQuestion {
  id: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface Questionnaire {
  id: string;
  userEmail: string;
  title: string;
  description: string;
  questions: QuestionnaireQuestion[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubmissionState {
  loading: boolean;
  success: boolean;
  error: string | null;
  submitted: boolean;
}

export default function EmailCollectionPage() {
  const params = useParams();
  const userEmail = decodeURIComponent(params.userEmail as string);
  const [pageSettings, setPageSettings] = useState<UserPageSettings | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>({});
  const [submission, setSubmission] = useState<SubmissionState>({
    loading: false,
    success: false,
    error: null,
    submitted: false
  });
  
  const { isMobile } = useViewport();

  // Load page settings and questionnaire
  useEffect(() => {
    const loadPageSettings = async () => {
      try {
        setPageLoading(true);
        setPageError(null);
        
        const response = await fetch(`/api/email-pages?userEmail=${encodeURIComponent(userEmail)}`);
        
        if (response.status === 404) {
          setPageError('Página no encontrada');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Error al cargar la configuración de la página');
        }
        
        const pages = await response.json();
        
        if (!pages || pages.length === 0) {
          setPageError('No se encontró configuración para esta página');
          return;
        }
        
        const settings: UserPageSettings = {
          userEmail: pages[0].userEmail,
          title: pages[0].title,
          description: pages[0].description,
          callToActionText: pages[0].callToActionText,
          successMessage: pages[0].successMessage,
          customBranding: pages[0].customBranding,

          isActive: pages[0].isActive,
          createdAt: pages[0].createdAt,
          updatedAt: pages[0].updatedAt
        };
        
        setPageSettings(settings);
        
        // Load questionnaire if available
        const savedQuestionnaire = localStorage.getItem(`questionnaire_${userEmail}`);
        if (savedQuestionnaire) {
          const parsedQuestionnaire = JSON.parse(savedQuestionnaire);
          if (parsedQuestionnaire.isActive) {
            setQuestionnaire(parsedQuestionnaire);
          }
        }
      } catch (error) {
        console.error('Error loading page settings:', error);
        setPageError('Error al cargar la página');
      } finally {
        setPageLoading(false);
      }
    };

    if (userEmail) {
      loadPageSettings();
    }
  }, [userEmail]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submission.loading) return;
    
    if (!email.trim()) {
      setSubmission({ loading: false, success: false, error: 'Por favor ingresa tu email', submitted: false });
      return;
    }
    
    if (!validateEmail(email.trim())) {
      setSubmission({ loading: false, success: false, error: 'Por favor ingresa un email válido', submitted: false });
      return;
    }
    
    // Check if questionnaire exists and show it
    if (questionnaire && questionnaire.questions.length > 0) {
      setShowQuestionnaire(true);
      setSubmission({ loading: false, success: false, error: null, submitted: false });
      return;
    }
    
    // Submit email directly if no questionnaire
    await submitEmailData();
  };

  const handleQuestionnaireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submission.loading) return;
    
    // Validate required questionnaire fields
    const missingAnswers = questionnaire?.questions.filter(q => q.required && !questionnaireAnswers[q.id]) || [];
    if (missingAnswers.length > 0) {
      setSubmission({ loading: false, success: false, error: 'Por favor completa todos los campos requeridos', submitted: false });
      return;
    }
    
    await submitEmailData();
  };

  const handleQuestionnaireAnswerChange = (questionId: string, value: string) => {
    setQuestionnaireAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    if (submission.error) {
      setSubmission(prev => ({ ...prev, error: null }));
    }
  };

  const goBackToEmail = () => {
    setShowQuestionnaire(false);
    setQuestionnaireAnswers({});
    setSubmission({ loading: false, success: false, error: null, submitted: false });
  };

  const submitEmailData = async () => {
    setSubmission({ loading: true, success: false, error: null, submitted: false });
    
    try {
      const customFields: Record<string, string> = {};
      let name = '';
      
      if (questionnaire && Object.keys(questionnaireAnswers).length > 0) {
        Object.entries(questionnaireAnswers).forEach(([questionId, answer]) => {
          const question = questionnaire.questions.find(q => q.id === questionId);
          if (question) {
            customFields[question.label] = answer;
            // Capturar el nombre si la pregunta es sobre el nombre
            if (question.label.toLowerCase().includes('nombre') || question.label.toLowerCase().includes('name')) {
              name = answer;
            }
          }
        });
      }
      
      const response = await fetch(`/api/email-collection/${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name || undefined,
          customFields
        })
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          setSubmission({
            loading: false,
            success: false,
            error: 'Demasiadas solicitudes. Por favor intenta más tarde.',
            submitted: false
          });
        } else {
          setSubmission({
            loading: false,
            success: false,
            error: 'Error al procesar la suscripción. Por favor intenta nuevamente.',
            submitted: false
          });
        }
        return;
      }
      
      setSubmission({
        loading: false,
        success: true,
        error: null,
        submitted: true
      });
      
      // Reset form
      setEmail('');
      setQuestionnaireAnswers({});
      setShowQuestionnaire(false);
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmission({
        loading: false,
        success: false,
        error: 'Error de conexión. Por favor verifica tu conexión a internet.',
        submitted: false
      });
    }
  };

  const resetForm = () => {
    setSubmission({ loading: false, success: false, error: null, submitted: false });
    setEmail('');
    setQuestionnaireAnswers({});
    setShowQuestionnaire(false);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <MobileOptimizedLoader size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{pageError}</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (submission.success && pageSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">¡Gracias!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {pageSettings.successMessage || 'Te has suscrito exitosamente. Revisa tu email para confirmar tu suscripción.'}
          </p>
          <button
            onClick={resetForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Suscribir otro email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          {pageSettings?.customBranding?.logoUrl && (
            <div className="mb-6">
              <img
                src={pageSettings.customBranding.logoUrl}
                alt="Logo"
                className="h-12 mx-auto"
                style={{
                  maxHeight: '48px',
                  width: 'auto'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {pageSettings?.title || 'Suscríbete a nuestro newsletter'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {pageSettings?.description || 'Recibe las últimas noticias y actualizaciones directamente en tu email.'}
            </p>
          </div>

          <form onSubmit={showQuestionnaire ? handleQuestionnaireSubmit : handleEmailSubmit} className="space-y-6">
            {!showQuestionnaire ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <MobileOptimizedInput
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (submission.error) {
                      setSubmission(prev => ({ ...prev, error: null }));
                    }
                  }}
                  placeholder="tu@email.com"
                  required
                  disabled={submission.loading}
                  className="w-full"
                />
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {questionnaire?.title || 'Completa tu perfil'}
                  </h2>
                  {questionnaire?.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {questionnaire.description}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  {questionnaire?.questions.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {question.label}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {question.type === 'text' && (
                        <MobileOptimizedInput
                          type="text"
                          value={questionnaireAnswers[question.id] || ''}
                          onChange={(e) => handleQuestionnaireAnswerChange(question.id, e.target.value)}
                          placeholder={question.placeholder}
                          required={question.required}
                          disabled={submission.loading}
                          className="w-full"
                        />
                      )}
                      
                      {question.type === 'email' && (
                        <MobileOptimizedInput
                          type="email"
                          value={questionnaireAnswers[question.id] || ''}
                          onChange={(e) => handleQuestionnaireAnswerChange(question.id, e.target.value)}
                          placeholder={question.placeholder}
                          required={question.required}
                          disabled={submission.loading}
                          className="w-full"
                        />
                      )}
                      
                      {question.type === 'number' && (
                        <MobileOptimizedInput
                          type="number"
                          value={questionnaireAnswers[question.id] || ''}
                          onChange={(e) => handleQuestionnaireAnswerChange(question.id, e.target.value)}
                          placeholder={question.placeholder}
                          required={question.required}
                          disabled={submission.loading}
                          className="w-full"
                        />
                      )}
                      
                      {question.type === 'date' && (
                        <input
                          type="date"
                          value={questionnaireAnswers[question.id] || ''}
                          onChange={(e) => handleQuestionnaireAnswerChange(question.id, e.target.value)}
                          required={question.required}
                          disabled={submission.loading}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      )}
                      
                      {question.type === 'select' && (
                        <select
                          value={questionnaireAnswers[question.id] || ''}
                          onChange={(e) => handleQuestionnaireAnswerChange(question.id, e.target.value)}
                          required={question.required}
                          disabled={submission.loading}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Selecciona una opción</option>
                          {question.options?.map((option, optIndex) => (
                            <option key={optIndex} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {question.type === 'textarea' && (
                        <textarea
                          value={questionnaireAnswers[question.id] || ''}
                          onChange={(e) => handleQuestionnaireAnswerChange(question.id, e.target.value)}
                          placeholder={question.placeholder}
                          required={question.required}
                          disabled={submission.loading}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={goBackToEmail}
                    disabled={submission.loading}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
                  >
                    ← Cambiar email
                  </button>
                </div>
              </>
            )}

            {submission.error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {submission.error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submission.loading || (!showQuestionnaire && !email.trim())}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                submission.loading || (!showQuestionnaire && !email.trim())
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : pageSettings?.customBranding?.primaryColor
                  ? `bg-[${pageSettings.customBranding.primaryColor}] hover:opacity-90 text-white`
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              style={
                pageSettings?.customBranding?.primaryColor && !submission.loading && (showQuestionnaire || email.trim())
                  ? { backgroundColor: pageSettings.customBranding.primaryColor }
                  : {}
              }
            >
              {submission.loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Enviando...
                </div>
              ) : showQuestionnaire ? (
                "Completar suscripción"
              ) : (
                pageSettings?.callToActionText || "Suscribirse"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Respetamos tu privacidad. Puedes cancelar tu suscripción en cualquier momento.
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Powered by Red Creativa Pro
          </Link>
        </div>
      </div>
    </div>
  );
}