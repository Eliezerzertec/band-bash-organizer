import { 
  UserPlus, 
  Calendar, 
  ArrowLeftRight, 
  CheckCircle, 
  XCircle,
  MessageSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'member_added' | 'schedule_created' | 'sub_request' | 'sub_accepted' | 'sub_rejected' | 'message';
  message: string;
  user: string;
  time: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'sub_accepted',
    message: 'aceitou substituir na escala de domingo',
    user: 'Maria Santos',
    time: '5 min atrás'
  },
  {
    id: '2',
    type: 'schedule_created',
    message: 'Nova escala criada para Culto de Domingo',
    user: 'Sistema',
    time: '1 hora atrás'
  },
  {
    id: '3',
    type: 'sub_request',
    message: 'solicitou substituição para quarta-feira',
    user: 'Carlos Silva',
    time: '2 horas atrás'
  },
  {
    id: '4',
    type: 'member_added',
    message: 'foi adicionado à Equipe Alpha',
    user: 'João Pedro',
    time: '3 horas atrás'
  },
  {
    id: '5',
    type: 'message',
    message: 'enviou mensagem para a Equipe Beta',
    user: 'Pastor João',
    time: '5 horas atrás'
  },
];

const activityIcons = {
  member_added: { icon: UserPlus, color: 'text-primary bg-primary/10' },
  schedule_created: { icon: Calendar, color: 'text-success bg-success/10' },
  sub_request: { icon: ArrowLeftRight, color: 'text-warning bg-warning/10' },
  sub_accepted: { icon: CheckCircle, color: 'text-success bg-success/10' },
  sub_rejected: { icon: XCircle, color: 'text-destructive bg-destructive/10' },
  message: { icon: MessageSquare, color: 'text-accent bg-accent/10' },
};

export function RecentActivity() {
  return (
    <div className="card-elevated p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Atividade Recente</h3>
          <p className="text-sm text-muted-foreground">Últimas ações no sistema</p>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">
          Ver tudo
        </button>
      </div>

      <div className="space-y-4">
        {mockActivities.map((activity) => {
          const { icon: Icon, color } = activityIcons[activity.type];
          
          return (
            <div 
              key={activity.id}
              className="flex items-start gap-3"
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                color
              )}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity.user}</span>{' '}
                  {activity.message}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
