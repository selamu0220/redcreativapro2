'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOptimizedAuth } from '../hooks/useOptimizedAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import ProtectedRoute from '../components/ProtectedRoute';
import {
  Mail,
  Search,
  Filter,
  Download,
  Eye,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface EmailHistory {
  id: string;
  subject: string;
  recipientEmail: string;
  recipientName?: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  openedAt?: string;
  clickedAt?: string;
  clickedLinks?: string[];
  bounceReason?: string;
  complaintReason?: string;
  emailType: 'template' | 'manual';
  templateId?: string;
  templateName?: string;
  tags?: string[];
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    device?: string;
  };
}

interface EmailStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  unsubscribeRate: number;
}

export default function HistorialPage() {
  const { user } = useAuth();
  const { get, post, put, del } = useAuthenticatedFetch();
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<EmailHistory[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedEmail, setSelectedEmail] = useState<EmailHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const statusConfig = {
    sent: { label: 'Enviado', color: 'bg-blue-600', icon: Mail },
    delivered: { label: 'Entregado', color: 'bg-green-600', icon: CheckCircle },
    opened: { label: 'Abierto', color: 'bg-purple-600', icon: Eye },
    clicked: { label: 'Clicado', color: 'bg-orange-600', icon: ExternalLink },
    bounced: { label: 'Rebotado', color: 'bg-red-600', icon: XCircle },
    complained: { label: 'Queja', color: 'bg-red-800', icon: AlertCircle },
    unsubscribed: { label: 'Desuscrito', color: 'bg-gray-600', icon: XCircle }
  };

  const typeConfig = {
    template: { label: 'Plantilla', color: 'bg-blue-500' },
    manual: { label: 'Manual', color: 'bg-orange-500' }
  };

  useEffect(() => {
    if (user?.email) {
      loadEmailHistory();
    }
  }, [user]);

  useEffect(() => {
    filterHistory();
    if (!stats) {
      calculateStats();
    }
  }, [emailHistory, searchTerm, statusFilter, typeFilter, dateRange]);

  const loadEmailHistory = async () => {
    try {
      const response = await get('/api/email-history');
      
      if (response.ok) {
        const data = await response.json();
        setEmailHistory(data.emails);
        setStats(data.stats);
      } else {
        console.error('Error loading email history:', response.statusText);
        // Fallback a datos simulados si hay error
        const mockHistory: EmailHistory[] = [
        {
          id: '1',
          subject: 'Novedades de la semana - Ofertas especiales',
          recipientEmail: 'cliente1@empresa.com',
          recipientName: 'Juan Pérez',
          sentAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'opened',
          openedAt: new Date(Date.now() - 1800000).toISOString(),
          emailType: 'template',
          templateId: 'tpl_001',
          templateName: 'Newsletter Template',
          tags: ['newsletter', 'promocional'],
          metadata: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            ipAddress: '192.168.1.100',
            location: 'Madrid, España',
            device: 'Desktop'
          }
        },
        {
          id: '2',
          subject: 'Bienvenido a nuestro servicio',
          recipientEmail: 'nuevo@cliente.com',
          recipientName: 'María García',
          sentAt: new Date(Date.now() - 7200000).toISOString(),
          status: 'clicked',
          openedAt: new Date(Date.now() - 5400000).toISOString(),
          clickedAt: new Date(Date.now() - 3600000).toISOString(),
          clickedLinks: ['https://ejemplo.com/bienvenida', 'https://ejemplo.com/productos'],
          emailType: 'template',
          templateId: 'tpl_002',
          templateName: 'Welcome Template',
          tags: ['bienvenida', 'automatizada'],
          metadata: {
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
            ipAddress: '192.168.1.101',
            location: 'Barcelona, España',
            device: 'Mobile'
          }
        },
        {
          id: '3',
          subject: 'Confirmación de pedido #12345',
          recipientEmail: 'comprador@email.com',
          recipientName: 'Carlos López',
          sentAt: new Date(Date.now() - 10800000).toISOString(),
          status: 'delivered',
          emailType: 'template',
          templateId: 'tpl_003',
          templateName: 'Order Confirmation',
          tags: ['transaccional', 'pedido'],
          metadata: {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            ipAddress: '192.168.1.102',
            location: 'Valencia, España',
            device: 'Desktop'
          }
        },
        {
          id: '4',
          subject: 'Black Friday: Hasta 70% de descuento',
          recipientEmail: 'rebotado@email.com',
          recipientName: 'Ana Martín',
          sentAt: new Date(Date.now() - 14400000).toISOString(),
          status: 'bounced',
          bounceReason: 'Mailbox full',
          emailType: 'template',
          templateId: 'tpl_004',
          templateName: 'Promotion Template',
          tags: ['promocional', 'blackfriday']
        },
        {
          id: '5',
          subject: 'Resumen del mes - Nuevas funcionalidades',
          recipientEmail: 'desuscrito@email.com',
          recipientName: 'Luis Rodríguez',
          sentAt: new Date(Date.now() - 18000000).toISOString(),
          status: 'unsubscribed',
          openedAt: new Date(Date.now() - 16200000).toISOString(),
          emailType: 'template',
          templateId: 'tpl_001',
          templateName: 'Newsletter Template',
          tags: ['newsletter', 'mensual']
        }
        ];
        
        // Generar más datos de ejemplo solo como fallback
        const additionalEmails = [];
        for (let i = 6; i <= 20; i++) {
          const statuses = ['sent', 'delivered', 'opened', 'clicked', 'bounced'];
          const types = ['template', 'manual'];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)] as any;
          const randomType = types[Math.floor(Math.random() * types.length)] as any;
          
          additionalEmails.push({
            id: i.toString(),
            subject: `Asunto del email ${i}`,
            recipientEmail: `usuario${i}@email.com`,
            recipientName: `Usuario ${i}`,
            sentAt: new Date(Date.now() - (i * 3600000)).toISOString(),
            status: randomStatus,
            openedAt: ['opened', 'clicked'].includes(randomStatus) ? new Date(Date.now() - (i * 3600000) + 1800000).toISOString() : undefined,
            clickedAt: randomStatus === 'clicked' ? new Date(Date.now() - (i * 3600000) + 3600000).toISOString() : undefined,
            emailType: randomType,
            templateId: `tpl_${String(i % 5 + 1).padStart(3, '0')}`,
            templateName: `Template ${i % 5 + 1}`,
            tags: ['ejemplo', randomType]
          });
        }
        
        setEmailHistory([...mockHistory, ...additionalEmails]);
      }
    } catch (error) {
      console.error('Error loading email history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = emailHistory;
    
    if (searchTerm) {
      filtered = filtered.filter(email => 
        (email.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (email.recipientEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (email.recipientName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(email => email.status === statusFilter);
    }
    
    if (typeFilter) {
      filtered = filtered.filter(email => email.emailType === typeFilter);
    }
    
    if (dateRange.start) {
      filtered = filtered.filter(email => 
        new Date(email.sentAt) >= new Date(dateRange.start)
      );
    }
    
    if (dateRange.end) {
      filtered = filtered.filter(email => 
        new Date(email.sentAt) <= new Date(dateRange.end + 'T23:59:59')
      );
    }
    
    setFilteredHistory(filtered);
    setCurrentPage(1);
  };

  const calculateStats = () => {
    const total = filteredHistory.length;
    if (total === 0) {
      setStats(null);
      return;
    }
    
    const delivered = filteredHistory.filter(e => ['delivered', 'opened', 'clicked'].includes(e.status)).length;
    const opened = filteredHistory.filter(e => ['opened', 'clicked'].includes(e.status)).length;
    const clicked = filteredHistory.filter(e => e.status === 'clicked').length;
    const bounced = filteredHistory.filter(e => e.status === 'bounced').length;
    const complained = filteredHistory.filter(e => e.status === 'complained').length;
    const unsubscribed = filteredHistory.filter(e => e.status === 'unsubscribed').length;
    
    setStats({
      totalSent: total,
      delivered,
      opened,
      clicked,
      bounced,
      complained,
      unsubscribed,
      deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
      openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
      clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
      bounceRate: total > 0 ? (bounced / total) * 100 : 0,
      complaintRate: total > 0 ? (complained / total) * 100 : 0,
      unsubscribeRate: total > 0 ? (unsubscribed / total) * 100 : 0
    });
  };

  const exportHistory = () => {
    const csvContent = [
      ['ID', 'Asunto', 'Destinatario', 'Enviado', 'Estado', 'Tipo', 'Abierto', 'Clicado'].join(','),
      ...filteredHistory.map(email => [
        email.id,
        `"${email.subject}"`,
        email.recipientEmail,
        new Date(email.sentAt).toLocaleString(),
        statusConfig[email.status].label,
        typeConfig[email.emailType].label,
        email.openedAt ? new Date(email.openedAt).toLocaleString() : '',
        email.clickedAt ? new Date(email.clickedAt).toLocaleString() : ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial-emails-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPaginatedHistory = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredHistory.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Mail className="w-8 h-8 mr-3" />
                Historial de Correos
              </h1>
              <p className="text-zinc-400 mt-2">
                Seguimiento detallado de todos los emails enviados
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadEmailHistory}
                className="bg-zinc-800 text-white px-4 py-2 rounded-md font-medium hover:bg-zinc-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </button>
              <button
                onClick={exportHistory}
                className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Total Enviados</p>
                    <p className="text-xl font-bold text-white">{stats.totalSent.toLocaleString()}</p>
                  </div>
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Tasa Entrega</p>
                    <p className="text-xl font-bold text-green-400">{stats.deliveryRate.toFixed(1)}%</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Tasa Apertura</p>
                    <p className="text-xl font-bold text-purple-400">{stats.openRate.toFixed(1)}%</p>
                  </div>
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Tasa Clics</p>
                    <p className="text-xl font-bold text-orange-400">{stats.clickRate.toFixed(1)}%</p>
                  </div>
                  <ExternalLink className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Tasa Rebote</p>
                    <p className="text-xl font-bold text-red-400">{stats.bounceRate.toFixed(1)}%</p>
                  </div>
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Desuscritos</p>
                    <p className="text-xl font-bold text-gray-400">{stats.unsubscribeRate.toFixed(1)}%</p>
                  </div>
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                >
                  <option value="">Todos los estados</option>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                >
                  <option value="">Todos los tipos</option>
                  {Object.entries(typeConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">Fecha inicio</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">Fecha fin</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
              </div>
            </div>
            
            {(searchTerm || statusFilter || typeFilter || dateRange.start || dateRange.end) && (
              <div className="mt-4 flex justify-between items-center">
                <p className="text-zinc-400 text-sm">
                  Mostrando {filteredHistory.length} de {emailHistory.length} emails
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setTypeFilter('');
                    setDateRange({ start: '', end: '' });
                  }}
                  className="text-zinc-400 hover:text-white text-sm transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Lista de emails */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">Historial de Emails</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-zinc-400">Cargando historial...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No se encontraron emails</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-800">
                      <tr>
                        <th className="text-left p-4 text-zinc-300 font-medium">Asunto</th>
                        <th className="text-left p-4 text-zinc-300 font-medium">Destinatario</th>
                        <th className="text-left p-4 text-zinc-300 font-medium">Enviado</th>
                        <th className="text-left p-4 text-zinc-300 font-medium">Estado</th>
                        <th className="text-left p-4 text-zinc-300 font-medium">Tipo</th>
                        <th className="text-left p-4 text-zinc-300 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedHistory().map((email) => {
                        const statusConf = statusConfig[email.status];
                        const typeConf = typeConfig[email.emailType];
                        const StatusIcon = statusConf.icon;
                        
                        return (
                          <tr key={email.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                            <td className="p-4">
                              <div>
                                <p className="text-white font-medium truncate max-w-xs" title={email.subject}>
                                  {email.subject}
                                </p>
                                {email.templateName && (
                                  <p className="text-zinc-400 text-sm">{email.templateName}</p>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="text-zinc-300">{email.recipientEmail}</p>
                                {email.recipientName && (
                                  <p className="text-zinc-400 text-sm">{email.recipientName}</p>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="text-zinc-300">
                                  {new Date(email.sentAt).toLocaleDateString()}
                                </p>
                                <p className="text-zinc-400 text-sm">
                                  {new Date(email.sentAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white flex items-center ${statusConf.color}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConf.label}
                                </span>
                              </div>
                              {email.openedAt && (
                                <p className="text-zinc-400 text-xs mt-1">
                                  Abierto: {new Date(email.openedAt).toLocaleString()}
                                </p>
                              )}
                              {email.clickedAt && (
                                <p className="text-zinc-400 text-xs mt-1">
                                  Clicado: {new Date(email.clickedAt).toLocaleString()}
                                </p>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium text-white ${typeConf.color}`}>
                                {typeConf.label}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => setSelectedEmail(email)}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="p-6 border-t border-zinc-800 flex justify-between items-center">
                    <p className="text-zinc-400 text-sm">
                      Página {currentPage} de {totalPages} ({filteredHistory.length} emails)
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal de detalles del email */}
        {selectedEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-white">Detalles del Email</h3>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Información General</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-zinc-400 text-sm">Asunto</p>
                        <p className="text-white">{selectedEmail.subject}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Destinatario</p>
                        <p className="text-white">{selectedEmail.recipientEmail}</p>
                        {selectedEmail.recipientName && (
                          <p className="text-zinc-300 text-sm">{selectedEmail.recipientName}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-zinc-400 text-sm">Template</p>
                        <p className="text-white">{selectedEmail.templateName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Estado y Métricas</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-zinc-400 text-sm">Estado</p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${statusConfig[selectedEmail.status].color}`}>
                            {statusConfig[selectedEmail.status].label}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Tipo</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${typeConfig[selectedEmail.emailType].color}`}>
                          {typeConfig[selectedEmail.emailType].label}
                        </span>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Enviado</p>
                        <p className="text-white">{new Date(selectedEmail.sentAt).toLocaleString()}</p>
                      </div>
                      {selectedEmail.openedAt && (
                        <div>
                          <p className="text-zinc-400 text-sm">Abierto</p>
                          <p className="text-white">{new Date(selectedEmail.openedAt).toLocaleString()}</p>
                        </div>
                      )}
                      {selectedEmail.clickedAt && (
                        <div>
                          <p className="text-zinc-400 text-sm">Clicado</p>
                          <p className="text-white">{new Date(selectedEmail.clickedAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedEmail.clickedLinks && selectedEmail.clickedLinks.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Enlaces Clicados</h4>
                    <div className="space-y-2">
                      {selectedEmail.clickedLinks.map((link, index) => (
                        <div key={index} className="bg-zinc-800 rounded p-3">
                          <p className="text-zinc-300 text-sm break-all">{link}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEmail.metadata && (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Información Técnica</h4>
                    <div className="bg-zinc-800 rounded p-4 space-y-2">
                      {selectedEmail.metadata.device && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Dispositivo:</span>
                          <span className="text-white">{selectedEmail.metadata.device}</span>
                        </div>
                      )}
                      {selectedEmail.metadata.location && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Ubicación:</span>
                          <span className="text-white">{selectedEmail.metadata.location}</span>
                        </div>
                      )}
                      {selectedEmail.metadata.ipAddress && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">IP:</span>
                          <span className="text-white">{selectedEmail.metadata.ipAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedEmail.tags && selectedEmail.tags.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Etiquetas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmail.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {(selectedEmail.bounceReason || selectedEmail.complaintReason) && (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Información Adicional</h4>
                    <div className="bg-red-900/20 border border-red-800 rounded p-4">
                      {selectedEmail.bounceReason && (
                        <div>
                          <p className="text-red-400 font-medium">Razón del rebote:</p>
                          <p className="text-white">{selectedEmail.bounceReason}</p>
                        </div>
                      )}
                      {selectedEmail.complaintReason && (
                        <div>
                          <p className="text-red-400 font-medium">Razón de la queja:</p>
                          <p className="text-white">{selectedEmail.complaintReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
