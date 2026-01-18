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
import { Schedule, useCreateSchedule, useUpdateSchedule } from '@/hooks/useSchedules';
import { useChurches } from '@/hooks/useChurches';
import { useMinistries } from '@/hooks/useMinistries';

const scheduleSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório').max(100, 'Máximo 100 caracteres'),
  description: z.string().trim().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  event_date: z.string().min(1, 'Data é obrigatória'),
  start_time: z.string().min(1, 'Horário de início é obrigatório'),
  end_time: z.string().optional().or(z.literal('')),
  location: z.string().trim().max(255, 'Máximo 255 caracteres').optional().or(z.literal('')),
  church_id: z.string().min(1, 'Igreja é obrigatória'),
  ministry_id: z.string().optional().or(z.literal('')),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: Schedule | null;
}

export function ScheduleFormDialog({ open, onOpenChange, schedule }: ScheduleFormDialogProps) {
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const { data: churches } = useChurches();
  const { data: ministries } = useMinistries();
  const isEditing = !!schedule;

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      end_time: '',
      location: '',
      church_id: '',
      ministry_id: '',
    },
  });

  useEffect(() => {
    if (schedule) {
      form.reset({
        title: schedule.title,
        description: schedule.description || '',
        event_date: schedule.event_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time || '',
        location: schedule.location || '',
        church_id: schedule.church_id,
        ministry_id: schedule.ministry_id || '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '',
        location: '',
        church_id: churches?.[0]?.id || '',
        ministry_id: '',
      });
    }
  }, [schedule, form, churches]);

  const onSubmit = async (data: ScheduleFormData) => {
    const payload = {
      title: data.title,
      description: data.description || null,
      event_date: data.event_date,
      start_time: data.start_time,
      end_time: data.end_time || null,
      location: data.location || null,
      church_id: data.church_id,
      ministry_id: data.ministry_id || null,
      created_by: null,
    };

    if (isEditing) {
      await updateSchedule.mutateAsync({ id: schedule.id, ...payload });
    } else {
      await createSchedule.mutateAsync(payload);
    }
    onOpenChange(false);
    form.reset();
  };

  const isPending = createSchedule.isPending || updateSchedule.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Escala' : 'Nova Escala'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Título do evento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Início *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Fim</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Local do evento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              name="ministry_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ministério</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ministério" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do evento" {...field} />
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
