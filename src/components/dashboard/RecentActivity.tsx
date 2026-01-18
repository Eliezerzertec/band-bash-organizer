import { 
  UserPlus, 
  Calendar, 
  ArrowLeftRight, 
  CheckCircle, 
  XCircle,
  MessageSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedIcon } from '@/components/ui/animated-icon';

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
    time: '5 min'
  },
  {
    id: '2',
    type: 'schedule_created',
    message: 'Nova escala criada para Culto de Domingo',
    user: 'Sistema',
    time: '1 hora'
  },
  {
    id: '3',
    type: 'sub_request',
    message: 'solicitou substituição para quarta-feira',
    user: 'Carlos Silva',
    time: '2 horas'
  },
  {
    id: '4',
    type: 'member_added',
    message: 'foi adicionado à Equipe Alpha',
    user: 'João Pedro',
    time: '3 horas'
  },
  {
    id: '5',
    type: 'message',
    message: 'enviou mensagem para a Equipe Beta',
    user: 'Pastor João',
    time: '5 horas'
  },
];

type ColorVariant = 'primary' | 'success' | 'warning' | 'accent' | 'info' | 'purple';
type AnimationType = 'pulse' | 'bounce' | 'spin' | 'wiggle' | 'float' | 'glow' | 'none';

const activityConfig: Record<Activity['type'], { 
  icon: React.ComponentType<{ className?: string }>; 
  color: ColorVariant;
  animation: AnimationType;
}> = {
  member_added: { icon: UserPlus, color: 'primary', animation: 'bounce' },
  schedule_created: { icon: Calendar, color: 'success', animation: 'pulse' },
  sub_request: { icon: ArrowLeftRight, color: 'warning', animation: 'wiggle' },
  sub_accepted: { icon: CheckCircle, color: 'success', animation: 'glow' },
  sub_rejected: { icon: XCircle, color: 'accent', animation: 'none' },
  message: { icon: MessageSquare, color: 'info', animation: 'float' },
};

export function RecentActivity() {
  return (
    <div className="card-elevated p-4 md:p-5 animate-slide-up">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Atividade Recente</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Últimas ações</p>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">
          Ver tudo
        </button>
      </div>

      <div className="space-y-3 md:space-y-4">
        {mockActivities.map((activity) => {
          const { icon: Icon, color, animation } = activityConfig[activity.type];
          
          return (
            <div 
              key={activity.id}
              className="flex items-start gap-2.5 md:gap-3 group cursor-pointer"
            >
              <AnimatedIcon 
                color={color}
                animation={animation}
                size="sm"
                className="group-hover:scale-110 transition-transform flex-shrink-0"
              >
                <Icon className="w-4 h-4" />
              </AnimatedIcon>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-foreground leading-snug">
                  <span className="font-semibold">{activity.user}</span>{' '}
                  <span className="text-muted-foreground hidden sm:inline">{activity.message}</span>
                  <span className="text-muted-foreground sm:hidden">{activity.message.slice(0, 25)}...</span>
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground/70 mt-0.5">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
