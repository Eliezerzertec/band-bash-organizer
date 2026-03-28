import { useState, useEffect, useRef } from 'react';
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
  FormDescription,
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
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, Music, Zap, FileText, User, Image } from 'lucide-react';
import { Ministry, useCreateMinistry, useUpdateMinistry } from '@/hooks/useMinistries';
import { useChurches } from '@/hooks/useChurches';
import { useProfiles } from '@/hooks/useProfiles';

const ministrySchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Máximo 100 caracteres'),
  description: z.string().trim().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  church_id: z.string().min(1, 'Igreja é obrigatória'),
  leader_id: z.string().optional().or(z.literal('')),
  logo_url: z.string().trim().optional().or(z.literal('')),
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
  const { data: churches, isLoading: churchesLoading } = useChurches();
  const { data: profiles } = useProfiles();
  const { toast } = useToast();
  const isEditing = !!ministry;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const churchesEmpty = !churchesLoading && (!churches || churches.length === 0);

  const form = useForm<MinistryFormData>({
    resolver: zodResolver(ministrySchema),
    defaultValues: {
      name: '',
      description: '',
      church_id: '',
      leader_id: 'none',
      logo_url: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (ministry) {
        form.reset({
          name: ministry.name,
          description: ministry.description || '',
          church_id: ministry.church_id,
          leader_id: ministry.leader_id || 'none',
          logo_url: ministry.logo_url || '',
        });
        setLogoPreview(ministry.logo_url || '');
      } else {
        form.reset({
          name: '',
          description: '',
          church_id: churches?.[0]?.id || '',
          leader_id: 'none',
          logo_url: '',
        });
        setLogoPreview('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ministry, open, churches?.[0]?.id]);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma imagem',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'Imagem não pode ser maior que 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        form.setValue('logo_url', base64);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao processar imagem',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: MinistryFormData) => {
    if (churchesEmpty) {
      toast({
        title: 'Igreja obrigatória',
        description: 'Cadastre uma igreja antes de criar um ministério.',
        variant: 'destructive',
      });
      return;
    }
    const payload = {
      name: data.name,
      description: data.description || null,
      church_id: data.church_id,
      leader_id: data.leader_id === 'none' ? null : data.leader_id || null,
      logo_url: data.logo_url || null,
    };

    if (isEditing && ministry) {
      await updateMinistry.mutateAsync({ id: ministry.id, ...payload });
    } else {
      await createMinistry.mutateAsync(payload);
    }
    onOpenChange(false);
    form.reset();
    setLogoPreview('');
  };

  const isPending = createMinistry.isPending || updateMinistry.isPending || uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? 'Editar Ministério' : 'Novo Ministério'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {churchesEmpty && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                Nenhuma igreja cadastrada. Cadastre uma igreja antes de criar um ministério.
              </div>
            )}
            {/* Logo Upload Section */}
            <Card className="p-4 bg-muted/30 border-dashed">
              <div className="flex flex-col items-center gap-4">
                {logoPreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview('');
                        form.setValue('logo_url', '');
                      }}
                      className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center border-2 border-muted-foreground/20">
                    <Music className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">Logo do Ministério</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="gap-2"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading ? 'Enviando...' : 'Enviar Logo'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">PNG, JPG ou GIF (Máx. 5MB)</p>
                </div>
              </div>
            </Card>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-semibold">
                      <Music className="w-4 h-4 text-primary" />
                      Nome do Ministério *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Louvor e Adoração" 
                        {...field}
                        disabled={isPending}
                      />
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
                    <FormLabel className="flex items-center gap-2 font-semibold">
                      <Zap className="w-4 h-4 text-primary" />
                      Igreja *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
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
            </div>

            <FormField
              control={form.control}
              name="leader_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-semibold">
                    <User className="w-4 h-4 text-primary" />
                    Responsável do Ministério
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pessoa responsável por coordenar este ministério
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-semibold">
                    <FileText className="w-4 h-4 text-primary" />
                    Descrição
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o ministério, seus objetivos e características..."
                      className="min-h-24 resize-none"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Informações adicionais sobre o ministério
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || churchesEmpty}
                className="gap-2 flex-1"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? 'Atualizar Ministério' : 'Criar Ministério'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
