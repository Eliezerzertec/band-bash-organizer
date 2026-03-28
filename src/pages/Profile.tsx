import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentProfile, useUpdateProfile } from '@/hooks/useProfiles';
import { toast } from 'sonner';

export default function Profile() {
  const { data: profile, isLoading } = useCurrentProfile();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setAvatarPreview(profile.avatar_url || '');
    }
  }, [profile]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem não pode ser maior que 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
    };
    reader.onerror = () => {
      toast.error('Erro ao processar a imagem');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    updateProfile.mutate({
      id: profile.id,
      name: name.trim(),
      phone: phone.trim() || null,
      avatar_url: avatarPreview || null,
    });
  };

  return (
    <MainLayout title="Editar Perfil" subtitle="Atualize seus dados pessoais">
      <div className="max-w-2xl">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Carregando perfil...</p>
          )}

          {!isLoading && !profile && (
            <p className="text-sm text-muted-foreground">Perfil não encontrado.</p>
          )}

          {profile && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 overflow-hidden rounded-full border border-border bg-muted">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>
                <div>
                  <Label htmlFor="avatar">Foto de perfil</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="mt-2"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG ou WEBP até 5MB.</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile.email} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
