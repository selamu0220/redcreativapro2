'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../src/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../src/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../src/components/ui/dialog';
import { Plus, Edit, Trash2, Download, FileText, Music, Video, Link, Image, FileIcon, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useAuth } from '../hooks/useAuth';

interface LeadMagnet {
  id: string;
  userEmail: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'audio' | 'video' | 'document' | 'image' | 'link';
  fileName?: string;
  filePath?: string;
  fileUrl?: string;
  fileSize?: number;
  downloadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailTopic {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
    case 'document':
      return <FileText className="h-5 w-5" />;
    case 'audio':
      return <Music className="h-5 w-5" />;
    case 'video':
      return <Video className="h-5 w-5" />;
    case 'image':
      return <Image className="h-5 w-5" />;
    case 'link':
      return <Link className="h-5 w-5" />;
    default:
      return <FileIcon className="h-5 w-5" />;
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default function LeadMagnetsPage() {
  const { user } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [emailTopics, setEmailTopics] = useState<EmailTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingMagnet, setEditingMagnet] = useState<LeadMagnet | null>(null);
  const [showTopicsDialog, setShowTopicsDialog] = useState(false);
  
  // Form state for lead magnet
  const [magnetForm, setMagnetForm] = useState({
    title: '',
    description: '',
    fileType: 'pdf' as LeadMagnet['fileType'],
    fileUrl: '',
    file: null as File | null,
    isActive: true
  });
  
  // Form state for topics
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });

  useEffect(() => {
    if (user?.email) {
      fetchLeadMagnets();
      fetchEmailTopics();
    }
  }, [user]);

  const fetchLeadMagnets = async () => {
    try {
      const response = await authenticatedFetch('/api/lead-magnets');
      if (response.ok) {
        const data = await response.json();
        setLeadMagnets(data.leadMagnets || []);
      }
    } catch (error) {
      console.error('Error fetching lead magnets:', error);
      toast.error('Error al cargar lead magnets');
    }
  };

  const fetchEmailTopics = async () => {
    try {
      const response = await authenticatedFetch('/api/email-topics');
      if (response.ok) {
        const data = await response.json();
        setEmailTopics(data.topics || []);
      }
    } catch (error) {
      console.error('Error fetching email topics:', error);
      toast.error('Error al cargar temas de email');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMagnet = async () => {
    if (!magnetForm.title || !magnetForm.description) {
      toast.error('Título y descripción son requeridos');
      return;
    }

    if (magnetForm.fileType === 'link' && !magnetForm.fileUrl) {
      toast.error('URL es requerida para tipo link');
      return;
    }

    if (magnetForm.fileType !== 'link' && !magnetForm.file) {
      toast.error('Archivo es requerido');
      return;
    }

    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('title', magnetForm.title);
      formData.append('description', magnetForm.description);
      formData.append('fileType', magnetForm.fileType);
      
      if (magnetForm.fileType === 'link') {
        formData.append('fileUrl', magnetForm.fileUrl);
      } else if (magnetForm.file) {
        formData.append('file', magnetForm.file);
      }

      const response = await authenticatedFetch('/api/lead-magnets', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast.success('Lead magnet creado exitosamente');
        setShowCreateDialog(false);
        resetMagnetForm();
        fetchLeadMagnets();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear lead magnet');
      }
    } catch (error) {
      console.error('Error creating lead magnet:', error);
      toast.error('Error al crear lead magnet');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMagnet = async (id: string, updates: Partial<LeadMagnet>) => {
    try {
      const response = await authenticatedFetch('/api/lead-magnets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates })
      });

      if (response.ok) {
        toast.success('Lead magnet actualizado');
        fetchLeadMagnets();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error updating lead magnet:', error);
      toast.error('Error al actualizar lead magnet');
    }
  };

  const handleDeleteMagnet = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este lead magnet?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/lead-magnets?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Lead magnet eliminado');
        fetchLeadMagnets();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting lead magnet:', error);
      toast.error('Error al eliminar lead magnet');
    }
  };

  const handleSaveTopics = async () => {
    setSaving(true);
    
    try {
      const response = await authenticatedFetch('/api/email-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topics: emailTopics })
      });

      if (response.ok) {
        toast.success('Temas guardados exitosamente');
        setShowTopicsDialog(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al guardar temas');
      }
    } catch (error) {
      console.error('Error saving topics:', error);
      toast.error('Error al guardar temas');
    } finally {
      setSaving(false);
    }
  };

  const addTopic = () => {
    if (!newTopic.name) {
      toast.error('Nombre del tema es requerido');
      return;
    }

    const topic: EmailTopic = {
      id: Date.now().toString(),
      name: newTopic.name,
      description: newTopic.description,
      isActive: true
    };

    setEmailTopics([...emailTopics, topic]);
    setNewTopic({ name: '', description: '' });
  };

  const updateTopic = (id: string, updates: Partial<EmailTopic>) => {
    setEmailTopics(emailTopics.map(topic => 
      topic.id === id ? { ...topic, ...updates } : topic
    ));
  };

  const deleteTopic = (id: string) => {
    setEmailTopics(emailTopics.filter(topic => topic.id !== id));
  };

  const resetMagnetForm = () => {
    setMagnetForm({
      title: '',
      description: '',
      fileType: 'pdf',
      fileUrl: '',
      file: null,
      isActive: true
    });
  };

  const copyPublicUrl = () => {
    if (user?.email) {
      const url = `${window.location.origin}/lead-magnet/${encodeURIComponent(user.email)}`;
      navigator.clipboard.writeText(url);
      toast.success('URL copiada al portapapeles');
    }
  };

  const openPublicPage = () => {
    if (user?.email) {
      const url = `${window.location.origin}/lead-magnet/${encodeURIComponent(user.email)}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Lead Magnets</h1>
          <p className="text-gray-600 mt-2">Gestiona tus recursos gratuitos para capturar emails</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={copyPublicUrl} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copiar URL
          </Button>
          <Button onClick={openPublicPage} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Ver Página
          </Button>
        </div>
      </div>

      <Tabs defaultValue="magnets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="magnets">Lead Magnets</TabsTrigger>
          <TabsTrigger value="topics">Temas de Email</TabsTrigger>
        </TabsList>

        <TabsContent value="magnets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mis Lead Magnets</h2>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Lead Magnet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Lead Magnet</DialogTitle>
                  <DialogDescription>
                    Crea un recurso gratuito para capturar emails de tus visitantes.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" style={{fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block'}}>Título *</label>
                    <Input
                      id="title"
                      value={magnetForm.title}
                      onChange={(e) => setMagnetForm({ ...magnetForm, title: e.target.value })}
                      placeholder="Ej: Guía Completa de Marketing Digital"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" style={{fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block'}}>Descripción *</label>
                    <textarea
                      id="description"
                      value={magnetForm.description}
                      onChange={(e) => setMagnetForm({ ...magnetForm, description: e.target.value })}
                      placeholder="Describe el valor que ofrece este recurso..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="fileType" style={{fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block'}}>Tipo de Archivo *</label>
                    <Select
                      value={magnetForm.fileType}
                      onValueChange={(value) => setMagnetForm({ ...magnetForm, fileType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="document">Documento</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="image">Imagen</SelectItem>
                        <SelectItem value="link">Enlace Externo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {magnetForm.fileType === 'link' ? (
                    <div>
                      <label htmlFor="fileUrl" style={{fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block'}}>URL *</label>
                      <Input
                        id="fileUrl"
                        type="url"
                        value={magnetForm.fileUrl}
                        onChange={(e) => setMagnetForm({ ...magnetForm, fileUrl: e.target.value })}
                        placeholder="https://ejemplo.com/recurso"
                      />
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="file" style={{fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block'}}>Archivo *</label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => setMagnetForm({ ...magnetForm, file: e.target.files?.[0] || null })}
                        accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif"
                      />
                      <p className="text-sm text-gray-500 mt-1">Máximo 50MB</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateMagnet} disabled={saving}>
                      {saving ? 'Creando...' : 'Crear Lead Magnet'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadMagnets.map((magnet) => (
              <Card key={magnet.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-blue-600">
                        {getFileIcon(magnet.fileType)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{magnet.title}</CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          {magnet.fileName && (
                            <span>{magnet.fileName}</span>
                          )}
                          {magnet.fileSize && (
                            <span>• {formatFileSize(magnet.fileSize)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={magnet.isActive}
                      onChange={(e) => handleUpdateMagnet(magnet.id, { isActive: e.target.checked })}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {magnet.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: magnet.isActive ? '#3b82f6' : '#6b7280',
                        color: 'white'
                      }}
                    >
                      {magnet.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Download className="h-4 w-4" />
                      <span>{magnet.downloadCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMagnet(magnet)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMagnet(magnet.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {leadMagnets.length === 0 && (
            <div className="text-center py-12">
              <FileIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No tienes lead magnets</h3>
              <p className="text-gray-600 mb-4">Crea tu primer recurso gratuito para capturar emails</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Lead Magnet
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Temas de Email</h2>
            <Dialog open={showTopicsDialog} onOpenChange={setShowTopicsDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Gestionar Temas
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Gestionar Temas de Email</DialogTitle>
                  <DialogDescription>
                    Define los temas sobre los que tus suscriptores pueden elegir recibir emails.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Agregar Nuevo Tema</h4>
                    <div className="space-y-3">
                      <Input
                        placeholder="Nombre del tema"
                        value={newTopic.name}
                        onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                      />
                      <Input
                        placeholder="Descripción (opcional)"
                        value={newTopic.description}
                        onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                      />
                      <Button onClick={addTopic} size="sm">
                        Agregar Tema
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Temas Existentes</h4>
                    {emailTopics.map((topic) => (
                      <div key={topic.id} className="flex items-center space-x-2 p-2 border rounded">
                        <input
                          type="checkbox"
                          checked={topic.isActive}
                          onChange={(e) => updateTopic(topic.id, { isActive: e.target.checked })}
                          style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer'
                          }}
                        />
                        <Input
                          value={topic.name}
                          onChange={(e) => updateTopic(topic.id, { name: e.target.value })}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTopic(topic.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowTopicsDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveTopics} disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar Temas'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailTopics.map((topic) => (
              <Card key={topic.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{topic.name}</h3>
                      {topic.description && (
                        <p className="text-sm text-gray-600">{topic.description}</p>
                      )}
                    </div>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: topic.isActive ? '#3b82f6' : '#6b7280',
                        color: 'white'
                      }}
                    >
                      {topic.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {emailTopics.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-800 mb-2">No tienes temas configurados</h3>
              <p className="text-gray-600 mb-4">Define temas para que tus suscriptores puedan elegir sus preferencias</p>
              <Button onClick={() => setShowTopicsDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Temas
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}