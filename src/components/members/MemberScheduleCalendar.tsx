import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSchedules } from '@/hooks/useSchedules';
import { Profile } from '@/hooks/useProfiles';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MemberScheduleCalendarProps {
  members: Profile[];
}

export function MemberScheduleCalendar({ members }: MemberScheduleCalendarProps) {
  const { data: schedules, isLoading } = useSchedules();

  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseLocalDate(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr?: string) => {
    return timeStr?.slice(0, 5) || '';
  };

  // Filtrar apenas escalas futuras
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {members.map(member => {
        // Filtrar escalas do membro
        const memberSchedules = schedules?.filter(schedule =>
          schedule.schedule_assignments?.some(sa => sa.profile_id === member.id)
        ) || [];

        // Filtrar apenas futuras
        const upcomingSchedules = memberSchedules.filter(s => parseLocalDate(s.event_date) >= today);

        return (
          <Card key={member.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Cabeçalho do Membro */}
              <div className="bg-muted/30 px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold text-primary">{member.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {upcomingSchedules.length} {upcomingSchedules.length === 1 ? 'escala' : 'escalas'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Escalas do Membro */}
              <div className="p-6">
                {upcomingSchedules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma escala agendada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingSchedules.map(schedule => {
                      const assignment = schedule.schedule_assignments?.find(
                        sa => sa.profile_id === member.id
                      );

                      return (
                        <div
                          key={schedule.id}
                          className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">
                                {schedule.title || schedule.event_name}
                              </h4>
                              {schedule.description && (
                                <p className="text-sm text-muted-foreground truncate mt-1">
                                  {schedule.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                              {assignment?.role_assigned && (
                                <Badge variant="outline" className="bg-primary/10">
                                  {assignment.role_assigned}
                                </Badge>
                              )}
                              {assignment?.team?.name && (
                                <Badge variant="secondary" className="gap-1">
                                  <Users className="w-3 h-3" />
                                  {assignment.team.name}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(schedule.event_date)}</span>
                            </div>

                            {schedule.start_time && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {formatTime(schedule.start_time)}
                                  {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                                </span>
                              </div>
                            )}

                            {schedule.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{schedule.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
