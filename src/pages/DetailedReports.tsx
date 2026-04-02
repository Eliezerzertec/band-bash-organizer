import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Download,
  Users,
  Calendar,
  ArrowLeftRight,
  Music,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useParticipationByMinistry,
  useMinistryStats,
  useAccessLogs,
  useSubstitutionStats,
  useMemberScores,
  useGeneralReportSummary,
} from '@/hooks/useReportsData';
import { useMinistries } from '@/hooks/useMinistries';

export default function DetailedReports() {
  const [selectedMinistry, setSelectedMinistry] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks
  const { data: summary, isLoading: summaryLoading } = useGeneralReportSummary();
  const { data: participation, isLoading: participationLoading } = useParticipationByMinistry(
    selectedMinistry !== 'all' ? selectedMinistry : undefined
  );
  const { data: ministryStats, isLoading: ministryStatsLoading } = useMinistryStats(
    selectedMinistry !== 'all' ? selectedMinistry : undefined
  );
  const { data: accessLogs, isLoading: accessLogsLoading } = useAccessLogs();
  const { data: substitutionStats, isLoading: substitutionLoading } = useSubstitutionStats(
    selectedMinistry !== 'all' ? selectedMinistry : undefined
  );
  const { data: memberScores, isLoading: scoresLoading } = useMemberScores(
    selectedMinistry !== 'all' ? selectedMinistry : undefined
  );
  const { data: ministries } = useMinistries();

  // Filtrar dados
  const filteredParticipation = participation?.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredSubstitutions = substitutionStats?.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredScores = memberScores?.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredAccessLogs = accessLogs?.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <MainLayout
      title="Relatórios Detalhados"
      subtitle="Análise completa de dados e indicadores do ministério"
    >
      <div className="space-y-6">
        {/* Header com Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-3 flex-wrap">
            <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por ministério" />
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
            <input
              type="text"
              placeholder="Buscar membro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Resumo Geral */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              title="Ministérios"
              value={summary.totalMinistries.toString()}
              icon={<Music className="w-6 h-6" />}
              variant="accent"
            />
            <StatCard
              title="Taxa de Presença"
              value={`${summary.averageAttendance}%`}
              icon={<TrendingUp className="w-6 h-6" />}
              variant="accent"
            />
            <StatCard
              title="Subst. Pendentes"
              value={summary.pendingSubstitutions.toString()}
              icon={<ArrowLeftRight className="w-6 h-6" />}
              variant="warning"
            />
          </div>
        )}

        {/* Tabs de Relatórios Detalhados */}
        <Tabs defaultValue="participation" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="participation">Participação</TabsTrigger>
            <TabsTrigger value="substitutions">Substituições</TabsTrigger>
            <TabsTrigger value="scores">Avaliações</TabsTrigger>
            <TabsTrigger value="access">Acessos</TabsTrigger>
          </TabsList>

          {/* Tab: Participação por Ministério */}
          <TabsContent value="participation" className="space-y-4">
            <div className="card-elevated p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg text-foreground">
                  Participação e Escalas
                </h3>
                <p className="text-sm text-muted-foreground">
                  Membros ordenados por taxa de presença
                </p>
              </div>

              {participationLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredParticipation.length === 0 ? (
                <Alert variant="default">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Nenhum dado encontrado</AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">#</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Membro
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Ministério
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Escalas
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Presenças
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Ausências
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Taxa
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Substituições
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredParticipation.map((member, index) => (
                        <tr key={member.memberId} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
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
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {member.memberId.slice(0, 8)}</p>
                          </td>
                          <td className="p-4 text-sm text-foreground">{member.ministryName}</td>
                          <td className="p-4 text-center font-medium text-foreground">{member.totalSchedules}</td>
                          <td className="p-4 text-center text-success font-medium">{member.totalPresences}</td>
                          <td className="p-4 text-center text-warning font-medium">{member.totalAbsences}</td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
              )}
            </div>
          </TabsContent>

          {/* Tab: Substituições */}
          <TabsContent value="substitutions" className="space-y-4">
            <div className="card-elevated p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg text-foreground">
                  Estatísticas de Substituição
                </h3>
                <p className="text-sm text-muted-foreground">
                  Membros ordenados por número de solicitações
                </p>
              </div>

              {substitutionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredSubstitutions.length === 0 ? (
                <Alert variant="default">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Nenhuma substituição registrada</AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">#</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Membro
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Ministério
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Criadas
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Aceitas
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Rejeitadas
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Taxa Aceitação
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubstitutions.map((sub, index) => (
                        <tr key={sub.memberId} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-muted/50 text-muted-foreground">
                              {index + 1}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-foreground">{sub.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {sub.memberId.slice(0, 8)}</p>
                          </td>
                          <td className="p-4 text-sm text-foreground">{sub.ministryName}</td>
                          <td className="p-4 text-center font-medium text-foreground">{sub.requestsCreated}</td>
                          <td className="p-4 text-center text-success font-medium">{sub.requestsAccepted}</td>
                          <td className="p-4 text-center text-warning font-medium">{sub.requestsRejected}</td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                sub.acceptanceRate >= 80
                                  ? 'bg-success-light text-success'
                                  : sub.acceptanceRate >= 50
                                  ? 'bg-info-light text-info'
                                  : 'bg-warning-light text-warning'
                              }`}
                            >
                              {sub.acceptanceRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab: Avaliações de membros */}
          <TabsContent value="scores" className="space-y-4">
            <div className="card-elevated p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg text-foreground">
                  Ranking de Avaliações dos Membros
                </h3>
                <p className="text-sm text-muted-foreground">
                  Membros ordenados pela pontuação total
                </p>
              </div>

              {scoresLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredScores.length === 0 ? (
                <Alert variant="default">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Nenhuma avaliação registrada</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {filteredScores.map((score, index) => (
                    <div
                      key={score.memberId}
                      className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
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
                            <p className="font-semibold text-foreground text-lg">{score.name}</p>
                            <p className="text-sm text-muted-foreground">{score.ministryName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary">{score.score}</p>
                          <p className="text-xs text-muted-foreground">
                            {score.rank} de {score.totalRank}
                          </p>
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-info-light/30 p-3 rounded">
                          <p className="text-xs text-muted-foreground">Presença</p>
                          <p className="font-semibold text-foreground">
                            {score.scoreBreakdown.attendance}
                          </p>
                        </div>
                        <div className="bg-success-light/30 p-3 rounded">
                          <p className="text-xs text-muted-foreground">Pontualidade</p>
                          <p className="font-semibold text-foreground">
                            {score.scoreBreakdown.punctuality}
                          </p>
                        </div>
                        <div className="bg-accent/20 p-3 rounded">
                          <p className="text-xs text-muted-foreground">Participação</p>
                          <p className="font-semibold text-foreground">
                            {score.scoreBreakdown.participation}
                          </p>
                        </div>
                        <div className="bg-warning-light/30 p-3 rounded">
                          <p className="text-xs text-muted-foreground">Confiabilidade</p>
                          <p className="font-semibold text-foreground">
                            {score.scoreBreakdown.reliability}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab: Acessos */}
          <TabsContent value="access" className="space-y-4">
            <div className="card-elevated p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg text-foreground">
                  Atividade de Acesso
                </h3>
                <p className="text-sm text-muted-foreground">
                  Membros ordenados por último acesso
                </p>
              </div>

              {accessLogsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredAccessLogs.length === 0 ? (
                <Alert variant="default">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Nenhum registro de acesso</AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Membro
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Último Acesso
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Total de Acessos
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Média/Dia
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccessLogs.map((log) => (
                        <tr key={log.memberId} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <p className="font-medium text-foreground">{log.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {log.memberId.slice(0, 8)}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-foreground">
                              {log.lastAccess === 'Nunca'
                                ? 'Nunca acessou'
                                : new Date(log.lastAccess).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                            </p>
                          </td>
                          <td className="p-4 text-center font-medium text-foreground">
                            {log.totalAccesses}
                          </td>
                          <td className="p-4 text-center text-foreground">{log.averageAccessesPerDay}</td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                log.status === 'active'
                                  ? 'bg-success-light text-success'
                                  : 'bg-warning-light text-warning'
                              }`}
                            >
                              {log.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
