import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { MembersChart } from '@/components/dashboard/MembersChart';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { SubstitutionRequests } from '@/components/dashboard/SubstitutionRequests';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { 
  Users, 
  Calendar, 
  Music, 
  ArrowLeftRight,
  UsersRound,
  MessageSquare
} from 'lucide-react';

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <MainLayout 
      title={`Olá, ${user?.name?.split(' ')[0] || 'Usuário'}!`}
      subtitle="Bem-vindo ao painel de gestão do ministério de louvor"
    >
      <div className="space-y-5 md:space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {isAdmin ? (
            <>
              <StatCard
                title="Total de Membros"
                value={isLoading ? '-' : String(stats?.totalMembers || 0)}
                icon={<Users className="w-5 h-5 md:w-6 md:h-6" />}
                variant="primary"
                animation="float"
              />
              <StatCard
                title="Próximos Cultos"
                value={isLoading ? '-' : String(stats?.upcomingSchedules || 0)}
                icon={<Calendar className="w-5 h-5 md:w-6 md:h-6" />}
                variant="success"
                animation="bounce"
              />
              <StatCard
                title="Equipes Ativas"
                value={isLoading ? '-' : String(stats?.totalTeams || 0)}
                icon={<UsersRound className="w-5 h-5 md:w-6 md:h-6" />}
                variant="accent"
                animation="pulse"
              />
              <StatCard
                title="Substituições"
                value={isLoading ? '-' : String(stats?.pendingSubstitutions || 0)}
                icon={<ArrowLeftRight className="w-5 h-5 md:w-6 md:h-6" />}
                variant="warning"
                animation="wiggle"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Minhas Escalas"
                value={isLoading ? '-' : String(stats?.upcomingSchedules || 0)}
                icon={<Calendar className="w-5 h-5 md:w-6 md:h-6" />}
                variant="primary"
                animation="float"
              />
              <StatCard
                title="Total Escalas"
                value={isLoading ? '-' : String(stats?.totalSchedules || 0)}
                icon={<Music className="w-5 h-5 md:w-6 md:h-6" />}
                variant="success"
                animation="bounce"
              />
              <StatCard
                title="Pedidos Pendentes"
                value={isLoading ? '-' : String(stats?.pendingSubstitutions || 0)}
                icon={<ArrowLeftRight className="w-5 h-5 md:w-6 md:h-6" />}
                variant="warning"
                animation="wiggle"
              />
              <StatCard
                title="Equipes"
                value={isLoading ? '-' : String(stats?.totalTeams || 0)}
                icon={<MessageSquare className="w-5 h-5 md:w-6 md:h-6" />}
                variant="accent"
                animation="pulse"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          {/* Left Column - Takes 2 cols on large screens */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6">
            <UpcomingEvents />
            <PerformanceChart />
          </div>

          {/* Right Column */}
          <div className="space-y-5 md:space-y-6">
            <MembersChart />
            <RecentActivity />
          </div>
        </div>

        {/* Substitution Requests - Full Width */}
        <SubstitutionRequests />
      </div>
    </MainLayout>
  );
}
