import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Calendar, Clock, MapPin, Music, Users, Building2, FileText, Edit } from 'lucide-react';

import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/hooks/useProfiles';
import { useSchedules } from '@/hooks/useSchedules';
import { ScheduleFormDialog } from '@/components/forms/ScheduleFormDialog';

function parseLocalDate(dateStr: string) {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateStr: string) {
  try {
    return format(parseLocalDate(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr?: string | null) {
  return timeStr ? timeStr.slice(0, 5) : '-';
}

export default function MemberSchedulesAdmin() {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  const { data: member, isLoading: memberLoading } = useProfile(memberId || '');
  const { data: schedules, isLoading: schedulesLoading } = useSchedules();

  const selectedSchedule = useMemo(
    () => schedules?.find((schedule) => schedule.id === selectedScheduleId) || null,
    [schedules, selectedScheduleId]
  );

  const memberAssignments = useMemo(() => {
    if (!memberId || !schedules) return [];

    return schedules
      .flatMap((schedule) => {
        const assignments = (schedule.schedule_assignments || []).filter((assignment) => assignment.profile_id === memberId);
        return assignments.map((assignment) => ({ schedule, assignment }));
      })
      .sort((a, b) => parseLocalDate(a.schedule.event_date).getTime() - parseLocalDate(b.schedule.event_date).getTime());
  }, [memberId, schedules]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingCount = memberAssignments.filter((item) => parseLocalDate(item.schedule.event_date) >= today).length;

  const handleEditSchedule = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    setDialogOpen(true);
  };

  return (
    <MainLayout
      title="Escalas do Membro"
      subtitle={member ? `${member.name} • ${memberAssignments.length} escala(s)` : 'Detalhamento completo de escalas'}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/members')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para membros
          </Button>
          <Badge variant="secondary">Próximas: {upcomingCount}</Badge>
          <Badge variant="outline">Total: {memberAssignments.length}</Badge>
        </div>

        {(memberLoading || schedulesLoading) && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!memberLoading && !member && (
          <div className="card-elevated p-10 text-center text-muted-foreground">
            Membro nao encontrado.
          </div>
        )}

        {!schedulesLoading && member && memberAssignments.length === 0 && (
          <div className="card-elevated p-10 text-center text-muted-foreground">
            Este membro ainda nao possui escalas associadas.
          </div>
        )}

        {!schedulesLoading && memberAssignments.length > 0 && (
          <div className="space-y-4">
            {memberAssignments.map(({ schedule, assignment }) => {
              const isUpcoming = parseLocalDate(schedule.event_date) >= today;

              return (
                <div key={assignment.id} className="card-elevated p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{schedule.title || schedule.event_name || 'Escala'}</h3>
                      {schedule.description && (
                        <p className="text-sm text-muted-foreground mt-1">{schedule.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                        {isUpcoming ? 'Proxima' : 'Concluida'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleEditSchedule(schedule.id)}
                      >
                        <Edit className="h-4 w-4" />
                        Editar escala
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(schedule.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Equipe: {assignment.team?.name || 'Nao definida'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Music className="h-4 w-4" />
                      <span>Instrumento/Funcao: {assignment.role_assigned || assignment.role || 'Nao definido'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
                      <MapPin className="h-4 w-4" />
                      <span>Local: {schedule.location || 'Nao informado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
                      <Building2 className="h-4 w-4" />
                      <span>Igreja: {schedule.church?.name || 'Nao informada'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
                      <FileText className="h-4 w-4" />
                      <span>Observacoes: {schedule.notes || 'Sem observacoes'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ScheduleFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedScheduleId(null);
          }
        }}
        schedule={selectedSchedule}
      />
    </MainLayout>
  );
}
