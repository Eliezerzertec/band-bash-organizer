import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar, Clock, MapPin, MoreVertical, Edit, Trash2, Loader2, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSchedules, useDeleteSchedule, Schedule, useRemoveScheduleAssignment } from '@/hooks/useSchedules';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { useCurrentProfile } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScheduleFormDialog } from '@/components/forms/ScheduleFormDialog';
import { toast } from 'sonner';

export default function Schedules() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [assignmentToRemove, setAssignmentToRemove] = useState<any>(null);
  const { data: schedules = [], isLoading, error } = useSchedules();
  const { data: profile } = useCurrentProfile();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const deleteSchedule = useDeleteSchedule();
  const removeAssignment = useRemoveScheduleAssignment();
  const { confirmDelete } = useConfirmDelete();

  const filteredSchedules = schedules.filter(schedule => {
    // Admins see all schedules, members only see their own
    if (!isAdmin && profile?.id) {
      const isMemberAssigned = schedule.schedule_assignments?.some(
        sa => sa.profile_id === profile.id
      );
      if (!isMemberAssigned) return false;
    }
    
    return schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (schedule.description || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreate = () => {
    setSelectedSchedule(null);
    setDialogOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDialogOpen(true);
  };

  const handleRemoveFromSchedule = (assignment: any) => {
    setAssignmentToRemove(assignment);
    setRemoveDialogOpen(true);
  };

  const confirmRemoveFromSchedule = () => {
    if (assignmentToRemove) {
      removeAssignment.mutate(assignmentToRemove.id, {
        onSuccess: () => {
          toast.success('Você foi removido da escala!');
          setRemoveDialogOpen(false);
          setAssignmentToRemove(null);
        },
        onError: (error) => {
          toast.error(`Erro ao remover: ${error.message}`);
        },
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d 'de' MMM yyyy", { locale: ptBR });
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
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar escalas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-modern"
            />
          </div>
          {isAdmin && (
            <Button className="gap-2 btn-gradient-primary" onClick={handleCreate}>
              <Plus className="w-4 h-4" />
              Nova Escala
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="card-elevated p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
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
        {!isLoading && !error && filteredSchedules.length === 0 && (
          <div className="card-elevated p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma escala encontrada
            </h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhuma escala corresponde à sua busca.' : 'Comece criando sua primeira escala.'}
            </p>
          </div>
        )}

        {/* Schedules List */}
        {!isLoading && !error && filteredSchedules.length > 0 && (
          <div className="space-y-3">
            {filteredSchedules.map((schedule) => (
              <div key={schedule.id} className="card-elevated p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {schedule.title}
                    </h3>
                    {schedule.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {schedule.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(schedule.event_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(schedule.start_time)}
                        {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                      </div>
                      {schedule.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {schedule.location}
                        </div>
                      )}
                    </div>
                    {schedule.schedule_assignments && schedule.schedule_assignments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {schedule.schedule_assignments.length} membro{schedule.schedule_assignments.length !== 1 ? 's' : ''} escalado{schedule.schedule_assignments.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => handleEdit(schedule)} className="gap-2">
                            <Edit className="w-4 h-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => confirmDelete(schedule.title, () => deleteSchedule.mutate(schedule.id))}
                            className="gap-2 text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            Deletar
                          </DropdownMenuItem>
                        </>
                      )}
                      {!isAdmin && profile?.id && (
                        <>
                          {schedule.schedule_assignments?.map(assignment => 
                            assignment.profile_id === profile.id && (
                              <DropdownMenuItem 
                                key={assignment.id}
                                onClick={() => handleRemoveFromSchedule(assignment)}
                                className="gap-2 text-destructive"
                              >
                                <LogOut className="w-4 h-4" />
                                Remover da Escala
                              </DropdownMenuItem>
                            )
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ScheduleFormDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        schedule={selectedSchedule} 
      />

      {/* Dialog de Confirmação para Remover da Escala */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover da Escala?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja se remover desta escala? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveFromSchedule}
              disabled={removeAssignment.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeAssignment.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
