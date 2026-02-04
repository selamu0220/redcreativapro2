"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from '../hooks/useAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

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
}

interface ContactSelectorProps {
  value: string;
  onChange: (email: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ContactSelector({ value, onChange, placeholder = "Buscar contacto o escribir email...", className = "" }: ContactSelectorProps) {
  const { user } = useAuth();
  const { get } = useAuthenticatedFetch();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar contactos al montar el componente
  useEffect(() => {
    // Only try to load contacts if user is authenticated
    if (!user) {
      console.log('Contacts not available (user not authenticated)');
      return;
    }

    const loadContacts = async () => {
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

  // Filtrar contactos basado en el valor de entrada
  useEffect(() => {
    if (!value.trim()) {
      setFilteredContacts([]);
      return;
    }

    const searchTerm = value.toLowerCase();
    const filtered = contacts.filter(contact => 
      (contact.email || '').toLowerCase().includes(searchTerm) ||
      (contact.name && (contact.name || '').toLowerCase().includes(searchTerm))
    ).slice(0, 10); // Limitar a 10 resultados

    setFilteredContacts(filtered);
    setIsOpen(filtered.length > 0 && value.length > 0);
  }, [value, contacts]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleContactSelect = (contact: Contact) => {
    onChange(contact.email);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (filteredContacts.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="email"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        autoComplete="off"
      />
      
      {/* Dropdown de contactos */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-muted-foreground">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="ml-2">Cargando contactos...</span>
            </div>
          ) : filteredContacts.length > 0 ? (
            <>
              <div className="p-2 text-xs text-muted-foreground border-b">
                {filteredContacts.length} contacto{filteredContacts.length !== 1 ? 's' : ''} encontrado{filteredContacts.length !== 1 ? 's' : ''}
              </div>
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className="w-full text-left p-3 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none border-b border-border last:border-b-0"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{contact.email}</span>
                    {contact.name && (
                      <span className="text-xs text-muted-foreground">{contact.name}</span>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        contact.isSubscribed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {contact.isSubscribed ? '✓ Suscrito' : '✗ No suscrito'}
                      </span>
                      {contact.tags && contact.tags.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {contact.tags.slice(0, 2).join(', ')}
                          {contact.tags.length > 2 && ` +${contact.tags.length - 2}`}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </>
          ) : value.length > 0 ? (
            <div className="p-3 text-center text-muted-foreground">
              <div className="text-sm">No se encontraron contactos</div>
              <div className="text-xs mt-1">Puedes escribir un email nuevo</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
