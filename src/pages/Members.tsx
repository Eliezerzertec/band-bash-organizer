import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Mail,
  Phone,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProfiles, Profile } from '@/hooks/useProfiles';
import { Skeleton } from '@/components/ui/skeleton';
import { MemberFormDialog } from '@/components/forms/MemberFormDialog';

export default function Members() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const { data: members, isLoading, error } = useProfiles();

  const filteredMembers = (members || []).filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.musical_skills || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (member: Profile) => {
    setSelectedMember(member);
    setDialogOpen(true);
  };

  return (
    <MainLayout 
      title="Membros" 
      subtitle="Gerencie os membros do ministério de louvor"
    >
      <div className="space-y-6">
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
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elevated p-6">
                <Skeleton className="w-14 h-14 rounded-xl mb-4" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="card-elevated p-12 text-center">
            <p className="text-destructive">Erro ao carregar membros: {error.message}</p>
          </div>
        )}

        {!isLoading && !error && filteredMembers.length === 0 && (
          <div className="card-elevated p-12 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum membro encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum membro corresponde à sua busca.' : 'Os membros serão exibidos quando você tiver acesso.'}
            </p>
          </div>
        )}

        {!isLoading && !error && filteredMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div key={member.id} className="card-elevated p-6 animate-fade-in hover:shadow-elevated transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-semibold text-primary">{member.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">Membro</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2" onClick={() => handleEdit(member)}>
                        <Edit className="w-4 h-4" />
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(member.musical_skills || []).slice(0, 3).map((skill) => (
                    <span key={skill} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {(member.musical_skills || []).length > 3 && (
                    <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                      +{member.musical_skills.length - 3}
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-4 pt-4 border-t border-border">
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
        )}
      </div>

      <MemberFormDialog open={dialogOpen} onOpenChange={setDialogOpen} member={selectedMember} />
    </MainLayout>
  );
}
