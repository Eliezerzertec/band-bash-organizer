import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';

interface ActivityLevel {
  status: 'ideal' | 'low' | 'high';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  schedulesThisMonth: number;
}

// Mock data: escalas por mês por membro
// TODO: Integrar com dados reais do banco de dados
const mockMemberSchedules: Record<string, number> = {
  'member-1': 1,    // Ideal
  'member-2': 0,    // Baixo
  'member-3': 2,    // Alto
  'member-4': 1,    // Ideal
  'member-5': 3,    // Alto
};

// Calcula escalas do mês atual para um membro
// TODO: Implementar com dados reais do banco
const getSchedulesThisMonth = (memberId: string): number => {
  return mockMemberSchedules[memberId] || Math.floor(Math.random() * 4);
};

// Determina o nível de atividade baseado em escalas por mês
// Critério: Ideal = 1 vez por mês
const getActivityLevel = (member: Profile): ActivityLevel => {
  const schedulesThisMonth = getSchedulesThisMonth(member.id);
  
  // Critérios:
  // Ideal: 1 escalação por mês (0.5 - 1.5)
  // Baixo: menos de 0.5 escalações por mês
  // Alto: mais de 1.5 escalações por mês
  
  if (schedulesThisMonth < 0.5) {
    return {
      status: 'low',
      label: 'Pouco Participativo',
      color: 'text-info dark:text-info-foreground',
      bgColor: 'bg-info-light dark:bg-info/20',
      borderColor: 'border-info',
      icon: <TrendingDown className="w-5 h-5 text-info" />,
      schedulesThisMonth,
    };
  } else if (schedulesThisMonth >= 0.5 && schedulesThisMonth <= 1.5) {
    return {
      status: 'ideal',
      label: 'Participação Ideal',
      color: 'text-success dark:text-success-foreground',
      bgColor: 'bg-success-light dark:bg-success/20',
      borderColor: 'border-success',
      icon: <Activity className="w-5 h-5 text-success" />,
      schedulesThisMonth,
    };
  } else {
    return {
      status: 'high',
      label: 'Muito Ativo',
      color: 'text-warning dark:text-warning-foreground',
      bgColor: 'bg-warning-light dark:bg-warning/20',
      borderColor: 'border-warning',
      icon: <TrendingUp className="w-5 h-5 text-warning" />,
      schedulesThisMonth,
    };
  }
};

// Componente de barra de status compacta para tabelas
export function ActivityStatusBar({ member }: { member: Profile }) {
  const activity = getActivityLevel(member);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-6 rounded-sm ${
        activity.status === 'ideal' 
          ? 'bg-success' 
          : activity.status === 'low'
          ? 'bg-info'
          : 'bg-warning'
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
  const activity = getActivityLevel(member);

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
        activity.status === 'ideal' 
          ? 'bg-success' 
          : activity.status === 'low'
          ? 'bg-info'
          : 'bg-warning'
      }`} />
    </div>
  );
}

export function ActivityMonitorSection({ members }: { members: Profile[] }) {
  const lowParticipation = members.filter(m => {
    const activity = getActivityLevel(m);
    return activity.status === 'low';
  });

  const idealParticipation = members.filter(m => {
    const activity = getActivityLevel(m);
    return activity.status === 'ideal';
  });

  const highActivity = members.filter(m => {
    const activity = getActivityLevel(m);
    return activity.status === 'high';
  });

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
