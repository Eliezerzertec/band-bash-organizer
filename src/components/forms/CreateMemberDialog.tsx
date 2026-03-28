import { useState } from 'react';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, User, Mail, Phone, Lock, Music, CheckCircle2, Eye, EyeOff, X } from 'lucide-react';
import { useCreateMember } from '@/hooks/useProfiles';
import { useMinistries } from '@/hooks/useMinistries';

const musicalSkills = [
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

const createMemberSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Máximo 100 caracteres'),
  email: z.string().trim().email('Email inválido'),
  phone: z.string().trim().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  status: z.enum(['active', 'inactive']),
  ministry_id: z.string().min(1, 'Ministério é obrigatório'),
  musical_skills: z.array(z.string()).default([]),
});

type CreateMemberFormData = z.infer<typeof createMemberSchema>;

interface CreateMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMemberDialog({ open, onOpenChange }: CreateMemberDialogProps) {
  const createMember = useCreateMember();
  const { data: ministries = [] } = useMinistries();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const form = useForm<CreateMemberFormData>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      status: 'active',
      ministry_id: '',
      musical_skills: [],
    },
  });

  const onSubmit = async (data: CreateMemberFormData) => {
    try {
      await createMember.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        password: data.password,
        status: data.status,
        ministry_id: data.ministry_id,
        musical_skills: selectedSkills,
      });
      form.reset();
      setSelectedSkills([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Create member error:', error);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const isPending = createMember.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Membro</DialogTitle>
        </DialogHeader>
        
        {/* Info Alert */}
        <Alert className="bg-info-light border-info dark:bg-info/20 dark:border-info">
          <AlertCircle className="h-4 w-4 text-info dark:text-info-foreground" />
          <AlertDescription className="text-info dark:text-info-foreground ml-2 text-sm">
            Preencha os dados do novo membro. Um email de confirmação será enviado.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Nome Completo *
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
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
                    <Input type="email" placeholder="joao@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone */}
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
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ministério */}
            <FormField
              control={form.control}
              name="ministry_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-primary" />
                    Ministério *
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ministério" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ministries.map((ministry) => (
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

            {/* Senha */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Senha de Acesso *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
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

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Status *
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
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

            {/* Habilidades Musicais */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                Habilidades Musicais
              </label>
              <div className="grid grid-cols-2 gap-2">
                {musicalSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {selectedSkills.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {selectedSkills.length} habilidade{selectedSkills.length !== 1 ? 's' : ''} selecionada{selectedSkills.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Membro
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
