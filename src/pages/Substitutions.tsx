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
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SubRequest {
  id: string;
  requester: {
    name: string;
    avatar: string;
    skill: string;
  };
  targetMember?: {
    name: string;
    avatar: string;
  };
  event: {
    title: string;
    date: string;
    time: string;
  };
  reason?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const mockRequests: SubRequest[] = [
  {
    id: '1',
    requester: {
      name: 'Carlos Silva',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
      skill: 'Guitarra'
    },
    targetMember: {
      name: 'Pedro Costa',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro'
    },
    event: {
      title: 'Culto de Domingo',
      date: '19 Jan 2026',
      time: '19:00'
    },
    reason: 'Viagem de trabalho',
    status: 'pending',
    createdAt: 'Há 2 horas'
  },
  {
    id: '2',
    requester: {
      name: 'Ana Paula',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
      skill: 'Vocal'
    },
    event: {
      title: 'Célula Jovem',
      date: '21 Jan 2026',
      time: '20:00'
    },
    reason: 'Compromisso familiar',
    status: 'pending',
    createdAt: 'Há 5 horas'
  },
  {
    id: '3',
    requester: {
      name: 'Pedro Costa',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
      skill: 'Bateria'
    },
    targetMember: {
      name: 'João Lucas',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao'
    },
    event: {
      title: 'Culto de Quarta',
      date: '15 Jan 2026',
      time: '19:30'
    },
    status: 'accepted',
    createdAt: 'Há 2 dias'
  },
  {
    id: '4',
    requester: {
      name: 'Maria Santos',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      skill: 'Violão'
    },
    event: {
      title: 'Ensaio',
      date: '14 Jan 2026',
      time: '15:00'
    },
    status: 'rejected',
    createdAt: 'Há 3 dias'
  },
];

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

  const filteredRequests = mockRequests.filter(request => 
    filter === 'all' || request.status === filter
  );

  const pendingCount = mockRequests.filter(r => r.status === 'pending').length;

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

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const status = statusConfig[request.status];
            const StatusIcon = status.icon;

            return (
              <div 
                key={request.id}
                className="card-elevated p-6 animate-fade-in"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Requester Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <img 
                      src={request.requester.avatar} 
                      alt={request.requester.name}
                      className="w-12 h-12 rounded-xl bg-muted"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {request.requester.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {request.requester.skill}
                        </span>
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

                  {/* Target Member (if any) */}
                  {request.targetMember && (
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Solicitando:</p>
                        <div className="flex items-center gap-2 mt-1">
                          <img 
                            src={request.targetMember.avatar} 
                            alt={request.targetMember.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm font-medium text-foreground">
                            {request.targetMember.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{request.event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.event.date} às {request.event.time}
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-4">
                    {request.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4" />
                          Recusar
                        </Button>
                        <Button 
                          size="sm"
                          className="gap-2 bg-success hover:bg-success/90"
                        >
                          <Check className="w-4 h-4" />
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
                    {request.createdAt}
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

        {filteredRequests.length === 0 && (
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
