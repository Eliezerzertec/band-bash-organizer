import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Music, Eye, EyeOff, Loader2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

      const { error: profileError } = await (supabase
        .from('profiles') as ReturnType<typeof supabase.from>)
        .upsert(
          {
            user_id: authData.user.id,
            name,
            email,
            phone: phone || null,
            status: 'pending_approval',
            musical_skills: selectedSkills,
          },
          { onConflict: 'user_id' }
        );

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
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">Cadastro de Musico</h1>
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
                <Label>Qual instrumento voce toca</Label>
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
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
