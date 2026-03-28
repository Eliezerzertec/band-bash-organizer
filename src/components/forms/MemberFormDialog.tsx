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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, X, Eye, EyeOff, Trash2, User, Mail, Phone, Lock, Image, Music, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Profile, useUpdateProfile, useUpdateMemberPassword, useDeleteMember } from '@/hooks/useProfiles';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';

const memberSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Máximo 100 caracteres'),
  email: z.string().trim().email('Email inválido'),
  phone: z.string().trim().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  avatar_url: z.string().trim().url('URL inválida').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
  musical_skills: z.array(z.string()),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Profile | null;
}

const skillOptions = [
  'Voz',
  'Violão',
  'Guitarra',
  'Baixo',
  'Bateria',
  'Teclado',
  'Piano',
  'Percussão',
  'Flauta',
  'Saxofone',
  'Trompete',
  'Trombone',
];

export function MemberFormDialog({ open, onOpenChange, member }: MemberFormDialogProps) {
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdateMemberPassword();
  const deleteMember = useDeleteMember();
  const { confirmDelete } = useConfirmDelete();
  const [newSkill, setNewSkill] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      avatar_url: '',
      status: 'active',
      musical_skills: [],
      password: '',
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
        password: '',
      });
    }
  }, [member, form]);

  const onSubmit = async (data: MemberFormData) => {
    if (!member) return;

    try {
      // Atualizar perfil
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        avatar_url: data.avatar_url || null,
        status: data.status,
        musical_skills: data.musical_skills,
      };

      await updateProfile.mutateAsync({ id: member.id, ...payload });

      // Atualizar senha se informada
      if (data.password && data.password.trim()) {
        try {
          await updatePassword.mutateAsync({
            userId: member.user_id,
            newPassword: data.password,
          });
        } catch (passwordError) {
          console.error('Erro ao atualizar senha:', passwordError);
          // Não bloqueia a edição se a senha falhar
          // O usuário já conseguiu atualizar o perfil
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
    }
  };

  const handleDelete = async () => {
    if (!member) return;
    confirmDelete(member.name, async () => {
      await deleteMember.mutateAsync(member.id);
      onOpenChange(false);
    });
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

  const isPending = updateProfile.isPending || updatePassword.isPending;

  return (
    <>
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
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Nome *
                    </FormLabel>
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
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email *
                    </FormLabel>
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
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        Telefone
                      </FormLabel>
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
                      <FormLabel className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        Status
                      </FormLabel>
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Nova Senha (deixe em branco para não alterar)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 6 caracteres" 
                          {...field} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-primary" />
                      URL da Foto
                    </FormLabel>
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
                    <FormLabel className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-primary" />
                      Habilidades Musicais
                    </FormLabel>
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
              <div className="flex justify-between gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={handleDelete}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Deletar
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
