import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Send,
  Inbox,
  CheckCircle,
  Circle,
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

interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
    role: string;
  };
  subject: string;
  preview: string;
  content: string;
  read: boolean;
  date: string;
  recipientType: 'all' | 'team' | 'member';
}

const mockMessages: Message[] = [
  {
    id: '1',
    sender: {
      name: 'Pastor João Silva',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pastor',
      role: 'Líder'
    },
    subject: 'Ensaio confirmado para sábado',
    preview: 'Olá a todos! Confirmo o ensaio para este sábado às 15h...',
    content: 'Olá a todos!\n\nConfirmo o ensaio para este sábado às 15h na sala de ensaios. Por favor, cheguem com antecedência para afinação e passagem de som.\n\nLevem as cifras atualizadas.\n\nAbraços,\nPastor João',
    read: false,
    date: 'Há 2 horas',
    recipientType: 'all'
  },
  {
    id: '2',
    sender: {
      name: 'Maria Santos',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      role: 'Líder de Louvor'
    },
    subject: 'Repertório do próximo domingo',
    preview: 'Segue o repertório atualizado para o culto de domingo...',
    content: 'Oi pessoal!\n\nSegue o repertório atualizado para o culto de domingo:\n\n1. Grande é o Senhor\n2. Eu Navegarei\n3. Atos 2\n4. Espontâneo\n5. Santo Espírito\n\nVamos ensaiar tudo no sábado!\n\nMaria',
    read: true,
    date: 'Há 1 dia',
    recipientType: 'team'
  },
  {
    id: '3',
    sender: {
      name: 'Sistema',
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=system',
      role: 'Sistema'
    },
    subject: 'Você foi escalado para domingo',
    preview: 'Você foi escalado para o Culto de Domingo, dia 19/01...',
    content: 'Olá!\n\nVocê foi escalado para o seguinte evento:\n\nEvento: Culto de Domingo\nData: 19/01/2026\nHorário: 19:00\nLocal: Templo Principal\nEquipe: Equipe Alpha\nFunção: Guitarra\n\nPor favor, confirme sua presença.\n\nAbraços,\nEquipe Louvor',
    read: false,
    date: 'Há 2 dias',
    recipientType: 'member'
  },
];

export default function Messages() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const unreadCount = mockMessages.filter(m => !m.read).length;

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
                <Dialog>
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
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione o destinatário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os membros</SelectItem>
                            <SelectItem value="team-alpha">Equipe Alpha</SelectItem>
                            <SelectItem value="team-beta">Equipe Beta</SelectItem>
                            <SelectItem value="member">Membro específico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Assunto</label>
                        <Input className="mt-1" placeholder="Digite o assunto" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Mensagem</label>
                        <Textarea className="mt-1" placeholder="Digite sua mensagem..." rows={5} />
                      </div>
                      <Button className="w-full gap-2 btn-gradient-primary">
                        <Send className="w-4 h-4" />
                        Enviar Mensagem
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {mockMessages.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={cn(
                  "w-full p-4 text-left border-b border-border transition-colors",
                  "hover:bg-muted/50",
                  selectedMessage?.id === message.id && "bg-primary/5",
                  !message.read && "bg-primary/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <img 
                    src={message.sender.avatar} 
                    alt={message.sender.name}
                    className="w-10 h-10 rounded-full bg-muted flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn(
                        "text-sm truncate",
                        !message.read ? "font-semibold text-foreground" : "text-foreground"
                      )}>
                        {message.sender.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {message.date}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm truncate mt-0.5",
                      !message.read ? "font-medium text-foreground" : "text-muted-foreground"
                    )}>
                      {message.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {message.preview}
                    </p>
                  </div>
                  {!message.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2 card-elevated flex flex-col">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={selectedMessage.sender.avatar} 
                      alt={selectedMessage.sender.name}
                      className="w-12 h-12 rounded-full bg-muted"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {selectedMessage.sender.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedMessage.sender.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {selectedMessage.date}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-foreground mt-4">
                  {selectedMessage.subject}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  {selectedMessage.recipientType === 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <Users className="w-3 h-3" />
                      Todos os membros
                    </span>
                  )}
                  {selectedMessage.recipientType === 'team' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                      <Users className="w-3 h-3" />
                      Equipe
                    </span>
                  )}
                  {selectedMessage.recipientType === 'member' && (
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
