import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Music, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const safeSignOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    const isSessionMissing = !!error && (
      error.message?.includes('Auth session missing') ||
      error.message?.includes('Session from session_id claim in JWT does not exist')
    );
    if (error && !isSessionMissing) throw error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);

      // Verifica se o membro está pendente de aprovação
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('status')
          .eq('user_id', session.user.id)
          .maybeSingle();
        const rawStatus = (profile as { status?: string })?.status;
        if (rawStatus === 'pending_approval') {
          await safeSignOut();
          toast.error('Seu cadastro ainda está aguardando confirmação do administrador.');
          return;
        }
        if (rawStatus === 'inactive') {
          await safeSignOut();
          toast.error('Sua conta está inativa. Entre em contato com o administrador.');
          return;
        }
      }

      toast.success('Login realizado com sucesso!');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email ou senha inválidos';
      
      if (errorMessage.includes('Email not confirmed')) {
        toast.error('Seu email ainda não foi confirmado. Verifique sua caixa de entrada.');
      } else if (errorMessage.includes('Invalid login credentials')) {
        toast.error('Email ou senha inválidos. Tente novamente.');
      } else if (errorMessage.includes('User not found')) {
        toast.error('Usuário não encontrado.');
      } else {
        toast.error(errorMessage);
      }
      
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card/80 p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
          {/* Logo */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/OIP.png"
              alt="Logo Valechurch"
              className="mb-6 h-64 w-64 object-contain"
            />
          </div>

          {/* Header */}
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-semibold text-foreground">Bem-vindo de volta</h2>
            <p className="text-muted-foreground mt-2">Acesse sua conta para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-input/60 bg-background/70 focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-12 border-input/60 bg-background/70 focus:border-primary transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Não tem uma conta?{' '}
              <Link to="/cadastro-musico" className="font-medium text-primary hover:underline">
                Fazer cadastro
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
