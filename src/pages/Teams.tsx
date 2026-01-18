import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, Calendar, Music } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { Skeleton } from '@/components/ui/skeleton';

const colorVariants: Record<number, string> = {
  0: 'bg-primary/10 text-primary border-primary/20',
  1: 'bg-success/10 text-success border-success/20',
  2: 'bg-accent/10 text-accent border-accent/20',
  3: 'bg-warning/10 text-warning border-warning/20',
};

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: teams, isLoading, error } = useTeams();

  const filteredTeams = (teams || []).filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Button className="gap-2 btn-gradient-primary">
            <Plus className="w-4 h-4" />
            Nova Equipe
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elevated overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Skeleton className="h-8 w-32 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Skeleton className="h-4 w-40" />
                  </div>
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
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma equipe encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Nenhuma equipe corresponde à sua busca.' : 'Comece criando sua primeira equipe.'}
            </p>
            {!searchTerm && (
              <Button className="gap-2 btn-gradient-primary">
                <Plus className="w-4 h-4" />
                Nova Equipe
              </Button>
            )}
          </div>
        )}

        {/* Teams Grid */}
        {!isLoading && !error && filteredTeams.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTeams.map((team, index) => {
              const colorClass = colorVariants[index % 4];
              const members = team.team_members || [];

              return (
                <div 
                  key={team.id}
                  className="card-elevated overflow-hidden animate-fade-in hover:shadow-elevated transition-shadow"
                >
                  {/* Header */}
                  <div className={`p-4 ${colorClass} border-b`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                          <Music className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{team.name}</h3>
                          <p className="text-sm opacity-80">{team.description || team.ministry?.name || ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {members.length} membros
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {members.slice(0, 4).map((member) => (
                        <div 
                          key={member.id}
                          className="flex items-center gap-2 px-2 py-1 rounded-full bg-muted"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {member.profile?.avatar_url ? (
                              <img 
                                src={member.profile.avatar_url} 
                                alt={member.profile.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium text-primary">
                                {member.profile?.name?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-medium text-foreground">
                            {member.profile?.name?.split(' ')[0] || 'Membro'}
                          </span>
                          {member.role_in_team && (
                            <span className="text-xs text-muted-foreground">
                              {member.role_in_team}
                            </span>
                          )}
                        </div>
                      ))}
                      {members.length > 4 && (
                        <div className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                          +{members.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Leader */}
                    {team.leader && (
                      <div className="flex items-center gap-2 pt-4 border-t border-border">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Líder:</span>
                        <span className="text-sm font-medium text-foreground">{team.leader.name}</span>
                      </div>
                    )}
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
