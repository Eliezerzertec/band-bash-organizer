# Band Bash Organizer - Contexto do Projeto

## 📋 Visão Geral do Projeto

**Band Bash Organizer** é uma aplicação web para gerenciamento de ministérios musicais em igrejas. O sistema permite organizar apresentações, escalas de músicos, solicitações de substituição e comunicação entre membros da banda/ministério.

**Nome do Projeto**: vite_react_shadcn_ts  
**Versão**: 0.0.0  
**Data de Contexto**: 18 de janeiro de 2026

---

## 🏗️ Arquitetura e Tecnologias

### Stack Tecnológico

- **Frontend Framework**: React 18+ (TypeScript)
- **Build Tool**: Vite
- **UI Components**: shadcn-ui (baseado em Radix UI)
- **Estilos**: Tailwind CSS
- **Backend/Database**: Supabase
- **State Management**: TanStack Query (React Query)
- **Formulários**: React Hook Form
- **Roteamento**: React Router
- **Temas**: next-themes
- **Notificações**: Sonner
- **Teste**: Vitest
- **Linting**: ESLint

### Dependências Principais

```json
{
  "@supabase/supabase-js": "^2.90.1",
  "@tanstack/react-query": "^5.83.0",
  "react-router-dom": "^6.x",
  "react-hook-form": "com @hookform/resolvers",
  "zod": "para validação de schemas"
}
```

---

## 📁 Estrutura de Pastas

```
src/
├── App.tsx                 # Arquivo principal com routing
├── main.tsx               # Entry point
├── index.css              # Estilos globais
├── App.css                # Estilos da aplicação
│
├── components/            # Componentes reutilizáveis
│   ├── NavLink.tsx
│   ├── dashboard/         # Componentes do dashboard
│   │   ├── MembersChart.tsx
│   │   ├── PerformanceChart.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── StatCard.tsx
│   │   ├── SubstitutionRequests.tsx
│   │   └── UpcomingEvents.tsx
│   ├── forms/            # Diálogos de formulários
│   │   ├── ChurchFormDialog.tsx
│   │   ├── MemberFormDialog.tsx
│   │   ├── MinistryFormDialog.tsx
│   │   ├── ScheduleFormDialog.tsx
│   │   └── TeamFormDialog.tsx
│   ├── layout/           # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── MainLayout.tsx
│   │   └── Sidebar.tsx
│   └── ui/               # Componentes de UI primitivos (shadcn-ui)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       ├── chart.tsx
│       └── ... (30+ componentes)
│
├── contexts/             # Context API
│   └── AuthContext.tsx   # Contexto de autenticação
│
├── hooks/                # Custom React Hooks
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   ├── useChurches.ts
│   ├── useDashboardStats.ts
│   ├── useMessages.ts
│   ├── useMinistries.ts
│   ├── useProfiles.ts
│   ├── useSchedules.ts
│   ├── useSubstitutions.ts
│   └── useTeams.ts
│
├── integrations/         # Integrações externas
│   └── supabase/        # Cliente Supabase
│
├── pages/                # Páginas da aplicação
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Churches.tsx
│   ├── Ministries.tsx
│   ├── Members.tsx
│   ├── Teams.tsx
│   ├── Schedules.tsx
│   ├── Substitutions.tsx
│   ├── Messages.tsx
│   ├── Reports.tsx
│   ├── Index.tsx
│   └── NotFound.tsx
│
├── lib/
│   └── utils.ts          # Funções utilitárias
│
├── types/
│   └── index.ts          # Definições TypeScript
│
└── test/
    ├── example.test.ts
    └── setup.ts
```

---

## 🔑 Tipos de Dados Principais

### User (Usuário)
- `id`: string (identificador único)
- `name`: string
- `email`: string
- `role`: 'admin' | 'member'
- `avatar?`: string (URL)
- `phone?`: string
- `whatsapp?`: string
- `status`: 'active' | 'inactive'

### Church (Igreja)
- `id`: string
- `name`: string
- `address`: string
- `contact`: string
- `logo?`: string (URL)
- `createdAt`: Date

### Ministry (Ministério)
- `id`: string
- `churchId`: string
- `name`: string
- `leaders`: string[] (IDs de usuários)
- `logo?`: string
- `profilePhoto?`: string

### Member (Membro do Ministério)
- `id`: string
- `userId`: string
- `ministryId`: string
- `name`: string
- `photo?`: string
- `phone?`: string
- `whatsapp?`: string
- `role`: string
- `skills`: MusicalSkill[] (instrumentos musicais)
- `status`: 'active' | 'inactive'

