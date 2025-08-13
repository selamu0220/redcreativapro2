'use client';

import React, { useState, useEffect } from 'react';
import { Save, Building, Target, MessageSquare, TrendingUp, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

interface BusinessContext {
  businessName: string;
  businessType: string;
  services: string;
  targetAudience: string;
  valueProposition: string;
  salesTactics: string;
  contentStrategy: {
    valueToSalesRatio: string; // "4:1" por defecto
    valueEmailTypes: string[];
    salesEmailTypes: string[];
  };
  brandTone: string;
  keyMessages: string[];
}

interface BusinessContextConfigProps {
  onSave?: (context: BusinessContext) => void;
}

const BusinessContextConfig: React.FC<BusinessContextConfigProps> = ({ onSave }) => {
  const { user } = useAuth();
  const { get, post } = useAuthenticatedFetch();
  const [context, setContext] = useState<BusinessContext>({
    businessName: '',
    businessType: '',
    services: '',
    targetAudience: '',
    valueProposition: '',
    salesTactics: '',
    contentStrategy: {
      valueToSalesRatio: '4:1',
      valueEmailTypes: [
        'Consejos y tips útiles',
        'Casos de éxito y testimonios',
        'Contenido educativo',
        'Noticias del sector'
      ],
      salesEmailTypes: [
        'Promociones y ofertas',
        'Lanzamiento de productos',
        'Llamadas a la acción directas'
      ]
    },
    brandTone: 'profesional',
    keyMessages: []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [newKeyMessage, setNewKeyMessage] = useState('');

  useEffect(() => {
    if (user?.email) {
      loadBusinessContext();
    }
  }, [user]);

  const loadBusinessContext = async () => {
    if (!user?.email) return;
    
    try {
      const data = await get('/api/business-context');
      setContext(data);
    } catch (error) {
      console.error('Error loading business context:', error);
    }
  };

  const saveBusinessContext = async () => {
    if (!user?.email) return;
    
    setIsSaving(true);
    try {
      const data = await post('/api/business-context', context);
      alert('Contexto empresarial guardado exitosamente');
      if (onSave) {
        onSave(context);
      }
    } catch (error) {
      console.error('Error saving business context:', error);
      alert('Error al guardar el contexto empresarial');
    } finally {
      setIsSaving(false);
    }
  };

  const addKeyMessage = () => {
    if (newKeyMessage.trim()) {
      setContext(prev => ({
        ...prev,
        keyMessages: [...prev.keyMessages, newKeyMessage.trim()]
      }));
      setNewKeyMessage('');
    }
  };

  const removeKeyMessage = (index: number) => {
    setContext(prev => ({
      ...prev,
      keyMessages: prev.keyMessages.filter((_, i) => i !== index)
    }));
  };

  const addValueEmailType = () => {
    const newType = prompt('Nuevo tipo de email de valor:');
    if (newType?.trim()) {
      setContext(prev => ({
        ...prev,
        contentStrategy: {
          ...prev.contentStrategy,
          valueEmailTypes: [...prev.contentStrategy.valueEmailTypes, newType.trim()]
        }
      }));
    }
  };

  const addSalesEmailType = () => {
    const newType = prompt('Nuevo tipo de email de venta:');
    if (newType?.trim()) {
      setContext(prev => ({
        ...prev,
        contentStrategy: {
          ...prev.contentStrategy,
          salesEmailTypes: [...prev.contentStrategy.salesEmailTypes, newType.trim()]
        }
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-400">Contexto Empresarial para IA</h3>
        </div>
        <p className="text-blue-300 text-sm">
          Configura la información de tu negocio para que la IA genere emails más personalizados y efectivos.
        </p>
      </div>

      {/* Información Básica del Negocio */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Building className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Información del Negocio</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre del Negocio</label>
            <input
              type="text"
              value={context.businessName}
              onChange={(e) => setContext(prev => ({ ...prev, businessName: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-white"
              placeholder="Ej: RedCreativa Pro"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Tipo de Negocio</label>
            <select
              value={context.businessType}
              onChange={(e) => setContext(prev => ({ ...prev, businessType: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-white"
            >
              <option value="">Seleccionar tipo</option>
              <option value="saas">SaaS / Software</option>
              <option value="ecommerce">E-commerce</option>
              <option value="consultoria">Consultoría</option>
              <option value="educacion">Educación</option>
              <option value="salud">Salud y Bienestar</option>
              <option value="marketing">Marketing y Publicidad</option>
              <option value="inmobiliaria">Inmobiliaria</option>
              <option value="finanzas">Finanzas</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-zinc-400 mb-2">Servicios/Productos que Ofreces</label>
          <textarea
            value={context.services}
            onChange={(e) => setContext(prev => ({ ...prev, services: e.target.value }))}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-white h-24 resize-none"
            placeholder="Describe los principales servicios o productos que ofreces..."
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-zinc-400 mb-2">Audiencia Objetivo</label>
          <textarea
            value={context.targetAudience}
            onChange={(e) => setContext(prev => ({ ...prev, targetAudience: e.target.value }))}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-white h-24 resize-none"
            placeholder="Describe tu audiencia ideal: edad, profesión, intereses, problemas que resuelves..."
          />
        </div>
      </div>

      {/* Propuesta de Valor y Ventas */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Estrategia de Ventas</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Propuesta de Valor Única</label>
            <textarea
              value={context.valueProposition}
              onChange={(e) => setContext(prev => ({ ...prev, valueProposition: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-white h-24 resize-none"
              placeholder="¿Qué te hace diferente? ¿Por qué deberían elegirte a ti?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Tácticas de Venta</label>
            <textarea
              value={context.salesTactics}
              onChange={(e) => setContext(prev => ({ ...prev, salesTactics: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-white h-24 resize-none"
              placeholder="Describe tus mejores tácticas de venta, objeciones comunes y cómo las manejas..."
            />
          </div>
        </div>
      </div>

      {/* Estrategia de Contenido */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Estrategia de Contenido</h3>
        </div>
        
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium">Ratio 4:1 (Recomendado)</span>
          </div>
          <p className="text-green-300 text-sm">
            Por cada 4 emails de valor, envía 1 email de venta. Esto construye confianza y autoridad.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-white mb-3">Emails de Valor (4)</h4>
            <div className="space-y-2">
              {context.contentStrategy.valueEmailTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded">
                  <span className="text-zinc-300 text-sm">{type}</span>
                  <button
                    onClick={() => {
                      setContext(prev => ({
                        ...prev,
                        contentStrategy: {
                          ...prev.contentStrategy,
                          valueEmailTypes: prev.contentStrategy.valueEmailTypes.filter((_, i) => i !== index)
                        }
                      }));
                    }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={addValueEmailType}
                className="w-full px-3 py-2 border border-dashed border-zinc-600 rounded text-zinc-400 hover:text-white hover:border-white transition-colors text-sm"
              >
                + Agregar tipo de email de valor
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-white mb-3">Emails de Venta (1)</h4>
            <div className="space-y-2">
              {context.contentStrategy.salesEmailTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded">
                  <span className="text-zinc-300 text-sm">{type}</span>
                  <button
                    onClick={() => {
                      setContext(prev => ({
                        ...prev,
                        contentStrategy: {
                          ...prev.contentStrategy,
                          salesEmailTypes: prev.contentStrategy.salesEmailTypes.filter((_, i) => i !== index)
                        }
                      }));
                    }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={addSalesEmailType}
                className="w-full px-3 py-2 border border-dashed border-zinc-600 rounded text-zinc-400 hover:text-white hover:border-white transition-colors text-sm"
              >
                + Agregar tipo de email de venta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tono de Marca y Mensajes Clave */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tono de Marca y Mensajes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Tono de Marca</label>
            <select
              value={context.brandTone}
              onChange={(e) => setContext(prev => ({ ...prev, brandTone: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-white"
            >
              <option value="profesional">Profesional</option>
              <option value="amigable">Amigable</option>
              <option value="casual">Casual</option>
              <option value="autoritario">Autoritario</option>
              <option value="inspirador">Inspirador</option>
              <option value="divertido">Divertido</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Agregar Mensaje Clave</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newKeyMessage}
                onChange={(e) => setNewKeyMessage(e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-white"
                placeholder="Mensaje importante a incluir"
                onKeyPress={(e) => e.key === 'Enter' && addKeyMessage()}
              />
              <button
                onClick={addKeyMessage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        {context.keyMessages.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-zinc-400 mb-2">Mensajes Clave</h4>
            <div className="flex flex-wrap gap-2">
              {context.keyMessages.map((message, index) => (
                <div key={index} className="flex items-center bg-blue-900/30 border border-blue-800 px-3 py-1 rounded-full">
                  <span className="text-blue-300 text-sm">{message}</span>
                  <button
                    onClick={() => removeKeyMessage(index)}
                    className="ml-2 text-blue-400 hover:text-blue-300"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          onClick={saveBusinessContext}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Guardando...' : 'Guardar Contexto'}</span>
        </button>
      </div>
    </div>
  );
};

export default BusinessContextConfig;