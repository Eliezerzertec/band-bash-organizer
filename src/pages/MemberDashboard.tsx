import { MainLayout } from '@/components/layout/MainLayout';
import { useCurrentProfile } from '@/hooks/useProfiles';
import { useSchedules } from '@/hooks/useSchedules';
import { useMessages } from '@/hooks/useMessages';
import { useTeams } from '@/hooks/useTeams';
import { useChurches } from '@/hooks/useChurches';
import { format, parseISO, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, MessageSquare, User, ArrowRight, Music, Clock, MapPin, Users, Tag, Building2, FileText, Guitar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function MemberDashboard() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: schedules, isLoading: schedulesLoading } = useSchedules();
  const { data: messages, isLoading: messagesLoading } = useMessages();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: churches } = useChurches();

  // Filtrar próximas escalas do membro
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mySchedules = schedules?.filter(schedule =>
    schedule.schedule_assignments?.some(sa => sa.profile_id === profile?.id)
  ) || [];

  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const upcomingSchedules = mySchedules
    .filter(s => parseLocalDate(s.event_date) >= today)
    .sort((a, b) => parseLocalDate(a.event_date).getTime() - parseLocalDate(b.event_date).getTime())
    .slice(0, 5);

  // Equipes do membro
  const myTeams = teams?.filter(team =>
    team.team_members?.some(tm => tm.profile_id === profile?.id)
  ) || [];

  // Mensagens não lidas
  const unreadMessages = messages?.filter(m => !m.read_at) || [];

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
      return format(new Date(year, month - 1, day), "d 'de' MMM yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr?: string) => {
    return timeStr?.slice(0, 5) || '';
  };

  return (
    <MainLayout 
      title="Bem-vindo ao Painel" 
      subtitle={`Olá ${profile?.name || 'Membro'}! Acompanhe suas atividades e escalas`}
    >
      <div className="space-y-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Perfil Card */}
          <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <User className="w-4 h-4 text-primary" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <>
                  <p className="font-bold text-lg text-foreground">{profile?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{profile?.status === 'active' ? '✅ Ativo' : '⚠️ Inativo'}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Próximas Escalas Card */}
          <Card className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="w-4 h-4 text-blue-500" />
                Próximas Escalas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <>
                  <p className="font-bold text-lg text-blue-600">{upcomingSchedules.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">escalas agendadas</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Mensagens Card */}
          <Card className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="w-4 h-4 text-green-500" />
                Mensagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <>
                  <p className="font-bold text-lg text-green-600">{unreadMessages.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">não lidas</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Equipes Card */}
          <Card className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Users className="w-4 h-4 text-purple-500" />
                Equipes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamsLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <>
                  <p className="font-bold text-lg text-purple-600">{myTeams.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">equipes ativas</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Próximas Escalas Detalhadas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Próximas Escalas
                  </CardTitle>
                  <Badge variant="outline">{upcomingSchedules.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {schedulesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                  </div>
                ) : upcomingSchedules.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingSchedules.map((schedule, idx) => {
                      const assignment = schedule.schedule_assignments?.find(
                        sa => sa.profile_id === profile?.id
                      );

                      return (
                        <div
                          key={schedule.id}
                          className="border rounded-lg p-4 hover:bg-accent/50 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold group-hover:text-primary transition-colors">
                                  {schedule.title || schedule.event_name}
                                </h4>
                                {schedule.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {schedule.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap justify-end">
                              {assignment?.role_assigned && (
                                <Badge className="bg-primary/20 text-primary border-primary/30">
                                  {assignment.role_assigned}
                                </Badge>
                              )}
                              {assignment?.team?.name && (
                                <Badge variant="secondary">
                                  <Users className="w-3 h-3 mr-1" />
                                  {assignment.team.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {/* Linha 1: data, hora, local */}
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pl-11">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(schedule.event_date)}</span>
                            </div>
                            {schedule.start_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {formatTime(schedule.start_time)}
                                  {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                                </span>
                              </div>
                            )}
                            {schedule.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{schedule.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Linha 2: detalhes adicionais da agenda */}
                          {(schedule.ministry?.name || schedule.church?.name || schedule.event_type || schedule.schedule_type || assignment?.role_assigned) && (
                            <div className="mt-3 pl-11 border-t pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              {schedule.ministry?.name && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Music className="w-3.5 h-3.5 flex-shrink-0 text-primary/70" />
                                  <span className="font-medium text-foreground/70">Ministério:</span>
                                  <span>{schedule.ministry.name}</span>
                                </div>
                              )}
                              {assignment?.team?.name && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Users className="w-3.5 h-3.5 flex-shrink-0 text-blue-500/70" />
                                  <span className="font-medium text-foreground/70">Equipe:</span>
                                  <span>{assignment.team.name}</span>
                                </div>
                              )}
                              {assignment?.role_assigned && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Guitar className="w-3.5 h-3.5 flex-shrink-0 text-purple-500/70" />
                                  <span className="font-medium text-foreground/70">Instrumento/Função:</span>
                                  <span>{assignment.role_assigned}</span>
                                </div>
                              )}
                              {(schedule.event_type || schedule.schedule_type) && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Tag className="w-3.5 h-3.5 flex-shrink-0 text-orange-500/70" />
                                  <span className="font-medium text-foreground/70">Tipo:</span>
                                  <span>{schedule.event_type || schedule.schedule_type}</span>
                                </div>
                              )}
                              {schedule.church?.name && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-green-500/70" />
                                  <span className="font-medium text-foreground/70">Igreja:</span>
                                  <span>{schedule.church.name}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Notas e observações */}
                          {schedule.notes && (
                            <div className="mt-3 pl-11">
                              <div className="flex items-start gap-2 bg-muted/40 rounded-md p-2.5 text-sm">
                                <FileText className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground mt-0.5" />
                                <div>
                                  <span className="font-medium text-foreground/70 block mb-0.5">Observações:</span>
                                  <span className="text-muted-foreground">{schedule.notes}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma escala próxima</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Perfil Detalhado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : profile ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">EMAIL</p>
                      <p className="text-sm break-all">{profile.email}</p>
                    </div>
                    {profile.phone && (
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">TELEFONE</p>
                        <p className="text-sm">{profile.phone}</p>
                      </div>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Minhas Equipes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Minhas Equipes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {teamsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : myTeams.length > 0 ? (
                  myTeams.map(team => {
                    const memberRecord = team.team_members?.find(tm => tm.profile_id === profile?.id);
                    const church = churches?.find(c => c.id === team.ministry?.church_id);
                    return (
                      <div key={team.id} className="border rounded-md p-3 space-y-1.5 bg-muted/20">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                          <span className="font-semibold text-sm">{team.name}</span>
                        </div>
                        {team.ministry?.name && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-0.5">
                            <Music className="w-3 h-3 text-primary/70 flex-shrink-0" />
                            <span className="font-medium text-foreground/70">Ministério:</span>
                            <span>{team.ministry.name}</span>
                          </div>
                        )}
                        {memberRecord?.role_in_team && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-0.5">
                            <Guitar className="w-3 h-3 text-orange-500/80 flex-shrink-0" />
                            <span className="font-medium text-foreground/70">Instrumento:</span>
                            <span>{memberRecord.role_in_team}</span>
                          </div>
                        )}
                        {church?.name && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-0.5">
                            <Building2 className="w-3 h-3 text-green-500/80 flex-shrink-0" />
                            <span className="font-medium text-foreground/70">Local:</span>
                            <span>{church.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma equipe atribuída</p>
                )}
              </CardContent>
            </Card>

            {/* Mensagens Rápidas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">Mensagens Recentes</CardTitle>
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <Skeleton className="h-4 w-full" />
                ) : unreadMessages.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      Você tem <span className="font-bold text-primary">{unreadMessages.length}</span> mensagem{unreadMessages.length !== 1 ? 's' : ''} não lida{unreadMessages.length !== 1 ? 's' : ''}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2"
                      onClick={() => navigate('/messages')}
                    >
                      Ver Mensagens
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem mensagens não lidas</p>
                )}
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/messages')}
                >
                  <MessageSquare className="w-4 h-4" />
                  Mensagens
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/substitutions')}
                >
                  <Users className="w-4 h-4" />
                  Substituições
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/profile')}
                >
                  <User className="w-4 h-4" />
                  Meu Perfil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
