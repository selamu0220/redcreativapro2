'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../src/components/ui/select';
import { Download, FileText, Music, Video, Link, Image, FileIcon } from 'lucide-react';
import { toast } from 'sonner';

interface LeadMagnet {
  id: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'audio' | 'video' | 'document' | 'image' | 'link';
  fileName?: string;
  fileSize?: number;
  downloadCount: number;
  isActive: boolean;
}

interface EmailTopic {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface SubscriptionPreferences {
  topics: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  language: 'es' | 'en';
}

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
    case 'document':
      return <FileText className="h-8 w-8" />;
    case 'audio':
      return <Music className="h-8 w-8" />;
    case 'video':
      return <Video className="h-8 w-8" />;
    case 'image':
      return <Image className="h-8 w-8" />;
    case 'link':
      return <Link className="h-8 w-8" />;
    default:
      return <FileIcon className="h-8 w-8" />;
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default function LeadMagnetPage() {
  const params = useParams();
  const userEmail = params.userEmail as string;
  
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [emailTopics, setEmailTopics] = useState<EmailTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedMagnet, setSelectedMagnet] = useState<LeadMagnet | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState<SubscriptionPreferences>({
    topics: [],
    frequency: 'weekly',
    language: 'es'
  });

  useEffect(() => {
    fetchLeadMagnets();
    fetchEmailTopics();
  }, [userEmail]);

  const fetchLeadMagnets = async () => {
    try {
      const response = await fetch(`/api/lead-magnets/public/${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setLeadMagnets(data.leadMagnets || []);
      }
    } catch (error) {
      console.error('Error fetching lead magnets:', error);
    }
  };

  const fetchEmailTopics = async () => {
    try {
      const response = await fetch(`/api/email-topics/public/${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setEmailTopics(data.topics || []);
      }
    } catch (error) {
      console.error('Error fetching email topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (magnet: LeadMagnet) => {
    if (!email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setDownloading(magnet.id);
    
    try {
      // Save subscription preferences if provided
      if (showPreferences && preferences.topics.length > 0) {
        await fetch('/api/subscription-preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            userEmail,
            preferences
          })
        });
      }

      // Request download - Use GET with query parameters
      const downloadUrl = new URL(`/api/lead-magnets/download/${magnet.id}`, window.location.origin);
      downloadUrl.searchParams.set('email', email);
      downloadUrl.searchParams.set('source', 'public-page');
      
      const response = await fetch(downloadUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.type === 'redirect') {
          window.open(data.downloadUrl, '_blank');
        } else {
          // Create download link
          const link = document.createElement('a');
          link.href = data.downloadUrl;
          link.download = data.fileName || magnet.title;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        toast.success('¡Descarga iniciada! Revisa tu carpeta de descargas.');
        
        // Reset form
        setEmail('');
        setPreferences({
          topics: [],
          frequency: 'weekly',
          language: 'es'
        });
        setShowPreferences(false);
        setSelectedMagnet(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al descargar el archivo');
      }
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Error al procesar la descarga');
    } finally {
      setDownloading(null);
    }
  };

  const handleTopicChange = (topicId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      topics: checked 
        ? [...prev.topics, topicId]
        : prev.topics.filter(id => id !== topicId)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando recursos...</p>
        </div>
      </div>
    );
  }

  const activeLeadMagnets = leadMagnets.filter(magnet => magnet.isActive);

  if (activeLeadMagnets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FileIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No hay recursos disponibles</h1>
          <p className="text-gray-600">Este usuario no tiene lead magnets activos en este momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Recursos Gratuitos</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descarga recursos valiosos completamente gratis. Solo necesitas tu email.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {activeLeadMagnets.map((magnet) => (
            <Card key={magnet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
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
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {magnet.description}
                </CardDescription>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor={`email-${magnet.id}`} className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <Input
                      id={`email-${magnet.id}`}
                      type="email"
                      placeholder="tu@email.com"
                      value={selectedMagnet?.id === magnet.id ? email : ''}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setSelectedMagnet(magnet);
                      }}
                      className="mt-1"
                    />
                  </div>

                  {selectedMagnet?.id === magnet.id && emailTopics.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          id={`show-preferences-${magnet.id}`}
                          checked={showPreferences}
                          onChange={(e) => setShowPreferences(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`show-preferences-${magnet.id}`} className="text-sm text-gray-700">
                          Configurar preferencias de email (opcional)
                        </label>
                      </div>

                      {showPreferences && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Temas de interés:</label>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                              {emailTopics.filter(topic => topic.isActive).map((topic) => (
                                <div key={topic.id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`topic-${topic.id}`}
                                    checked={preferences.topics.includes(topic.id)}
                                    onChange={(e) => handleTopicChange(topic.id, e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label htmlFor={`topic-${topic.id}`} className="text-sm text-gray-700">
                                    {topic.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700">Frecuencia de emails:</label>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="daily"
                                  name="frequency"
                                  value="daily"
                                  checked={preferences.frequency === 'daily'}
                                  onChange={(e) => setPreferences(prev => ({ ...prev, frequency: e.target.value as any }))}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor="daily" className="text-sm text-gray-700">Diario</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="weekly"
                                  name="frequency"
                                  value="weekly"
                                  checked={preferences.frequency === 'weekly'}
                                  onChange={(e) => setPreferences(prev => ({ ...prev, frequency: e.target.value as any }))}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor="weekly" className="text-sm text-gray-700">Semanal</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="monthly"
                                  name="frequency"
                                  value="monthly"
                                  checked={preferences.frequency === 'monthly'}
                                  onChange={(e) => setPreferences(prev => ({ ...prev, frequency: e.target.value as any }))}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor="monthly" className="text-sm text-gray-700">Mensual</label>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700">Idioma:</label>
                            <Select
                              value={preferences.language}
                              onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value as any }))}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => handleDownload(magnet)}
                    disabled={downloading === magnet.id || !email}
                    className="w-full"
                  >
                    {downloading === magnet.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Descargando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Descargar Gratis</span>
                      </div>
                    )}
                  </Button>
                </div>

                <div className="mt-3 text-center">
                  <span className="text-xs text-gray-500">
                    {magnet.downloadCount} descargas
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Al descargar, aceptas recibir emails ocasionales. Puedes darte de baja en cualquier momento.</p>
        </div>
      </div>
    </div>
  );
}