### MusicalSkill (Habilidades Musicais)
Tipos de instrumentos/funções:
- vocal, backing_vocal
- guitar, acoustic_guitar, bass
- drums, keyboard, piano
- violin, flute, saxophone, trumpet
- audio_tech, projection

### Team (Equipe de Apresentação)
- `id`: string
- `ministryId`: string
- `name`: string
- `members`: TeamMember[]

### ServiceEvent (Evento de Apresentação)
- `id`: string
- `churchId`: string
- `ministryId`: string
- `teamId?`: string
- `title`: string
- `date`: Date
- `time`: string
- `description?`: string
- `scheduledMembers`: ScheduledMember[]
- `status`: 'scheduled' | 'completed' | 'cancelled'

### SubstitutionRequest (Solicitação de Substituição)
- `id`: string
- `eventId`: string
- `requesterId`: string
- `targetMemberId?`: string
- `skill`: MusicalSkill
- `status`: 'pending' | 'accepted' | 'rejected'
- `createdAt`: Date
- `respondedAt?`: Date

### Message (Mensagem)
- `id`: string
- `senderId`: string
- `recipientType`: 'all' | 'team' | 'member'
- `recipientId?`: string
- `subject`: string
- `content`: string
- `read`: boolean
- `createdAt`: Date

### Notification (Notificação)
- `id`: string
- `userId`: string
- `type`: 'schedule' | 'substitution' | 'message' | 'system'
- `title`: string
- `message`: string
- `read`: boolean
- `createdAt`: Date

---

## 🔐 Autenticação e Autorização

### Sistema de Autenticação
- **Provedor**: Supabase Auth
- **Contexto**: AuthContext.tsx
- **Storage**: localStorage (chave: 'louvor_user')

### Funções de Autenticação
- `login(email, password)`: Realiza login do usuário
- `logout()`: Desconecta o usuário
- `hasRole(role)`: Verifica se o usuário tem determinado papel

### Roles (Papéis)
- **admin**: Acesso total (pode gerenciar igrejas, ministérios, membros, escalas)
- **member**: Acesso restrito (visualiza sua informação, participa de eventos)

### Mock Users (para desenvolvimento)
```
admin@louvor.com / admin123 → Pastor João Silva (admin)
membro@louvor.com / membro123 → Maria Santos (member)
```

---

## 🛣️ Rotas da Aplicação

### Rotas Públicas
- `/login` - Página de login

### Rotas Protegidas
- `/dashboard` - Dashboard principal (todos)
- `/churches` - Gerenciamento de igrejas (admin)
- `/ministries` - Gerenciamento de ministérios (admin)
- `/members` - Gerenciamento de membros (admin)
- `/teams` - Gerenciamento de equipes (admin)
- `/schedules` - Gerenciamento de escalas (todos)
- `/substitutions` - Solicitações de substituição (todos)
- `/messages` - Sistema de mensagens (todos)
- `/reports` - Relatórios (admin)

### Componentes de Rota
- `ProtectedRoute`: Verifica autenticação, redireciona para login se necessário
- `PublicRoute`: Redireciona para dashboard se já logado

---

## 🎨 Componentes UI (shadcn-ui)

A aplicação usa 30+ componentes shadcn-ui construídos sobre Radix UI:

**Formulários**: input, textarea, select, checkbox, radio-group, switch, label
**Diálogos**: dialog, alert-dialog, popover, hover-card
**Navegação**: navigation-menu, breadcrumb, tabs, pagination
**Dados**: table, calendar
**Feedback**: alert, progress, badge, toast
**Layout**: card, separator, scroll-area, drawer, sheet, sidebar

---

## ⚙️ Configurações

### Vite
- **Arquivo**: vite.config.ts
- **Port**: 8080
- **HMR**: Habilitado (overlay desabilitado)
- **Alias**: `@` → `./src`

### TypeScript
- **tsconfig.json**: Configuração principal
- **tsconfig.app.json**: Configuração da aplicação
- **tsconfig.node.json**: Configuração para build tools

### Tailwind CSS
- **Arquivo**: tailwind.config.ts
- **Importado em**: src/index.css

### ESLint
- **Arquivo**: eslint.config.js
- **Comando**: `npm run lint`

### Testes
- **Framework**: Vitest
- **Setup**: src/test/setup.ts
- **Comandos**:
  - `npm test` - Executar testes uma vez
  - `npm run test:watch` - Modo watch

---

## 📦 Scripts Disponíveis

```bash
npm run dev              # Inicia dev server (Vite)
npm run build            # Build para produção
npm run build:dev        # Build modo desenvolvimento
npm run lint             # Executar ESLint
npm run preview          # Preview do build
npm test                 # Executar testes (uma vez)
npm run test:watch       # Executar testes em modo watch
```

