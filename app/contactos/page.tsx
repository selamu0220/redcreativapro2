"use client";

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import { SimpleMainNavigation } from "../components/SimpleMainNavigation";
import Footer from "../components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Users,
  UserCheck,
  Tag,
  Search,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Plus,
  ArrowRight,
  Filter,
  Download,
  Settings
} from "lucide-react";

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [copiedEmail, setCopiedEmail] = useState("");

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

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.name && contact.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = !selectedTag || (contact.tags && contact.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(contacts.flatMap(contact => contact.tags || []))).sort();

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(""), 2000);
    } catch (error) {
      console.error('Error copying email:', error);
    }
  };

  const handleUseInEmailGenerator = (email: string) => {
    window.location.href = `/correos-ia?recipient=${encodeURIComponent(email)}`;
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        <SimpleMainNavigation />

        <main className="flex-grow container mx-auto px-4 py-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Mis Contactos</h1>
              <p className="text-muted-foreground">Gestiona tu red de contactos y leads generados con IA.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/importar-exportar">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Importar/Exportar
                </Button>
              </Link>
              <Link href="/correos-ia">
                <Button className="gap-2 bg-zinc-900 text-white dark:bg-white dark:text-black">
                  <Mail className="w-4 h-4" />
                  Nuevo Email
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Contactos</p>
                  <h3 className="text-2xl font-bold">{contacts.length}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suscritos</p>
                  <h3 className="text-2xl font-bold">{contacts.filter(c => c.isSubscribed).length}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Etiquetas</p>
                  <h3 className="text-2xl font-bold">{allTags.length}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="w-full md:w-64">
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Todas las etiquetas</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
                <Link href={`/correosia/${encodeURIComponent(user.email || '')}/admin`}>
                  <Button variant="outline" className="w-full md:w-auto gap-2">
                    <Settings className="w-4 h-4" />
                    Mi Página
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-lg font-semibold">Listado de Contactos</h2>
              <span className="text-sm text-muted-foreground">
                Mostrando {filteredContacts.length} de {contacts.length}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-zinc-100 dark:bg-zinc-800" />
                  </Card>
                ))}
              </div>
            ) : filteredContacts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-semibold mb-2">No se encontraron contactos</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || selectedTag ? 'Prueba con otros filtros o términos de búsqueda.' : 'Aún no tienes contactos en tu CRM.'}
                  </p>
                  {!searchTerm && !selectedTag && (
                    <Link href="/importar-exportar">
                      <Button>Importar mis primeros contactos</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map((contact) => (
                  <Card key={contact.id} className="overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all">
                    <CardHeader className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant={contact.isSubscribed ? "default" : "secondary"} className={contact.isSubscribed ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-none" : ""}>
                          {contact.isSubscribed ? 'Suscrito' : 'Sin suscripción'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          {contact.source}
                        </span>
                      </div>
                      <CardTitle className="text-lg mb-1 truncate">{contact.name || 'Sin nombre'}</CardTitle>
                      <CardDescription className="truncate">{contact.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      {contact.additionalContext && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {contact.additionalContext}
                        </p>
                      )}
                      
                      {contact.tags && contact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-6">
                          {contact.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-[10px] py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleUseInEmailGenerator(contact.email)}
                          className="flex-1 h-9 text-xs bg-zinc-900 text-white dark:bg-white dark:text-black"
                        >
                          Enviar Email
                        </Button>
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => copyEmail(contact.email)}
                          className="h-9 w-9"
                        >
                          {copiedEmail === contact.email ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
