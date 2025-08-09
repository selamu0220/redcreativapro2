'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Tag,
  Calendar,
  Trash2,
  Edit,
  Download,
  Upload,
  Filter
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  position?: string;
  location?: string;
  website?: string;
  interests?: string[];
  notes?: string;
  tags: string[];
  isSubscribed: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
  lastEmailSent?: string;
  totalEmailsSent?: number;
}

export default function ContactosPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    position: '',
    location: '',
    website: '',
    interests: [] as string[],
    notes: '',
    tags: [] as string[],
    isSubscribed: true
  });

  const [newTag, setNewTag] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    if (user?.email) {
      loadContacts();
    }
  }, [user]);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, selectedTag]);

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/contacts', {
        headers: {
          'x-user-email': user?.email || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
        
        // Extraer todas las etiquetas únicas
        const tags = new Set<string>();
        data.contacts?.forEach((contact: Contact) => {
          if (Array.isArray(contact.tags)) {
            contact.tags.forEach(tag => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;
    
    if (searchTerm) {
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedTag) {
      filtered = filtered.filter(contact => 
        Array.isArray(contact.tags) && contact.tags.includes(selectedTag)
      );
    }
    
    setFilteredContacts(filtered);
  };

  const addContact = async () => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify(newContact)
      });
      
      if (response.ok) {
        setNewContact({
          name: '',
          email: '',
          phone: '',
          company: '',
          industry: '',
          position: '',
          location: '',
          website: '',
          interests: [],
          notes: '',
          tags: [],
          isSubscribed: true
        });
        setShowAddModal(false);
        loadContacts();
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const updateContact = async () => {
    if (!editingContact) return;
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify(editingContact)
      });
      
      if (response.ok) {
        setEditingContact(null);
        loadContacts();
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este contacto?')) return;
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ contactId })
      });
      
      if (response.ok) {
        loadContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const addTagToContact = (contactId: string, tag: string) => {
    const contact = contacts.find(c => c.id === contactId);
    const contactTags = Array.isArray(contact?.tags) ? contact.tags : [];
    if (contact && !contactTags.includes(tag)) {
      const updatedContact = {
        ...contact,
        tags: [...contactTags, tag]
      };
      setEditingContact(updatedContact);
    }
  };

  const removeTagFromContact = (contactId: string, tag: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      const contactTags = Array.isArray(contact.tags) ? contact.tags : [];
      const updatedContact = {
        ...contact,
        tags: contactTags.filter(t => t !== tag)
      };
      setEditingContact(updatedContact);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Users className="w-8 h-8 mr-3" />
                Gestión de Contactos
              </h1>
              <p className="text-zinc-400 mt-2">
                Administra tu base de datos de contactos y segmentos
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-zinc-800 text-white px-4 py-2 rounded-md font-medium hover:bg-zinc-700 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              <button className="bg-zinc-800 text-white px-4 py-2 rounded-md font-medium hover:bg-zinc-700 transition-colors flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Contacto
              </button>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar contactos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>
              <div className="min-w-48">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                >
                  <option value="">Todas las etiquetas</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Total Contactos</p>
                  <p className="text-2xl font-bold text-white">{contacts.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Suscritos</p>
                  <p className="text-2xl font-bold text-green-400">
                    {contacts.filter(c => c.isSubscribed).length}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">No Suscritos</p>
                  <p className="text-2xl font-bold text-red-400">
                    {contacts.filter(c => !c.isSubscribed).length}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Etiquetas</p>
                  <p className="text-2xl font-bold text-purple-400">{allTags.length}</p>
                </div>
                <Tag className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Lista de contactos */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">Contactos ({filteredContacts.length})</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-zinc-400">Cargando contactos...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">No se encontraron contactos</p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                >
                  Agregar primer contacto
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="text-left p-4 text-zinc-300 font-medium">Nombre</th>
                      <th className="text-left p-4 text-zinc-300 font-medium">Email</th>
                      <th className="text-left p-4 text-zinc-300 font-medium">Empresa</th>
                      <th className="text-left p-4 text-zinc-300 font-medium">Estado</th>
                      <th className="text-left p-4 text-zinc-300 font-medium">Etiquetas</th>
                      <th className="text-left p-4 text-zinc-300 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{contact.name}</p>
                            {contact.position && (
                              <p className="text-zinc-400 text-sm">{contact.position}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-zinc-300">{contact.email}</p>
                          {contact.phone && (
                            <p className="text-zinc-400 text-sm">{contact.phone}</p>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-zinc-300">{contact.company || '-'}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            contact.isSubscribed 
                              ? 'bg-green-600 text-white' 
                              : 'bg-red-600 text-white'
                          }`}>
                            {contact.isSubscribed ? 'Suscrito' : 'No suscrito'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(contact.tags) && contact.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingContact(contact)}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteContact(contact.id)}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal para agregar contacto */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">Nuevo Contacto</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Nombre completo"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="+34 123 456 789"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Empresa</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Nombre de la empresa"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Cargo</label>
                  <input
                    type="text"
                    value={newContact.position}
                    onChange={(e) => setNewContact({...newContact, position: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Director, Gerente, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Industria</label>
                  <input
                    type="text"
                    value={newContact.industry}
                    onChange={(e) => setNewContact({...newContact, industry: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Tecnología, Salud, Educación, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Ubicación</label>
                  <input
                    type="text"
                    value={newContact.location}
                    onChange={(e) => setNewContact({...newContact, location: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Madrid, España"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Sitio Web</label>
                  <input
                    type="url"
                    value={newContact.website}
                    onChange={(e) => setNewContact({...newContact, website: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="https://ejemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Intereses</label>
                  <input
                    type="text"
                    value={newContact.interests?.join(', ') || ''}
                    onChange={(e) => setNewContact({...newContact, interests: e.target.value.split(',').map(i => i.trim()).filter(i => i)})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Marketing, Ventas, Tecnología (separados por comas)"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Notas</label>
                  <textarea
                    value={newContact.notes}
                    onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Información adicional sobre el contacto..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="subscribed"
                    checked={newContact.isSubscribed}
                    onChange={(e) => setNewContact({...newContact, isSubscribed: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="subscribed" className="text-zinc-300 text-sm">Suscrito a emails</label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addContact}
                  disabled={!newContact.name || !newContact.email}
                  className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agregar Contacto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar contacto */}
        {editingContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">Editar Contacto</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={editingContact.name}
                    onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={editingContact.email}
                    onChange={(e) => setEditingContact({...editingContact, email: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={editingContact.phone || ''}
                    onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Empresa</label>
                  <input
                    type="text"
                    value={editingContact.company || ''}
                    onChange={(e) => setEditingContact({...editingContact, company: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Cargo</label>
                  <input
                    type="text"
                    value={editingContact.position || ''}
                    onChange={(e) => setEditingContact({...editingContact, position: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Industria</label>
                  <input
                    type="text"
                    value={editingContact.industry || ''}
                    onChange={(e) => setEditingContact({...editingContact, industry: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Tecnología, Salud, Educación, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Ubicación</label>
                  <input
                    type="text"
                    value={editingContact.location || ''}
                    onChange={(e) => setEditingContact({...editingContact, location: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Madrid, España"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Sitio Web</label>
                  <input
                    type="url"
                    value={editingContact.website || ''}
                    onChange={(e) => setEditingContact({...editingContact, website: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="https://ejemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Intereses</label>
                  <input
                    type="text"
                    value={editingContact.interests?.join(', ') || ''}
                    onChange={(e) => setEditingContact({...editingContact, interests: e.target.value.split(',').map(i => i.trim()).filter(i => i)})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Marketing, Ventas, Tecnología (separados por comas)"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Notas</label>
                  <textarea
                    value={editingContact.notes || ''}
                    onChange={(e) => setEditingContact({...editingContact, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Información adicional sobre el contacto..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editSubscribed"
                    checked={editingContact.isSubscribed}
                    onChange={(e) => setEditingContact({...editingContact, isSubscribed: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="editSubscribed" className="text-zinc-300 text-sm">Suscrito a emails</label>
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Etiquetas</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Array.isArray(editingContact.tags) && editingContact.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-xs flex items-center">
                        {tag}
                        <button
                          onClick={() => removeTagFromContact(editingContact.id, tag)}
                          className="ml-1 text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Nueva etiqueta"
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-l-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newTag.trim()) {
                          addTagToContact(editingContact.id, newTag.trim());
                          setNewTag('');
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newTag.trim()) {
                          addTagToContact(editingContact.id, newTag.trim());
                          setNewTag('');
                        }
                      }}
                      className="px-3 py-2 bg-white text-black rounded-r-md hover:bg-zinc-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={updateContact}
                  className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}