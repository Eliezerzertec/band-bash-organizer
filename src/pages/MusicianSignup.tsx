import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSignupMinistries } from '@/hooks/useMinistries';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const musicalSkills = [
  'Voz',
  'Violao',
  'Guitarra',
  'Baixo',
  'Bateria',
  'Teclado',
  'Piano',
  'Percussao',
  'Flauta',
  'Saxofone',
  'Trompete',
  'Trombone',
];

export default function MusicianSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedMinistryId, setSelectedMinistryId] = useState('');
  const [acceptedCommitmentTerm, setAcceptedCommitmentTerm] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { data: ministries = [], isLoading: ministriesLoading } = useSignupMinistries();

  const selectedMinistry = ministries.find((ministry) => ministry.id === selectedMinistryId) || null;

  const safeSignOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    const isSessionMissing = !!error && (
      error.message?.includes('Auth session missing') ||
      error.message?.includes('Session from session_id claim in JWT does not exist')
    );
    if (error && !isSessionMissing) throw error;
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSkills.length === 0) {
      toast.error('Selecione pelo menos um instrumento.');
      return;
    }

    if (!selectedMinistry) {
      toast.error('Selecione um ministério para concluir o cadastro.');
      return;
    }

    if (!acceptedCommitmentTerm) {
      toast.error('Você precisa aceitar o Termo de Compromisso para concluir o cadastro.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Nao foi possivel criar o usuario.');
      }

      const registrationDate = authData.user.created_at || new Date().toISOString();

      const { error: profileError } = await (supabase
        .from('profiles') as ReturnType<typeof supabase.from>)
        .upsert({
          user_id: authData.user.id,
          name,
          email,
          phone: phone || null,
          status: 'pending_approval',
          musical_skills: selectedSkills,
          commitment_term_accepted: true,
          commitment_term_accepted_at: registrationDate,
          commitment_term_payload: {
            church_name: selectedMinistry.church?.name || '',
            church_address: selectedMinistry.church?.address || '',
            church_phone: selectedMinistry.church?.contact || '',
            ministry_name: selectedMinistry.name,
            member_role: selectedSkills.join(', '),
            agreed_at: registrationDate,
            term_version: '2026-04-01',
            ministry_id: selectedMinistry.id,
          },
        } as Record<string, unknown>, { onConflict: 'user_id' });

      if (profileError) {
        throw profileError;
      }

      // Sempre faz sign out para garantir que o membro não entre antes da aprovação
      await safeSignOut();

      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao concluir cadastro';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        {submitted ? (
          <Card className="w-full max-w-md border-border/60 bg-card/90 backdrop-blur">
            <CardContent className="p-10 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Cadastro enviado!</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Seu cadastro foi realizado com sucesso e está <strong>aguardando confirmação do administrador</strong>.
                </p>
                <p className="mt-2 text-muted-foreground text-sm">
                  Após a aprovação, você receberá acesso ao sistema e poderá fazer login normalmente.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Entre em contato com o responsável da sua equipe para agilizar a aprovação.
              </div>
              <Link to="/login">
                <Button variant="outline" className="w-full mt-2">Voltar para o login</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-2xl border-border/60 bg-card/90 backdrop-blur">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background p-2 shadow-sm">
                <img
                  src="/logo%20valechurchPreto.png"
                  alt="Vale Music Lavras"
                  className="h-full w-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">Cadastro de Músicos</h1>
              <p className="mt-2 text-muted-foreground">
                Preencha os dados para criar seu acesso ao sistema.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Joao da Silva"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Numero de celular</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="ministry">Ministérios disponíveis</Label>
                  <Select value={selectedMinistryId} onValueChange={setSelectedMinistryId}>
                    <SelectTrigger id="ministry" className="mt-1">
                      <SelectValue
                        placeholder={
                          ministriesLoading
                            ? 'Carregando ministérios...'
                            : 'Selecione um ministério'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {ministries.map((ministry) => (
                        <SelectItem key={ministry.id} value={ministry.id}>
                          {ministry.name}{ministry.church?.name ? ` - ${ministry.church.name}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMinistry?.church?.name && (
                    <p className="text-xs text-muted-foreground">
                      Igreja vinculada: {selectedMinistry.church.name}
                    </p>
                  )}
                  {!ministriesLoading && ministries.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Os ministérios exibidos aqui são os mesmos cadastrados na página de ADM.
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Senha de acesso</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimo 6 caracteres"
                      minLength={6}
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Qual instrumento você toca</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {musicalSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedSkills.length > 0
                    ? `${selectedSkills.length} instrumento(s) selecionado(s)`
                    : 'Selecione ao menos um instrumento'}
                </p>
              </div>

              <div className="space-y-3 rounded-lg border border-border/70 bg-muted/30 p-4">
                <p className="text-sm font-semibold">Regulamento e Termo de Compromisso</p>
                <div className="max-h-56 overflow-y-auto rounded-md border bg-background p-3 text-xs text-muted-foreground leading-relaxed space-y-2">
                  <p><strong>CAPÍTULO 1 – DA MISSÃO DO MINISTÉRIO</strong></p>
                  <p>O Ministério de Louvor tem como finalidade conduzir a igreja à adoração a Deus por meio da música, colaborando com a liturgia dos cultos e demais atividades da igreja.</p>
                  <p>O ministério busca: glorificar a Deus através da música, conduzir a congregação à adoração, servir à igreja com excelência espiritual e musical e desenvolver comunhão entre os integrantes.</p>

                  <p><strong>CAPÍTULO 2 – DOS REQUISITOS PARA PARTICIPAR</strong></p>
                  <p>Para integrar o Ministério de Louvor, o candidato deverá: ser membro ou congregado ativo da igreja, demonstrar vida cristã compatível com os princípios bíblicos, demonstrar capacidade musical mínima para exercer sua função, passar por avaliação quando necessário e aceitar este regulamento.</p>
                  <p>A entrada de novos membros será definida pela liderança do ministério em conjunto com a liderança pastoral.</p>

                  <p><strong>CAPÍTULO 3 – DOS COMPROMISSOS ESPIRITUAIS</strong></p>
                  <p>O integrante compromete-se a manter vida de oração e leitura da Palavra, buscar santidade e testemunho cristão, participar da vida espiritual da igreja e entender que o ministério de louvor é um serviço espiritual antes de ser musical.</p>

                  <p><strong>CAPÍTULO 4 – DOS COMPROMISSOS COM O MINISTÉRIO</strong></p>
                  <p>O membro compromete-se a participar dos ensaios programados, chegar pontualmente aos cultos e ensaios, estudar previamente as músicas definidas, manter postura adequada durante ensaios e ministrações e zelar pelos equipamentos e instrumentos da igreja.</p>

                  <p><strong>CAPÍTULO 5 – DO COMPORTAMENTO E TESTEMUNHO</strong></p>
                  <p>Espera-se que o integrante demonstre respeito à liderança pastoral e ministerial, trabalhe em equipe com os demais integrantes, evite comportamentos que gerem divisão ou conflitos e mantenha bom testemunho dentro e fora da igreja.</p>

                  <p><strong>CAPÍTULO 6 – DA ORGANIZAÇÃO DO MINISTÉRIO</strong></p>
                  <p>O Ministério de Louvor será organizado com líder do ministério, equipe de músicos, equipe de vocal e equipe técnica. As escalas de ministração serão organizadas pela liderança.</p>

                  <p><strong>CAPÍTULO 7 – DAS AUSÊNCIAS</strong></p>
                  <p>O integrante deverá informar antecipadamente quando não puder participar de ensaios ou cultos e evitar faltas frequentes sem justificativa. Faltas constantes poderão resultar em reavaliação da participação no ministério.</p>

                  <p><strong>CAPÍTULO 8 – DA DISCIPLINA</strong></p>
                  <p>Caso um integrante descumpra os compromissos estabelecidos, apresente conduta incompatível com o ministério ou gere conflitos dentro da equipe, a liderança poderá aplicar orientação pastoral, acompanhamento, afastamento temporário ou desligamento do ministério, buscando sempre restauração e edificação.</p>

                  <p><strong>CAPÍTULO 9 – DA SAÍDA DO MINISTÉRIO</strong></p>
                  <p>O integrante poderá solicitar desligamento do ministério a qualquer momento, comunicando previamente à liderança. Caso se afaste por longo período, seu retorno deverá ser avaliado pela liderança.</p>

                  <p><strong>DECLARAÇÃO DE COMPROMISSO</strong></p>
                  <p>Declaro que li e compreendi este regulamento e assumo o compromisso de servir no Ministério de Louvor com dedicação, respeito, unidade e temor a Deus.</p>
                  <p>O termo completo ficará salvo no seu perfil para download em PDF.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptedCommitmentTerm"
                    checked={acceptedCommitmentTerm}
                    onCheckedChange={(checked) => setAcceptedCommitmentTerm(checked === true)}
                  />
                  <Label htmlFor="acceptedCommitmentTerm" className="text-sm leading-relaxed">
                    Li e estou de acordo com o Regulamento e Termo de Compromisso do Ministério de Louvor.
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || ministriesLoading || ministries.length === 0}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  'Criar conta'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Ja possui conta?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Entrar no sistema
              </Link>
            </p>
          </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
