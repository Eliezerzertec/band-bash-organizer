import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Send,
  Inbox,
  User,
  Users,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMessages, useUnreadMessagesCount, useMarkMessageAsRead, useSendMessage, Message } from '@/hooks/useMessages';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCurrentProfile, useProfiles } from '@/hooks/useProfiles';
import { useTeams } from '@/hooks/useTeams';

type RecipientType = 'all' | 'team' | 'member';

function extractMentionTokens(content: string): string[] {
  const regex = /@([\w.-]+)/g;
  const matches = [...content.matchAll(regex)].map((m) => m[1].toLowerCase());
  return [...new Set(matches)];
}

export default function Messages() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<RecipientType>('all');
  const [recipientTeamId, setRecipientTeamId] = useState('');
  const [recipientMemberId, setRecipientMemberId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  
  const { data: messages, isLoading, error } = useMessages();
  const { data: unreadCount = 0 } = useUnreadMessagesCount();
  const markAsRead = useMarkMessageAsRead();
  const sendMessage = useSendMessage();
  const { data: currentProfile } = useCurrentProfile();
  const { data: profiles } = useProfiles();
  const { data: teams } = useTeams();

  const mentionCandidates = useMemo(() => {
    const tokens = extractMentionTokens(content);
    if (tokens.length === 0 || !profiles) return [];

    return profiles.filter((profile) => {
      const firstName = profile.name.split(' ')[0]?.toLowerCase() || '';
      const normalizedName = profile.name.toLowerCase().replace(/\s+/g, '.');
      return tokens.some((token) => token === firstName || token === normalizedName);
    });
  }, [content, profiles]);

  const filteredMessages = (messages || []).filter(message =>
    (message.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (message.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (message.sender?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read_at) {
      markAsRead.mutate(message.id);
    }
  };

  const formatCreatedAt = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return 'Há menos de 1 hora';
      if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
      return format(date, "d 'de' MMM", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const getRecipientType = (message: Message): 'all' | 'team' | 'member' => {
    if (message.is_broadcast) return 'all';
    if (message.recipient_team_id) return 'team';
    return 'member';
  };

  const resetCompose = () => {
    setRecipientType('all');
    setRecipientTeamId('');
    setRecipientMemberId('');
    setSubject('');
    setContent('');
  };

  const handleSendMessage = async () => {
    if (!currentProfile?.id) return;
    if (!content.trim()) return;

    const payload: {
      sender_id: string;
      subject?: string;
      content: string;
      is_broadcast?: boolean;
      recipient_team_id?: string;
      recipient_id?: string;
    } = {
      sender_id: currentProfile.id,
      subject: subject.trim() || null || undefined,
      content: content.trim(),
    };

    if (recipientType === 'all') {
      payload.is_broadcast = true;
    }

    if (recipientType === 'team') {
      if (!recipientTeamId) return;
      payload.recipient_team_id = recipientTeamId;
    }

    if (recipientType === 'member') {
      if (!recipientMemberId) return;
      payload.recipient_id = recipientMemberId;
    }

    sendMessage.mutate(payload, {
      onSuccess: () => {
        setComposeOpen(false);
        resetCompose();
      },
    });
  };

  return (
    <MainLayout 
      title="Mensagens" 
      subtitle={`${unreadCount} não lidas`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Messages List */}
        <div className="lg:col-span-1 card-elevated flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Caixa de Entrada</h3>
              {isAdmin && (
                <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2 btn-gradient-primary">
                      <Plus className="w-4 h-4" />
                      Nova
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Mensagem</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium">Destinatário</label>
                        <Select value={recipientType} onValueChange={(value: RecipientType) => setRecipientType(value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione o destinatário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os membros</SelectItem>
                            <SelectItem value="team">Equipe</SelectItem>
                            <SelectItem value="member">Membro específico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {recipientType === 'team' && (
                        <div>
                          <label className="text-sm font-medium">Equipe</label>
                          <Select value={recipientTeamId} onValueChange={setRecipientTeamId}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Selecione a equipe" />
                            </SelectTrigger>
                            <SelectContent>
                              {(teams || []).map((team) => (
                                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {recipientType === 'member' && (
                        <div>
                          <label className="text-sm font-medium">Membro</label>
                          <Select value={recipientMemberId} onValueChange={setRecipientMemberId}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Selecione o membro" />
                            </SelectTrigger>
                            <SelectContent>
                              {(profiles || []).map((profile) => (
                                <SelectItem key={profile.id} value={profile.id}>{profile.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium">Assunto</label>
                        <Input
                          className="mt-1"
                          placeholder="Digite o assunto"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Mensagem</label>
                        <Textarea
                          className="mt-1"
                          placeholder="Digite sua mensagem... Use @nome para mencionar"
                          rows={5}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />
                        {mentionCandidates.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Menções detectadas: {mentionCandidates.map((m) => m.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <Button
                        className="w-full gap-2 btn-gradient-primary"
                        onClick={handleSendMessage}
                        disabled={
                          sendMessage.isPending ||
                          !content.trim() ||
                          (recipientType === 'team' && !recipientTeamId) ||
                          (recipientType === 'member' && !recipientMemberId)
                        }
                      >
                        <Send className="w-4 h-4" />
                        {sendMessage.isPending ? 'Enviando...' : 'Enviar Mensagem'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar mensagens..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-modern"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48 mb-1" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          {!isLoading && (
            <div className="flex-1 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma mensagem encontrada</p>
                  </div>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={cn(
                      "w-full p-4 text-left border-b border-border transition-colors",
                      "hover:bg-muted/50",
                      selectedMessage?.id === message.id && "bg-primary/5",
                      !message.read_at && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {message.sender?.avatar_url ? (
                          <img 
                            src={message.sender.avatar_url} 
                            alt={message.sender.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-primary">
                            {message.sender?.name?.charAt(0) || 'S'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn(
                            "text-sm truncate",
                            !message.read_at ? "font-semibold text-foreground" : "text-foreground"
                          )}>
                            {message.sender?.name || 'Sistema'}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatCreatedAt(message.created_at)}
                          </span>
                        </div>
                        <p className={cn(
                          "text-sm truncate mt-0.5",
                          !message.read_at ? "font-medium text-foreground" : "text-muted-foreground"
                        )}>
                          {message.subject || 'Sem assunto'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {message.content?.slice(0, 60)}...
                        </p>
                      </div>
                      {!message.read_at && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2 card-elevated flex flex-col">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {selectedMessage.sender?.avatar_url ? (
                        <img 
                          src={selectedMessage.sender.avatar_url} 
                          alt={selectedMessage.sender.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-medium text-primary">
                          {selectedMessage.sender?.name?.charAt(0) || 'S'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {selectedMessage.sender?.name || 'Sistema'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Remetente
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatCreatedAt(selectedMessage.created_at)}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-foreground mt-4">
                  {selectedMessage.subject || 'Sem assunto'}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  {getRecipientType(selectedMessage) === 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <Users className="w-3 h-3" />
                      Todos os membros
                    </span>
                  )}
                  {getRecipientType(selectedMessage) === 'team' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                      <Users className="w-3 h-3" />
                      {selectedMessage.recipient_team?.name || 'Equipe'}
                    </span>
                  )}
                  {getRecipientType(selectedMessage) === 'member' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                      <User className="w-3 h-3" />
                      Direto
                    </span>
                  )}
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                  {selectedMessage.content}
                </div>
              </div>

              {/* Reply */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-3">
                  <Input 
                    placeholder="Digite sua resposta..." 
                    className="input-modern"
                  />
                  <Button className="gap-2 btn-gradient-primary">
                    <Send className="w-4 h-4" />
                    Enviar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Inbox className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Selecione uma mensagem
                </h3>
                <p className="text-muted-foreground">
                  Escolha uma mensagem para visualizar seu conteúdo
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
