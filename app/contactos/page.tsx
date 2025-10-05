"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import MobileLayout, { MobileContainer } from "../components/MobileLayout";
import { useViewport } from "../hooks/useViewport";

interface Contact {
  email: string;
  name?: string;
  userEmail: string;
  isSubscribed: boolean;
  source: string;
  tags?: string[];
  id: string;
  createdAt: string;
  updatedAt: string;
  additionalContext?: string;
}

export default function ContactosPage() {
  const { user, logout } = useAuth();
  const { get } = useAuthenticatedFetch();
  const { isMobile } = useViewport();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [copiedEmail, setCopiedEmail] = useState("");

  // Cargar contactos
  useEffect(() => {
    const loadContacts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await get('/api/contacts');
        setContacts(data.contacts || []);
      } catch (error) {
        console.error('Error loading contacts:', error);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [user, get]);

  // Filtrar contactos
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.name && contact.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = !selectedTag || 
      (contact.tags && contact.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  // Obtener todas las etiquetas únicas
  const allTags = Array.from(new Set(
    contacts.flatMap(contact => contact.tags || [])
  )).sort();

  // Copiar email al portapapeles
  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(""), 2000);
    } catch (error) {
      console.error('Error copying email:', error);
    }
  };

  // Ir a correos-ia con email preseleccionado
  const handleUseInEmailGenerator = (email: string) => {
    const url = `/correos-ia?recipient=${encodeURIComponent(email)}`;
    window.location.href = url;
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
            <p className="text-muted-foreground">Necesitas iniciar sesión para ver tus contactos</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MobileLayout>
        <MobileContainer>
          <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 max-w-screen-2xl items-center">
                <div className="flex items-center space-x-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center space-x-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Dashboard</span>
                  </Link>
                  <div className="h-6 w-px bg-border" />
                  <h1 className="text-xl font-semibold">
                    Mis Contactos
                  </h1>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-4">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Link
                    href="/correos-ia"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                  >
                    Generar Email
                  </Link>
                  <button
                    onClick={logout}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="container max-w-screen-2xl py-6">
              {/* Stats and Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="text-2xl font-bold">{contacts.length}</p>
                      <p className="text-sm text-muted-foreground">Total Contactos</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-2xl font-bold">{contacts.filter(c => c.isSubscribed).length}</p>
                      <p className="text-sm text-muted-foreground">Suscritos</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <div>
                      <p className="text-2xl font-bold">{allTags.length}</p>
                      <p className="text-sm text-muted-foreground">Etiquetas</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                        Buscar contactos
                      </label>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por email o nombre..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    
                    {/* Tag Filter */}
                    <div className="md:w-64">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                        Filtrar por etiqueta
                      </label>
                      <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Todas las etiquetas</option>
                        {allTags.map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    <Link
                      href="/importar-exportar"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      Importar/Exportar
                    </Link>
                    <Link
                      href={`/correosia/${encodeURIComponent(user.email || '')}/admin`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Mi Página
                    </Link>
                  </div>
                </div>
              </div>

              {/* Contacts List */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                      Contactos ({filteredContacts.length})
                    </h2>
                    {searchTerm || selectedTag ? (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedTag("");
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Limpiar filtros
                      </button>
                    ) : null}
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2 text-muted-foreground">Cargando contactos...</p>
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium">No hay contactos</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {searchTerm || selectedTag ? 'No se encontraron contactos con los filtros aplicados.' : 'Aún no tienes contactos registrados.'}
                      </p>
                      {!searchTerm && !selectedTag && (
                        <div className="mt-6">
                          <Link
                            href="/importar-exportar"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                          >
                            Importar Contactos
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredContacts.map((contact) => (
                        <div key={contact.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-sm truncate">{contact.email}</h3>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  contact.isSubscribed 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                }`}>
                                  {contact.isSubscribed ? '✓ Suscrito' : '✗ No suscrito'}
                                </span>
                              </div>
                              
                              {contact.name && (
                                <p className="text-sm text-muted-foreground mb-1">{contact.name}</p>
                              )}
                              
                              {contact.additionalContext && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  <strong>Contexto:</strong> {contact.additionalContext}
                                </p>
                              )}
                              
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>Fuente: {contact.source}</span>
                                <span>Creado: {new Date(contact.createdAt).toLocaleDateString()}</span>
                              </div>
                              
                              {contact.tags && contact.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {contact.tags.map((tag, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col space-y-2 ml-4">
                              <button
                                onClick={() => handleUseInEmailGenerator(contact.email)}
                                className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Usar en Email
                              </button>
                              
                              <button
                                onClick={() => copyEmail(contact.email)}
                                className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                              >
                                {copiedEmail === contact.email ? (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copiado
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copiar
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </MobileContainer>
      </MobileLayout>
    </ProtectedRoute>
  );
}