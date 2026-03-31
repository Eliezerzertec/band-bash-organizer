import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCurrentProfile } from '@/hooks/useProfiles';
import { useSchedules } from '@/hooks/useSchedules';
import { useMessages } from '@/hooks/useMessages';
import { useTeams } from '@/hooks/useTeams';
import { useChurches } from '@/hooks/useChurches';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, MessageSquare, User, ArrowRight, Music, Clock, MapPin, Users, Tag, Building2, FileText, Guitar, Star } from 'lucide-react';
import { usePeerEvaluationScore, EVAL_CRITERIA } from '@/hooks/usePeerEvaluations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';

export default function MemberDashboard() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: schedules, isLoading: schedulesLoading } = useSchedules();
  const { data: messages, isLoading: messagesLoading } = useMessages();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: churches } = useChurches();
  const { data: peerScore } = usePeerEvaluationScore(profile?.id ?? '');

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

  const isSameDay = (left: Date, right: Date) => (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );

  const upcomingSchedules = mySchedules
    .filter(s => parseLocalDate(s.event_date) >= today)
    .sort((a, b) => parseLocalDate(a.event_date).getTime() - parseLocalDate(b.event_date).getTime())
    .slice(0, 5);

  const [selectedDate, setSelectedDate] = useState<Date>(today);

  useEffect(() => {
    if (upcomingSchedules.length > 0 && !mySchedules.some(schedule => isSameDay(parseLocalDate(schedule.event_date), selectedDate))) {
      setSelectedDate(parseLocalDate(upcomingSchedules[0].event_date));
    }
  }, [mySchedules, selectedDate, upcomingSchedules]);

  const selectedDaySchedules = mySchedules
    .filter(schedule => isSameDay(parseLocalDate(schedule.event_date), selectedDate))
    .sort((a, b) => (a.start_time ?? '23:59').localeCompare(b.start_time ?? '23:59'));

  const scheduleDates = mySchedules.map(schedule => parseLocalDate(schedule.event_date));

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
                <CalendarIcon className="w-4 h-4 text-blue-500" />
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

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Calendário do Mês
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Dias marcados indicam suas escalas. Selecione um dia para ver os detalhes completos.
                  </p>
                </div>
                <Badge variant="outline">
                  {mySchedules.length} agenda{mySchedules.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr] items-start">
              {schedulesLoading ? (
                <>
                  <Skeleton className="h-[332px] w-full" />
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                        }
                      }}
                      modifiers={{ hasSchedule: scheduleDates }}
                      modifiersClassNames={{
                        hasSchedule: 'relative after:absolute after:bottom-1.5 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-primary after:content-[""]',
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 border-b pb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Agenda selecionada</p>
                        <h3 className="text-lg font-semibold capitalize">
                          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </h3>
                      </div>
                      <Badge variant={selectedDaySchedules.length > 0 ? 'default' : 'secondary'}>
                        {selectedDaySchedules.length} compromisso{selectedDaySchedules.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {selectedDaySchedules.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDaySchedules.map((schedule) => {
                          const assignment = schedule.schedule_assignments?.find(
                            sa => sa.profile_id === profile?.id,
                          );

                          return (
                            <div key={schedule.id} className="rounded-xl border bg-background p-4 shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="font-semibold text-foreground">
                                    {schedule.title || schedule.event_name}
                                  </h4>
                                  {schedule.description && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {schedule.description}
                                    </p>
                                  )}
                                </div>
                                {assignment?.role_assigned && (
                                  <Badge className="border-primary/20 bg-primary/15 text-primary">
                                    {assignment.role_assigned}
                                  </Badge>
                                )}
                              </div>

                              <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                {schedule.start_time && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary/70" />
                                    <span>
                                      {formatTime(schedule.start_time)}
                                      {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                                    </span>
                                  </div>
                                )}
                                {assignment?.team?.name && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-500/70" />
                                    <span>{assignment.team.name}</span>
                                  </div>
                                )}
                                {schedule.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-500/70" />
                                    <span>{schedule.location}</span>
                                  </div>
                                )}
                                {schedule.ministry?.name && (
                                  <div className="flex items-center gap-2">
                                    <Music className="w-4 h-4 text-orange-500/70" />
                                    <span>{schedule.ministry.name}</span>
                                  </div>
                                )}
                              </div>

                              {schedule.notes && (
                                <div className="mt-4 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground/80">Observações:</span>{' '}
                                  {schedule.notes}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center text-muted-foreground">
                        <CalendarIcon className="mb-3 h-10 w-10 opacity-50" />
                        <p className="font-medium">Nenhuma escala neste dia</p>
                        <p className="mt-1 text-sm">
                          Selecione outro dia marcado no calendário para visualizar equipe, horário, local e observações.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-dashed bg-muted/15">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Visão Rápida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium text-foreground">Próxima agenda</p>
                <p className="mt-1">
                  {upcomingSchedules[0]
                    ? `${formatDate(upcomingSchedules[0].event_date)}${upcomingSchedules[0].start_time ? ` às ${formatTime(upcomingSchedules[0].start_time)}` : ''}`
                    : 'Nenhuma escala futura cadastrada no momento.'}
                </p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium text-foreground">Como ler o calendário</p>
                <p className="mt-1">
                  Cada ponto indica uma data com escala. Ao selecionar o dia, o painel ao lado mostra equipe, função, local e observações do evento.
                </p>
              </div>
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
                              <CalendarIcon className="w-4 h-4" />
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
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
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

            {/* Meu Escore de Avaliação */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">Meu Escore</CardTitle>
                <Star className="w-4 h-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                {peerScore ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {Number(peerScore.overall_score).toFixed(1)}
                        <span className="text-sm font-normal text-muted-foreground"> / 5</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{peerScore.total_evaluators} avaliador(es)</span>
                    </div>
                    <div className="space-y-1">
                      {EVAL_CRITERIA.map(({ key, label }) => {
                        const avg = Number(peerScore[`avg_${key}` as keyof typeof peerScore] ?? 0);
                        return (
                          <div key={key} className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground truncate flex-1">{label.split(' ')[0]}</span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= Math.round(avg) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                              ))}
                            </div>
                            <span className="text-xs w-6 text-right">{avg.toFixed(1)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-2 mt-2" onClick={() => navigate('/peer-evaluations')}>
                      <Star className="w-3 h-3" /> Ver avaliações
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground mb-2">Nenhuma avaliação recebida ainda</p>
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => navigate('/peer-evaluations')}>
                      <Star className="w-3 h-3" /> Avaliar colegas
                    </Button>
                  </div>
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
                  onClick={() => navigate('/peer-evaluations')}
                >
                  <Star className="w-4 h-4" />
                  Avaliações
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
