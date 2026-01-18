import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Team, useCreateTeam, useUpdateTeam } from '@/hooks/useTeams';
import { useMinistries } from '@/hooks/useMinistries';
import { useProfiles } from '@/hooks/useProfiles';

const teamSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Máximo 100 caracteres'),
  description: z.string().trim().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  ministry_id: z.string().min(1, 'Ministério é obrigatório'),
  leader_id: z.string().optional().or(z.literal('')),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface TeamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team | null;
}

export function TeamFormDialog({ open, onOpenChange, team }: TeamFormDialogProps) {
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const { data: ministries } = useMinistries();
  const { data: profiles } = useProfiles();
  const isEditing = !!team;

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
      ministry_id: '',
      leader_id: '',
    },
  });

  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        description: team.description || '',
        ministry_id: team.ministry_id,
        leader_id: team.leader_id || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        ministry_id: ministries?.[0]?.id || '',
        leader_id: '',
      });
    }
  }, [team, form, ministries]);

  const onSubmit = async (data: TeamFormData) => {
    const payload = {
      name: data.name,
      description: data.description || null,
      ministry_id: data.ministry_id,
      leader_id: data.leader_id || null,
    };

    if (isEditing) {
      await updateTeam.mutateAsync({ id: team.id, ...payload });
    } else {
      await createTeam.mutateAsync(payload);
    }
    onOpenChange(false);
    form.reset();
  };

  const isPending = createTeam.isPending || updateTeam.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Equipe' : 'Nova Equipe'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da equipe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ministry_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ministério *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ministério" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ministries?.map((ministry) => (
                        <SelectItem key={ministry.id} value={ministry.id}>
                          {ministry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="leader_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Líder</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o líder" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição da equipe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
