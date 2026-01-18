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
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Profile, useUpdateProfile } from '@/hooks/useProfiles';

const memberSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Máximo 100 caracteres'),
  email: z.string().trim().email('Email inválido'),
  phone: z.string().trim().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  avatar_url: z.string().trim().url('URL inválida').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
  musical_skills: z.array(z.string()),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Profile | null;
}

const skillOptions = [
  'Vocal',
  'Violão',
  'Guitarra',
  'Baixo',
  'Bateria',
  'Teclado',
  'Piano',
  'Saxofone',
  'Trompete',
  'Violino',
  'Flauta',
  'Percussão',
  'Back Vocal',
  'Regência',
];

export function MemberFormDialog({ open, onOpenChange, member }: MemberFormDialogProps) {
  const updateProfile = useUpdateProfile();
  const [newSkill, setNewSkill] = useState('');

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      avatar_url: '',
      status: 'active',
      musical_skills: [],
    },
  });

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        avatar_url: member.avatar_url || '',
        status: member.status,
        musical_skills: member.musical_skills || [],
      });
    }
  }, [member, form]);

  const onSubmit = async (data: MemberFormData) => {
    if (!member) return;

    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      avatar_url: data.avatar_url || null,
      status: data.status,
      musical_skills: data.musical_skills,
    };

    await updateProfile.mutateAsync({ id: member.id, ...payload });
    onOpenChange(false);
  };

  const addSkill = (skill: string) => {
    const currentSkills = form.getValues('musical_skills');
    if (!currentSkills.includes(skill)) {
      form.setValue('musical_skills', [...currentSkills, skill]);
    }
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues('musical_skills');
    form.setValue('musical_skills', currentSkills.filter(s => s !== skillToRemove));
  };

  const isPending = updateProfile.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Membro</DialogTitle>
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
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Foto</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="musical_skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habilidades Musicais</FormLabel>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={addSkill} value="">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Adicionar habilidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {skillOptions
                          .filter(skill => !field.value.includes(skill))
                          .map((skill) => (
                            <SelectItem key={skill} value={skill}>
                              {skill}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
