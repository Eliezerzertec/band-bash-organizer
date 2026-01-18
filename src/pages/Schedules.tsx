import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  team: string;
  status: 'scheduled' | 'confirmed' | 'completed';
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Culto de Domingo',
    date: new Date(2026, 0, 19),
    time: '19:00',
    location: 'Templo Principal',
    team: 'Equipe Alpha',
    status: 'confirmed'
  },
  {
    id: '2',
    title: 'Célula Jovem',
    date: new Date(2026, 0, 21),
    time: '20:00',
    location: 'Salão Social',
    team: 'Equipe Beta',
    status: 'scheduled'
  },
  {
    id: '3',
    title: 'Culto de Quarta',
    date: new Date(2026, 0, 22),
    time: '19:30',
    location: 'Templo Principal',
    team: 'Equipe Gamma',
    status: 'scheduled'
  },
  {
    id: '4',
    title: 'Ensaio Geral',
    date: new Date(2026, 0, 25),
    time: '15:00',
    location: 'Sala de Ensaio',
    team: 'Todas as Equipes',
    status: 'scheduled'
  },
  {
    id: '5',
    title: 'Culto de Domingo',
    date: new Date(2026, 0, 26),
    time: '19:00',
    location: 'Templo Principal',
    team: 'Equipe Beta',
    status: 'scheduled'
  },
];

const statusStyles = {
  scheduled: { bg: 'bg-warning-light', text: 'text-warning', label: 'Agendado' },
  confirmed: { bg: 'bg-success-light', text: 'text-success', label: 'Confirmado' },
  completed: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Concluído' },
};

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function Schedules() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return mockEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <MainLayout 
      title="Escalas" 
      subtitle="Gerencie as escalas de cultos e eventos"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              Lista
            </Button>
            <Button 
              variant={viewMode === 'calendar' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Calendário
            </Button>
          </div>
          <Button className="gap-2 btn-gradient-primary">
            <Plus className="w-4 h-4" />
            Nova Escala
          </Button>
        </div>

        {viewMode === 'list' ? (
          /* List View */
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Evento</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Data/Hora</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Local</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Equipe</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockEvents.map((event) => {
                    const status = statusStyles[event.status];
                    return (
                      <tr 
                        key={event.id}
                        className="border-t border-border table-row-hover cursor-pointer"
                      >
                        <td className="p-4">
                          <span className="font-medium text-foreground">{event.title}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="w-4 h-4" />
                            {event.date.toLocaleDateString('pt-BR')}
                            <Clock className="w-4 h-4 ml-2" />
                            {event.time}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {event.team}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            status.bg, status.text
                          )}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Calendar View */
          <div className="card-elevated p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground capitalize">
                {formatMonth(currentMonth)}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {/* Day Headers */}
              {daysOfWeek.map((day) => (
                <div 
                  key={day}
                  className="bg-muted/50 p-3 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {days.map((date, index) => {
                const events = getEventsForDate(date);
                const isToday = date && date.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "bg-card min-h-[100px] p-2 transition-colors",
                      date && "hover:bg-muted/50 cursor-pointer",
                      !date && "bg-muted/20"
                    )}
                  >
                    {date && (
                      <>
                        <span className={cn(
                          "inline-flex items-center justify-center w-7 h-7 text-sm rounded-full",
                          isToday && "bg-primary text-primary-foreground font-medium"
                        )}>
                          {date.getDate()}
                        </span>
                        <div className="mt-1 space-y-1">
                          {events.slice(0, 2).map((event) => (
                            <div 
                              key={event.id}
                              className="px-2 py-1 rounded text-xs bg-primary/10 text-primary font-medium truncate"
                            >
                              {event.time} {event.title}
                            </div>
                          ))}
                          {events.length > 2 && (
                            <div className="text-xs text-muted-foreground px-2">
                              +{events.length - 2} mais
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
