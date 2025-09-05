// Hook para carregar evento atual
import { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description?: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  dateTime: {
    start: string; // ISO string
    end?: string;
  };
  type: 'celebration' | 'meeting' | 'reminder' | 'birthday' | 'anniversary';
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  attendees?: string[]; // IDs dos usuários
  createdBy: string;
}

interface UseCurrentEventReturn {
  currentEvent: Event | null;
  upcomingEvents: Event[];
  loading: boolean;
  error: string | null;
  refreshEvents: () => void;
}

export function useCurrentEvent(): UseCurrentEventReturn {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/family/events/current', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Evento atual (próximo ou em andamento)
        setCurrentEvent(data.current || null);
        
        // Próximos eventos
        setUpcomingEvents(data.upcoming || []);
      } else {
        throw new Error('Erro ao carregar eventos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Fallback com evento mockado
      setCurrentEvent(getMockEvent());
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    // Atualizar eventos a cada 5 minutos
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshEvents = () => {
    fetchEvents();
  };

  return { 
    currentEvent, 
    upcomingEvents, 
    loading, 
    error, 
    refreshEvents 
  };
}

// Evento mockado como fallback
function getMockEvent(): Event {
  // Criar um domingo às 18:30 (próximo domingo)
  const nextSunday = new Date();
  const daysUntilSunday = 7 - nextSunday.getDay();
  nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
  nextSunday.setHours(18, 30, 0, 0);

  return {
    id: 'mock-celebration',
    title: 'CELEBRAÇÃO',
    description: 'Reunião semanal da família',
    location: {
      address: 'Rua 19 de Fevereiro, 96',
      coordinates: {
        lat: -22.9068,
        lng: -43.1729
      }
    },
    dateTime: {
      start: nextSunday.toISOString(),
    },
    type: 'celebration',
    priority: 'high',
    isActive: true,
    attendees: [],
    createdBy: 'family-admin'
  };
}

// Hook para formatação de evento
export function useEventFormatting() {
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    return date.toLocaleDateString('pt-BR', options);
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const start = new Date(event.dateTime.start);
    const end = event.dateTime.end ? new Date(event.dateTime.end) : new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2h default

    if (now < start) {
      return 'upcoming';
    } else if (now >= start && now <= end) {
      return 'ongoing';
    } else {
      return 'ended';
    }
  };

  const getTimeUntilEvent = (dateString: string) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diffMs = eventDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Evento iniciado';
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} dia${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  };

  return {
    formatEventDate,
    formatEventTime,
    getEventStatus,
    getTimeUntilEvent
  };
}

// Hook para ações de evento
export function useEventActions() {
  const openLocation = (location: Event['location']) => {
    if (location.coordinates) {
      const { lat, lng } = location.coordinates;
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      const query = encodeURIComponent(location.address);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(url, '_blank');
    }
  };

  const addToCalendar = (event: Event) => {
    // Gerar link para Google Calendar
    const startDate = new Date(event.dateTime.start);
    const endDate = event.dateTime.end ? new Date(event.dateTime.end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: event.description || '',
      location: event.location.address
    });

    const url = `https://calendar.google.com/calendar/render?${params}`;
    window.open(url, '_blank');
  };

  const shareEvent = async (event: Event) => {
    const shareData = {
      title: event.title,
      text: `${event.title} - ${event.location.address}`,
      url: window.location.href
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback para clipboard
      const text = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      await navigator.clipboard.writeText(text);
      // Mostrar toast de sucesso
    }
  };

  return {
    openLocation,
    addToCalendar,
    shareEvent
  };
}