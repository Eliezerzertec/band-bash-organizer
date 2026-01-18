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
import { Ministry, useCreateMinistry, useUpdateMinistry } from '@/hooks/useMinistries';
import { useChurches } from '@/hooks/useChurches';
import { useProfiles } from '@/hooks/useProfiles';

const ministrySchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Máximo 100 caracteres'),
  description: z.string().trim().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  church_id: z.string().min(1, 'Igreja é obrigatória'),
  leader_id: z.string().optional().or(z.literal('')),
  logo_url: z.string().trim().url('URL inválida').optional().or(z.literal('')),
});

type MinistryFormData = z.infer<typeof ministrySchema>;

interface MinistryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ministry?: Ministry | null;
}

export function MinistryFormDialog({ open, onOpenChange, ministry }: MinistryFormDialogProps) {
  const createMinistry = useCreateMinistry();
  const updateMinistry = useUpdateMinistry();
  const { data: churches } = useChurches();
  const { data: profiles } = useProfiles();
  const isEditing = !!ministry;

  const form = useForm<MinistryFormData>({
    resolver: zodResolver(ministrySchema),
    defaultValues: {
      name: '',
      description: '',
      church_id: '',
      leader_id: '',
      logo_url: '',
    },
  });

  useEffect(() => {
    if (ministry) {
      form.reset({
        name: ministry.name,
        description: ministry.description || '',
        church_id: ministry.church_id,
        leader_id: ministry.leader_id || '',
        logo_url: ministry.logo_url || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        church_id: churches?.[0]?.id || '',
        leader_id: '',
        logo_url: '',
      });
    }
  }, [ministry, form, churches]);

  const onSubmit = async (data: MinistryFormData) => {
    const payload = {
      name: data.name,
      description: data.description || null,
      church_id: data.church_id,
      leader_id: data.leader_id || null,
      logo_url: data.logo_url || null,
    };

    if (isEditing) {
      await updateMinistry.mutateAsync({ id: ministry.id, ...payload });
    } else {
      await createMinistry.mutateAsync(payload);
    }
    onOpenChange(false);
    form.reset();
  };

  const isPending = createMinistry.isPending || updateMinistry.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Ministério' : 'Novo Ministério'}</DialogTitle>
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
                    <Input placeholder="Nome do ministério" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="church_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Igreja *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a igreja" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {churches?.map((church) => (
                        <SelectItem key={church.id} value={church.id}>
                          {church.name}
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
                    <Textarea placeholder="Descrição do ministério" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Logo</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
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
