import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { MembersChart } from '@/components/dashboard/MembersChart';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Users, 
  Calendar,
  ArrowLeftRight,
  Music,
  TrendingUp
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Reports() {
  return (
    <MainLayout 
      title="Relatórios" 
      subtitle="Visualize métricas e indicadores do ministério"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <Select defaultValue="this-month">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">Esta semana</SelectItem>
                <SelectItem value="this-month">Este mês</SelectItem>
                <SelectItem value="last-month">Mês passado</SelectItem>
                <SelectItem value="this-year">Este ano</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ministério" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ministry-1">Ministério Adoração</SelectItem>
                <SelectItem value="ministry-2">Ministério Jovem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Membros"
            value="48"
            change={12}
            icon={<Users className="w-6 h-6" />}
            variant="primary"
          />
          <StatCard
            title="Cultos Realizados"
            value="24"
            change={8}
            icon={<Calendar className="w-6 h-6" />}
            variant="success"
          />
          <StatCard
            title="Taxa de Presença"
            value="92%"
            change={5}
            icon={<TrendingUp className="w-6 h-6" />}
            variant="accent"
          />
          <StatCard
            title="Substituições"
            value="12"
            change={-10}
            icon={<ArrowLeftRight className="w-6 h-6" />}
            variant="warning"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MembersChart />
          <PerformanceChart />
        </div>

        {/* Top Participants */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Membros Mais Participativos</h3>
              <p className="text-sm text-muted-foreground">Ranking de participação no período</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">#</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Membro</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Escalas</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Presenças</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Taxa</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Substituições</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, name: 'Maria Santos', avatar: 'maria', skill: 'Vocal', schedules: 12, presences: 12, subs: 0 },
                  { rank: 2, name: 'Carlos Silva', avatar: 'carlos', skill: 'Guitarra', schedules: 10, presences: 10, subs: 1 },
                  { rank: 3, name: 'Ana Paula', avatar: 'ana', skill: 'Teclado', schedules: 10, presences: 9, subs: 2 },
                  { rank: 4, name: 'João Pedro', avatar: 'joao', skill: 'Bateria', schedules: 8, presences: 8, subs: 0 },
                  { rank: 5, name: 'Julia Mendes', avatar: 'julia', skill: 'Piano', schedules: 8, presences: 7, subs: 1 },
                ].map((member) => (
                  <tr key={member.rank} className="border-t border-border table-row-hover">
                    <td className="p-4">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        member.rank === 1 ? 'bg-warning/20 text-warning' :
                        member.rank === 2 ? 'bg-muted text-muted-foreground' :
                        member.rank === 3 ? 'bg-accent/20 text-accent' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {member.rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} 
                          alt={member.name}
                          className="w-8 h-8 rounded-full bg-muted"
                        />
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.skill}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{member.schedules}</td>
                    <td className="p-4 text-foreground">{member.presences}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (member.presences / member.schedules) >= 0.9 
                          ? 'bg-success-light text-success' 
                          : 'bg-warning-light text-warning'
                      }`}>
                        {Math.round((member.presences / member.schedules) * 100)}%
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{member.subs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
