import { 
  Calendar, 
  ArrowLeftRight, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react';
import { AnimatedIcon } from '@/components/ui/animated-icon';
import { useRecentActivity } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';

type ColorVariant = 'primary' | 'success' | 'warning' | 'accent' | 'info' | 'purple';
type AnimationType = 'pulse' | 'bounce' | 'spin' | 'wiggle' | 'float' | 'glow' | 'none';

const activityConfig: Record<string, { 
  icon: React.ComponentType<{ className?: string }>; 
  color: ColorVariant;
  animation: AnimationType;
}> = {
  schedule: { icon: Calendar, color: 'success', animation: 'pulse' },
  substitution: { icon: ArrowLeftRight, color: 'warning', animation: 'wiggle' },
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: ArrowLeftRight,
  accepted: CheckCircle,
  rejected: XCircle,
};

export function RecentActivity() {
  const { data: activities, isLoading, error } = useRecentActivity();

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'agora';
      if (diffMins < 60) return `${diffMins} min`;
      if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } catch {
      return '';
    }
  };

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

      {isLoading && (
        <div className="space-y-3 md:space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-2.5 md:gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-destructive">Erro ao carregar atividades</p>
        </div>
      )}

      {!isLoading && !error && (!activities || activities.length === 0) && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
        </div>
      )}

      {!isLoading && !error && activities && activities.length > 0 && (
        <div className="space-y-3 md:space-y-4">
          {activities.map((activity) => {
            const config = activityConfig[activity.type] || activityConfig.schedule;
            const Icon = activity.type === 'substitution' && activity.status 
              ? (statusIcons[activity.status] || config.icon)
              : config.icon;
            
            const color: ColorVariant = activity.type === 'substitution' && activity.status === 'accepted' 
              ? 'success' 
              : activity.type === 'substitution' && activity.status === 'rejected'
                ? 'accent'
                : config.color;
            
            return (
              <div 
                key={activity.id}
                className="flex items-start gap-2.5 md:gap-3 group cursor-pointer"
              >
                <AnimatedIcon 
                  color={color}
                  animation={config.animation}
                  size="sm"
                  className="group-hover:scale-110 transition-transform flex-shrink-0"
                >
                  <Icon className="w-4 h-4" />
                </AnimatedIcon>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-foreground leading-snug">
                    <span className="font-semibold">{'name' in activity ? activity.name : 'Sistema'}</span>{' '}
                    <span className="text-muted-foreground">{activity.description}</span>
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground/70 mt-0.5">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
