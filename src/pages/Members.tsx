import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProfiles, Profile, useDeleteMember, useUpdateMemberStatus } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { MemberFormDialog } from '@/components/forms/MemberFormDialog';
import { CreateMemberDialog } from '@/components/forms/CreateMemberDialog';
import { ActivityStatusBar } from '@/components/dashboard/ActivityMonitor';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Members() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Profile | null>(null);
  const { data: members, isLoading, error } = useProfiles();
  const updateStatus = useUpdateMemberStatus();
  const deleteProfile = useDeleteMember();

  const filteredMembers = (members || []).filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.musical_skills || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (member: Profile) => {
    setSelectedMember(member);
    setDialogOpen(true);
  };

  const handleDeleteClick = (member: Profile) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      deleteProfile.mutate(memberToDelete.id, {
        onSuccess: () => {
          toast.success('Membro deletado com sucesso!');
          setDeleteDialogOpen(false);
          setMemberToDelete(null);
        },
        onError: (error) => {
          toast.error(`Erro ao deletar: ${error.message}`);
        },
      });
    }
  };

  // Verificar se é admin
  const isAdmin = user?.role === 'admin';

  // Se não for admin, redirecionar ou mostrar erro
  if (!isAdmin) {
    return (
      <MainLayout 
        title="Acesso Negado" 
        subtitle="Você não tem permissão para acessar esta página"
      >
        <div className="card-elevated p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground">
            Apenas administradores podem gerenciar membros.
          </p>
        </div>
      </MainLayout>
    );
  }

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
          <div className="flex gap-3">
            <Button className="gap-2 btn-gradient-primary" onClick={() => setCreateDialogOpen(true)}>
              <Users className="w-4 h-4" />
              Novo Membro
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="card-elevated">
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
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
              {searchTerm ? 'Nenhum membro corresponde à sua busca.' : 'Comece criando seu primeiro membro.'}
            </p>
          </div>
        )}

        {!isLoading && !error && filteredMembers.length > 0 && (
          <div className="card-elevated">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Habilidades</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} className="animate-fade-in hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-semibold text-primary">{member.name.charAt(0)}</span>
                          )}
                        </div>
                        <span>{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                    <TableCell className="text-sm">{member.phone || '-'}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-wrap gap-1">
                        {(member.musical_skills || []).slice(0, 2).map((skill) => (
                          <span key={skill} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                        {(member.musical_skills || []).length > 2 && (
                          <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                            +{member.musical_skills.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ActivityStatusBar member={member} />
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
                        member.status === 'active' ? "bg-success-light text-success" :
                        member.status === 'pending_approval' ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {member.status === 'active' && <CheckCircle className="w-3 h-3" />}
                        {member.status === 'pending_approval' && <Clock className="w-3 h-3" />}
                        {member.status === 'inactive' && <XCircle className="w-3 h-3" />}
                        {member.status === 'active' ? 'Ativo' :
                         member.status === 'pending_approval' ? 'Aguardando aprovação' :
                         'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
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
                          <DropdownMenuItem className="gap-2" onClick={() => navigate(`/members/${member.id}/schedules`)}>
                            <Calendar className="w-4 h-4" />
                            Ver escalas do membro
                          </DropdownMenuItem>
                          {(member.status === 'pending_approval' || member.status === 'inactive') && (
                            <DropdownMenuItem
                              className="gap-2 text-green-600 focus:text-green-600"
                              onClick={() => updateStatus.mutate({ id: member.id, status: 'active' })}
                            >
                              <CheckCircle className="w-4 h-4" />
                              {member.status === 'pending_approval' ? 'Aprovar e ativar' : 'Ativar'}
                            </DropdownMenuItem>
                          )}
                          {member.status === 'pending_approval' && (
                            <DropdownMenuItem
                              className="gap-2 text-destructive focus:text-destructive"
                              onClick={() => updateStatus.mutate({ id: member.id, status: 'inactive' })}
                            >
                              <XCircle className="w-4 h-4" />
                              Rejeitar cadastro
                            </DropdownMenuItem>
                          )}
                          {member.status === 'active' && (
                            <DropdownMenuItem
                              className="gap-2 text-amber-600 focus:text-amber-600"
                              onClick={() => updateStatus.mutate({ id: member.id, status: 'inactive' })}
                            >
                              <XCircle className="w-4 h-4" />
                              Desativar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(member)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <MemberFormDialog open={dialogOpen} onOpenChange={setDialogOpen} member={selectedMember} />
      <CreateMemberDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar <strong>{memberToDelete?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={deleteProfile.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProfile.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
