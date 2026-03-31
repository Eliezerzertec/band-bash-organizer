import { MessageSquare, Search, User, Settings, Menu, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentProfile } from '@/hooks/useProfiles';
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { notificationService } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

function hasMention(content: string | null | undefined, fullName: string | undefined): boolean {
  if (!content || !fullName) return false;

  const normalizedContent = content.toLowerCase();
  const firstName = fullName.split(' ')[0]?.toLowerCase();
  const dottedName = fullName.toLowerCase().replace(/\s+/g, '.');

  return Boolean(
    (firstName && normalizedContent.includes(`@${firstName}`)) ||
    normalizedContent.includes(`@${dottedName}`)
  );
}

function isSubstitutionMention(reason: string | null | undefined, fullName: string | undefined): boolean {
  if (!reason || !fullName) return false;

  const normalizedContent = reason.toLowerCase();
  const firstName = fullName.split(' ')[0]?.toLowerCase();
  const dottedName = fullName.toLowerCase().replace(/\s+/g, '.');

  return Boolean(
    (firstName && normalizedContent.includes(`@${firstName}`)) ||
    normalizedContent.includes(`@${dottedName}`)
  );
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { data: currentProfile } = useCurrentProfile();
  const { data: messages, isLoading: messagesLoading } = useMessages();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [messagesOpen, setMessagesOpen] = useState(false);
  
  // Ref para rastrear mensagens já notificadas
  const notifiedMessageIds = useRef<Set<string>>(new Set());

  // Contar mensagens não lidas
  const unreadMessages = useMemo(
    () => messages?.filter((m) => !m.read_at) || [],
    [messages]
  );
  const unreadCount = unreadMessages.length;
  const recentMessages = useMemo(() => messages?.slice(0, 5) || [], [messages]);

  const notifiedSubstitutionKeys = useRef<Set<string>>(new Set());

  // Solicitar permissão de notificações ao carregar
  useEffect(() => {
    notificationService.requestPermission();
  }, []);

  // Monitorar novas mensagens não lidas
  useEffect(() => {
    if (unreadMessages.length === 0) return;

    unreadMessages.forEach(message => {
      // Se a mensagem é nova (não foi notificada ainda) e é não lida
      if (!notifiedMessageIds.current.has(message.id)) {
        notifiedMessageIds.current.add(message.id);

        const mentioned = hasMention(message.content, currentProfile?.name);

        if (mentioned) {
          notificationService.notify({
            title: `Voce foi mencionado por ${message.sender?.name || 'Sistema'}`,
            body: message.subject || message.content?.substring(0, 120) || 'Abra para ver os detalhes.',
            tag: 'message-mention',
          });
          return;
        }

        // Mostrar notificação web padrão para mensagens não lidas
        notificationService.notifyNewMessage(
          message.sender?.name || 'Sistema',
          message.subject || 'Nova mensagem',
          message.content?.substring(0, 100)
        );
      }
    });
  }, [unreadMessages, currentProfile?.name]);

  // Notificacoes em tempo real para eventos de substituicao
  useEffect(() => {
    if (!currentProfile?.id) return;

    const channel = supabase
      .channel(`substitutions-${currentProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'substitution_requests',
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            requester_id: string;
            substitute_id: string | null;
            reason: string | null;
          };

          const key = `${row.id}:insert`;
          if (notifiedSubstitutionKeys.current.has(key)) return;

          const isTargetSubstitute = row.substitute_id === currentProfile.id;
          const isMentioned = isSubstitutionMention(row.reason, currentProfile.name);
          const isTargetRequester = row.requester_id === currentProfile.id;

          if (!isTargetSubstitute && !isMentioned && !isTargetRequester) return;
          notifiedSubstitutionKeys.current.add(key);

          if (isTargetSubstitute) {
            notificationService.notify({
              title: 'Nova solicitacao de substituicao',
              body: 'Voce foi escolhido como substituto. Abra Substituicoes para aceitar ou recusar.',
              tag: `substitution-request-${row.id}`,
            });
            return;
          }

          if (isMentioned) {
            notificationService.notify({
              title: 'Voce foi mencionado em substituicao',
              body: row.reason || 'Abra Substituicoes para ver os detalhes.',
              tag: `substitution-mention-${row.id}`,
            });
            return;
          }

          notificationService.notify({
            title: 'Solicitacao de substituicao enviada',
            body: 'Sua solicitacao foi registrada com sucesso.',
            tag: `substitution-created-${row.id}`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'substitution_requests',
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            requester_id: string;
            substitute_id: string | null;
            status: 'pending' | 'accepted' | 'rejected';
            updated_at?: string;
          };

          const isRequester = row.requester_id === currentProfile.id;
          const isSubstitute = row.substitute_id === currentProfile.id;
          if (!isRequester && !isSubstitute) return;

          const key = `${row.id}:update:${row.status}:${row.updated_at || ''}`;
          if (notifiedSubstitutionKeys.current.has(key)) return;
          notifiedSubstitutionKeys.current.add(key);

          if (row.status === 'accepted' && isRequester) {
            notificationService.notify({
              title: 'Substituicao aceita',
              body: 'Seu pedido de substituicao foi aceito.',
              tag: `substitution-accepted-${row.id}`,
            });
            return;
          }

          if (row.status === 'rejected' && isRequester) {
            notificationService.notify({
              title: 'Substituicao recusada',
              body: 'Seu pedido de substituicao foi recusado.',
              tag: `substitution-rejected-${row.id}`,
            });
            return;
          }

          if (row.status === 'accepted' && isSubstitute) {
            notificationService.notify({
              title: 'Voce aceitou uma substituicao',
              body: 'A escala foi atualizada para voce.',
              tag: `substitution-you-accepted-${row.id}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProfile?.id, currentProfile?.name]);

  return (
    <header className="header-gradient px-4 md:px-8 py-4 md:py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMenuClick}
              className="text-header-foreground/70 hover:text-header-foreground hover:bg-white/10 rounded-xl flex-shrink-0"
            >
              <Menu className="w-6 h-6" />
            </Button>
          )}
          
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-semibold text-header-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-header-foreground/60 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {/* Search - Hidden on mobile */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-header-foreground/40" />
            <Input 
              placeholder="Search anything here..." 
              className="pl-11 w-72 bg-white/10 border-white/10 text-header-foreground placeholder:text-header-foreground/40 rounded-xl focus:bg-white/15 focus:border-white/20"
            />
          </div>

          {/* Messages */}
          <DropdownMenu open={messagesOpen} onOpenChange={setMessagesOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-header-foreground/70 hover:text-header-foreground hover:bg-white/10 rounded-xl">
                <MessageSquare className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 rounded-xl shadow-xl">
              <div className="flex items-center justify-between px-4 py-3">
                <DropdownMenuLabel className="m-0">Mensagens</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <span className="text-xs bg-destructive text-white px-2 py-1 rounded-full font-semibold">
                    {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <DropdownMenuSeparator className="m-0" />
              
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : recentMessages.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {recentMessages.map((message) => (
                    <DropdownMenuItem 
                      key={message.id}
                      className={cn(
                        'flex flex-col items-start gap-2 py-3 px-4 cursor-pointer hover:bg-accent/80 border-l-2',
                        !message.read_at
                          ? 'border-l-destructive bg-destructive/5'
                          : 'border-l-transparent'
                      )}
                      onClick={() => {
                        navigate('/messages');
                        setMessagesOpen(false);
                      }}
                    >
                      <div className="flex items-start justify-between w-full gap-2">
                        <span className="font-semibold text-sm text-foreground flex-1">{message.subject}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {message.created_at && format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      {message.content && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>
                      )}
                      <span
                        className={cn(
                          'inline-block text-[10px] font-medium px-2 py-0.5 rounded',
                          !message.read_at
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {!message.read_at ? 'Nao lida' : 'Lida'}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  {messages && messages.length > 5 && (
                    <>
                      <DropdownMenuSeparator className="m-0" />
                      <DropdownMenuItem
                        className="justify-center py-2 text-sm text-primary font-semibold"
                        onClick={() => {
                          navigate('/messages');
                          setMessagesOpen(false);
                        }}
                      >
                        Ver todas as {messages.length} mensagens
                      </DropdownMenuItem>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Sem mensagens</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Settings - Hidden on mobile */}
          <Button variant="ghost" size="icon" className="text-header-foreground/70 hover:text-header-foreground hover:bg-white/10 rounded-xl hidden md:flex">
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 md:gap-3 hover:bg-white/10 rounded-xl px-2 md:pl-3 md:pr-4">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white/15 overflow-hidden shadow-md">
                  {currentProfile?.avatar_url ? (
                    <img src={currentProfile.avatar_url} alt={currentProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4 md:w-5 md:h-5 text-header-foreground/70" />
                    </div>
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium text-header-foreground">{currentProfile?.name || user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={async () => {
                  try {
                    await logout();
                    // Navegar para login após logout bem-sucedido
                    navigate('/login', { replace: true });
                  } catch (error) {
                    console.error('Erro ao fazer logout:', error);
                  }
                }} 
                className="text-destructive"
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
