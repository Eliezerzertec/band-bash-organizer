import { Check, X, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatedIcon } from '@/components/ui/animated-icon';
import { ArrowLeftRight } from 'lucide-react';
import { useSubstitutionRequests, usePendingSubstitutionsCount, useRespondToSubstitution } from '@/hooks/useSubstitutions';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SubstitutionRequests() {
  const { data: requests, isLoading, error } = useSubstitutionRequests();
  const { data: pendingCount = 0 } = usePendingSubstitutionsCount();
  const respondMutation = useRespondToSubstitution();

  const handleRespond = (id: string, status: 'accepted' | 'rejected') => {
    respondMutation.mutate({ id, status });
  };

  const formatEventInfo = (schedule: { title: string; event_date: string; start_time: string } | undefined) => {
    if (!schedule) return { title: '-', dateTime: '-' };
    try {
      const date = format(new Date(schedule.event_date), "d MMM", { locale: ptBR });
      const time = schedule.start_time?.slice(0, 5) || '';
      return { title: schedule.title, dateTime: `${date}, ${time}` };
    } catch {
      return { title: schedule.title, dateTime: '-' };
    }
  };

  // Show only first 3 requests
  const displayRequests = (requests || []).slice(0, 3);

  return (
    <div className="card-elevated p-4 md:p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-3">
          <AnimatedIcon color="warning" animation="wiggle" size="md" className="hidden sm:flex">
            <ArrowLeftRight className="w-5 h-5" />
          </AnimatedIcon>
          <div>
            <h3 className="font-semibold text-foreground">Pedidos de Substituição</h3>
            <p className="text-sm text-muted-foreground">
              <span className="text-warning font-medium">{pendingCount}</span> pendentes
            </p>
          </div>
        </div>
        <button className="text-sm text-primary font-medium hover:underline whitespace-nowrap">
          Ver todos
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-muted/40">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-destructive">Erro ao carregar substituições</p>
        </div>
      )}

      {!isLoading && !error && displayRequests.length === 0 && (
        <div className="text-center py-8">
          <ArrowLeftRight className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum pedido de substituição</p>
        </div>
      )}

      {!isLoading && !error && displayRequests.length > 0 && (
        <div className="space-y-3">
          {displayRequests.map((request) => {
            const eventInfo = formatEventInfo(request.schedule_assignment?.schedule);
            
            return (
              <div 
                key={request.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 md:p-4 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {request.requester?.avatar_url ? (
                      <img 
                        src={request.requester.avatar_url} 
                        alt={request.requester.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground text-sm truncate">
                        {request.requester?.name || 'Usuário'}
                      </span>
                      {request.schedule_assignment?.role_assigned && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {request.schedule_assignment.role_assigned}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {eventInfo.title} • {eventInfo.dateTime}
                    </p>
                    {request.substitute && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Substituto: <span className="text-foreground">{request.substitute.name}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 sm:flex-shrink-0">
                  {request.status === 'pending' ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-9 px-3 text-destructive hover:bg-destructive/10 rounded-xl"
                        onClick={() => handleRespond(request.id, 'rejected')}
                        disabled={respondMutation.isPending}
                      >
                        {respondMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Recusar</span>
                          </>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-9 px-3 bg-success hover:bg-success/90 rounded-xl"
                        onClick={() => handleRespond(request.id, 'accepted')}
                        disabled={respondMutation.isPending}
                      >
                        {respondMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Aceitar</span>
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-semibold",
                      request.status === 'accepted' && "bg-success text-success-foreground",
                      request.status === 'rejected' && "bg-destructive-light text-destructive"
                    )}>
                      {request.status === 'accepted' ? 'Aceito' : 'Recusado'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
