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
import { Loader2, Calendar, Clock, MapPin, FileText, Music } from 'lucide-react';
import { Schedule, useCreateSchedule, useUpdateSchedule, useAddScheduleAssignment, useRemoveScheduleAssignment } from '@/hooks/useSchedules';
import { useChurches } from '@/hooks/useChurches';
import { useMinistries } from '@/hooks/useMinistries';
import { useTeams, type TeamMember } from '@/hooks/useTeams';

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

interface SchedulePayload {
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  church_id: string;
  ministry_id: string | null;
  created_by: null;
}

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: Schedule | null;
}

// Mensagens randômicas para descrição
const descricaoMensagens = [
  'Vamos estar todos juntos para louvar o Senhor com muita alegria!',
  'Um momento especial de adoração e comunhão com o nosso Deus!',
  'Venha celebrar o poder e a graça do Senhor conosco!',
  'Juntos vamos exaltar o nome do Senhor em grande louvor!',
  'Uma noite abençoada de celebração e comunhão espiritual!',
  'Vamos levantar nossas vozes em gratidão ao Altíssimo!',
  'Prepare o seu coração para um culto especial de celebração!',
  'Nos vemos para um encontro inesquecível com o Senhor!',
  'Uma oportunidade de crescimento espiritual e comunhão!',
  'Que este seja um culto de bênção e renovação espiritual!',
];

function getRandomDescricao(): string {
  return descricaoMensagens[Math.floor(Math.random() * descricaoMensagens.length)];
}

export function ScheduleFormDialog({ open, onOpenChange, schedule }: ScheduleFormDialogProps) {
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const addAssignment = useAddScheduleAssignment();
  const removeAssignment = useRemoveScheduleAssignment();
  const { data: churches } = useChurches();
  const { data: ministries } = useMinistries();
  const { data: teams } = useTeams();
  const isEditing = !!schedule;

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

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
    if (open) {
      if (schedule) {
        form.reset({
          title: schedule.title || '',
          description: schedule.description || '',
          event_date: schedule.event_date,
          start_time: schedule.start_time || '',
          end_time: schedule.end_time || '',
          location: schedule.location || '',
          church_id: schedule.church_id || (schedule.church?.id || ''),
          ministry_id: schedule.ministry_id || (schedule.ministry?.id || ''),
        });
        
        const assignments = schedule.schedule_assignments || [];
        const assignmentTeamId = assignments.find((assignment) => assignment.team_id)?.team_id || '';
        setSelectedTeamId(assignmentTeamId);
      } else {
        const today = new Date().toISOString().split('T')[0];
        const defaultChurchId = churches && churches.length > 0 ? churches[0].id : '';
        form.reset({
          title: 'Culto de Celebração',
          description: getRandomDescricao(),
          event_date: today,
          start_time: '19:00',
          end_time: '20:30',
          location: '',
          church_id: defaultChurchId,
          ministry_id: '',
        });
        setSelectedTeamId('');
      }
    }
  }, [schedule, open, form, churches]);

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      if (!selectedTeamId) {
        alert('Selecione uma equipe para a escala');
        return;
      }

      const payload: SchedulePayload = {
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

      let scheduleId: string;

      if (isEditing && schedule) {
        await updateSchedule.mutateAsync({ id: schedule.id, ...payload });
        scheduleId = schedule.id;
        
        // Remover assignments antigos
        const oldAssignments = schedule.schedule_assignments || [];
        for (const assignment of oldAssignments) {
          await removeAssignment.mutateAsync(assignment.id);
        }
      } else {
        const result = await createSchedule.mutateAsync(payload);
        scheduleId = result.id;
      }

      // Adicionar assignments da equipe selecionada
      const selectedTeam = teams?.find((team) => team.id === selectedTeamId);
      if (selectedTeam) {
        const teamMembers = selectedTeam.team_members || [];
        for (const member of teamMembers as TeamMember[]) {
          await addAssignment.mutateAsync({
            schedule_id: scheduleId,
            profile_id: member.profile_id,
            team_id: selectedTeamId,
            role_assigned: member.role_in_team || null,
          });
        }
      }

      onOpenChange(false);
      form.reset();
      setSelectedTeamId('');
    } catch (error) {
      console.error('Erro ao salvar escala:', error);
      alert('Erro ao salvar escala');
    }
  };

  const isPending = createSchedule.isPending || updateSchedule.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Escala' : 'Nova Escala'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Informações Básicas</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-primary" />
                      Título *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Louvor - Domingo 24/01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Descrição
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detalhes sobre a escala" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Data *
                      </FormLabel>
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
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Hora Início *
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora Fim</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Local
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o local" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="templo-principal">Templo Principal</SelectItem>
                        <SelectItem value="templinho">Templinho</SelectItem>
                        <SelectItem value="templo-kids">Templo Kids</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Igreja e Ministério */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Igreja e Ministério</h3>

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
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ministério (opcional)" />
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
            </div>

            {/* Seleção de Equipes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Equipe da Escala</h3>

              {/* Equipes Disponíveis */}
              {teams && teams.length > 0 && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-xs font-medium mb-3 text-muted-foreground">Selecione uma equipe:</p>
                  <Select onValueChange={setSelectedTeamId} value={selectedTeamId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha a equipe escalada" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
