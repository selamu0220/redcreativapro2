"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { useAuthenticatedFetch } from "../../../hooks/useAuthenticatedFetch";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { MobileOptimizedInput, MobileOptimizedTextarea } from "../../../components/MobileFormOptimizations";
import { MobileOptimizedLoader } from "../../../components/MobileLoadingStates";

// Contacts are stored locally

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

interface CollectedEmail {
  id: string;
  email: string;
  collectedAt: string;
  userEmail: string;
  source: string;
  ipAddress?: string;
  customFields?: Record<string, string>;
}

interface QuestionnaireQuestion {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  options?: string[];
  required: boolean;
}

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  questions: QuestionnaireQuestion[];
}

type AdminView = 'settings' | 'emails' | 'questionnaire'

export default function EmailCollectionAdminPage() {
  const params = useParams();
  const userEmail = decodeURIComponent(params.userEmail as string);
  const { user, isLoading: authLoading } = useAuth();
  const { get, post, put } = useAuthenticatedFetch();

  // View management
  const [currentView, setCurrentView] = useState<AdminView>('settings');

  // Settings state
  const [pageSettings, setPageSettings] = useState<UserPageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Emails state
  const [collectedEmails, setCollectedEmails] = useState<CollectedEmail[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);
  
  // Questionnaire state
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [questionnaireLoading, setQuestionnaireLoading] = useState(false);
  const [questionnaireError, setQuestionnaireError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  const loadQuestionnaire = async () => {
    try {
      setQuestionnaireLoading(true);
      setQuestionnaireError(null);
      // Try API, fallback to localStorage
      try {
        const data = await get(`/api/email-collection/${encodeURIComponent(userEmail)}/questionnaire`);
        const q = data.questionnaire || data;
        setQuestionnaire(q);
        localStorage.setItem(`questionnaire_${userEmail}`, JSON.stringify(q));
      } catch {
        const saved = localStorage.getItem(`questionnaire_${userEmail}`);
        if (saved) {
          setQuestionnaire(JSON.parse(saved));
        } else {
          const defaultQ: Questionnaire = {
            id: `q_${Date.now()}`,
            title: 'Cuestionario de preferencias',
            description: 'Ayúdanos a conocer tus preferencias para mejorar nuestros contenidos.',
            isActive: true,
            questions: []
          };
          setQuestionnaire(defaultQ);
          localStorage.setItem(`questionnaire_${userEmail}`, JSON.stringify(defaultQ));
        }
      }
    } catch (e) {
      console.error('Error loading questionnaire', e);
      setQuestionnaireError('Error al cargar el cuestionario.');
    } finally {
      setQuestionnaireLoading(false);
    }
  };

  const saveQuestionnaire = async () => {
    if (!questionnaire) return;
    try {
      try {
        const updated = await put(`/api/email-collection/${encodeURIComponent(userEmail)}/questionnaire`, questionnaire);
        const q = updated.questionnaire || updated;
        setQuestionnaire(q);
        localStorage.setItem(`questionnaire_${userEmail}`, JSON.stringify(q));
        alert('Cuestionario guardado');
      } catch {
        localStorage.setItem(`questionnaire_${userEmail}`, JSON.stringify(questionnaire));
        alert('Cuestionario guardado localmente');
      }
    } catch (e) {
      console.error('Save questionnaire error', e);
      alert('No se pudo guardar el cuestionario');
    }
  };

  const generateQuestionsWithAI = async () => {
    if (!aiPrompt.trim()) return;
    if (!questionnaire) return;
    try {
      setGeneratingQuestions(true);
      // Simple generator: split prompt into sentences as labels
      const labels = aiPrompt.split(/[\.\n]/).map(s => s.trim()).filter(Boolean).slice(0, 3);
      const gen = labels.map((label, i) => ({
        id: `q_${Date.now()}_${i}`,
        label,
        type: 'text' as const,
        required: false
      }));
      const updated = { ...questionnaire, questions: [...questionnaire.questions, ...gen] };
      setQuestionnaire(updated);
      localStorage.setItem(`questionnaire_${userEmail}`, JSON.stringify(updated));
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const addCustomQuestion = () => {
    if (!questionnaire) return;
    const newQ: QuestionnaireQuestion = {
      id: `q_${Date.now()}`,
      label: 'Nueva pregunta',
      type: 'text',
      required: false
    };
    const updated = { ...questionnaire, questions: [...questionnaire.questions, newQ] };
    setQuestionnaire(updated);
    localStorage.setItem(`questionnaire_${userEmail}`, JSON.stringify(updated));
  };

  const updateQuestion = (questionId: string, updates: Partial<QuestionnaireQuestion>) => {
    if (!questionnaire) return;
    const updated = {
      ...questionnaire,
      questions: questionnaire.questions.map(q => q.id === questionId ? { ...q, ...updates } : q)
    };
    setQuestionnaire(updated);
    localStorage.setItem(`questionnaire_${userEmail}`, JSON.stringify(updated));
  };

  const removeQuestion = (questionId: string) => {
    if (!questionnaire) return;
    const updated = {
      ...questionnaire,
      questions: questionnaire.questions.filter(q => q.id !== questionId)
    };
    setQuestionnaire(updated);
    localStorage.setItem(`questionnaire_${userEmail}`, JSON.stringify(updated));
  };



  // Access control
  const hasAccess = user?.email === userEmail;

  useEffect(() => {
    if (hasAccess) {
      loadData();
    }
  }, [hasAccess]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load page settings from API with localStorage fallback
      try {
        const settingsData = await get(`/api/email-collection/${encodeURIComponent(userEmail)}/settings`);
        setPageSettings(settingsData.settings || settingsData);
      } catch (apiError) {
        console.warn('API failed, trying localStorage fallback:', apiError);
        // Fallback to localStorage if API fails
        const savedSettings = localStorage.getItem(`pageSettings_${userEmail}`);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setPageSettings(parsed);
        } else {
          // Set default settings if nothing exists
          const defaultSettings: UserPageSettings = {
            userEmail,
            title: 'Suscríbete a mi newsletter',
            description: 'Recibe las últimas actualizaciones directamente en tu email.',
            callToActionText: 'Suscribirse',
            successMessage: '¡Gracias por suscribirte! Te enviaremos las últimas novedades.',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setPageSettings(defaultSettings);
        }
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadCollectedEmails = async () => {
    try {
      setEmailsLoading(true);
      setEmailsError(null);

      // Try to load from API first
      try {
        const emailsData = await get(`/api/email-collection/${encodeURIComponent(userEmail)}/emails`);
        setCollectedEmails(emailsData.emails || []);
      } catch (apiError) {
        console.warn('API failed for emails, trying direct file access:', apiError);
        // If API fails, try to load from local storage or show empty state
        setCollectedEmails([]);
      }

    } catch (error) {
      console.error('Error loading collected emails:', error);
      setEmailsError('Error al cargar los correos recopilados.');
    } finally {
      setEmailsLoading(false);
    }
  };













  // Export/Import functionality has been simplified

  // Save page settings
  const handleSettingsUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!pageSettings) return;
    try {
      setSaving(true);
      
      // Try to save to API first
      try {
        const updated = await put(`/api/email-collection/${encodeURIComponent(userEmail)}/settings`, pageSettings);
        setPageSettings(updated.settings || updated);
        // Also save to localStorage as backup
        localStorage.setItem(`pageSettings_${userEmail}`, JSON.stringify(updated.settings || updated));
        alert('Configuración guardada exitosamente');
      } catch (apiError) {
        console.warn('API save failed, saving to localStorage only:', apiError);
        // Fallback to localStorage only
        const updatedSettings = { ...pageSettings, updatedAt: new Date().toISOString() };
        localStorage.setItem(`pageSettings_${userEmail}`, JSON.stringify(updatedSettings));
        setPageSettings(updatedSettings);
        alert('Configuración guardada localmente (sin conexión al servidor)');
      }
    } catch (e) {
      console.error('Save settings error', e);
      alert('No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Panel de Recopilación
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {userEmail}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href={`/correosia/${encodeURIComponent(userEmail)}`}
                  target="_blank"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Ver página pública
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setCurrentView('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'settings'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Configuración
              </button>
              <button
                onClick={() => {
                  setCurrentView('emails');
                  if (collectedEmails.length === 0 && !emailsLoading) {
                    loadCollectedEmails();
                  }
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'emails'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Correos Recopilados
              </button>
              <button
                onClick={() => {
                  setCurrentView('questionnaire');
                  if (!questionnaire && !questionnaireLoading) {
                    loadQuestionnaire();
                  }
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'questionnaire'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Cuestionario
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <MobileOptimizedLoader />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando datos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={loadData}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {/* Settings View */}
              {currentView === 'settings' && pageSettings && (
                <div className="max-w-2xl">
                  <form onSubmit={handleSettingsUpdate} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                          Configuración de la Página
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Título
                            </label>
                            <MobileOptimizedInput
                              type="text"
                              value={pageSettings.title}
                              onChange={(e) => setPageSettings(prev => prev ? { ...prev, title: e.target.value } : null)}
                              placeholder="Título de la página"
                              maxLength={100}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Descripción
                            </label>
                            <MobileOptimizedTextarea
                              value={pageSettings.description}
                              onChange={(e) => setPageSettings(prev => prev ? { ...prev, description: e.target.value } : null)}
                              placeholder="Descripción que aparecerá en la página"
                              rows={3}
                              maxLength={500}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Texto del Botón
                            </label>
                            <MobileOptimizedInput
                              type="text"
                              value={pageSettings.callToActionText}
                              onChange={(e) => setPageSettings(prev => prev ? { ...prev, callToActionText: e.target.value } : null)}
                              placeholder="Texto del botón de suscripción"
                              maxLength={50}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Mensaje de Éxito
                            </label>
                            <MobileOptimizedTextarea
                              value={pageSettings.successMessage}
                              onChange={(e) => setPageSettings(prev => prev ? { ...prev, successMessage: e.target.value } : null)}
                              placeholder="Mensaje que se mostrará después de la suscripción"
                              rows={2}
                              maxLength={200}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Color Primario (opcional)
                            </label>
                            <MobileOptimizedInput
                              type="color"
                              value={pageSettings.customBranding?.primaryColor || '#3B82F6'}
                              onChange={(e) => setPageSettings(prev => prev ? { 
                                ...prev, 
                                customBranding: { 
                                  ...prev.customBranding, 
                                  primaryColor: e.target.value 
                                } 
                              } : null)}
                            />
                          </div>



                          <div className="flex items-center">
                            <input
                              id="isActive"
                              type="checkbox"
                              checked={pageSettings.isActive}
                              onChange={(e) => setPageSettings(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                              Página activa
                            </label>
                          </div>
                        </div>

                        <div className="mt-6">
                          <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {saving ? 'Guardando...' : 'Guardar Configuración'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>


                </div>
              )}

              {/* Emails View */}
              {currentView === 'emails' && (
                <div className="max-w-4xl">
                  <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            Correos Recopilados
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Lista de todos los correos electrónicos recopilados en tu página
                          </p>
                        </div>
                        <button
                          onClick={loadCollectedEmails}
                          disabled={emailsLoading}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {emailsLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Cargando...
                            </>
                          ) : (
                            <>
                              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Actualizar
                            </>
                          )}
                        </button>
                      </div>

                      {emailsError && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-red-800 dark:text-red-200">{emailsError}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {emailsLoading ? (
                        <div className="text-center py-12">
                          <MobileOptimizedLoader />
                          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando correos recopilados...</p>
                        </div>
                      ) : collectedEmails.length === 0 ? (
                        <div className="text-center py-12">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay correos recopilados</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Aún no se han recopilado correos electrónicos en tu página.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-hidden">
                          <div className="mb-4 flex justify-between items-center">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              Total: <span className="font-medium">{collectedEmails.length}</span> correos recopilados
                            </p>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Email
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Fecha
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Origen
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Datos del Cuestionario
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {collectedEmails.map((email) => (
                                  <tr key={email.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                      {email.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {new Date(email.collectedAt).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {email.source || 'Página de recopilación'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                      {email.customFields && Object.keys(email.customFields).length > 0 ? (
                                        <div className="space-y-1">
                                          {Object.entries(email.customFields).map(([key, value]) => (
                                            <div key={key} className="text-xs">
                                              <span className="font-medium">{key}:</span> {value}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 italic">Sin datos</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Questionnaire View */}
              {currentView === 'questionnaire' && (
                <div className="space-y-6">
                  {questionnaireLoading ? (
                    <div className="text-center py-12">
                      <MobileOptimizedLoader />
                      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando cuestionario...</p>
                    </div>
                  ) : questionnaireError ? (
                    <div className="text-center py-12">
                      <p className="text-red-600 dark:text-red-400">{questionnaireError}</p>
                      <button
                        onClick={loadQuestionnaire}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : questionnaire ? (
                    <>
                      {/* Questionnaire Header */}
                      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                              Configuración del Cuestionario
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                questionnaire.isActive 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                              }`}>
                                {questionnaire.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                              <button
                                onClick={() => {
                                  const updated = { ...questionnaire, isActive: !questionnaire.isActive };
                                  setQuestionnaire(updated);
                                  localStorage.setItem(`questionnaire_${userEmail}`, JSON.stringify(updated));
                                }}
                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                              >
                                {questionnaire.isActive ? 'Desactivar' : 'Activar'}
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Título del Cuestionario
                              </label>
                              <MobileOptimizedInput
                                type="text"
                                value={questionnaire.title}
                                onChange={(e) => setQuestionnaire(prev => prev ? { ...prev, title: e.target.value } : null)}
                                placeholder="Título del cuestionario"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descripción
                              </label>
                              <MobileOptimizedTextarea
                                value={questionnaire.description}
                                onChange={(e) => setQuestionnaire(prev => prev ? { ...prev, description: e.target.value } : null)}
                                placeholder="Descripción del cuestionario"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Question Generator */}
                      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                            Generar Preguntas con IA
                          </h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Describe qué información quieres recopilar
                              </label>
                              <MobileOptimizedTextarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Ej: Quiero saber sobre sus intereses en marketing digital, presupuesto, experiencia previa, objetivos de negocio..."
                                rows={3}
                              />
                            </div>
                            
                            <button
                              onClick={generateQuestionsWithAI}
                              disabled={generatingQuestions || !aiPrompt.trim()}
                              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                            >
                              {generatingQuestions ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Generando...
                                </>
                              ) : (
                                <>🤖 Generar Preguntas con IA</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Questions List */}
                      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                              Preguntas ({questionnaire.questions.length})
                            </h3>
                            <button
                              onClick={addCustomQuestion}
                              className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
                            >
                              + Agregar Pregunta
                            </button>
                          </div>
                          
                          {questionnaire.questions.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-500 dark:text-gray-400 mb-4">
                                No hay preguntas aún. Usa la IA para generar preguntas o agrega una manualmente.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {questionnaire.questions.map((question, index) => (
                                <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                      Pregunta {index + 1}
                                    </span>
                                    <button
                                      onClick={() => removeQuestion(question.id)}
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Pregunta
                                      </label>
                                      <MobileOptimizedInput
                                        type="text"
                                        value={question.label}
                                        onChange={(e) => updateQuestion(question.id, { label: e.target.value })}
                                        placeholder="Escribe la pregunta"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tipo
                                      </label>
                                      <select
                                        value={question.type}
                                        onChange={(e) => updateQuestion(question.id, { type: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      >
                                        <option value="text">Texto</option>
                                        <option value="email">Email</option>
                                        <option value="number">Número</option>
                                        <option value="date">Fecha</option>
                                        <option value="select">Selección</option>
                                        <option value="textarea">Texto largo</option>
                                      </select>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Placeholder (opcional)
                                      </label>
                                      <MobileOptimizedInput
                                        type="text"
                                        value={question.placeholder || ''}
                                        onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                                        placeholder="Texto de ayuda"
                                      />
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={question.required}
                                        onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <label className="ml-2 block text-sm text-gray-900 dark:text-white">
                                        Campo obligatorio
                                      </label>
                                    </div>
                                  </div>
                                  
                                  {question.type === 'select' && (
                                    <div className="mt-4">
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Opciones (una por línea)
                                      </label>
                                      <MobileOptimizedTextarea
                                        value={(question.options || []).join('\n')}
                                        onChange={(e) => updateQuestion(question.id, { 
                                          options: e.target.value.split('\n').filter(opt => opt.trim()) 
                                        })}
                                        placeholder="Opción 1\nOpción 2\nOpción 3"
                                        rows={3}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <button
                              onClick={saveQuestionnaire}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                              💾 Guardar Cuestionario
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              )}

              {/* Questionnaire View */}
              {String(currentView) === 'questionnaire' && (
                <div className="space-y-6">
                  {questionnaireLoading ? (
                    <div className="text-center py-12">
                      <MobileOptimizedLoader />
                      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando cuestionario...</p>
                    </div>
                  ) : questionnaireError ? (
                    <div className="text-center py-12">
                      <p className="text-red-600 dark:text-red-400">{questionnaireError}</p>
                      <button
                        onClick={loadQuestionnaire}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : questionnaire ? (
                    <>
                      {/* Questionnaire Header */}
                      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                              Configuración del Cuestionario
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                questionnaire.isActive 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                              }`}>
                                {questionnaire.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                              <button
                                onClick={() => {
                                  const updated = { ...questionnaire, isActive: !questionnaire.isActive };
                                  setQuestionnaire(updated);
                                  localStorage.setItem(`questionnaire_${userEmail}`, JSON.stringify(updated));
                                }}
                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                              >
                                {questionnaire.isActive ? 'Desactivar' : 'Activar'}
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Título del Cuestionario
                              </label>
                              <MobileOptimizedInput
                                type="text"
                                value={questionnaire.title}
                                onChange={(e) => setQuestionnaire(prev => prev ? { ...prev, title: e.target.value } : null)}
                                placeholder="Título del cuestionario"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descripción
                              </label>
                              <MobileOptimizedTextarea
                                value={questionnaire.description}
                                onChange={(e) => setQuestionnaire(prev => prev ? { ...prev, description: e.target.value } : null)}
                                placeholder="Descripción del cuestionario"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Question Generator */}
                      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                            Generar Preguntas con IA
                          </h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Describe qué información quieres recopilar
                              </label>
                              <MobileOptimizedTextarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Ej: Quiero saber sobre sus intereses en marketing digital, presupuesto, experiencia previa, objetivos de negocio..."
                                rows={3}
                              />
                            </div>
                            
                            <button
                              onClick={generateQuestionsWithAI}
                              disabled={generatingQuestions || !aiPrompt.trim()}
                              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                            >
                              {generatingQuestions ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Generando...
                                </>
                              ) : (
                                <>🤖 Generar Preguntas con IA</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Questions List */}
                      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                              Preguntas ({questionnaire.questions.length})
                            </h3>
                            <button
                              onClick={addCustomQuestion}
                              className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
                            >
                              + Agregar Pregunta
                            </button>
                          </div>
                          
                          {questionnaire.questions.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-500 dark:text-gray-400 mb-4">
                                No hay preguntas aún. Usa la IA para generar preguntas o agrega una manualmente.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {questionnaire.questions.map((question, index) => (
                                <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                      Pregunta {index + 1}
                                    </span>
                                    <button
                                      onClick={() => removeQuestion(question.id)}
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Pregunta
                                      </label>
                                      <MobileOptimizedInput
                                        type="text"
                                        value={question.label}
                                        onChange={(e) => updateQuestion(question.id, { label: e.target.value })}
                                        placeholder="Escribe la pregunta"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tipo
                                      </label>
                                      <select
                                        value={question.type}
                                        onChange={(e) => updateQuestion(question.id, { type: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      >
                                        <option value="text">Texto</option>
                                        <option value="email">Email</option>
                                        <option value="number">Número</option>
                                        <option value="date">Fecha</option>
                                        <option value="select">Selección</option>
                                        <option value="textarea">Texto largo</option>
                                      </select>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Placeholder (opcional)
                                      </label>
                                      <MobileOptimizedInput
                                        type="text"
                                        value={question.placeholder || ''}
                                        onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                                        placeholder="Texto de ayuda"
                                      />
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={question.required}
                                        onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <label className="ml-2 block text-sm text-gray-900 dark:text-white">
                                        Campo obligatorio
                                      </label>
                                    </div>
                                  </div>
                                  
                                  {question.type === 'select' && (
                                    <div className="mt-4">
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Opciones (una por línea)
                                      </label>
                                      <MobileOptimizedTextarea
                                        value={(question.options || []).join('\n')}
                                        onChange={(e) => updateQuestion(question.id, { 
                                          options: e.target.value.split('\n').filter(opt => opt.trim()) 
                                        })}
                                        placeholder="Opción 1\nOpción 2\nOpción 3"
                                        rows={3}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <button
                              onClick={saveQuestionnaire}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                              💾 Guardar Cuestionario
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
