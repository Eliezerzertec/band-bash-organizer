import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, Calendar, Music } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description: string;
  members: { id: string; name: string; avatar: string; skill: string }[];
  nextEvent: string;
  color: string;
}

const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Equipe Alpha',
    description: 'Equipe principal para cultos de domingo',
    members: [
      { id: '1', name: 'Maria Santos', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', skill: 'Vocal' },
      { id: '2', name: 'Carlos Silva', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos', skill: 'Guitarra' },
      { id: '3', name: 'João Pedro', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao', skill: 'Bateria' },
      { id: '4', name: 'Ana Paula', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana', skill: 'Teclado' },
    ],
    nextEvent: 'Domingo, 19 Jan - 19:00',
    color: 'primary'
  },
  {
    id: '2',
    name: 'Equipe Beta',
    description: 'Equipe para cultos de quarta e células',
    members: [
      { id: '5', name: 'Julia Mendes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julia', skill: 'Teclado' },
      { id: '6', name: 'Lucas Oliveira', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas', skill: 'Violão' },
      { id: '7', name: 'Fernanda Costa', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fernanda', skill: 'Vocal' },
    ],
    nextEvent: 'Quarta, 22 Jan - 19:30',
    color: 'success'
  },
  {
    id: '3',
    name: 'Equipe Gamma',
    description: 'Equipe para eventos especiais',
    members: [
      { id: '8', name: 'Pedro Costa', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro', skill: 'Bateria' },
      { id: '9', name: 'Camila Reis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=camila', skill: 'Baixo' },
      { id: '10', name: 'Rafael Lima', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafael', skill: 'Guitarra' },
      { id: '11', name: 'Bruna Souza', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bruna', skill: 'Vocal' },
      { id: '12', name: 'Diego Alves', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diego', skill: 'Violão' },
    ],
    nextEvent: 'Sábado, 25 Jan - 15:00',
    color: 'accent'
  },
];

const colorVariants: Record<string, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
};

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeams = mockTeams.filter(team =>
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

        {/* Teams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div 
              key={team.id}
              className="card-elevated overflow-hidden animate-fade-in hover:shadow-elevated transition-shadow"
            >
              {/* Header */}
              <div className={`p-4 ${colorVariants[team.color]} border-b`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{team.name}</h3>
                      <p className="text-sm opacity-80">{team.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {team.members.length} membros
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {team.members.slice(0, 4).map((member, index) => (
                    <div 
                      key={member.id}
                      className="flex items-center gap-2 px-2 py-1 rounded-full bg-muted"
                    >
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-xs font-medium text-foreground">
                        {member.name.split(' ')[0]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member.skill}
                      </span>
                    </div>
                  ))}
                  {team.members.length > 4 && (
                    <div className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                      +{team.members.length - 4}
                    </div>
                  )}
                </div>

                {/* Next Event */}
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Próximo:</span>
                  <span className="text-sm font-medium text-foreground">{team.nextEvent}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
