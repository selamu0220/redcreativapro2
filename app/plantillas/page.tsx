'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';
interface UserData {
  email: string;
  subscriptionStatus: 'free' | 'trial' | 'pro' | 'premium';
  subscriptionId?: string;
  customerId?: string;
  trialStartDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  aiStudioApiKey?: string;
  gmailUser?: string;
  gmailPassword?: string;
  gmailConfigNotified?: boolean;
  createdAt: string;
  lastActiveAt: string;
}
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Send,
  Eye,
  Save,
  X
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  timesUsed: number;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  industry?: string;
  position?: string;
  interests?: string[];
  phone?: string;
  location?: string;
  website?: string;
  notes?: string;
}

const TEMPLATE_VARIABLES = [
  '{{nombre}}',
  '{{email}}',
  '{{empresa}}',
  '{{industria}}',
  '{{posicion}}',
  '{{telefono}}',
  '{{ubicacion}}',
  '{{sitio_web}}',
  '{{intereses}}',
  '{{notas}}'
];

const TEMPLATE_CATEGORIES = [
  'Prospección',
  'Seguimiento',
  'Promocional',
  'Informativo',
  'Agradecimiento',
  'Recordatorio'
];

export default function PlantillasPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'Prospección'
  });

  useEffect(() => {
    if (user?.email) {
      fetch(`/api/users/${encodeURIComponent(user.email)}`)
        .then(res => res.ok ? res.json() : null)
        .then(dbUser => {
          setUserData(dbUser);
        })
        .catch(() => setUserData(null));
    } else {
      setUserData(null);
    }
  }, [user?.email]);

  useEffect(() => {
    loadTemplates();
    loadContacts();
  }, [user]);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const loadTemplates = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/templates', {
        headers: {
          'x-user-email': user.email
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/contacts', {
        headers: {
          'x-user-email': user.email
        }
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;
    
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }
    
    setFilteredTemplates(filtered);
  };

  const saveTemplate = async () => {
    if (!user?.email || !newTemplate.name || !newTemplate.subject || !newTemplate.content) return;
    
    const templateData = {
      ...newTemplate,
      id: editingTemplate?.id || `template_${Date.now()}_${user.email}`,
      variables: extractVariables(newTemplate.content),
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timesUsed: editingTemplate?.timesUsed || 0
    };
    
    try {
      const response = await fetch('/api/templates', {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify(templateData)
      });
      
      if (response.ok) {
        await loadTemplates();
        setShowCreateModal(false);
        setEditingTemplate(null);
        setNewTemplate({ name: '', subject: '', content: '', category: 'Prospección' });
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) return;
    
    try {
      const response = await fetch('/api/templates', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ id: templateId })
      });
      
      if (response.ok) {
        await loadTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/{{[^}]+}}/g);
    return matches ? [...new Set(matches)] : [];
  };

  const replaceVariables = (content: string, contact: Contact): string => {
    let result = content;
    result = result.replace(/{{nombre}}/g, contact.name || '');
    result = result.replace(/{{email}}/g, contact.email || '');
    result = result.replace(/{{empresa}}/g, contact.company || '');
    result = result.replace(/{{industria}}/g, contact.industry || '');
    result = result.replace(/{{posicion}}/g, contact.position || '');
    result = result.replace(/{{telefono}}/g, contact.phone || '');
    result = result.replace(/{{ubicacion}}/g, contact.location || '');
    result = result.replace(/{{sitio_web}}/g, contact.website || '');
    result = result.replace(/{{intereses}}/g, contact.interests?.join(', ') || '');
    result = result.replace(/{{notas}}/g, contact.notes || '');
    return result;
  };

  const sendEmails = async () => {
    if (!selectedTemplate || selectedContacts.length === 0) return;
    
    try {
      for (const contactId of selectedContacts) {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) continue;
        
        const personalizedSubject = replaceVariables(selectedTemplate.subject, contact);
        const personalizedContent = replaceVariables(selectedTemplate.content, contact);
        
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: contact.email,
            subject: personalizedSubject,
            text: personalizedContent,
            isPromotional: true,
            gmailUser: userData?.gmailUser,
            gmailPassword: userData?.gmailPassword,
            templateId: selectedTemplate.id
          })
        });
      }
      
      // Actualizar contador de uso
      await fetch('/api/templates', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          ...selectedTemplate,
          timesUsed: selectedTemplate.timesUsed + selectedContacts.length
        })
      });
      
      setShowSendModal(false);
      setSelectedContacts([]);
      setSelectedTemplate(null);
      await loadTemplates();
      
      alert(`Emails enviados exitosamente a ${selectedContacts.length} contactos`);
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Error al enviar emails');
    }
  };

  const openEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category
    });
    setShowCreateModal(true);
  };

  const openSendModal = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowSendModal(true);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando plantillas...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Plantillas de Email</h1>
            <p className="text-gray-600">Crea y gestiona plantillas personalizadas para tus campañas de email</p>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar plantillas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las categorías</option>
                  {TEMPLATE_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Plantilla
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {template.category}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(template)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Asunto:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{template.subject}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {template.content.substring(0, 150)}...
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Usado {template.timesUsed} veces</span>
                    <span>{template.variables.length} variables</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openSendModal(template)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Send className="h-4 w-4" />
                      Enviar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        // Aquí podrías abrir un modal de vista previa
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas</h3>
              <p className="text-gray-600 mb-4">Crea tu primera plantilla para comenzar</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Plantilla
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Template Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTemplate(null);
                      setNewTemplate({ name: '', subject: '', content: '', category: 'Prospección' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nombre de la plantilla"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <select
                        value={newTemplate.category}
                        onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {TEMPLATE_CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                    <input
                      type="text"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Asunto del email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                    <textarea
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contenido del email..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Variables disponibles</label>
                    <div className="flex flex-wrap gap-2">
                      {TEMPLATE_VARIABLES.map(variable => (
                        <button
                          key={variable}
                          onClick={() => {
                            const textarea = document.querySelector('textarea');
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const newContent = newTemplate.content.substring(0, start) + variable + newTemplate.content.substring(end);
                              setNewTemplate({ ...newTemplate, content: newContent });
                            }
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          {variable}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTemplate(null);
                      setNewTemplate({ name: '', subject: '', content: '', category: 'Prospección' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveTemplate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {editingTemplate ? 'Actualizar' : 'Crear'} Plantilla
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Email Modal */}
        {showSendModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Enviar: {selectedTemplate.name}
                  </h2>
                  <button
                    onClick={() => {
                      setShowSendModal(false);
                      setSelectedTemplate(null);
                      setSelectedContacts([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Contactos</h3>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    {contacts.map((contact) => (
                      <label key={contact.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContacts([...selectedContacts, contact.id]);
                            } else {
                              setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                            }
                          }}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-600">{contact.email}</div>
                          {contact.company && (
                            <div className="text-xs text-gray-500">{contact.company} - {contact.industry}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {selectedContacts.length} contactos seleccionados
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowSendModal(false);
                        setSelectedTemplate(null);
                        setSelectedContacts([]);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={sendEmails}
                      disabled={selectedContacts.length === 0}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                      Enviar Emails
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}