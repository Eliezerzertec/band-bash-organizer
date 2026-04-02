import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { useSchedules, Schedule } from '@/hooks/useSchedules';

interface ActivityLevel {
  status: 'none' | 'ideal' | 'moderate' | 'high';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  schedulesThisMonth: number;
}

// Calcula escalas do mês atual para um membro a partir dos dados reais
function computeSchedulesThisMonth(schedules: Schedule[] | undefined, memberId: string): number {
  if (!schedules) return 0;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  return schedules.filter(schedule => {
    const [y, m] = schedule.event_date.split('T')[0].split('-').map(Number);
    return y === year && m - 1 === month &&
      schedule.schedule_assignments?.some(sa => sa.profile_id === memberId);
  }).length;
}

// Determina o nível de atividade baseado em escalas por mês
// 0 escalas = azul | 1 escala = verde | 2-3 escalas = laranja | >3 escalas = vermelho
const getActivityLevel = (schedulesThisMonth: number): ActivityLevel => {
  if (schedulesThisMonth === 0) {
    return {
      status: 'none',
      label: 'Nenhuma Escala',
      color: 'text-info dark:text-info-foreground',
      bgColor: 'bg-info-light dark:bg-info/20',
      borderColor: 'border-info',
      icon: <TrendingDown className="w-5 h-5 text-info" />,
      schedulesThisMonth,
    };
  }

  if (schedulesThisMonth === 1) {
    return {
      status: 'ideal',
      label: 'Participação Ideal',
      color: 'text-success dark:text-success-foreground',
      bgColor: 'bg-success-light dark:bg-success/20',
      borderColor: 'border-success',
      icon: <Activity className="w-5 h-5 text-success" />,
      schedulesThisMonth,
    };
  }

  if (schedulesThisMonth <= 3) {
    return {
      status: 'moderate',
      label: 'Muito Ativo',
      color: 'text-warning dark:text-warning-foreground',
      bgColor: 'bg-warning-light dark:bg-warning/20',
      borderColor: 'border-warning',
      icon: <TrendingUp className="w-5 h-5 text-warning" />,
      schedulesThisMonth,
    };
  }

  return {
    status: 'high',
    label: 'Sobrecarregado',
    color: 'text-destructive dark:text-destructive-foreground',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/40',
    icon: <TrendingUp className="w-5 h-5 text-destructive" />,
    schedulesThisMonth,
  };
};

// Componente de barra de status compacta para tabelas
export function ActivityStatusBar({ member }: { member: Profile }) {
  const { data: schedules } = useSchedules();
  const count = useMemo(
    () => computeSchedulesThisMonth(schedules, member.id),
    [schedules, member.id],
  );
  const activity = getActivityLevel(count);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-6 rounded-sm ${
        activity.status === 'none'
          ? 'bg-info'
          : activity.status === 'ideal'
          ? 'bg-success'
          : activity.status === 'moderate'
          ? 'bg-warning'
          : 'bg-destructive'
      }`} />
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${activity.color}`}>
          {activity.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {activity.schedulesThisMonth} escalações este mês
        </span>
      </div>
    </div>
  );
}

export function ActivityMonitor({ member }: { member: Profile }) {
  const { data: schedules } = useSchedules();
  const count = useMemo(
    () => computeSchedulesThisMonth(schedules, member.id),
    [schedules, member.id],
  );
  const activity = getActivityLevel(count);

  return (
    <div className={`${activity.bgColor} border ${activity.borderColor} rounded-lg p-3 flex items-center gap-3`}>
      <div className="flex-shrink-0">
        {activity.icon}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${activity.color}`}>
          {activity.label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {member.name} • {activity.schedulesThisMonth} escalações este mês
        </p>
      </div>
      <div className={`w-2 h-2 rounded-full ${
        activity.status === 'none'
          ? 'bg-info'
          : activity.status === 'ideal'
          ? 'bg-success'
          : activity.status === 'moderate'
          ? 'bg-warning'
          : 'bg-destructive'
      }`} />
    </div>
  );
}

export function ActivityMonitorSection({ members }: { members: Profile[] }) {
  const { data: schedules } = useSchedules();

  const memberData = useMemo(
    () => members.map(m => ({
      member: m,
      activity: getActivityLevel(computeSchedulesThisMonth(schedules, m.id)),
    })),
    [members, schedules],
  );

  const lowParticipation = memberData.filter(({ activity }) => activity.status === 'none');
  const idealParticipation = memberData.filter(({ activity }) => activity.status === 'ideal');
  const highActivity = memberData.filter(({ activity }) =>
    activity.status === 'moderate' || activity.status === 'high',
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated p-4 border-l-4 border-green-500">
          <p className="text-sm text-muted-foreground">Participação Ideal</p>
          <p className="text-2xl font-bold text-green-600">{idealParticipation.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {((idealParticipation.length / members.length) * 100).toFixed(0)}% dos membros
          </p>
        </div>

        <div className="card-elevated p-4 border-l-4 border-blue-500">
          <p className="text-sm text-muted-foreground">Pouco Participativos</p>
          <p className="text-2xl font-bold text-blue-600">{lowParticipation.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {((lowParticipation.length / members.length) * 100).toFixed(0)}% dos membros
          </p>
        </div>

        <div className="card-elevated p-4 border-l-4 border-red-500">
          <p className="text-sm text-muted-foreground">Muito Ativos</p>
          <p className="text-2xl font-bold text-red-600">{highActivity.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {((highActivity.length / members.length) * 100).toFixed(0)}% dos membros
          </p>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Monitor de Atividades</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {members.map((member) => (
            <ActivityMonitor key={member.id} member={member} />
          ))}
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="card-elevated p-4 bg-amber-50 border border-amber-200">
        <p className="text-sm font-medium text-amber-900 mb-2">📋 Gancho para Implementação Futura</p>
        <ul className="text-xs text-amber-800 space-y-1">
          <li>• Integrar dados reais de escalas do banco de dados</li>
          <li>• Substituir mockMemberSchedules com dados da tabela de escalas</li>
          <li>• Considerar frequência de comparecimento nas escalas</li>
          <li>• Integrar dados de substituições realizadas</li>
          <li>• Implementar cálculo dinâmico por período</li>
          <li>• Usar data da última participação como fator secundário</li>
        </ul>
      </div>
    </div>
  );
}
