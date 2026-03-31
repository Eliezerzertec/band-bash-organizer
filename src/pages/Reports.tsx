import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Users, 
  Calendar,
  ArrowLeftRight,
  Music,
  TrendingUp,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGeneralReportSummary, useParticipationByMinistry, useMemberScores, type MemberParticipation } from '@/hooks/useReportsData';
import { useMinistries } from '@/hooks/useMinistries';

type MembersBySkillMap = Record<string, MemberParticipation[]>;

export default function Reports() {
  const navigate = useNavigate();
  const [selectedMinistry, setSelectedMinistry] = useState<string>('all');

  // Hooks para dados reais
  const { data: summary, isLoading: summaryLoading } = useGeneralReportSummary();
  const { data: participation, isLoading: participationLoading } = useParticipationByMinistry(
    selectedMinistry !== 'all' ? selectedMinistry : undefined
  );
  const { data: memberScores, isLoading: scoresLoading } = useMemberScores(
    selectedMinistry !== 'all' ? selectedMinistry : undefined
  );
  const { data: ministries } = useMinistries();

  // Dados por habilidade
  const membersBySkill: MembersBySkillMap = participation?.reduce((acc, member) => {
    if (!acc['Geral']) acc['Geral'] = [];
    acc['Geral'].push(member);
    return acc;
  }, {} as MembersBySkillMap) || {};

  return (
    <MainLayout 
      title="Relatórios" 
      subtitle="Visualize métricas e indicadores do ministério"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3 flex-wrap">
            <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ministério" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Ministérios</SelectItem>
                {ministries?.map((ministry) => (
                  <SelectItem key={ministry.id} value={ministry.id}>
                    {ministry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
            <Button onClick={() => navigate('/reports/detailed')} className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Detalhado
            </Button>
          </div>
        </div>

        {/* Stats Grid - Com dados reais */}
        {summaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-elevated p-6 animate-pulse">
                <div className="h-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total de Membros"
              value={summary.totalMembers.toString()}
              icon={<Users className="w-6 h-6" />}
              variant="primary"
            />
            <StatCard
              title="Cultos Realizados"
              value={summary.totalSchedules.toString()}
              icon={<Calendar className="w-6 h-6" />}
              variant="success"
            />
            <StatCard
              title="Taxa de Presença"
              value={`${summary.averageAttendance}%`}
              icon={<TrendingUp className="w-6 h-6" />}
              variant="accent"
            />
            <StatCard
              title="Substituições Pendentes"
              value={summary.pendingSubstitutions.toString()}
              icon={<ArrowLeftRight className="w-6 h-6" />}
              variant="warning"
            />
          </div>
        ) : null}

        {/* Membros por Desempenho (Escore) */}
        <div className="card-elevated p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg text-foreground">
              Membros por Desempenho
            </h3>
            <p className="text-sm text-muted-foreground">
              Ranking de escore dos membros
            </p>
          </div>

          {scoresLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : memberScores && memberScores.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {memberScores.slice(0, 6).map((member, index) => (
                <div key={member.memberId} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? 'bg-warning/20 text-warning'
                            : index === 1
                            ? 'bg-muted text-muted-foreground'
                            : index === 2
                            ? 'bg-accent/20 text-accent'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.ministryName}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-primary">{member.score}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="bg-info-light/30 p-2 rounded text-center">
                      <p className="text-muted-foreground">Presença</p>
                      <p className="font-semibold">{member.scoreBreakdown.attendance}</p>
                    </div>
                    <div className="bg-success-light/30 p-2 rounded text-center">
                      <p className="text-muted-foreground">Pontualidade</p>
                      <p className="font-semibold">{member.scoreBreakdown.punctuality}</p>
                    </div>
                    <div className="bg-accent/20 p-2 rounded text-center">
                      <p className="text-muted-foreground">Participação</p>
                      <p className="font-semibold">{member.scoreBreakdown.participation}</p>
                    </div>
                    <div className="bg-warning-light/30 p-2 rounded text-center">
                      <p className="text-muted-foreground">Confiabilidade</p>
                      <p className="font-semibold">{member.scoreBreakdown.reliability}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Nenhum membro com escore registrado</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Membros Mais Participativos - Dados Reais */}
        <div className="card-elevated p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg text-foreground">
              Membros Mais Participativos
            </h3>
            <p className="text-sm text-muted-foreground">Ranking de participação</p>
          </div>

          {participationLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : participation && participation.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">#</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Membro</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Escalas</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Presenças</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Taxa</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Subs</th>
                  </tr>
                </thead>
                <tbody>
                  {participation.slice(0, 10).map((member, index) => (
                    <tr key={member.memberId} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? 'bg-warning/20 text-warning'
                              : index === 1
                              ? 'bg-muted text-muted-foreground'
                              : index === 2
                              ? 'bg-accent/20 text-accent'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.ministryName}</p>
                        </div>
                      </td>
                      <td className="p-4 text-center text-foreground font-medium">{member.totalSchedules}</td>
                      <td className="p-4 text-center text-success font-medium">{member.totalPresences}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            member.attendanceRate >= 90
                              ? 'bg-success-light text-success'
                              : member.attendanceRate >= 70
                              ? 'bg-info-light text-info'
                              : 'bg-warning-light text-warning'
                          }`}
                        >
                          {member.attendanceRate}%
                        </span>
                      </td>
                      <td className="p-4 text-center text-foreground">{member.substitutionRequests}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Nenhum membro com participação registrada</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
