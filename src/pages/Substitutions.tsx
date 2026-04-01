import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Check, 
  X, 
  Clock,
  Calendar,
  User,
  Music,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCreateSubstitutionRequest,
  useDeleteSubstitutionRequest,
  useEligibleSubstitutes,
  useMyAssignmentOptions,
  usePendingSubstitutionsCount,
  useRespondToSubstitution,
  useSubstitutionRequests,
} from '@/hooks/useSubstitutions';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCurrentProfile } from '@/hooks/useProfiles';

const statusConfig = {
  pending: { 
    bg: 'bg-warning-light', 
    text: 'text-warning', 
    label: 'Pendente',
    icon: Clock
  },
  accepted: { 
    bg: 'bg-success-light', 
    text: 'text-success', 
    label: 'Aceito',
    icon: Check
  },
  rejected: { 
    bg: 'bg-destructive-light', 
    text: 'text-destructive', 
    label: 'Recusado',
    icon: X
  },
};

export default function Substitutions() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedSubstituteId, setSelectedSubstituteId] = useState('');
  const [reason, setReason] = useState('');
  
  const { data: currentProfile } = useCurrentProfile();
  const { data: pendingCount = 0 } = usePendingSubstitutionsCount();
  const { data: requests, isLoading, error } = useSubstitutionRequests(filter === 'all' ? undefined : filter);
  const respondMutation = useRespondToSubstitution();
  const deleteMutation = useDeleteSubstitutionRequest();
  const createMutation = useCreateSubstitutionRequest();
  const { data: myAssignments = [] } = useMyAssignmentOptions(currentProfile?.id);
  const {
    data: eligibleSubstitutes = [],
    isLoading: eligibleLoading,
  } = useEligibleSubstitutes(selectedAssignmentId || undefined);

  const selectedAssignment = myAssignments.find((assignment) => assignment.id === selectedAssignmentId);
  const substitutesCount = eligibleSubstitutes.length;
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const getCandidateInstrumentLabel = (candidate: (typeof eligibleSubstitutes)[number]) => {
    const roleInTeam = candidate.role_in_team?.trim();
    if (roleInTeam) return roleInTeam;

    const requestedRole = selectedAssignment?.role_assigned?.trim();
    const skills = candidate.profile.musical_skills || [];
    if (requestedRole) {
      const requestedRoleNormalized = normalize(requestedRole);
      const matchedSkill = skills.find((skill) => normalize(skill) === requestedRoleNormalized);
      if (matchedSkill) return matchedSkill;
    }

    return skills[0] || 'Sem funcao';
  };

  const handleCreateRequest = () => {
    if (!currentProfile?.id || !selectedAssignmentId || !selectedSubstituteId) return;

    createMutation.mutate(
      {
        requester_id: currentProfile.id,
        schedule_assignment_id: selectedAssignmentId,
        substitute_id: selectedSubstituteId,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSelectedAssignmentId('');
          setSelectedSubstituteId('');
          setReason('');
        },
      }
    );
  };

  const handleRespond = (id: string, status: 'accepted' | 'rejected') => {
    respondMutation.mutate({ id, status });
  };

  const handleCancel = (id: string) => {
    deleteMutation.mutate(id);
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

  const formatCreatedAt = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return 'Há menos de 1 hora';
      if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <MainLayout 
      title="Substituições" 
      subtitle={`${pendingCount} pedidos pendentes`}
    >
      <div className="space-y-6">
        {!isAdmin && (
          <div className="card-elevated p-5 space-y-4">
            <h3 className="text-base font-semibold">Solicitar Substituicao</h3>
            <p className="text-sm text-muted-foreground">
              Selecione sua escala e escolha um substituto da mesma categoria/função para solicitar a troca.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Minha escala</label>
                <Select value={selectedAssignmentId} onValueChange={(value) => {
                  setSelectedAssignmentId(value);
                  setSelectedSubstituteId('');
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma escala" />
                  </SelectTrigger>
                  <SelectContent>
                    {myAssignments.map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        {(assignment.schedule?.title || 'Escala')} - {formatDate(assignment.schedule?.event_date || '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium flex items-center justify-between gap-2">
                  <span>Substituto (mesma categoria)</span>
                  {selectedAssignmentId && !eligibleLoading && (
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      substitutesCount > 0
                        ? 'bg-success/15 text-success'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {substitutesCount} disponivel{substitutesCount === 1 ? '' : 'eis'}
                    </span>
                  )}
                </label>
                <Select
                  value={selectedSubstituteId}
                  onValueChange={setSelectedSubstituteId}
                  disabled={!selectedAssignmentId || eligibleLoading || eligibleSubstitutes.length === 0}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={
                        !selectedAssignmentId
                          ? 'Selecione uma escala primeiro'
                          : eligibleLoading
                            ? 'Carregando substitutos...'
                            : eligibleSubstitutes.length === 0
                              ? 'Nenhum substituto disponivel'
                              : 'Selecione o substituto'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleLoading && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">Carregando substitutos disponiveis...</div>
                    )}
                    {!eligibleLoading && eligibleSubstitutes.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        Nenhum substituto disponivel para esta escala.
                      </div>
                    )}
                    {!eligibleLoading &&
                      eligibleSubstitutes.map((candidate) => (
                        <SelectItem key={candidate.profile_id} value={candidate.profile_id}>
                          {candidate.profile.name} - {getCandidateInstrumentLabel(candidate)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedAssignmentId && !eligibleLoading && substitutesCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {substitutesCount} substituto{substitutesCount === 1 ? '' : 's'} disponivel{substitutesCount === 1 ? '' : 'eis'} para esta escala.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Motivo (opcional)</label>
              <Textarea
                className="mt-1"
                rows={3}
                placeholder="Explique rapidamente o motivo. Use @nome para mencionar alguem."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dica: quando voce mencionar um membro com @nome, ele recebe notificacao web ao abrir o sistema.
              </p>
            </div>

            <Button
              onClick={handleCreateRequest}
              disabled={!selectedAssignmentId || !selectedSubstituteId || createMutation.isPending}
            >
              {createMutation.isPending ? 'Enviando...' : 'Enviar solicitacao'}
            </Button>
          </div>
        )}

        {/* Informação sobre período */}
        <div className="bg-info-light border border-info rounded-lg p-3 text-sm text-info dark:bg-info/20 dark:text-info-foreground">
          📅 Mostrando todos os pedidos de substituição dos últimos <strong>30 dias</strong>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className={cn(
                filter === status && status === 'pending' && 'bg-warning text-warning-foreground',
                filter === status && status === 'accepted' && 'bg-success text-success-foreground',
                filter === status && status === 'rejected' && 'bg-destructive text-destructive-foreground'
              )}
            >
              {status === 'all' && 'Todos'}
              {status === 'pending' && `Pendentes (${pendingCount})`}
              {status === 'accepted' && 'Aceitos'}
              {status === 'rejected' && 'Recusados'}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elevated p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card-elevated p-12 text-center">
            <p className="text-destructive">Erro ao carregar substituições: {error.message}</p>
          </div>
        )}

        {/* Requests List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {(requests || []).map((request) => {
              const status = statusConfig[request.status];
              const StatusIcon = status.icon;
              const schedule = request.schedule_assignment?.schedule;
              const canRespond = isAdmin || request.substitute?.id === currentProfile?.id;
              const canCancel = isAdmin || request.requester_id === currentProfile?.id;

              return (
                <div 
                  key={request.id}
                  className="card-elevated p-6 animate-fade-in"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Requester Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                        {request.requester?.avatar_url ? (
                          <img 
                            src={request.requester.avatar_url} 
                            alt={request.requester.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {request.requester?.name || 'Usuário'}
                          </span>
                          {request.schedule_assignment?.role_assigned && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {request.schedule_assignment.role_assigned}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Solicitou substituição
                        </p>
                        {request.reason && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Motivo: {request.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Substitute (if any) */}
                    {request.substitute && (
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Substituto:</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-6 h-6 rounded-full bg-primary/10 overflow-hidden">
                              {request.substitute.avatar_url ? (
                                <img 
                                  src={request.substitute.avatar_url} 
                                  alt={request.substitute.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs flex items-center justify-center h-full text-primary font-medium">
                                  {request.substitute.name?.charAt(0)}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {request.substitute.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Event Info */}
                    {schedule && (
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{schedule.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(schedule.event_date)} às {formatTime(schedule.start_time)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status & Actions */}
                    <div className="flex items-center gap-4">
                      {request.status === 'pending' && canRespond ? (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => handleRespond(request.id, 'rejected')}
                            disabled={respondMutation.isPending}
                          >
                            {respondMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Recusar
                          </Button>
                          <Button 
                            size="sm"
                            className="gap-2 bg-success hover:bg-success/90"
                            onClick={() => handleRespond(request.id, 'accepted')}
                            disabled={respondMutation.isPending}
                          >
                            {respondMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Aceitar
                          </Button>
                        </div>
                      ) : (
                        <div className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg",
                          status.bg
                        )}>
                          <StatusIcon className={cn("w-4 h-4", status.text)} />
                          <span className={cn("text-sm font-medium", status.text)}>
                            {status.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {formatCreatedAt(request.created_at)}
                    </span>
                    <div className="flex items-center gap-2">
                      {request.status === 'pending' && !canRespond && (
                        <span className="text-xs text-warning font-medium">Aguardando resposta do substituto</span>
                      )}
                      {request.status === 'pending' && canCancel && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => handleCancel(request.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? 'Cancelando...' : 'Cancelar pedido'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && !error && (requests || []).length === 0 && (
          <div className="card-elevated p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Music className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-muted-foreground">
              Não há pedidos de substituição nesta categoria.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
