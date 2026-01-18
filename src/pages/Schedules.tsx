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
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSchedules, useDeleteSchedule, Schedule } from '@/hooks/useSchedules';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScheduleFormDialog } from '@/components/forms/ScheduleFormDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function Schedules() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const { data: schedules, isLoading, error } = useSchedules();
  const deleteSchedule = useDeleteSchedule();

  const handleCreate = () => {
    setSelectedSchedule(null);
    setDialogOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDialogOpen(true);
  };

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
    if (!date || !schedules) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.filter(schedule => schedule.event_date === dateStr);
  };

  const formatMonth = (date: Date) => {
    return format(date, "MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr?.slice(0, 5) || '';
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
          <Button className="gap-2 btn-gradient-primary" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Nova Escala
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="card-elevated p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card-elevated p-12 text-center">
            <p className="text-destructive">Erro ao carregar escalas: {error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!schedules || schedules.length === 0) && (
          <div className="card-elevated p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <CalendarIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma escala encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece criando sua primeira escala.
            </p>
            <Button className="gap-2 btn-gradient-primary" onClick={handleCreate}>
              <Plus className="w-4 h-4" />
              Nova Escala
            </Button>
          </div>
        )}

        {!isLoading && !error && schedules && schedules.length > 0 && viewMode === 'list' && (
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Evento</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Data/Hora</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Local</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Membros</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="border-t border-border table-row-hover">
                      <td className="p-4">
                        <span className="font-medium text-foreground">{schedule.title}</span>
                        {schedule.ministry?.name && <p className="text-sm text-muted-foreground">{schedule.ministry.name}</p>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="w-4 h-4" />
                          {formatDate(schedule.event_date)}
                          <Clock className="w-4 h-4 ml-2" />
                          {formatTime(schedule.start_time)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {schedule.location || 'Não definido'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {schedule.schedule_assignments?.length || 0} escalado(s)
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => handleEdit(schedule)}>
                              <Edit className="w-4 h-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => deleteSchedule.mutate(schedule.id)}
                              disabled={deleteSchedule.isPending}
                            >
                              {deleteSchedule.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isLoading && !error && schedules && schedules.length > 0 && viewMode === 'calendar' && (
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
                              {formatTime(event.start_time)} {event.title}
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
