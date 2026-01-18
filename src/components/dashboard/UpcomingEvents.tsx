import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedIcon } from '@/components/ui/animated-icon';
import { useUpcomingSchedules } from '@/hooks/useSchedules';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function UpcomingEvents() {
  const { data: schedules, isLoading, error } = useUpcomingSchedules(4);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return {
        day: format(date, 'd', { locale: ptBR }),
        month: format(date, 'MMM', { locale: ptBR })
      };
    } catch {
      return { day: '-', month: '-' };
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr?.slice(0, 5) || '';
  };

  return (
    <div className="card-elevated p-4 md:p-5 animate-slide-up">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <AnimatedIcon color="primary" animation="bounce" size="md" className="hidden sm:flex">
            <Calendar className="w-5 h-5" />
          </AnimatedIcon>
          <div>
            <h3 className="font-semibold text-foreground">Próximos Eventos</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Agenda dos próximos cultos</p>
          </div>
        </div>
        <button className="text-sm text-primary font-medium hover:underline whitespace-nowrap">
          Ver tudo
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-muted/40">
              <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-destructive">Erro ao carregar eventos</p>
        </div>
      )}

      {!isLoading && !error && (!schedules || schedules.length === 0) && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum evento próximo</p>
        </div>
      )}

      {!isLoading && !error && schedules && schedules.length > 0 && (
        <div className="space-y-3">
          {schedules.map((schedule) => {
            const { day, month } = formatDate(schedule.event_date);
            const assignmentsCount = schedule.schedule_assignments?.length || 0;
            
            return (
              <div 
                key={schedule.id}
                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-all cursor-pointer group"
              >
                {/* Date Badge */}
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span className="text-[9px] md:text-[10px] text-primary font-semibold uppercase tracking-wide">
                    {month}
                  </span>
                  <span className="text-lg md:text-xl font-bold text-primary">
                    {day}
                  </span>
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm md:text-base truncate">{schedule.title}</h4>
                  <div className="flex items-center gap-2 md:gap-4 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTime(schedule.start_time)}
                    </span>
                    {schedule.location && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground hidden sm:flex">
                        <MapPin className="w-3 h-3" />
                        {schedule.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground hidden md:flex">
                      <Users className="w-3 h-3" />
                      {assignmentsCount} escalado(s)
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={cn(
                  "px-2.5 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold flex-shrink-0 transition-transform group-hover:scale-105",
                  assignmentsCount > 0 ? "bg-success text-success-foreground" : "bg-warning-light text-warning"
                )}>
                  {assignmentsCount > 0 ? 'Confirmado' : 'Pendente'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
