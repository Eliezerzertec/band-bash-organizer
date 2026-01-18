import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2,
  Users,
  Music,
  Church
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Ministry {
  id: string;
  name: string;
  churchName: string;
  leaders: string[];
  logo?: string;
  memberCount: number;
  teamCount: number;
}

const mockMinistries: Ministry[] = [
  {
    id: '1',
    name: 'Ministério de Louvor Adoração',
    churchName: 'Igreja Batista Central',
    leaders: ['Pastor João Silva', 'Maria Santos'],
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=ministry1',
    memberCount: 28,
    teamCount: 4
  },
  {
    id: '2',
    name: 'Ministério Jovem de Louvor',
    churchName: 'Igreja Batista Central',
    leaders: ['Carlos Silva'],
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=ministry2',
    memberCount: 20,
    teamCount: 2
  },
  {
    id: '3',
    name: 'Louvor Nova Vida',
    churchName: 'Comunidade Evangélica Nova Vida',
    leaders: ['Ana Paula Costa'],
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=ministry3',
    memberCount: 32,
    teamCount: 3
  },
];

export default function Ministries() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMinistries = mockMinistries.filter(ministry =>
    ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ministry.churchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout 
      title="Ministérios" 
      subtitle="Gerencie os ministérios de louvor"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar ministério..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-modern"
            />
          </div>
          <Button className="gap-2 btn-gradient-primary">
            <Plus className="w-4 h-4" />
            Novo Ministério
          </Button>
        </div>

        {/* Ministries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMinistries.map((ministry) => (
            <div 
              key={ministry.id}
              className="card-elevated overflow-hidden animate-fade-in hover:shadow-elevated transition-shadow"
            >
              {/* Header with gradient */}
              <div className="h-24 bg-gradient-to-br from-primary to-primary-muted relative">
                <div className="absolute -bottom-8 left-6">
                  <div className="w-16 h-16 rounded-xl bg-card border-4 border-card flex items-center justify-center overflow-hidden shadow-md">
                    {ministry.logo ? (
                      <img src={ministry.logo} alt={ministry.name} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-8 h-8 text-primary" />
                    )}
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Edit className="w-4 h-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Content */}
              <div className="pt-12 px-6 pb-6">
                <h3 className="font-semibold text-foreground text-lg">{ministry.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Church className="w-4 h-4" />
                  <span>{ministry.churchName}</span>
                </div>

                {/* Leaders */}
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Líderes:</p>
                  <div className="flex flex-wrap gap-2">
                    {ministry.leaders.map((leader, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {leader}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 pt-4 mt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm">
                      <span className="font-medium text-foreground">{ministry.memberCount}</span>
                      <span className="text-muted-foreground"> membros</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-accent" />
                    <span className="text-sm">
                      <span className="font-medium text-foreground">{ministry.teamCount}</span>
                      <span className="text-muted-foreground"> equipes</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
