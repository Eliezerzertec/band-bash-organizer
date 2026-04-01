import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PostgrestError } from '@supabase/supabase-js';

export type MemberStatus = 'active' | 'inactive' | 'pending_approval';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  musical_skills: string[];
  status: MemberStatus;
  created_at: string;
  updated_at: string;
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: ['profiles', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!id,
  });
}

export function useCurrentProfile() {
  return useQuery({
    queryKey: ['currentProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...profile }: Partial<Profile> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['currentProfile'] });
      toast({ title: 'Perfil atualizado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar perfil', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MemberStatus }) => {
      // Quando ativar membro criado por auto-cadastro, garante vínculo em user_roles
      // para que as políticas RLS liberem os dados do painel dele.
      if (status === 'active') {
        const [{ data: sessionData }, { data: profileData, error: profileError }] = await Promise.all([
          supabase.auth.getSession(),
          supabase
            .from('profiles')
            .select('user_id')
            .eq('id', id)
            .maybeSingle(),
        ]);

        if (profileError) throw profileError;

        const adminUserId = sessionData.session?.user?.id;
        const memberUserId = profileData?.user_id;

        if (!memberUserId) {
          throw new Error('Não foi possível identificar o usuário do membro para ativação.');
        }

        const { data: existingMemberRoles, error: existingMemberRolesError } = await supabase
          .from('user_roles')
          .select('church_id')
          .eq('user_id', memberUserId)
          .eq('role', 'member')
          .limit(1);

        if (existingMemberRolesError) throw existingMemberRolesError;

        // Se já existir vínculo de membro, segue para ativação.
        if (!existingMemberRoles || existingMemberRoles.length === 0) {
          if (!adminUserId) {
            throw new Error('Sessão do administrador não encontrada para vincular o membro à igreja.');
          }

          const { data: adminRoles, error: adminRolesError } = await supabase
            .from('user_roles')
            .select('church_id')
            .eq('user_id', adminUserId)
            .eq('role', 'admin')
            .limit(1);

          if (adminRolesError) throw adminRolesError;

          const churchId = adminRoles?.[0]?.church_id;
          if (!churchId) {
            throw new Error('Administrador sem igreja vinculada. Não foi possível ativar o membro.');
          }

          const { error: roleError } = await supabase
            .from('user_roles')
            .upsert(
              { user_id: memberUserId, church_id: churchId, role: 'member' },
              { onConflict: 'user_id,church_id' }
            );

          if (roleError) throw roleError;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({ status } as Record<string, unknown>)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      const label = status === 'active' ? 'Membro ativado com sucesso!' : 'Membro desativado.';
      toast({ title: label });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: { 
      name: string; 
      email: string; 
      password: string; 
      phone?: string | null;
      status?: 'active' | 'inactive';
      musical_skills?: string[];
      ministry_id?: string;
    }) => {
      try {
        console.log('Criando membro com dados:', payload);
        
        // TENTATIVA 1: Usar Edge Function (melhor porque contorna rate limit)
        try {
          console.log('Tentando via Edge Function...');
          const { data, error } = await supabase.functions.invoke('create-user', {
            body: payload,
          });

          if (!error && data?.user_id) {
            console.log('Membro criado via Edge Function:', data.user_id);
            // Atualizar perfil com campos adicionais
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                status: payload.status || 'active',
                musical_skills: payload.musical_skills || [],
              })
              .eq('user_id', data.user_id);

            // Vincular membro à igreja via user_roles
            if (payload.ministry_id) {
              const { data: ministry } = await supabase
                .from('ministries')
                .select('church_id')
                .eq('id', payload.ministry_id)
                .maybeSingle();
              if (ministry?.church_id) {
                await supabase.from('user_roles').upsert(
                  { user_id: data.user_id, church_id: ministry.church_id, role: 'member' },
                  { onConflict: 'user_id,church_id' }
                );
              }
            }

            if (!updateError) {
              return { user_id: data.user_id };
            }
          }
          
          if (error) {
            console.warn('Edge Function não disponível:', error.message);
          }
        } catch (err) {
          console.warn('Edge Function falhou, tentando fallback...', err);
        }

        // TENTATIVA 2: Usar auth.signUp direto (pode dar rate limit)
        console.log('Tentando via auth.signUp...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              name: payload.name,
            },
          },
        });

        if (authError) {
          console.error('Auth signUp error:', authError);
          
          // Se for rate limit, mostrar mensagem clara
          if (authError.message.includes('40 seconds') || authError.message.includes('8 seconds')) {
            throw new Error(`Aguarde alguns segundos antes de criar outro membro. ${authError.message}`);
          }
          
          throw new Error(`Erro ao registrar: ${authError.message}`);
        }

        if (!authData.user) {
          throw new Error('Usuário não foi criado');
        }

        const userId = authData.user.id;
        console.log('Usuário criado, ID:', userId);

        // Criar perfil com todos os campos
        console.log('Inserindo perfil com dados:', {
          user_id: userId,
          email: payload.email,
          name: payload.name,
          phone: payload.phone || null,
          status: payload.status || 'active',
          musical_skills: payload.musical_skills || [],
        });

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            email: payload.email,
            name: payload.name,
            phone: payload.phone || null,
            status: payload.status || 'active',
            musical_skills: payload.musical_skills || [],
          }, { onConflict: 'user_id' });

        if (profileError) {
          const profileErr = profileError as PostgrestError;
          console.error('Profile error completo:', {
            message: profileError.message,
            code: profileErr.code,
            details: profileErr.details,
            hint: profileErr.hint,
          });
          
          // Mensagem de erro mais específica
          let errorMsg = `Erro ao criar perfil: ${profileError.message}`;
          if (profileErr.code === '42501') {
            errorMsg = 'Erro de permissão: RLS policy não permite INSERT. Execute FIX_PROFILES_RLS_NOW.sql';
          } else if (profileErr.code === '23505') {
            errorMsg = 'Erro: Email já está registrado';
          }
          
          throw new Error(errorMsg);
        }

        // Vincular membro à igreja via user_roles
        if (payload.ministry_id) {
          const { data: ministry } = await supabase
            .from('ministries')
            .select('church_id')
            .eq('id', payload.ministry_id)
            .maybeSingle();
          if (ministry?.church_id) {
            await supabase.from('user_roles').upsert(
              { user_id: userId, church_id: ministry.church_id, role: 'member' },
              { onConflict: 'user_id,church_id' }
            );
          }
        }

        console.log('Perfil criado com sucesso:', profileData);
        return { user_id: userId };
      } catch (err) {
        console.error('CreateMember error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({ title: 'Membro criado com sucesso!' });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('CreateMember mutation error:', message);
      toast({ 
        title: 'Erro ao criar membro', 
        description: message, 
        variant: 'destructive' 
      });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (profileId: string) => {
      // Deletar o perfil (isso também deleta o usuário de auth por CASCADE)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
      return { profileId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({ title: 'Membro deletado com sucesso!' });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({ 
        title: 'Erro ao deletar membro', 
        description: message, 
        variant: 'destructive' 
      });
    },
  });
}

export function useUpdateMemberPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      try {
        // Tentar primeiro com a versão simpler
        let { data, error } = await supabase.rpc('update_user_password_simple', {
          user_id: userId,
          new_password: newPassword,
        });

        // Se não encontrar, tentar com a versão original
        if (error?.message.includes('does not exist')) {
          const result = await supabase.rpc('update_user_password', {
            user_id: userId,
            new_password: newPassword,
          });
          data = result.data;
          error = result.error;
        }

        if (error) {
          throw new Error(error.message || 'Erro ao chamar função de atualização de senha');
        }
        
        if (data && !data.success) {
          throw new Error(data.message || 'Erro ao atualizar senha');
        }
        
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar senha';
        throw new Error(message);
      }
    },
    onSuccess: () => {
      toast({ 
        title: 'Senha atualizada com sucesso!',
        description: 'A senha do membro foi alterada.'
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({ 
        title: 'Erro ao atualizar senha', 
        description: message, 
        variant: 'destructive' 
      });
    },
  });
}
