import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  skills: string[];
  team: string;
  status: 'active' | 'inactive';
}

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 99999-1111',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    role: 'Líder de Louvor',
    skills: ['Vocal', 'Violão'],
    team: 'Equipe Alpha',
    status: 'active'
  },
  {
    id: '2',
    name: 'Carlos Silva',
    email: 'carlos@email.com',
    phone: '(11) 99999-2222',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    role: 'Músico',
    skills: ['Guitarra', 'Baixo'],
    team: 'Equipe Alpha',
    status: 'active'
  },
  {
    id: '3',
    name: 'Ana Paula',
    email: 'ana@email.com',
    phone: '(11) 99999-3333',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    role: 'Backing Vocal',
    skills: ['Vocal'],
    team: 'Equipe Beta',
    status: 'active'
  },
  {
    id: '4',
    name: 'Pedro Costa',
    email: 'pedro@email.com',
    phone: '(11) 99999-4444',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
    role: 'Músico',
    skills: ['Bateria'],
    team: 'Equipe Gamma',
    status: 'inactive'
  },
  {
    id: '5',
    name: 'Julia Mendes',
    email: 'julia@email.com',
    phone: '(11) 99999-5555',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julia',
    role: 'Tecladista',
    skills: ['Teclado', 'Piano'],
    team: 'Equipe Beta',
    status: 'active'
  },
];

export default function Members() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = mockMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <MainLayout 
      title="Membros" 
      subtitle="Gerencie os membros do ministério de louvor"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome, email ou habilidade..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-modern"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
            <Button className="gap-2 btn-gradient-primary">
              <Plus className="w-4 h-4" />
              Novo Membro
            </Button>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div 
              key={member.id}
              className="card-elevated p-6 animate-fade-in hover:shadow-elevated transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    className="w-14 h-14 rounded-xl bg-muted"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
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

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {member.skills.map((skill) => (
                  <span 
                    key={skill}
                    className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{member.phone}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">{member.team}</span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  member.status === 'active' ? "bg-success-light text-success" : "bg-muted text-muted-foreground"
                )}>
                  {member.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
