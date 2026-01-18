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
  MapPin,
  Phone,
  Users,
  Music
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Church {
  id: string;
  name: string;
  address: string;
  contact: string;
  logo?: string;
  memberCount: number;
  ministryCount: number;
}

const mockChurches: Church[] = [
  {
    id: '1',
    name: 'Igreja Batista Central',
    address: 'Rua das Flores, 123 - Centro',
    contact: '(11) 3333-1111',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=church1',
    memberCount: 48,
    ministryCount: 2
  },
  {
    id: '2',
    name: 'Comunidade Evangélica Nova Vida',
    address: 'Av. Brasil, 456 - Jardim América',
    contact: '(11) 3333-2222',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=church2',
    memberCount: 32,
    ministryCount: 1
  },
  {
    id: '3',
    name: 'Igreja Presbiteriana Renovada',
    address: 'Rua São Paulo, 789 - Vila Nova',
    contact: '(11) 3333-3333',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=church3',
    memberCount: 25,
    ministryCount: 1
  },
];

export default function Churches() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChurches = mockChurches.filter(church =>
    church.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout 
      title="Igrejas" 
      subtitle="Gerencie as igrejas cadastradas"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar igreja..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-modern"
            />
          </div>
          <Button className="gap-2 btn-gradient-primary">
            <Plus className="w-4 h-4" />
            Nova Igreja
          </Button>
        </div>

        {/* Churches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChurches.map((church) => (
            <div 
              key={church.id}
              className="card-elevated p-6 animate-fade-in hover:shadow-elevated transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                    {church.logo ? (
                      <img src={church.logo} alt={church.name} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{church.name}</h3>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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

              {/* Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{church.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{church.contact}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    <span className="font-medium text-foreground">{church.memberCount}</span>
                    <span className="text-muted-foreground"> membros</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-accent" />
                  <span className="text-sm">
                    <span className="font-medium text-foreground">{church.ministryCount}</span>
                    <span className="text-muted-foreground"> ministérios</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
