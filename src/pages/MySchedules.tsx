import { MainLayout } from '@/components/layout/MainLayout';
import { useCurrentProfile } from '@/hooks/useProfiles';
import { useSchedules, type Schedule } from '@/hooks/useSchedules';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Users, Music } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function MySchedules() {
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: schedules, isLoading: schedulesLoading } = useSchedules();
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  };


  const isLoading = profileLoading || schedulesLoading;

  // Filtrar escalas do membro atual
  const mySchedules = schedules?.filter(schedule => 
    schedule.schedule_assignments?.some(sa => sa.profile_id === profile?.id)
  ) || [];

  // Separar escalas futuras e passadas
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingSchedules = mySchedules.filter(s => parseLocalDate(s.event_date) >= today);
  const pastSchedules = mySchedules.filter(s => parseLocalDate(s.event_date) < today);

  const formatDate = (dateStr: string) => {
    try {
      return format(parseLocalDate(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr?.slice(0, 5) || '';
  };

  const ScheduleCard = ({ schedule }: { schedule: Schedule }) => {
    const assignment = schedule.schedule_assignments?.find((sa) => sa.profile_id === profile?.id);
    
    
    return (
      <div className="border rounded-xl p-5 hover:bg-accent/50 transition-colors space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{schedule.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{schedule.description}</p>
          </div>
          <Badge variant="outline">
            {parseLocalDate(schedule.event_date) >= today ? 'Próxima' : 'Passada'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(schedule.event_date)}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {formatTime(schedule.start_time)}
              {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
            </span>
          </div>

          {schedule.location && (
            <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
              <MapPin className="w-4 h-4" />
              <span>{schedule.location}</span>
            </div>
          )}

          {schedule.church && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Music className="w-4 h-4" />
              <span>{schedule.church.name}</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t space-y-2">
          {assignment?.team && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium">Equipe: {assignment.team.name}</span>
            </div>
          )}

          {assignment?.role_assigned && (
            <div className="text-sm">
              <Badge className="bg-primary/10 text-primary">
                {assignment.role_assigned}
              </Badge>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Total de membros: {schedule.schedule_assignments?.length || 0}
          </div>
        </div>

        {parseLocalDate(schedule.event_date) >= today && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Remocao direta desabilitada. Caso nao possa cumprir esta escala, utilize a tela de substituicoes.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <MainLayout 
      title="Minhas Escalas" 
      subtitle="Visualize suas escalas e compromissos"
    >
      <div className="space-y-8">
        {/* Próximas Escalas */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Próximas Escalas ({upcomingSchedules.length})
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : upcomingSchedules.length === 0 ? (
            <div className="card-elevated p-12 text-center rounded-xl">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma escala próxima agendada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSchedules.map(schedule => (
                <ScheduleCard key={schedule.id} schedule={schedule} />
              ))}
            </div>
          )}
        </div>

        {/* Escalas Passadas */}
        {pastSchedules.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              Escalas Passadas ({pastSchedules.length})
            </h2>

            <div className="space-y-4">
              {pastSchedules.slice(-5).map(schedule => (
                <ScheduleCard key={schedule.id} schedule={schedule} />
              ))}
            </div>

            {pastSchedules.length > 5 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Mostrando 5 de {pastSchedules.length} escalas passadas
              </p>
            )}
          </div>
        )}

        {/* Sem escalas */}
        {!isLoading && mySchedules.length === 0 && (
          <div className="card-elevated p-12 text-center rounded-xl">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma escala encontrada</h3>
            <p className="text-muted-foreground">
              Você será notificado quando for escalado para um culto ou evento
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