---

## 🪝 Custom Hooks

### useChurches
Gerencia dados de igrejas (CRUD)

### useMinistries
Gerencia dados de ministérios (CRUD)

### useTeams
Gerencia equipes de apresentação

### useSchedules
Gerencia escalas de apresentações

### useSubstitutions
Gerencia solicitações de substituição

### useMessages
Gerencia sistema de mensagens

### useDashboardStats
Obtém estatísticas para o dashboard

### useProfiles
Gerencia perfis de usuários

### useMessages
Gerencia mensagens do sistema

### use-mobile
Hook para detecção de device mobile

### use-toast
Hook para exibir notificações toast

---

## 🗄️ Banco de Dados (Supabase)

**Localização**: `supabase/` pasta raiz

### Estrutura
- `config.toml`: Configuração do Supabase
- `migrations/`: Migrações SQL
  - `20260118135312_5241e508-7046-4296-a26c-2f75c6bccb32.sql`: Criação de schema inicial

### Tabelas Esperadas
- users
- churches
- ministries
- members
- teams
- team_members
- service_events
- scheduled_members
- substitution_requests
- messages
- notifications

---

## 🎯 Funcionalidades Principais

### 1. Dashboard
- Visualização de estatísticas
- Próximos eventos
- Atividade recente
- Gráficos de desempenho e membros
- Solicitações de substituição pendentes

### 2. Gerenciamento de Igrejas
- CRUD de igrejas
- Informações de contato
- Logo da igreja

### 3. Gerenciamento de Ministérios
- CRUD de ministérios
- Atribuição de líderes
- Foto de perfil

### 4. Gerenciamento de Membros
- CRUD de membros
- Atribuição de habilidades musicais
- Status ativo/inativo
- Informações de contato (telefone, WhatsApp)

### 5. Gerenciamento de Equipes
- Criar equipes para apresentações
- Atribuir membros com suas habilidades
- Visualizar composição da equipe

### 6. Escalas de Apresentações
- Criar eventos de apresentação
- Escalar membros por instrumento/habilidade
- Confirmação de presença
- Status (agendado, concluído, cancelado)

### 7. Solicitações de Substituição
- Membros podem solicitar substituição
- Confirmar ou rejeitar solicitações
- Histórico de status

### 8. Sistema de Mensagens
- Mensagens individuais ou em grupo
- Enviar para toda a equipe
- Marcar como lido

### 9. Relatórios
- Análise de desempenho
- Histórico de apresentações
- Estatísticas de participação

---

## 🔄 Fluxo de Dados

1. **Autenticação**: Usuário faz login → AuthContext armazena sessão
2. **Hooks**: Componentes usam hooks customizados para buscar dados
3. **React Query**: TanStack Query cacheia e gerencia requisições
4. **Supabase**: Hooks conectam ao backend via @supabase/supabase-js
5. **Componentes**: Recebem dados e renderizam UI com shadcn-ui

---

## 📝 Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (ex: MembersChart.tsx)
- **Hooks**: camelCase com prefixo 'use' (ex: useChurches.ts)
- **Tipos**: PascalCase (ex: User, Church)
- **Enums**: SCREAMING_SNAKE_CASE (ex: MUSICAL_SKILL)

### Estrutura de Componentes
- Imports no topo
- Context/Hooks personalizados
- Componente principal
- Exportação padrão

### TypeScript
- Tipagem explícita de props
- Interfaces para estruturas de dados
- Type guards quando necessário

---

## 🚀 Desenvolvimento

### Setup Local
```bash
git clone <repo-url>
cd band-bash-organizer
npm install
npm run dev
```

### Variáveis de Ambiente Necessárias
(Armazenar em .env ou .env.local)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```


## 📊 Estado da Aplicação

### Última Atualização
- **Data**: 18 de janeiro de 2026
- **Status**: Em desenvolvimento
- **Dependencies Instaladas**: npm i foi executado com sucesso

### Próximos Passos Possíveis
1. Implementar migrações Supabase completas
2. Finalizar hooks de integração com banco de dados
3. Implementar autenticação real do Supabase
4. Adicionar validações de formulário com Zod
5. Implementar paginação em tabelas
6. Adicionar testes unitários
7. Configurar CI/CD para deploy
8. Implementar PWA (opcional)

---

## 🔗 Recursos Úteis

- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [shadcn-ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📄 Licença e Informações

- **Desenvolvido com**: Vite + React + TypeScript
- **Node.js**: Requerido (use nvm para gerenciamento)
- **Package Manager**: npm ou bun

---

**Documento criado em**: 18 de janeiro de 2026  
**Versão do Contexto**: 1.0
