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
  Music,
  Loader2,
  Church as ChurchIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChurches, useDeleteChurch, Church } from '@/hooks/useChurches';
import { Skeleton } from '@/components/ui/skeleton';
import { ChurchFormDialog } from '@/components/forms/ChurchFormDialog';

export default function Churches() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const { data: churches, isLoading, error } = useChurches();
  const deleteChurch = useDeleteChurch();

  const filteredChurches = (churches || []).filter(church =>
    church.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedChurch(null);
    setDialogOpen(true);
  };

  const handleEdit = (church: Church) => {
    setSelectedChurch(church);
    setDialogOpen(true);
  };

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
          <Button className="gap-2 btn-gradient-primary" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Nova Igreja
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elevated p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-xl" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-4 pt-4 border-t border-border">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card-elevated p-12 text-center">
            <p className="text-destructive">Erro ao carregar igrejas: {error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredChurches.length === 0 && (
          <div className="card-elevated p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <ChurchIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma igreja encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Nenhuma igreja corresponde à sua busca.' : 'Comece cadastrando sua primeira igreja.'}
            </p>
            {!searchTerm && (
              <Button className="gap-2 btn-gradient-primary" onClick={handleCreate}>
                <Plus className="w-4 h-4" />
                Nova Igreja
              </Button>
            )}
          </div>
        )}

        {/* Churches Grid */}
        {!isLoading && !error && filteredChurches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChurches.map((church) => (
              <div 
                key={church.id}
                className="card-elevated p-6 animate-fade-in hover:shadow-elevated transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                      {church.logo_url ? (
                        <img src={church.logo_url} alt={church.name} className="w-full h-full object-cover" />
                      ) : (
                        <ChurchIcon className="w-6 h-6 text-primary" />
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
                      <DropdownMenuItem className="gap-2" onClick={() => handleEdit(church)}>
                        <Edit className="w-4 h-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-destructive"
                        onClick={() => deleteChurch.mutate(church.id)}
                        disabled={deleteChurch.isPending}
                      >
                        {deleteChurch.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Info */}
                <div className="space-y-3 mb-4">
                  {church.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{church.address}</span>
                    </div>
                  )}
                  {church.contact && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{church.contact}</span>
                    </div>
                  )}
                </div>

                {/* Stats - placeholder for now */}
                <div className="flex gap-4 pt-4 border-t border-border">
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
            ))}
          </div>
        )}
      </div>

      <ChurchFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        church={selectedChurch}
      />
    </MainLayout>
  );
}
