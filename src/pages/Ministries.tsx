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
  Church,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMinistries, useDeleteMinistry, Ministry } from '@/hooks/useMinistries';
import { Skeleton } from '@/components/ui/skeleton';
import { MinistryFormDialog } from '@/components/forms/MinistryFormDialog';

export default function Ministries() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const { data: ministries, isLoading, error } = useMinistries();
  const deleteMinistry = useDeleteMinistry();

  const filteredMinistries = (ministries || []).filter(ministry =>
    ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ministry.church?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedMinistry(null);
    setDialogOpen(true);
  };

  const handleEdit = (ministry: Ministry) => {
    setSelectedMinistry(ministry);
    setDialogOpen(true);
  };

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
          <Button className="gap-2 btn-gradient-primary" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Novo Ministério
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elevated overflow-hidden">
                <Skeleton className="h-24 w-full" />
                <div className="pt-12 px-6 pb-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex gap-6 pt-4 border-t border-border">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card-elevated p-12 text-center">
            <p className="text-destructive">Erro ao carregar ministérios: {error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredMinistries.length === 0 && (
          <div className="card-elevated p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Music className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum ministério encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Nenhum ministério corresponde à sua busca.' : 'Comece cadastrando seu primeiro ministério.'}
            </p>
            {!searchTerm && (
              <Button className="gap-2 btn-gradient-primary" onClick={handleCreate}>
                <Plus className="w-4 h-4" />
                Novo Ministério
              </Button>
            )}
          </div>
        )}

        {/* Ministries Grid */}
        {!isLoading && !error && filteredMinistries.length > 0 && (
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
                      {ministry.logo_url ? (
                        <img src={ministry.logo_url} alt={ministry.name} className="w-full h-full object-cover" />
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
                        <DropdownMenuItem className="gap-2" onClick={() => handleEdit(ministry)}>
                          <Edit className="w-4 h-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-destructive"
                          onClick={() => deleteMinistry.mutate(ministry.id)}
                          disabled={deleteMinistry.isPending}
                        >
                          {deleteMinistry.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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
                    <span>{ministry.church?.name || 'Igreja não definida'}</span>
                  </div>

                  {/* Leader */}
                  {ministry.leader && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Líder:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {ministry.leader.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {ministry.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {ministry.description}
                    </p>
                  )}

                  {/* Stats - placeholder for now */}
                  <div className="flex gap-6 pt-4 mt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">-</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">-</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MinistryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ministry={selectedMinistry}
      />
    </MainLayout>
  );
}
