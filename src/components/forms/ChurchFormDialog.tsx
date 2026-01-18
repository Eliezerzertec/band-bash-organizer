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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Church, useCreateChurch, useUpdateChurch } from '@/hooks/useChurches';

const churchSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Máximo 100 caracteres'),
  address: z.string().trim().max(255, 'Máximo 255 caracteres').optional().or(z.literal('')),
  contact: z.string().trim().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  logo_url: z.string().trim().url('URL inválida').optional().or(z.literal('')),
});

type ChurchFormData = z.infer<typeof churchSchema>;

interface ChurchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  church?: Church | null;
}

export function ChurchFormDialog({ open, onOpenChange, church }: ChurchFormDialogProps) {
  const createChurch = useCreateChurch();
  const updateChurch = useUpdateChurch();
  const isEditing = !!church;

  const form = useForm<ChurchFormData>({
    resolver: zodResolver(churchSchema),
    defaultValues: {
      name: '',
      address: '',
      contact: '',
      logo_url: '',
    },
  });

  useEffect(() => {
    if (church) {
      form.reset({
        name: church.name,
        address: church.address || '',
        contact: church.contact || '',
        logo_url: church.logo_url || '',
      });
    } else {
      form.reset({
        name: '',
        address: '',
        contact: '',
        logo_url: '',
      });
    }
  }, [church, form]);

  const onSubmit = async (data: ChurchFormData) => {
    const payload = {
      name: data.name,
      address: data.address || null,
      contact: data.contact || null,
      logo_url: data.logo_url || null,
    };

    if (isEditing) {
      await updateChurch.mutateAsync({ id: church.id, ...payload });
    } else {
      await createChurch.mutateAsync(payload);
    }
    onOpenChange(false);
    form.reset();
  };

  const isPending = createChurch.isPending || updateChurch.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Igreja' : 'Nova Igreja'}</DialogTitle>
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
                    <Input placeholder="Nome da igreja" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato</FormLabel>
                  <FormControl>
                    <Input placeholder="Telefone ou email" {...field} />
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
