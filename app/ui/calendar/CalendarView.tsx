'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, Users, MapPin } from 'lucide-react';

interface EventType {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number;
  attendees?: string[];
  location?: string;
  type: 'meeting' | 'call' | 'event' | 'reminder';
}

interface UseLocalStorageReturn<T> {
  data: T[];
  setData: (data: T[]) => void;
  hasChanges: boolean;
  importFromCSV: (event: React.ChangeEvent<HTMLInputElement>) => void;
  exportToCSV: () => void;
}

const useEventsStorage = (): UseLocalStorageReturn<EventType> => {
  const [data, setDataState] = useState<EventType[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('calendar-events');
    if (stored) {
      try {
        setDataState(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored events:', error);
      }
    }
  }, []);

  const setData = (newData: EventType[]) => {
    setDataState(newData);
    localStorage.setItem('calendar-events', JSON.stringify(newData));
    setHasChanges(true);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Título', 'Descripción', 'Fecha', 'Hora', 'Duración', 'Tipo', 'Ubicación', 'Asistentes'];
    const csvContent = [
      headers.join(','),
      ...data.map(event => [
        event.id,
        `"${event.title}"`,
        `"${event.description || ''}"`,
        event.date,
        event.time,
        event.duration,
        event.type,
        `"${event.location || ''}"`,
        `"${event.attendees?.join(';') || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendar-events.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const importedEvents: EventType[] = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',');
            return {
              id: values[0] || `imported-${Date.now()}-${index}`,
              title: values[1]?.replace(/"/g, '') || 'Evento Importado',
              description: values[2]?.replace(/"/g, '') || '',
              date: values[3] || new Date().toISOString().split('T')[0],
              time: values[4] || '09:00',
              duration: parseInt(values[5]) || 60,
              type: (values[6] as EventType['type']) || 'event',
              location: values[7]?.replace(/"/g, '') || '',
              attendees: values[8]?.replace(/"/g, '').split(';').filter(Boolean) || []
            };
          });

        setData([...data, ...importedEvents]);
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Error al importar el archivo CSV');
      }
    };
    reader.readAsText(file);
  };

  return { data, setData, hasChanges, importFromCSV, exportToCSV };
};

const CalendarView: React.FC = () => {
  const { data: events, setData, importFromCSV, exportToCSV, hasChanges: hasUnsavedChanges } = useEventsStorage();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<EventType>>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    type: 'meeting'
  });

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    const eventToSave: EventType = {
      id: editingEvent?.id || Date.now().toString(),
      title: newEvent.title!,
      description: newEvent.description,
      date: newEvent.date!,
      time: newEvent.time!,
      duration: newEvent.duration || 60,
      attendees: newEvent.attendees,
      location: newEvent.location,
      type: newEvent.type as EventType['type'] || 'meeting'
    };

    if (editingEvent) {
      setData(events.map(event => event.id === editingEvent.id ? eventToSave : event));
    } else {
      setData([...events, eventToSave]);
    }

    setShowEventForm(false);
    setEditingEvent(null);
    setNewEvent({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 60,
      type: 'meeting'
    });
  };

  const handleEditEvent = (event: EventType) => {
    setEditingEvent(event);
    setNewEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      setData(events.filter(event => event.id !== eventId));
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Calendar className="text-blue-400" />
              Calendario
            </h1>
            <button
              onClick={() => setShowEventForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus size={20} />
              Nuevo Evento
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar Grid */}
            <div className="lg:col-span-2">
              <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    {selectedDate.toLocaleDateString('es-ES', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h2>
                </div>
                
                {/* Simple day view for selected date */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {selectedDate.toLocaleDateString('es-ES', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </h3>
                  
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map(event => (
                      <div key={event.id} className="bg-zinc-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-zinc-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatTime(event.time)}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-2 text-blue-400 hover:bg-blue-400/20 rounded"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2 text-red-400 hover:bg-red-400/20 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {getEventsForDate(selectedDate).length === 0 && (
                      <p className="text-zinc-400 text-center py-8">
                        No hay eventos para este día
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Form */}
            <div className="lg:col-span-1">
              {showEventForm && (
                <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Título</label>
                      <input
                        type="text"
                        value={newEvent.title || ''}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Fecha</label>
                      <input
                        type="date"
                        value={newEvent.date || ''}
                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Hora</label>
                      <input
                        type="time"
                        value={newEvent.time || ''}
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEvent}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        {editingEvent ? 'Actualizar' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => {
                          setShowEventForm(false);
                          setEditingEvent(null);
                        }}
                        className="flex-1 px-4 py-2 bg-zinc-600 hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
