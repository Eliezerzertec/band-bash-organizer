import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatedIcon } from '@/components/ui/animated-icon';
import { ArrowLeftRight } from 'lucide-react';

interface SubRequest {
  id: string;
  requester: {
    name: string;
    avatar: string;
    skill: string;
  };
  event: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
  targetMember?: string;
}

const mockRequests: SubRequest[] = [
  {
    id: '1',
    requester: {
      name: 'Carlos Silva',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
      skill: 'Guitarra'
    },
    event: 'Culto de Domingo',
    date: '19 Jan, 19:00',
    status: 'pending'
  },
  {
    id: '2',
    requester: {
      name: 'Ana Paula',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
      skill: 'Vocal'
    },
    event: 'Célula Jovem',
    date: '21 Jan, 20:00',
    status: 'pending',
    targetMember: 'Maria Santos'
  },
  {
    id: '3',
    requester: {
      name: 'Pedro Costa',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
      skill: 'Bateria'
    },
    event: 'Culto de Quarta',
    date: '22 Jan, 19:30',
    status: 'accepted',
    targetMember: 'João Lucas'
  },
];

export function SubstitutionRequests() {
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
              <span className="text-warning font-medium">2</span> pendentes
            </p>
          </div>
        </div>
        <button className="text-sm text-primary font-medium hover:underline whitespace-nowrap">
          Ver todos
        </button>
      </div>

      <div className="space-y-3">
        {mockRequests.map((request) => (
          <div 
            key={request.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 md:p-4 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-all"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img 
                src={request.requester.avatar} 
                alt={request.requester.name}
                className="w-10 h-10 rounded-xl bg-muted flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground text-sm truncate">
                    {request.requester.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {request.requester.skill}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {request.event} • {request.date}
                </p>
                {request.targetMember && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Solicitando: <span className="text-foreground">{request.targetMember}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 sm:flex-shrink-0">
              {request.status === 'pending' ? (
                <>
                  <Button size="sm" variant="ghost" className="h-9 px-3 text-destructive hover:bg-destructive/10 rounded-xl">
                    <X className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Recusar</span>
                  </Button>
                  <Button size="sm" className="h-9 px-3 bg-success hover:bg-success/90 rounded-xl">
                    <Check className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Aceitar</span>
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
        ))}
      </div>
    </div>
  );
}
