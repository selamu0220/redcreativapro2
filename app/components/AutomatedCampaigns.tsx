'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  Settings, 
  BarChart3, 
  Mail, 
  Users, 
  TrendingUp, 
  Save,
  Target,
  Clock,
  Zap,
  Edit,
  Check,
  X,
  Send
} from 'lucide-react';
import BusinessContextConfig from './BusinessContextConfig';
import { CampaignData } from '../lib/database';
import { useAuth } from '../hooks/useAuth';

// Additional interfaces for component-specific data
interface CampaignDisplayData extends CampaignData {
  frequency?: 'daily' | 'every3days' | 'weekly' | 'monthly' | 'custom';
  segment?: string;
  aiEnabled?: boolean;
  abTestEnabled?: boolean;
  abTestProgress?: number;
  nextSend?: string;
}

interface AnalyticsData {
  totalSent: number;
  avgOpenRate: number;
  avgClickRate: number;
  totalROI: number;
  insights: string[];
  detailedHistory?: EmailHistoryItem[];
  dailySummary?: DailySummary[];
}

interface EmailHistoryItem {
  id: string;
  campaignId?: string;
  campaignName?: string;
  subject: string;
  recipientEmail: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  emailType: 'campaign' | 'automated' | 'transactional' | 'manual';
  templateName?: string;
}

interface DailySummary {
  date: string;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  campaigns: string[];
}

interface AISettings {
  geminiApiKey: string;
  model: string;
  temperature: number;
  autoOptimize: boolean;
  abTesting: boolean;
  testEmail: string;
  contactPercentage: number;
}

