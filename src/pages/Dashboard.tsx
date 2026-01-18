import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { MembersChart } from '@/components/dashboard/MembersChart';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { SubstitutionRequests } from '@/components/dashboard/SubstitutionRequests';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Calendar, 
  Music, 
  ArrowLeftRight,
  Church,
  UsersRound,
  MessageSquare
} from 'lucide-react';

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  return (
    <MainLayout 
      title={`Olá, ${user?.name?.split(' ')[0]}!`}
      subtitle="Bem-vindo ao painel de gestão do ministério de louvor"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {isAdmin ? (
            <>
              <StatCard
                title="Total de Membros"
                value="48"
                change={12}
                icon={<Users className="w-6 h-6" />}
                variant="primary"
                animation="float"
              />
              <StatCard
                title="Próximos Cultos"
                value="8"
                icon={<Calendar className="w-6 h-6" />}
                variant="success"
                animation="bounce"
              />
              <StatCard
                title="Equipes Ativas"
                value="6"
                change={2}
                icon={<UsersRound className="w-6 h-6" />}
                variant="accent"
                animation="pulse"
              />
              <StatCard
                title="Substituições Pendentes"
                value="3"
                change={-15}
                icon={<ArrowLeftRight className="w-6 h-6" />}
                variant="warning"
                animation="wiggle"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Minhas Escalas"
                value="5"
                icon={<Calendar className="w-6 h-6" />}
                variant="primary"
                animation="float"
              />
              <StatCard
                title="Próximo Culto"
                value="Dom, 19h"
                icon={<Music className="w-6 h-6" />}
                variant="success"
                animation="bounce"
              />
              <StatCard
                title="Pedidos Pendentes"
                value="1"
                icon={<ArrowLeftRight className="w-6 h-6" />}
                variant="warning"
                animation="wiggle"
              />
              <StatCard
                title="Mensagens"
                value="3"
                icon={<MessageSquare className="w-6 h-6" />}
                variant="accent"
                animation="pulse"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Takes 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <UpcomingEvents />
            <PerformanceChart />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
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
