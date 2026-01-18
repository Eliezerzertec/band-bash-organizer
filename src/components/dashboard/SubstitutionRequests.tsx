import { Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <div className="card-elevated p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Pedidos de Substituição</h3>
          <p className="text-sm text-muted-foreground">
            <span className="text-warning font-medium">2</span> pendentes
          </p>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">
          Ver todos
        </button>
      </div>

      <div className="space-y-4">
        {mockRequests.map((request) => (
          <div 
            key={request.id}
            className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
          >
            <img 
              src={request.requester.avatar} 
              alt={request.requester.name}
              className="w-10 h-10 rounded-full bg-muted"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground text-sm">
                  {request.requester.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {request.requester.skill}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {request.event} • {request.date}
              </p>
              {request.targetMember && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Solicitando: <span className="text-foreground">{request.targetMember}</span>
                </p>
              )}
            </div>

            {request.status === 'pending' ? (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" className="h-8 w-8 p-0 bg-success hover:bg-success/90">
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                request.status === 'accepted' && "bg-success-light text-success",
                request.status === 'rejected' && "bg-destructive-light text-destructive"
              )}>
                {request.status === 'accepted' ? 'Aceito' : 'Recusado'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