const AutomatedCampaigns: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'analytics' | 'settings'>('campaigns');
  const [campaigns, setCampaigns] = useState<CampaignDisplayData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingROI, setEditingROI] = useState<string | null>(null);
  const [tempROI, setTempROI] = useState<string>('');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSent: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    totalROI: 0,
    insights: []
  });
  const [settings, setSettings] = useState<AISettings>({
    geminiApiKey: 'AIzaSyALwXOW_onexmTnq6RXNipyWCqVUVXjwqw',
    model: 'gemini-2.5-flash-lite',
    temperature: 0.7,
    autoOptimize: true,
    abTesting: true,
    testEmail: '',
    contactPercentage: 100
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    sendTime: '09:00',
    timezone: 'Europe/Madrid',
    sendDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    pauseWeekends: true,
    maxDailyEmails: 100,
    description: '',
    businessType: '',
    goal: '',
    frequency: 'weekly',
    segment: 'all',
    aiEnabled: true,
    abTestEnabled: true,
    aiTone: 'professional',
    aiCreativity: 'balanced',
    testEmail: '',
    contactPercentage: 100
  });
  const [loading, setLoading] = useState(false);
  const [contactsCount, setContactsCount] = useState(0);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [contactsFile, setContactsFile] = useState<File | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<CampaignDisplayData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load campaigns and analytics on component mount
  useEffect(() => {
    if (user?.email) {
      loadCampaigns();
      loadAnalytics();
      loadContactsCount();
    }
  }, [user]);

  const loadContactsCount = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/contacts', {
        headers: {
          'x-user-email': user.email
        }
      });
      
      if (response.ok) {
        const contacts = await response.json();
        setContactsCount(contacts.length);
      }
    } catch (error) {
      console.error('Error loading contacts count:', error);
    }
  };

  const startEditingCampaign = (campaign: CampaignDisplayData) => {
    setEditingCampaign(campaign);
    setShowEditModal(true);
  };

  const updateCampaign = async () => {
    if (!editingCampaign || !user?.email) return;
    
    try {
      const response = await fetch('/api/campaigns/automated', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify(editingCampaign)
      });
      
      if (response.ok) {
        alert('Campaña actualizada exitosamente');
        setShowEditModal(false);
        setEditingCampaign(null);
        loadCampaigns();
      } else {
        alert('Error al actualizar la campaña');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Error al actualizar la campaña');
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    console.log('🔥 INICIO deleteCampaign - ID:', campaignId);
    console.log('🔥 User object:', user);
    console.log('🔥 User email:', user?.email);
    console.log('🔥 Campaigns before delete:', campaigns.length);
    
    if (!user?.email) {
      console.log('❌ No user email found, returning');
      alert('Error: No se encontró el email del usuario. Por favor, inicia sesión nuevamente.');
      return;
    }
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta campaña? Esta acción no se puede deshacer.')) {
      console.log('❌ User cancelled deletion');
      return;
    }
    
    try {
      console.log('🚀 Sending DELETE request...');
      console.log('🚀 Request headers:', {
        'Content-Type': 'application/json',
        'x-user-email': user.email
      });
      console.log('🚀 Request body:', JSON.stringify({ campaignId }));
      
      const response = await fetch('/api/campaigns/automated', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ campaignId })
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Delete successful:', result);
        
        // Actualizar estado local inmediatamente
        console.log('🔄 Updating local state...');
        setCampaigns(prevCampaigns => {
          const updated = prevCampaigns.filter(c => c.id !== campaignId);
          console.log('🔄 Local state updated, campaigns count:', updated.length);
          return updated;
        });
        
        // También recargar desde el servidor para asegurar sincronización
        console.log('🔄 Calling loadCampaigns...');
        await loadCampaigns();
        console.log('🔄 Campaigns after reload:', campaigns.length);
        alert('Campaña eliminada exitosamente');
      } else {
        const errorData = await response.json();
        console.error('❌ Delete failed:', errorData);
        alert(`Error al eliminar la campaña: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('💥 Error deleting campaign:', error);
      alert('Error al eliminar la campaña: ' + (error as Error).message);
    }
    
    console.log('🏁 FIN deleteCampaign');
  };

  const sendCampaignNow = async (campaignId: string) => {
    if (!user?.email) return;
    
    if (!confirm('¿Estás seguro de que quieres enviar esta campaña ahora a todos los contactos?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ campaignId })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Campaña enviada exitosamente a ${result.sentCount} contactos`);
        loadCampaigns();
        loadAnalytics();
      } else {
        const error = await response.json();
        alert(`Error al enviar la campaña: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Error al enviar la campaña');
    }
  };

  const rescheduleOverdueCampaigns = async () => {
    if (!user?.email) return;
    
    const now = new Date();
    const overdueCampaigns = campaigns.filter(campaign => 
      campaign.automationSettings?.isActive && 
      campaign.automationSettings?.nextSendDate &&
      new Date(campaign.automationSettings.nextSendDate).getTime() < now.getTime()
    );
    
    for (const campaign of overdueCampaigns) {
      try {
        const frequency = campaign.automationSettings?.frequency || 'weekly';
        const nextSendDate = new Date();
        
        // Calcular próxima fecha basada en frecuencia
        switch (frequency) {
          case 'daily':
            nextSendDate.setDate(nextSendDate.getDate() + 1);
            break;
          case 'weekly':
            nextSendDate.setDate(nextSendDate.getDate() + 7);
            break;
          case 'monthly':
            nextSendDate.setMonth(nextSendDate.getMonth() + 1);
            break;
        }
        
        // Actualizar la campaña con la nueva fecha
        await fetch('/api/campaigns/automated', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user.email
          },
          body: JSON.stringify({
            targetCampaignId: campaign.id,
            automationSettings: {
              ...campaign.automationSettings,
              nextSendDate: nextSendDate.toISOString()
            }
          })
        });
      } catch (error) {
        console.error(`Error rescheduling campaign ${campaign.id}:`, error);
      }
    }
    
    if (overdueCampaigns.length > 0) {
      loadCampaigns(); // Recargar para mostrar las nuevas fechas
    }
  };

  const handleContactsUpload = async () => {
    if (!contactsFile || !user?.email) return;
    
    const formData = new FormData();
    formData.append('file', contactsFile);
    formData.append('userEmail', user.email);
    
    try {
      const response = await fetch('/api/contacts/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Se han importado ${result.imported} contactos exitosamente`);
        setContactsFile(null);
        setShowContactsModal(false);
        loadContactsCount();
      } else {
        alert('Error al subir contactos');
      }
    } catch (error) {
      console.error('Error uploading contacts:', error);
      alert('Error al subir contactos');
    }
  };

  const loadAnalytics = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/campaigns/analytics?period=30&insights=true', {
        headers: {
          'x-user-email': user.email
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics({
          totalSent: data.overallMetrics?.totalEmailsSent || 0,
          avgOpenRate: data.overallMetrics?.overallOpenRate || 0,
          avgClickRate: data.overallMetrics?.overallClickRate || 0,
          totalROI: data.overallMetrics?.totalROI || 0,
          insights: data.insights || [],
          detailedHistory: data.calendar?.detailedHistory || [],
          dailySummary: data.calendar?.dailySummary || []
        });
      } else {
        console.error('Error loading analytics:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadCampaigns = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/campaigns/automated', {
        headers: {
          'x-user-email': user.email
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
        
        // Verificar y reprogramar campañas atrasadas automáticamente
        setTimeout(() => {
          rescheduleOverdueCampaigns();
        }, 1000);
      } else {
        console.error('Error loading campaigns:', response.statusText);
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaign = async (campaignId: string) => {
    if (!user?.email) return;
    
    try {
      const campaign = campaigns.find(c => c.id === campaignId);
      const isActive = campaign?.automationSettings?.isActive;
      const action = isActive ? 'pause' : 'resume';
      
      const response = await fetch('/api/campaigns/automated', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({
          campaignId,
          action,
          automationSettings: {
            ...campaign?.automationSettings,
            isActive: !isActive
          }
        })
      });

      if (response.ok) {
        loadCampaigns();
      } else {
        const errorData = await response.text();
        console.error('Error toggling campaign:', errorData);
        alert('Error al cambiar el estado de la campaña.');
      }
    } catch (error) {
      console.error('Error toggling campaign:', error);
      alert('Error al cambiar el estado de la campaña.');
    }
  };

  const processCampaignsManually = async () => {
    if (!user?.email) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/cron/process-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer default-secret',
          'x-user-email': user.email
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Procesamiento completado:', result);
        const message = `✅ Procesamiento completado exitosamente\n\n` +
          `📧 Campañas procesadas: ${result.campaignsProcessed || 0}\n` +
          `📨 Correos enviados: ${result.totalEmailsSent || 0}\n` +
          `💰 Ingresos estimados: €${result.totalRevenue?.toFixed(2) || '0.00'}\n` +
          `⏰ Próximo procesamiento automático: En 1 hora`;
        alert(message);
        loadCampaigns();
        loadAnalytics();
      } else {
        const error = await response.text();
        console.error('Error procesando campañas:', error);
        alert('❌ Error al procesar campañas. Revisa la consola para más detalles.');
      }
    } catch (error) {
      console.error('Error procesando campañas:', error);
      alert('Error al procesar campañas. Revisa la consola para más detalles.');
    } finally {
      setIsProcessing(false);
    }
  };

  const createCampaign = async () => {
    if (!newCampaign.name.trim()) {
      alert('Por favor, ingresa un nombre para la campaña');
      return;
    }
    
    if (!user?.email) return;

    setLoading(true);
    try {
      const response = await fetch('/api/campaigns/automated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({
          name: newCampaign.name,
          description: newCampaign.description,
          businessType: newCampaign.businessType,
          goal: newCampaign.goal,
          automationSettings: {
            frequency: newCampaign.frequency,
            isActive: true,
            maxEmailsPerCampaign: 100
          },
          aiSettings: {
            enabled: newCampaign.aiEnabled,
            model: settings.model,
            temperature: settings.temperature,
            userApiKey: settings.geminiApiKey,
            contentTheme: 'marketing general',
            targetAudience: newCampaign.segment,
            tone: 'professional'
          },
          abTestSettings: {
            isEnabled: newCampaign.abTestEnabled,
            testDuration: 7,
            winnerCriteria: 'openRate'
          },
          testEmail: newCampaign.testEmail || settings.testEmail,
          contactPercentage: newCampaign.contactPercentage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShowCreateModal(false);
        setNewCampaign({
          name: '',
          sendTime: '09:00',
          timezone: 'Europe/Madrid',
          sendDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          pauseWeekends: true,
          maxDailyEmails: 100,
          description: '',
          businessType: '',
          goal: '',
          frequency: 'weekly',
          segment: 'all',
          aiEnabled: true,
          abTestEnabled: true,
          aiTone: 'professional',
          aiCreativity: 'balanced',
          testEmail: '',
          contactPercentage: 100
        });
        loadCampaigns();
        alert('Campaña creada exitosamente');
      } else {
        const errorData = await response.text();
        console.error('Error creating campaign:', errorData);
        alert('Error al crear la campaña. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error al crear la campaña. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user?.email) return;
    
    console.log('saveSettings called with settings:', settings);
    try {
      console.log('Using email:', user.email);
      
      // Save Gemini API key
      if (settings.geminiApiKey) {
        console.log('Attempting to save API key...');
        const apiKeyResponse = await fetch('/api/ai-studio-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: user.email,
            apiKey: settings.geminiApiKey
          })
        });
        
        if (!apiKeyResponse.ok) {
          throw new Error('Error saving API key');
        }
      }
      
      // Save other AI settings to localStorage for now
      localStorage.setItem('aiSettings', JSON.stringify({
        model: settings.model,
        temperature: settings.temperature,
        autoOptimize: settings.autoOptimize,
        abTesting: settings.abTesting,
        testEmail: settings.testEmail,
        contactPercentage: settings.contactPercentage
      }));
      
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar la configuración. Por favor, inténtalo de nuevo.');
    }
  };
  
  // Load saved settings on component mount
  useEffect(() => {
    loadAISettings();
  }, []);

  const loadAISettings = async () => {
    try {
      // Load API key from backend
      const response = await fetch('/api/ai-studio-key');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, geminiApiKey: data.apiKey || '' }));
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }

    // Load other settings from localStorage
    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({
        ...prev,
        model: parsed.model || 'gemini-pro',
        temperature: parsed.temperature || 0.7,
        autoOptimize: parsed.autoOptimize !== undefined ? parsed.autoOptimize : true,
        abTesting: parsed.abTesting !== undefined ? parsed.abTesting : true,
        testEmail: parsed.testEmail || '',
        contactPercentage: parsed.contactPercentage || 100
      }));
    }
  };

  // Funciones para manejar la edición del ROI
  const startEditingROI = (campaignId: string, currentROI: number) => {
    setEditingROI(campaignId);
    setTempROI(currentROI.toString());
  };

  const cancelEditingROI = () => {
    setEditingROI(null);
    setTempROI('');
  };

  const saveROI = async (campaignId: string) => {
    if (!user?.email) return;
    
    try {
      const roiValue = parseFloat(tempROI);
      
      if (isNaN(roiValue) || roiValue < 0) {
        alert('Por favor, ingresa un valor de ROI válido (número positivo)');
        return;
      }

      const response = await fetch(`/api/campaigns/${campaignId}/roi`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ manualROI: roiValue })
      });

      if (response.ok) {
        // Recargar las campañas para mostrar el ROI actualizado
        await loadCampaigns();
        await loadAnalytics();
        setEditingROI(null);
        setTempROI('');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al actualizar el ROI');
      }
    } catch (error) {
      console.error('Error updating ROI:', error);
      alert('Error al actualizar el ROI. Por favor, inténtalo de nuevo.');
    }
  };

  const removeManualROI = async (campaignId: string) => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/roi`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user.email
        }
      });

      if (response.ok) {
        // Recargar las campañas para mostrar el ROI calculado automáticamente
        await loadCampaigns();
        await loadAnalytics();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar el ROI manual');
      }
    } catch (error) {
      console.error('Error removing manual ROI:', error);
      alert('Error al eliminar el ROI manual. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Email Marketing con IA</h1>
          <p className="text-zinc-400 text-sm max-w-2xl">
            Crea campañas profesionales con herramientas de IA integradas. Escritor automático, A/B testing inteligente y optimización continua.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-green-900/30 border border-green-700/50 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Sistema Automático Activo</span>
          </div>
          {campaigns.some(c => c.automationSettings?.isActive && c.automationSettings?.nextSendDate && new Date(c.automationSettings.nextSendDate).getTime() < new Date().getTime()) && (
            <button 
              onClick={rescheduleOverdueCampaigns}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 flex items-center shadow-lg"
              title="Reprogramar campañas atrasadas"
            >
              <Clock className="w-4 h-4 mr-2" />
              Reprogramar
            </button>
          )}
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear Campaña con IA
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className="flex space-x-1 bg-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'campaigns' 
                ? 'bg-white text-black' 
                : 'text-white hover:bg-zinc-700'
            }`}
          >
            Campañas
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-white text-black' 
                : 'text-white hover:bg-zinc-700'
            }`}
          >
            Analíticas
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'settings' 
                ? 'bg-white text-black' 
                : 'text-white hover:bg-zinc-700'
            }`}
          >
            Configuración
          </button>
        </div>

        {activeTab === 'campaigns' && (
          <div className="space-y-6 mt-6">
            {/* Estado de Automatización */}
            {campaigns.length > 0 && (
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <h3 className="text-lg font-semibold text-white mb-3">Estado de Automatización</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-900 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">Campañas Activas</span>
                      <span className="text-green-400 font-bold text-lg">
                        {campaigns.filter(c => c.automationSettings?.isActive).length}
                      </span>
                    </div>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">Total Campañas</span>
                      <span className="text-white font-bold text-lg">{campaigns.length}</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">Próximo Envío</span>
                      <span className="text-blue-400 font-bold text-sm">
                        {(() => {
                          const nextCampaign = campaigns
                            .filter(c => c.automationSettings?.isActive && c.automationSettings?.nextSendDate)
                            .sort((a, b) => new Date(a.automationSettings!.nextSendDate!).getTime() - new Date(b.automationSettings!.nextSendDate!).getTime())[0];
                          if (nextCampaign) {
                            const nextDate = new Date(nextCampaign.automationSettings!.nextSendDate!);
                            const now = new Date();
                            const diffMs = nextDate.getTime() - now.getTime();
                            const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
                            const diffMinutes = Math.ceil(diffMs / (1000 * 60));
                            
                            if (diffMs > 0) {
                              if (diffHours >= 24) {
                                const diffDays = Math.ceil(diffHours / 24);
                                return `${diffDays}d`;
                              } else if (diffHours >= 1) {
                                return `${diffHours}h`;
                              } else {
                                return `${diffMinutes}min`;
                              }
                            } else {
                              const pastHours = Math.abs(diffHours);
                              if (pastHours < 1) {
                                return 'Procesando...';
                              } else if (pastHours < 24) {
                                return `Atrasado ${pastHours}h`;
                              } else {
                                const pastDays = Math.ceil(pastHours / 24);
                                return `Atrasado ${pastDays}d`;
                              }
                            }
                          }
                          return 'N/A';
                        })()
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {campaigns.length === 0 ? (
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
                <div className="mb-6">
                  <Zap className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">¡Empieza a crear campañas inteligentes!</h3>
                  <p className="text-zinc-400 mb-4">Usa nuestras herramientas de IA para crear campañas que convierten</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <div className="text-blue-400 mb-2">🤖</div>
                    <h4 className="text-white font-medium mb-1">Escritor IA</h4>
                    <p className="text-xs text-zinc-400">Genera contenido personalizado automáticamente</p>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <div className="text-green-400 mb-2">📊</div>
                    <h4 className="text-white font-medium mb-1">A/B Testing</h4>
                    <p className="text-xs text-zinc-400">Optimización automática de rendimiento</p>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <div className="text-purple-400 mb-2">⚡</div>
                    <h4 className="text-white font-medium mb-1">Automatización</h4>
                    <p className="text-xs text-zinc-400">Envíos programados y segmentación inteligente</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateModal(true)} 
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  Crear mi primera campaña con IA
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                          <p className="text-zinc-400 mb-2">{campaign.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-zinc-500">
                            <span>Frecuencia: {campaign.automationSettings?.frequency === 'daily' ? 'Diaria' : campaign.automationSettings?.frequency === 'weekly' ? 'Semanal' : 'Mensual'}</span>
                            {campaign.automationSettings?.nextSendDate && (
                              <span className={(() => {
                                const nextDate = new Date(campaign.automationSettings.nextSendDate);
                                const now = new Date();
                                const isPast = nextDate.getTime() < now.getTime();
                                return isPast ? 'text-red-400' : 'text-zinc-500';
                              })()}>
                                {(() => {
                                  const nextDate = new Date(campaign.automationSettings.nextSendDate);
                                  const now = new Date();
                                  const isPast = nextDate.getTime() < now.getTime();
                                  const dateStr = nextDate.toLocaleDateString('es-ES', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  });
                                  return isPast ? `⚠️ Atrasado: ${dateStr}` : `Próximo envío: ${dateStr}`;
                                })()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.automationSettings?.isActive
                              ? 'bg-green-600 text-white' 
                              : 'bg-red-600 text-white'
                          }`}>
                            {campaign.automationSettings?.isActive ? 'Activa' : 'Pausada'}
                          </span>
                          <button
                            onClick={() => startEditingCampaign(campaign)}
                            className="p-2 border border-zinc-700 rounded-md transition-colors text-blue-400 hover:bg-blue-900/20"
                            title="Editar campaña"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => sendCampaignNow(campaign.id)}
                            className="p-2 border border-zinc-700 rounded-md transition-colors text-green-400 hover:bg-green-900/20"
                            title="Enviar ahora"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              console.log('🎯 CLICK EVENT TRIGGERED!', e);
                              console.log('🎯 Campaign ID:', campaign.id);
                              console.log('🎯 Event target:', e.target);
                              console.log('🎯 Event currentTarget:', e.currentTarget);
                              e.preventDefault();
                              e.stopPropagation();
                              deleteCampaign(campaign.id);
                            }}
                            className="p-2 border border-zinc-700 rounded-md transition-colors text-red-400 hover:bg-red-900/20"
                            title="Eliminar campaña"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleCampaign(campaign.id)}
                            className={`p-2 border border-zinc-700 rounded-md transition-colors ${
                              campaign.automationSettings?.isActive
                                ? 'text-red-400 hover:bg-red-900/20'
                                : 'text-green-400 hover:bg-green-900/20'
                            }`}
                            title={campaign.automationSettings?.isActive ? 'Pausar campaña' : 'Activar campaña'}
                          >
                            {campaign.automationSettings?.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-zinc-400">Enviados</p>
                          <p className="text-white font-semibold">{campaign.metrics?.sent || 0}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400">Abiertos</p>
                          <p className="text-white font-semibold">{campaign.metrics?.opened || 0} ({campaign.metrics?.openRate || 0}%)</p>
                        </div>
                        <div>
                          <p className="text-zinc-400">Clicks</p>
                          <p className="text-white font-semibold">{campaign.metrics?.clicked || 0} ({campaign.metrics?.clickRate || 0}%)</p>
                        </div>
                        <div>
                          <p className="text-zinc-400">ROI</p>
                          {editingROI === campaign.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={tempROI}
                                onChange={(e) => setTempROI(e.target.value)}
                                className="w-20 px-2 py-1 text-sm bg-zinc-800 border border-zinc-600 rounded text-white focus:outline-none focus:border-white"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                              />
                              <button
                                onClick={() => saveROI(campaign.id)}
                                className="p-1 text-green-400 hover:bg-green-900/20 rounded"
                                title="Guardar ROI"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditingROI}
                                className="p-1 text-red-400 hover:bg-red-900/20 rounded"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <p className="text-white font-semibold">${campaign.metrics?.roi || 0}</p>
                              <button
                                onClick={() => startEditingROI(campaign.id, campaign.metrics?.roi || 0)}
                                className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"
                                title="Editar ROI manualmente"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              {/* Mostrar indicador si es ROI manual */}
                              {campaign.metrics?.manualROI !== undefined && (
                                <span 
                                  className="text-xs text-blue-400 cursor-pointer hover:text-blue-300"
                                  title="ROI manual - Click para volver al cálculo automático"
                                  onClick={() => removeManualROI(campaign.id)}
                                >
                                  (manual)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm text-zinc-400 mb-1">
                          <span>Progreso A/B Test</span>
                          <span>{campaign.abTestProgress}%</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div 
                            className="bg-white h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${campaign.abTestProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4 mt-6">
            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Emails Enviados</p>
                    <p className="text-white text-2xl font-bold">{analytics.totalSent}</p>
                  </div>
                  <Mail className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Tasa de Apertura</p>
                    <p className="text-white text-2xl font-bold">{analytics.avgOpenRate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Tasa de Clicks</p>
                    <p className="text-white text-2xl font-bold">{analytics.avgClickRate.toFixed(1)}%</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">ROI Total</p>
                    <p className="text-white text-2xl font-bold">${analytics.totalROI}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Gestión de Contactos */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Gestión de Contactos</h3>
                    <p className="text-zinc-400">Administra tu base de datos de contactos</p>
                  </div>
                  <button
                    onClick={() => setShowContactsModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Subir Contactos
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-zinc-400 text-sm">Total Contactos</p>
                        <p className="text-white text-xl font-bold">{contactsCount}</p>
                      </div>
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-zinc-400 text-sm">Contactos Activos</p>
                        <p className="text-white text-xl font-bold">{contactsCount}</p>
                      </div>
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-zinc-400 text-sm">Nuevos (30 días)</p>
                        <p className="text-white text-xl font-bold">0</p>
                      </div>
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendario de Envíos */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Calendario de Envíos</h3>
                <p className="text-zinc-400 mb-4">Historial detallado de emails enviados</p>
                
                {/* Resumen Diario */}
                {analytics.dailySummary && analytics.dailySummary.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-white mb-3">Resumen por Día</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {analytics.dailySummary.slice(0, 7).map((day, index) => (
                        <div key={index} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                          <div className="text-sm font-medium text-white">{new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                          <div className="text-xs text-zinc-400 mt-1">
                            <div>📧 {day.totalSent} enviados</div>
                            <div>👁️ {day.totalOpened} abiertos</div>
                            <div>🖱️ {day.totalClicked} clicks</div>
                            {day.campaigns.length > 0 && (
                              <div className="mt-1 text-xs text-zinc-500">
                                Campañas: {day.campaigns.slice(0, 2).join(', ')}
                                {day.campaigns.length > 2 && ` +${day.campaigns.length - 2} más`}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Historial Detallado */}
                {analytics.detailedHistory && analytics.detailedHistory.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-white mb-3">Envíos Recientes</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {analytics.detailedHistory.slice(0, 20).map((email, index) => (
                        <div key={index} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{email.subject}</div>
                              <div className="text-xs text-zinc-400 mt-1">
                                Para: {email.recipientEmail}
                              </div>
                              <div className="text-xs text-zinc-500 mt-1">
                                {new Date(email.sentAt).toLocaleString('es-ES')}
                              </div>
                              {email.campaignName && (
                                <div className="text-xs text-zinc-500">
                                  Campaña: {email.campaignName}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                email.status === 'opened' ? 'bg-green-900 text-green-300' :
                                email.status === 'clicked' ? 'bg-blue-900 text-blue-300' :
                                email.status === 'sent' ? 'bg-gray-900 text-gray-300' :
                                email.status === 'bounced' ? 'bg-red-900 text-red-300' :
                                'bg-yellow-900 text-yellow-300'
                              }`}>
                                {email.status === 'sent' ? '📧' :
                                 email.status === 'opened' ? '👁️' :
                                 email.status === 'clicked' ? '🖱️' :
                                 email.status === 'bounced' ? '❌' : '📤'}
                                {email.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(!analytics.detailedHistory || analytics.detailedHistory.length === 0) && (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No hay envíos registrados aún</p>
                    <p className="text-zinc-500 text-sm">Los envíos aparecerán aquí cuando se procesen las campañas</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Insights de IA</h3>
                <p className="text-zinc-400 mb-4">Análisis automático de tus campañas</p>
                <div className="space-y-4">
                  {analytics.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-zinc-300">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Contexto Empresarial */}
            <BusinessContextConfig />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4 mt-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Configuración de IA</h3>
                <p className="text-zinc-400 mb-6">Ajusta cómo la IA genera y optimiza tus campañas</p>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="api-key" className="block text-sm font-medium text-white">API Key de Gemini</label>
                    <input
                      id="api-key"
                      type="password"
                      value={settings.geminiApiKey}
                      onChange={(e) => setSettings({...settings, geminiApiKey: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      placeholder="Ingresa tu API key de Gemini"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="model" className="block text-sm font-medium text-white">Modelo de IA</label>
                    <select
                      id="model"
                      value={settings.model}
                      onChange={(e) => setSettings({...settings, model: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    >
                      <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                      <option value="gemini-pro">Gemini Pro</option>
                      <option value="gemini-pro-vision">Gemini Pro Vision</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="temperature" className="block text-sm font-medium text-white">Creatividad (Temperature)</label>
                    <input
                      id="temperature"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="auto-optimize"
                      type="checkbox"
                      checked={settings.autoOptimize}
                      onChange={(e) => setSettings({...settings, autoOptimize: e.target.checked})}
                      className="w-4 h-4 text-white bg-zinc-800 border-zinc-700 rounded focus:ring-white focus:ring-2"
                    />
                    <label htmlFor="auto-optimize" className="text-white">Optimización automática</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="ab-testing"
                      type="checkbox"
                      checked={settings.abTesting}
                      onChange={(e) => setSettings({...settings, abTesting: e.target.checked})}
                      className="w-4 h-4 text-white bg-zinc-800 border-zinc-700 rounded focus:ring-white focus:ring-2"
                    />
                    <label htmlFor="ab-testing" className="text-white">A/B Testing automático</label>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="test-email" className="block text-sm font-medium text-white">Correo de Prueba</label>
                    <input
                      id="test-email"
                      type="email"
                      value={settings.testEmail}
                      onChange={(e) => setSettings({...settings, testEmail: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      placeholder="correo@ejemplo.com"
                    />
                    <p className="text-xs text-zinc-400">Correo para recibir copias de prueba de las campañas</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-percentage" className="block text-sm font-medium text-white">Porcentaje de Contactos (%)</label>
                    <input
                      id="contact-percentage"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.contactPercentage}
                      onChange={(e) => setSettings({...settings, contactPercentage: parseInt(e.target.value) || 100})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                    <p className="text-xs text-zinc-400">Porcentaje de contactos a los que enviar la campaña (para pruebas rápidas)</p>
                  </div>

                  <button 
                    onClick={saveSettings} 
                    className="w-full bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Configuración
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Nueva Campaña de Email Marketing</h3>
              <p className="text-zinc-400 mb-6">Crea una campaña profesional con herramientas de IA integradas</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="campaign-name" className="block text-sm font-medium text-white">Nombre de la Campaña</label>
                  <input
                    id="campaign-name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Ej: Campaña de Bienvenida"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="campaign-description" className="block text-sm font-medium text-white">Descripción y Objetivo</label>
                  <textarea
                    id="campaign-description"
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Ej: Generar leads para consultoría de marketing digital. Objetivo: conseguir 10 consultas por semana de empresas que buscan mejorar su ROI..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="campaign-business-type" className="block text-sm font-medium text-white">Tipo de Negocio</label>
                    <select
                      id="campaign-business-type"
                      value={newCampaign.businessType || ''}
                      onChange={(e) => setNewCampaign({...newCampaign, businessType: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="consultoria">Consultoría</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="saas">Software/SaaS</option>
                      <option value="servicios">Servicios Profesionales</option>
                      <option value="educacion">Educación/Cursos</option>
                      <option value="inmobiliaria">Inmobiliaria</option>
                      <option value="salud">Salud/Bienestar</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="campaign-goal" className="block text-sm font-medium text-white">Objetivo Principal</label>
                    <select
                      id="campaign-goal"
                      value={newCampaign.goal || ''}
                      onChange={(e) => setNewCampaign({...newCampaign, goal: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    >
                      <option value="">Seleccionar objetivo</option>
                      <option value="leads">Generar Leads</option>
                      <option value="ventas">Aumentar Ventas</option>
                      <option value="engagement">Mejorar Engagement</option>
                      <option value="retencion">Retener Clientes</option>
                      <option value="awareness">Aumentar Awareness</option>
                      <option value="educacion">Educar Audiencia</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="campaign-frequency" className="block text-sm font-medium text-white">Frecuencia de Envío</label>
                  <select
                    id="campaign-frequency"
                    value={newCampaign.frequency}
                    onChange={(e) => setNewCampaign({...newCampaign, frequency: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                {/* Configuración de Horarios */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-white flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Configuración de Horarios
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="send-time" className="block text-sm font-medium text-white">Hora de Envío</label>
                      <input
                        id="send-time"
                        type="time"
                        value={newCampaign.sendTime}
                        onChange={(e) => setNewCampaign({...newCampaign, sendTime: e.target.value})}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="timezone" className="block text-sm font-medium text-white">Zona Horaria</label>
                      <select
                        id="timezone"
                        value={newCampaign.timezone}
                        onChange={(e) => setNewCampaign({...newCampaign, timezone: e.target.value})}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Europe/Madrid">Madrid (GMT+1)</option>
                        <option value="Europe/London">Londres (GMT+0)</option>
                        <option value="America/New_York">Nueva York (GMT-5)</option>
                        <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                        <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                        <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Días de Envío</label>
                    <div className="grid grid-cols-7 gap-2">
                      {[
                        { key: 'monday', label: 'L' },
                        { key: 'tuesday', label: 'M' },
                        { key: 'wednesday', label: 'X' },
                        { key: 'thursday', label: 'J' },
                        { key: 'friday', label: 'V' },
                        { key: 'saturday', label: 'S' },
                        { key: 'sunday', label: 'D' }
                      ].map((day) => (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => {
                            const isSelected = newCampaign.sendDays.includes(day.key);
                            if (isSelected) {
                              setNewCampaign({
                                ...newCampaign,
                                sendDays: newCampaign.sendDays.filter(d => d !== day.key)
                              });
                            } else {
                              setNewCampaign({
                                ...newCampaign,
                                sendDays: [...newCampaign.sendDays, day.key]
                              });
                            }
                          }}
                          className={`p-2 rounded-md text-sm font-medium transition-colors ${
                            newCampaign.sendDays.includes(day.key)
                              ? 'bg-blue-600 text-white'
                              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400">Selecciona los días en los que se pueden enviar emails</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        id="pause-weekends"
                        type="checkbox"
                        checked={newCampaign.pauseWeekends}
                        onChange={(e) => setNewCampaign({...newCampaign, pauseWeekends: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="pause-weekends" className="text-sm text-white">Pausar fines de semana</label>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="max-daily-emails" className="block text-sm font-medium text-white">Máx. emails/día</label>
                      <input
                        id="max-daily-emails"
                        type="number"
                        min="1"
                        max="1000"
                        value={newCampaign.maxDailyEmails}
                        onChange={(e) => setNewCampaign({...newCampaign, maxDailyEmails: parseInt(e.target.value) || 100})}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="campaign-segment" className="block text-sm font-medium text-white">Segmento de Audiencia</label>
                  <select
                    id="campaign-segment"
                    value={newCampaign.segment}
                    onChange={(e) => setNewCampaign({...newCampaign, segment: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  >
                    <option value="all">Todos los contactos</option>
                    <option value="new">Nuevos suscriptores</option>
                    <option value="active">Usuarios activos</option>
                    <option value="inactive">Usuarios inactivos</option>
                  </select>
                </div>

                {/* Herramientas de IA */}
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/50 rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-white flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-blue-400" />
                    Herramientas de IA
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          id="enable-ai"
                          type="checkbox"
                          checked={newCampaign.aiEnabled}
                          onChange={(e) => setNewCampaign({...newCampaign, aiEnabled: e.target.checked})}
                          className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label htmlFor="enable-ai" className="text-white font-medium">Escritor IA</label>
                      </div>
                      <p className="text-xs text-zinc-400">Genera automáticamente contenido personalizado para cada email basado en tu negocio y objetivos</p>
                    </div>
                    
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          id="enable-ab"
                          type="checkbox"
                          checked={newCampaign.abTestEnabled}
                          onChange={(e) => setNewCampaign({...newCampaign, abTestEnabled: e.target.checked})}
                          className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label htmlFor="enable-ab" className="text-white font-medium">A/B Testing IA</label>
                      </div>
                      <p className="text-xs text-zinc-400">La IA crea automáticamente variantes de tus emails y optimiza el rendimiento en tiempo real</p>
                    </div>
                  </div>
                  
                  {newCampaign.aiEnabled && (
                    <div className="bg-zinc-800/30 border border-zinc-600 rounded-lg p-3 space-y-3">
                      <h5 className="text-sm font-medium text-white">Configuración del Escritor IA</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-zinc-300">Tono de Comunicación</label>
                          <select
                            value={newCampaign.aiTone || 'professional'}
                            onChange={(e) => setNewCampaign({...newCampaign, aiTone: e.target.value})}
                            className="w-full px-2 py-1 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="professional">Profesional</option>
                            <option value="friendly">Amigable</option>
                            <option value="casual">Casual</option>
                            <option value="formal">Formal</option>
                            <option value="persuasive">Persuasivo</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-zinc-300">Creatividad IA</label>
                          <select
                            value={newCampaign.aiCreativity || 'balanced'}
                            onChange={(e) => setNewCampaign({...newCampaign, aiCreativity: e.target.value})}
                            className="w-full px-2 py-1 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="conservative">Conservador</option>
                            <option value="balanced">Equilibrado</option>
                            <option value="creative">Creativo</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="campaign-test-email" className="block text-sm font-medium text-white">Correo de Prueba (Opcional)</label>
                  <input
                    id="campaign-test-email"
                    type="email"
                    value={newCampaign.testEmail}
                    onChange={(e) => setNewCampaign({...newCampaign, testEmail: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="correo@ejemplo.com"
                  />
                  <p className="text-xs text-zinc-400">Deja vacío para usar el correo de configuración global</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="campaign-contact-percentage" className="block text-sm font-medium text-white">Porcentaje de Contactos (%)</label>
                  <input
                    id="campaign-contact-percentage"
                    type="number"
                    min="1"
                    max="100"
                    value={newCampaign.contactPercentage}
                    onChange={(e) => setNewCampaign({...newCampaign, contactPercentage: parseInt(e.target.value) || 100})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                  <p className="text-xs text-zinc-400">Porcentaje de contactos para envío (útil para pruebas)</p>
                </div>

                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-zinc-700 text-white hover:bg-zinc-800 rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={createCampaign}
                    className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Crear Campaña
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar campaña */}
      {showEditModal && editingCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Editar Campaña</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nombre de la Campaña
                </label>
                <input
                  type="text"
                  value={editingCampaign.name || ''}
                  onChange={(e) => setEditingCampaign({...editingCampaign, name: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-white"
                  placeholder="Nombre de la campaña"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Descripción
                </label>
                <textarea
                  value={editingCampaign.description || ''}
                  onChange={(e) => setEditingCampaign({...editingCampaign, description: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-white"
                  rows={3}
                  placeholder="Descripción de la campaña"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Asunto del Email
                </label>
                <input
                  type="text"
                  value={editingCampaign.subject || ''}
                  onChange={(e) => setEditingCampaign({...editingCampaign, subject: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-white"
                  placeholder="Asunto del email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Contenido del Email
                </label>
                <textarea
                  value={editingCampaign.content || ''}
                  onChange={(e) => setEditingCampaign({...editingCampaign, content: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-white"
                  rows={6}
                  placeholder="Contenido del email"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Frecuencia
                  </label>
                  <select
                    value={editingCampaign.frequency || 'weekly'}
                    onChange={(e) => setEditingCampaign({...editingCampaign, frequency: e.target.value as 'daily' | 'weekly' | 'monthly'})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-white"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Segmento
                  </label>
                  <input
                    type="text"
                    value={editingCampaign.segment || ''}
                    onChange={(e) => setEditingCampaign({...editingCampaign, segment: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-white"
                    placeholder="Segmento de audiencia"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="aiEnabled"
                    checked={editingCampaign.aiEnabled || false}
                    onChange={(e) => setEditingCampaign({...editingCampaign, aiEnabled: e.target.checked})}
                    className="rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="aiEnabled" className="text-sm text-white">
                    Habilitar optimización con IA
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="abTestEnabled"
                    checked={editingCampaign.abTestEnabled || false}
                    onChange={(e) => setEditingCampaign({...editingCampaign, abTestEnabled: e.target.checked})}
                    className="rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="abTestEnabled" className="text-sm text-white">
                    Habilitar pruebas A/B
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCampaign(null);
                }}
                className="px-4 py-2 border border-zinc-700 text-white hover:bg-zinc-800 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={updateCampaign}
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para subir contactos */}
      {showContactsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Subir Contactos</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Sube un archivo CSV con las columnas: email, name (opcional)
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Archivo CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setContactsFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>
              
              {contactsFile && (
                <div className="text-sm text-zinc-400">
                  Archivo seleccionado: {contactsFile.name}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowContactsModal(false);
                  setContactsFile(null);
                }}
                className="px-4 py-2 border border-zinc-700 text-white hover:bg-zinc-800 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleContactsUpload}
                disabled={!contactsFile}
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Subir Contactos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomatedCampaigns;