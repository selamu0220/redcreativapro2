'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import ProtectedRoute from '../components/ProtectedRoute';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  MapPin,
  Video,
  Phone,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'call' | 'email' | 'task';
  status: 'scheduled' | 'completed' | 'cancelled';
  attendees?: string[];
  location?: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  reminderMinutes?: number;

  contactIds?: string[];
  createdAt: string;
  updatedAt: string;
}

interface TimeSlot {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxBookings?: number;
  title?: string;
}

export default function CalendarioPage() {
  const { user } = useAuth();
  const { get, post, put, del } = useAuthenticatedFetch();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'schedule'>('month');
  const [loading, setLoading] = useState(true);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'meeting' as const,
    status: 'scheduled' as const,
    attendees: [] as string[],
    location: '',
    isRecurring: false,
    recurringPattern: 'weekly' as const,
    reminderMinutes: 15
  });

  const [newTimeSlot, setNewTimeSlot] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    isAvailable: true,
    maxBookings: 1,
    title: ''
  });

  const eventTypes = [
    { value: 'meeting', label: 'Reunión', icon: Users, color: 'bg-blue-600' },
    { value: 'call', label: 'Llamada', icon: Phone, color: 'bg-green-600' },
    { value: 'email', label: 'Email', icon: Mail, color: 'bg-purple-600' },
    { value: 'task', label: 'Tarea', icon: CheckCircle, color: 'bg-orange-600' }
  ];

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    if (user?.email) {
      loadEvents();
      loadTimeSlots();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const data = await get('/api/calendar/events');
      setEvents(data.events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    try {
      const data = await get('/api/calendar/time-slots');
      setTimeSlots(data.timeSlots);
    } catch (error) {
      console.error('Error loading time slots:', error);
    }
  };

  const addEvent = async () => {
    try {
      const data = await post('/api/calendar/events', newEvent);
      setEvents([...events, data.event]);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        type: 'meeting',
        status: 'scheduled',
        attendees: [],
        location: '',
        isRecurring: false,
        recurringPattern: 'weekly',
        reminderMinutes: 15
      });
      setShowEventModal(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const updateEvent = async () => {
    if (!editingEvent) return;
    
    try {
      const data = await put('/api/calendar/events', { eventId: editingEvent.id, ...editingEvent });
      const updatedEvents = events.map(event => 
        event.id === editingEvent.id ? data.event : event
      );
      setEvents(updatedEvents);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;
    
    try {
      await del(`/api/calendar/events?eventId=${eventId}`);
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const addTimeSlot = async () => {
    try {
      const data = await post('/api/calendar/time-slots', newTimeSlot);
      setTimeSlots([...timeSlots, data.timeSlot]);
      setNewTimeSlot({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        isAvailable: true,
        maxBookings: 1,
        title: ''
      });
      setShowTimeSlotModal(false);
    } catch (error) {
      console.error('Error adding time slot:', error);
    }
  };

  const updateTimeSlot = async () => {
    if (!editingTimeSlot) return;
    
    try {
      const data = await put('/api/calendar/time-slots', { slotId: editingTimeSlot.id, ...editingTimeSlot });
      const updatedTimeSlots = timeSlots.map(slot => 
        slot.id === editingTimeSlot.id ? data.timeSlot : slot
      );
      setTimeSlots(updatedTimeSlots);
      setEditingTimeSlot(null);
    } catch (error) {
      console.error('Error updating time slot:', error);
    }
  };

  const deleteTimeSlot = async (slotId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este horario?')) return;
    
    try {
      await del(`/api/calendar/time-slots?slotId=${slotId}`);
      setTimeSlots(timeSlots.filter(slot => slot.id !== slotId));
    } catch (error) {
      console.error('Error deleting time slot:', error);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getTimeSlotsForDay = (dayOfWeek: number) => {
    return timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek && slot.isAvailable);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventTypeConfig = (type: string) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  const renderCalendarView = () => {
    if (view === 'schedule') {
      return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Horarios Disponibles</h2>
            <button
              onClick={() => setShowTimeSlotModal(true)}
              className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Horario
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daysOfWeek.map((day, index) => {
              const daySlots = getTimeSlotsForDay(index);
              return (
                <div key={index} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">{day}</h3>
                  {daySlots.length === 0 ? (
                    <p className="text-zinc-400 text-sm">Sin horarios disponibles</p>
                  ) : (
                    <div className="space-y-2">
                      {daySlots.map(slot => (
                        <div key={slot.id} className="bg-zinc-700 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-white font-medium">{slot.title || 'Sin título'}</p>
                              <p className="text-zinc-300 text-sm">
                                {slot.startTime} - {slot.endTime}
                              </p>
                              <p className="text-zinc-400 text-xs">
                                Máx. {slot.maxBookings} reserva(s)
                              </p>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => setEditingTimeSlot(slot)}
                                className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-600 rounded transition-colors"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteTimeSlot(slot.id)}
                                className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-600 rounded transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Vista de calendario mensual
    const days = getDaysInMonth(currentDate);
    
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors text-sm"
              >
                Hoy
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Encabezados de días */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="p-2 text-center text-zinc-400 text-sm font-medium">
                {day}
              </div>
            ))}
          </div>
          
          {/* Días del calendario */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(({ date, isCurrentMonth }, index) => {
              const dayEvents = getEventsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-24 p-2 border border-zinc-800 rounded cursor-pointer transition-colors ${
                    isCurrentMonth ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-900 text-zinc-600'
                  } ${
                    isToday ? 'ring-2 ring-white' : ''
                  } ${
                    isSelected ? 'bg-zinc-700' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonth ? 'text-white' : 'text-zinc-600'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => {
                      const typeConfig = getEventTypeConfig(event.type);
                      return (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded text-white truncate ${typeConfig.color}`}
                          title={`${event.title} (${event.startTime} - ${event.endTime})`}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-zinc-400">
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Calendar className="w-8 h-8 mr-3" />
                Calendario y Horarios
              </h1>
              <p className="text-zinc-400 mt-2">
                Gestiona tus eventos, reuniones y horarios disponibles
              </p>
            </div>
            <div className="flex space-x-3">
              <div className="flex bg-zinc-800 rounded-md">
                {[
                  { key: 'month', label: 'Mes' },
                  { key: 'schedule', label: 'Horarios' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setView(key as any)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      view === key
                        ? 'bg-white text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowEventModal(true)}
                className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Evento
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Eventos Hoy</p>
                  <p className="text-2xl font-bold text-white">
                    {getEventsForDate(new Date()).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Esta Semana</p>
                  <p className="text-2xl font-bold text-green-400">
                    {events.filter(event => {
                      const eventDate = new Date(event.date);
                      const today = new Date();
                      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return eventDate >= weekStart && eventDate <= weekEnd;
                    }).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Horarios Activos</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {timeSlots.filter(slot => slot.isAvailable).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Pendientes</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {events.filter(event => event.status === 'scheduled').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Vista principal */}
          {renderCalendarView()}

          {/* Eventos del día seleccionado */}
          {selectedDate && (
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Eventos para {selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-zinc-400">No hay eventos programados para este día.</p>
              ) : (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map(event => {
                    const typeConfig = getEventTypeConfig(event.type);
                    const IconComponent = typeConfig.icon;
                    
                    return (
                      <div key={event.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded ${typeConfig.color}`}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{event.title}</h4>
                              {event.description && (
                                <p className="text-zinc-400 text-sm mt-1">{event.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-zinc-400">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {event.startTime} - {event.endTime}
                                </span>
                                {event.location && (
                                  <span className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {event.location}
                                  </span>
                                )}
                                <span className={`px-2 py-1 rounded text-xs ${
                                  event.status === 'scheduled' ? 'bg-blue-600 text-white' :
                                  event.status === 'completed' ? 'bg-green-600 text-white' :
                                  'bg-red-600 text-white'
                                }`}>
                                  {event.status === 'scheduled' ? 'Programado' :
                                   event.status === 'completed' ? 'Completado' : 'Cancelado'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingEvent(event)}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteEvent(event.id)}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal para nuevo evento */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">Nuevo Evento</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Título *</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Título del evento"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Descripción del evento"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Fecha *</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">Hora inicio *</label>
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">Hora fin *</label>
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Ubicación</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Ubicación del evento"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Recordatorio (minutos antes)</label>
                  <select
                    value={newEvent.reminderMinutes}
                    onChange={(e) => setNewEvent({...newEvent, reminderMinutes: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  >
                    <option value={0}>Sin recordatorio</option>
                    <option value={5}>5 minutos</option>
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={1440}>1 día</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addEvent}
                  disabled={!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime}
                  className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear Evento
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar evento */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">Editar Evento</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Título *</label>
                  <input
                    type="text"
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    value={editingEvent.description || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Estado</label>
                  <select
                    value={editingEvent.status}
                    onChange={(e) => setEditingEvent({...editingEvent, status: e.target.value as any})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  >
                    <option value="scheduled">Programado</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Ubicación</label>
                  <input
                    type="text"
                    value={editingEvent.location || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={updateEvent}
                  className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para nuevo horario */}
        {showTimeSlotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">Nuevo Horario</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Título</label>
                  <input
                    type="text"
                    value={newTimeSlot.title}
                    onChange={(e) => setNewTimeSlot({...newTimeSlot, title: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Título del horario"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Día de la semana</label>
                  <select
                    value={newTimeSlot.dayOfWeek}
                    onChange={(e) => setNewTimeSlot({...newTimeSlot, dayOfWeek: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  >
                    {daysOfWeek.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">Hora inicio</label>
                    <input
                      type="time"
                      value={newTimeSlot.startTime}
                      onChange={(e) => setNewTimeSlot({...newTimeSlot, startTime: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">Hora fin</label>
                    <input
                      type="time"
                      value={newTimeSlot.endTime}
                      onChange={(e) => setNewTimeSlot({...newTimeSlot, endTime: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Máximo de reservas</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newTimeSlot.maxBookings}
                    onChange={(e) => setNewTimeSlot({...newTimeSlot, maxBookings: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTimeSlotModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addTimeSlot}
                  className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                >
                  Crear Horario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar horario */}
        {editingTimeSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">Editar Horario</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Título</label>
                  <input
                    type="text"
                    value={editingTimeSlot.title || ''}
                    onChange={(e) => setEditingTimeSlot({...editingTimeSlot, title: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Día de la semana</label>
                  <select
                    value={editingTimeSlot.dayOfWeek}
                    onChange={(e) => setEditingTimeSlot({...editingTimeSlot, dayOfWeek: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  >
                    {daysOfWeek.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">Hora inicio</label>
                    <input
                      type="time"
                      value={editingTimeSlot.startTime}
                      onChange={(e) => setEditingTimeSlot({...editingTimeSlot, startTime: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">Hora fin</label>
                    <input
                      type="time"
                      value={editingTimeSlot.endTime}
                      onChange={(e) => setEditingTimeSlot({...editingTimeSlot, endTime: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Máximo de reservas</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingTimeSlot.maxBookings || 1}
                    onChange={(e) => setEditingTimeSlot({...editingTimeSlot, maxBookings: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editAvailable"
                    checked={editingTimeSlot.isAvailable}
                    onChange={(e) => setEditingTimeSlot({...editingTimeSlot, isAvailable: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="editAvailable" className="text-zinc-300 text-sm">Horario disponible</label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingTimeSlot(null)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={updateTimeSlot}
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