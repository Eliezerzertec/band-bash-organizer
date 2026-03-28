import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, Calendar, Music, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTeams, useDeleteTeam, Team } from '@/hooks/useTeams';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { Skeleton } from '@/components/ui/skeleton';

const colorVariants: Record<number, string> = {
  0: 'bg-primary',
  1: 'bg-success',
  2: 'bg-accent',
  3: 'bg-warning',
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  cyan: 'bg-cyan-500',
  slate: 'bg-slate-500',
};

const getTeamBorderColor = (color: string | null | undefined): string => {
  if (!color) return colorVariants[0];
  return colorMap[color] || colorVariants[0];
};

export default function Teams() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const { data: teams, isLoading, error } = useTeams();
  const deleteTeam = useDeleteTeam();
  const { confirmDelete } = useConfirmDelete();

  const filteredTeams = (teams || []).filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    navigate('/teams/new');
  };

  const handleEdit = (team: Team) => {
    navigate(`/teams/${team.id}/edit`);
  };

  return (
    <MainLayout 
      title="Equipes" 
      subtitle="Gerencie as equipes de louvor"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar equipe..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-modern"
            />
          </div>
          <Button className="gap-2 btn-gradient-primary" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Nova Equipe
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elevated p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64 mb-3" />
                    <div className="flex flex-wrap gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card-elevated p-12 text-center">
            <p className="text-destructive">Erro ao carregar equipes: {error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredTeams.length === 0 && (
          <div className="card-elevated p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma equipe encontrada
            </h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhuma equipe corresponde à sua busca.' : 'Comece criando sua primeira equipe.'}
            </p>
          </div>
        )}

        {/* Teams List */}
        {!isLoading && !error && filteredTeams.length > 0 && (
          <div className="space-y-3">
            {filteredTeams.map((team) => {
              const members = team.team_members || [];
              const borderColor = getTeamBorderColor(team.color);
              return (
                <div key={team.id} className="card-elevated p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-1 h-6 rounded-full ${borderColor}`}></div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {team.name}
                        </h3>
                      </div>
                      {team.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {team.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {members.length} membro{members.length !== 1 ? 's' : ''}
                        </div>
                        {team.ministry && (
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            {team.ministry.name}
                          </div>
                        )}
                        {team.leader && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Líder: {team.leader.name}
                          </div>
                        )}
                      </div>
                      {members.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Membros:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {members.slice(0, 5).map((member) => (
                              <span 
                                key={member.id}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs font-medium text-foreground"
                              >
                                {member.profile?.name?.split(' ')[0] || 'Membro'}
                                {member.role_in_team && (
                                  <span className="text-muted-foreground">({member.role_in_team})</span>
                                )}
                              </span>
                            ))}
                            {members.length > 5 && (
                              <span className="text-xs text-muted-foreground">
                                +{members.length - 5} mais
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => handleEdit(team)}>
                          <Edit className="w-4 h-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-destructive"
                          onClick={() => confirmDelete(team.name, () => deleteTeam.mutate(team.id))}
                          disabled={deleteTeam.isPending}
                        >
                          {deleteTeam.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
