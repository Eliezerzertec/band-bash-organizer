import { useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { ChevronLeft, Loader2, Users, Music, User, Plus, X } from 'lucide-react';
import { useTeams, useCreateTeam, useUpdateTeam, useAddTeamMember, useRemoveTeamMember, Team } from '@/hooks/useTeams';
import { useMinistries } from '@/hooks/useMinistries';
import { useProfiles } from '@/hooks/useProfiles';
import { useToast } from '@/hooks/use-toast';

const TEAM_COLORS = [
  { name: 'Azul', value: 'blue', bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-700' },
  { name: 'Vermelho', value: 'red', bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-700' },
  { name: 'Verde', value: 'green', bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700' },
  { name: 'Roxo', value: 'purple', bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-700' },
  { name: 'Laranja', value: 'orange', bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-700' },
  { name: 'Rosa', value: 'pink', bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-700' },
  { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-700' },
  { name: 'Cyan', value: 'cyan', bg: 'bg-cyan-100', border: 'border-cyan-500', text: 'text-cyan-700' },
  { name: 'Prata', value: 'slate', bg: 'bg-slate-100', border: 'border-slate-500', text: 'text-slate-700' },
];

const teamSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Máximo 100 caracteres'),
  description: z.string().trim().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  ministry_id: z.string().min(1, 'Ministério é obrigatório'),
  leader_id: z.string().optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface SelectedMemberWithRole {
  profileId: string;
  skill: string;
}

export default function TeamForm() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [selectedMembers, setSelectedMembers] = useState<SelectedMemberWithRole[]>([]);
  
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: ministries, isLoading: ministriesLoading } = useMinistries();
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const addTeamMember = useAddTeamMember();
  const removeTeamMember = useRemoveTeamMember();
  const { toast } = useToast();
  const isEditing = !!teamId;
  const team = isEditing ? teams?.find(t => t.id === teamId) : null;
  const isLoading = teamsLoading || ministriesLoading || profilesLoading;

  // Ao carregar uma equipe existente, popular selectedMembers
  React.useEffect(() => {
    if (isEditing && team?.team_members) {
      const membersToSelect = team.team_members.map(tm => ({
        profileId: tm.profile_id,
        skill: tm.role_in_team || '',
      }));
      setSelectedMembers(membersToSelect);
    }
  }, [team, isEditing]);

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team?.name || '',
      description: team?.description || '',
      ministry_id: team?.ministry_id || ministries?.[0]?.id || '',
      leader_id: team?.leader_id || 'none',
      color: team?.color || 'blue',
    },
  });

  // Atualizar form quando dados carregam
  React.useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        description: team.description || '',
        ministry_id: team.ministry_id,
        leader_id: team.leader_id || 'none',
        color: team.color || 'blue',
      });
    } else if (ministries && ministries.length > 0 && form.getValues('ministry_id') === '') {
      form.setValue('ministry_id', ministries[0].id);
    }
  }, [team, ministries, form]);

  const onSubmit = async (data: TeamFormData) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        ministry_id: data.ministry_id,
        leader_id: data.leader_id === 'none' ? null : (data.leader_id || null),
        color: data.color || 'blue',
      };

      let savedTeamId: string;

      if (isEditing && team) {
        await updateTeam.mutateAsync({ id: team.id, ...payload });
        savedTeamId = team.id;
      } else {
        const newTeam = await createTeam.mutateAsync(payload);
        savedTeamId = newTeam.id;
      }

      // Remover membros antigos
      if (isEditing && team?.team_members) {
        for (const oldMember of team.team_members) {
          await removeTeamMember.mutateAsync(oldMember.id);
        }
      }

      // Adicionar novos membros
      for (const memberData of selectedMembers) {
        await addTeamMember.mutateAsync({
          team_id: savedTeamId,
          profile_id: memberData.profileId,
          role_in_team: memberData.skill || null,
        });
      }

      toast({ title: isEditing ? 'Equipe atualizada com sucesso!' : 'Equipe criada com sucesso!' });
      navigate('/teams');
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      const message = error instanceof Error ? error.message : 'Erro ao salvar equipe';
      toast({ 
        title: 'Erro ao salvar equipe', 
        description: message, 
        variant: 'destructive' 
      });
    }
  };

  const isPending = createTeam.isPending || updateTeam.isPending || addTeamMember.isPending || removeTeamMember.isPending;

  const toggleMember = (profileId: string) => {
    const existing = selectedMembers.find(m => m.profileId === profileId);
    if (existing) {
      setSelectedMembers(selectedMembers.filter(m => m.profileId !== profileId));
    } else {
      const profile = profiles?.find(p => p.id === profileId);
      const defaultSkill = profile?.musical_skills?.[0] || '';
      setSelectedMembers([...selectedMembers, { profileId, skill: defaultSkill }]);
    }
  };

  const updateMemberSkill = (profileId: string, skill: string) => {
    setSelectedMembers(selectedMembers.map(m =>
      m.profileId === profileId ? { ...m, skill } : m
    ));
  };

  return (
    <MainLayout
      title={isEditing ? 'Editar Equipe' : 'Criar Nova Equipe'}
      subtitle={isEditing ? 'Atualize os dados da equipe' : 'Configure uma nova equipe de louvor'}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="gap-2 -ml-4"
          onClick={() => navigate('/teams')}
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Equipes
        </Button>

        {/* Loading State */}
        {isLoading ? (
          <div className="card-elevated p-8 space-y-4">
            <div className="h-12 bg-muted rounded-lg animate-pulse" />
            <div className="h-12 bg-muted rounded-lg animate-pulse" />
            <div className="h-12 bg-muted rounded-lg animate-pulse" />
            <div className="h-32 bg-muted rounded-lg animate-pulse" />
          </div>
        ) : (
          <>
            {/* Main Form Card */}
            <div className="card-elevated p-6 md:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Nome */}
                  <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base">
                      <Users className="w-5 h-5 text-primary" />
                      Nome da Equipe *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Violões" 
                        {...field}
                        className="h-11"
                      />
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
                    <FormLabel className="flex items-center gap-2 text-base">
                      <Music className="w-5 h-5 text-primary" />
                      Ministério *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione o ministério" />
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

              {/* Líder */}
              <FormField
                control={form.control}
                name="leader_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base">
                      <User className="w-5 h-5 text-primary" />
                      Líder da Equipe
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione o líder" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem líder</SelectItem>
                        {profiles?.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Descrição
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o propósito e características da equipe..." 
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cor da Equipe */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Cor da Equipe
                    </FormLabel>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {TEAM_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => field.onChange(color.value)}
                          className={`w-12 h-12 rounded-lg border-2 transition-all flex items-center justify-center ${
                            field.value === color.value
                              ? `${color.border} border-4 shadow-lg`
                              : `border-gray-200 hover:border-gray-300 ${color.bg}`
                          }`}
                          title={color.name}
                        >
                          {field.value === color.value && (
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Membros */}
              <div className="space-y-3 border-t pt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Adicionar Membros
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione os membros que farão parte desta equipe
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {profiles?.map((profile) => {
                    const isSelected = selectedMembers.find(m => m.profileId === profile.id);
                    return (
                    <div 
                      key={profile.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2" onClick={() => toggleMember(profile.id)}>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {profile.avatar_url ? (
                            <img 
                              src={profile.avatar_url} 
                              alt={profile.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {profile.name?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{profile.name}</p>
                          <p className="text-xs text-muted-foreground">{profile.email}</p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'border-border'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Seleção de Habilidade */}
                      {isSelected && profile.musical_skills && profile.musical_skills.length > 0 && (
                        <div className="pl-13 space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Habilidade na Equipe:</label>
                          <Select 
                            value={isSelected.skill} 
                            onValueChange={(skill) => updateMemberSkill(profile.id, skill)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {profile.musical_skills.map((skill) => (
                                <SelectItem key={skill} value={skill}>
                                  {skill}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {isSelected && (!profile.musical_skills || profile.musical_skills.length === 0) && (
                        <p className="text-xs text-amber-600 pl-13">
                          Nenhuma habilidade cadastrada para este membro
                        </p>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Membros Selecionados */}
              {selectedMembers.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm font-medium text-foreground">
                    {selectedMembers.length} membro{selectedMembers.length !== 1 ? 's' : ''} selecionado{selectedMembers.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((memberData) => {
                      const member = profiles?.find(p => p.id === memberData.profileId);
                      return (
                        <div 
                          key={memberData.profileId}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                        >
                          <span>{member?.name}</span>
                          {memberData.skill && (
                            <span className="text-xs opacity-75">• {memberData.skill}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleMember(memberData.profileId)}
                            className="hover:bg-primary/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/teams')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gap-2 btn-gradient-primary"
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditing ? 'Salvar Alterações' : 'Criar Equipe'}
                </Button>
              </div>
                </form>
              </Form>
            </div>

            {/* Info Card */}
            <div className="card-elevated p-4 bg-info/5 border border-info/20">
              <p className="text-sm text-foreground">
                <strong>💡 Dica:</strong> Você poderá adicionar ou remover membros da equipe a qualquer momento. Os dados serão salvos automaticamente.
              </p>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
