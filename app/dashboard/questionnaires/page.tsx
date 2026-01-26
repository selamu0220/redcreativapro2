"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import QuestionnaireGenerator from '../../components/QuestionnaireGenerator';
import Link from 'next/link';

interface QuestionField {
  id: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface UserQuestionnaire {
  id: string;
  userEmail: string;
  name: string;
  description: string;
  questions: QuestionField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function QuestionnairesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { get, post, put, del } = useAuthenticatedFetch();
  const [questionnaires, setQuestionnaires] = useState<UserQuestionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<UserQuestionnaire | null>(null);
  const [newQuestionnaire, setNewQuestionnaire] = useState({
    name: '',
    description: '',
    questions: [] as QuestionField[]
  });

  useEffect(() => {
    if (user?.email) {
      loadQuestionnaires();
    }
  }, [user]);

  const loadQuestionnaires = async () => {
    try {
      setLoading(true);
      const response = await get('/api/questionnaires');
      setQuestionnaires(response.questionnaires || []);
    } catch (error) {
      console.error('Error loading questionnaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionsGenerated = (questions: QuestionField[]) => {
    setNewQuestionnaire(prev => ({ ...prev, questions }));
  };

  const saveQuestionnaire = async () => {
    if (!newQuestionnaire.name.trim() || newQuestionnaire.questions.length === 0) {
      alert('Por favor completa el nombre y genera al menos una pregunta');
      return;
    }

    try {
      const questionnaireData = {
        ...newQuestionnaire,
        userEmail: user?.email,
        isActive: true
      };

      if (editingQuestionnaire) {
        await put(`/api/questionnaires/${editingQuestionnaire.id}`, questionnaireData);
      } else {
        await post('/api/questionnaires', questionnaireData);
      }

      await loadQuestionnaires();
      resetForm();
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      alert('Error al guardar el cuestionario');
    }
  };

  const deleteQuestionnaire = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cuestionario?')) {
      return;
    }

    try {
      await del(`/api/questionnaires/${id}`);
      await loadQuestionnaires();
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      alert('Error al eliminar el cuestionario');
    }
  };

  const toggleQuestionnaireStatus = async (id: string, isActive: boolean) => {
    try {
      await put(`/api/questionnaires/${id}`, { isActive });
      await loadQuestionnaires();
    } catch (error) {
      console.error('Error updating questionnaire status:', error);
    }
  };

  const editQuestionnaire = (questionnaire: UserQuestionnaire) => {
    setEditingQuestionnaire(questionnaire);
    setNewQuestionnaire({
      name: questionnaire.name,
      description: questionnaire.description,
      questions: questionnaire.questions
    });
    setShowGenerator(true);
  };

  const resetForm = () => {
    setNewQuestionnaire({ name: '', description: '', questions: [] });
    setEditingQuestionnaire(null);
    setShowGenerator(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acceso requerido
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Necesitas iniciar sesión para acceder a esta página.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Cuestionarios Personalizados
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Crea cuestionarios con IA para recopilar información valiosa de tus leads
              </p>
            </div>
            <button
              onClick={() => setShowGenerator(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <span className="mr-2">+</span>
              Nuevo Cuestionario
            </button>
          </div>
        </div>

        {/* Generator Modal */}
        {showGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingQuestionnaire ? 'Editar Cuestionario' : 'Crear Nuevo Cuestionario'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre del cuestionario
                      </label>
                      <input
                        type="text"
                        value={newQuestionnaire.name}
                        onChange={(e) => setNewQuestionnaire(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Cuestionario de Marketing Digital"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={newQuestionnaire.description}
                        onChange={(e) => setNewQuestionnaire(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Breve descripción del propósito"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Questionnaire Generator */}
                  <QuestionnaireGenerator
                    onQuestionsGenerated={handleQuestionsGenerated}
                    className="border-t pt-6"
                  />

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveQuestionnaire}
                      disabled={!newQuestionnaire.name.trim() || newQuestionnaire.questions.length === 0}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                    >
                      {editingQuestionnaire ? 'Actualizar' : 'Guardar'} Cuestionario
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questionnaires List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {questionnaires.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tienes cuestionarios aún
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Crea tu primer cuestionario personalizado con IA para recopilar información valiosa de tus leads.
              </p>
              <button
                onClick={() => setShowGenerator(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <span className="mr-2">+</span>
                Crear Primer Cuestionario
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {questionnaires.map((questionnaire) => (
                <div key={questionnaire.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {questionnaire.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          questionnaire.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {questionnaire.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {questionnaire.description}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        {questionnaire.questions.length} preguntas • Creado {new Date(questionnaire.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleQuestionnaireStatus(questionnaire.id, !questionnaire.isActive)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          questionnaire.isActive
                            ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {questionnaire.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => editQuestionnaire(questionnaire)}
                        className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors dark:bg-blue-900 dark:text-blue-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteQuestionnaire(questionnaire.id)}
                        className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors dark:bg-red-900 dark:text-red-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}