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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, Church as ChurchIcon, MapPin, Phone, Image } from 'lucide-react';
import { Church, useCreateChurch, useUpdateChurch } from '@/hooks/useChurches';

const churchSchema = z.object({
  name: z.string().trim().min(1, 'Nome da igreja é obrigatório').max(100, 'Máximo 100 caracteres'),
  address: z.string().trim().max(255, 'Máximo 255 caracteres').optional().or(z.literal('')),
  contact: z.string().trim().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  logo_url: z.string().trim().optional().or(z.literal('')),
  pastor_name: z.string().trim().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
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
  const { toast } = useToast();
  const isEditing = !!church;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const form = useForm<ChurchFormData>({
    resolver: zodResolver(churchSchema),
    defaultValues: {
      name: '',
      address: '',
      contact: '',
      logo_url: '',
      pastor_name: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (church) {
        form.reset({
          name: church.name,
          address: church.address || '',
          contact: church.contact || '',
          logo_url: church.logo_url || '',
          pastor_name: church.pastor_name || '',
        });
        setLogoPreview(church.logo_url || '');
      } else {
        form.reset({
          name: '',
          address: '',
          contact: '',
          logo_url: '',
          pastor_name: '',
        });
        setLogoPreview('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [church, open]);

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
      // Create a preview
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

  const onSubmit = async (data: ChurchFormData) => {
    const payload = {
      name: data.name,
      address: data.address || null,
      contact: data.contact || null,
      logo_url: data.logo_url || null,
      pastor_name: data.pastor_name || null,
    };

    if (isEditing && church) {
      await updateChurch.mutateAsync({ id: church.id, ...payload });
    } else {
      await createChurch.mutateAsync(payload);
    }
    onOpenChange(false);
    form.reset();
    setLogoPreview('');
  };

  const isPending = createChurch.isPending || updateChurch.isPending || uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? 'Editar Igreja' : 'Nova Igreja'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <ChurchIcon className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">Logo da Igreja</p>
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
                      <ChurchIcon className="w-4 h-4 text-primary" />
                      Nome da Igreja *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Igreja do Evangelho" 
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-semibold">
                    <MapPin className="w-4 h-4 text-primary" />
                    Endereço
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Rua, número, complemento, bairro, cidade, estado" 
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Endereço completo da sede da igreja
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-semibold">
                    <Phone className="w-4 h-4 text-primary" />
                    Contato
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(XX) XXXXX-XXXX ou email@church.com" 
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Telefone ou email principal de contato
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pastor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Nome do Pastor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do pastor responsável"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
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
                disabled={isPending}
                className="gap-2 flex-1"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? 'Atualizar Igreja' : 'Criar Igreja'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
