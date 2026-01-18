import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
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
import { useSubstitutionRequests, usePendingSubstitutionsCount, useRespondToSubstitution } from '@/hooks/useSubstitutions';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  
  const { data: pendingCount = 0 } = usePendingSubstitutionsCount();
  const { data: requests, isLoading, error } = useSubstitutionRequests(filter === 'all' ? undefined : filter);
  const respondMutation = useRespondToSubstitution();

  const handleRespond = (id: string, status: 'accepted' | 'rejected') => {
    respondMutation.mutate({ id, status });
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
                      {request.status === 'pending' ? (
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
                    {isAdmin && request.status === 'pending' && (
                      <span className="text-xs text-warning font-medium">
                        Aguardando resposta
                      </span>
                    )}
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
