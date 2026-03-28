# Melhorias nos Formulários - Band Bash Organizer

## 📋 Resumo das Alterações

Foram implementadas melhorias significativas nos formulários de cadastro de **Igreja** e **Ministério**, tornando-os mais completos, intuitivos e profissionais.

---

## 🏛️ ChurchFormDialog - Formulário de Igreja

### Novas Funcionalidades

#### 1. **Upload de Logo com Preview**
- Interface visual para upload de imagem
- Preview em tempo real da logo selecionada
- Botão para remover/trocar a imagem
- Validação de tipo de arquivo (apenas imagens)
- Limite de tamanho: 5MB
- Conversão para Base64 para armazenamento

#### 2. **Campo de Pastor Responsável**
- Campo obrigatório para o nome do pastor
- Armazenamento em banco de dados
- Validação de entrada

#### 3. **Layout Melhorado**
- Design mais espaçoso e organizado
- Diálogo responsivo (máx. 550px)
- Scrollable para telas pequenas
- Seção destacada para upload com bordas tracejadas
- Ícone visual para representar Igreja

### Campos do Formulário

```typescript
interface ChurchFormData {
  name: string;              // Nome da Igreja *
  pastor_name: string;       // Pastor Responsável *
  address?: string;          // Endereço (opcional)
  contact?: string;          // Contato - Telefone/Email (opcional)
  logo_url?: string;         // Logo (Base64)
}
```

### Validações

- **Nome**: Obrigatório, máximo 100 caracteres
- **Pastor**: Obrigatório, máximo 100 caracteres
- **Endereço**: Máximo 255 caracteres
- **Contato**: Máximo 50 caracteres
- **Logo**: PNG, JPG ou GIF, máximo 5MB

### Exemplo de Uso

```tsx
import { ChurchFormDialog } from '@/components/forms/ChurchFormDialog';

export function ChurchesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);

  return (
    <>
      <ChurchFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        church={selectedChurch}
      />
    </>
  );
}
```

---

## 🎵 MinistryFormDialog - Formulário de Ministério

### Novas Funcionalidades

#### 1. **Upload de Logo com Preview**
- Interface visual idêntica ao formulário de Igreja
- Preview em tempo real da logo selecionada
- Mesmas validações e funcionalidades
- Ícone visual diferente (Música)

#### 2. **Campo de Responsável do Ministério**
- Seleção via dropdown dos líderes disponíveis
- Descrição clara: "Pessoa responsável por coordennar este ministério"
- Campo opcional com opção "Nenhum"

#### 3. **Descrição Melhorada**
- Campo Textarea com 24px de altura mínima
- Placeholder mais descritivo
- Descrição de contexto
- Suporta até 500 caracteres

#### 4. **Layout Responsivo**
- Grid 2 colunas em desktop (nome + igreja)
- Stack em mobile
- Diálogo máximo 600px
- Scrollable para telas pequenas

### Campos do Formulário

```typescript
interface MinistryFormData {
  name: string;              // Nome do Ministério *
  church_id: string;         // Igreja *
  leader_id?: string;        // Responsável do Ministério (opcional)
  description?: string;      // Descrição (opcional)
  logo_url?: string;         // Logo (Base64)
}
```

### Validações

- **Nome**: Obrigatório, máximo 100 caracteres
- **Igreja**: Obrigatória
- **Responsável**: Opcional
- **Descrição**: Máximo 500 caracteres
- **Logo**: PNG, JPG ou GIF, máximo 5MB

### Exemplo de Uso

```tsx
import { MinistryFormDialog } from '@/components/forms/MinistryFormDialog';

export function MinistriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);

  return (
    <>
      <MinistryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ministry={selectedMinistry}
      />
    </>
  );
}
```

---

## 🔧 Modificações no Hook useChurches

### Alteração na Interface Church

**Antes:**
```typescript
export interface Church {
  id: string;
  name: string;
  address: string | null;
  contact: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}
```

**Depois:**
```typescript
export interface Church {
  id: string;
  name: string;
  pastor_name: string | null;  // ✨ Novo campo
  address: string | null;
  contact: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}
```

### Migração do Banco de Dados Necessária

Para suportar o novo campo, é necessário executar a migração SQL:

```sql
ALTER TABLE churches ADD COLUMN pastor_name VARCHAR(100);

-- Índice opcional para melhor performance
CREATE INDEX idx_churches_pastor_name ON churches(pastor_name);
```

---

## 📁 Componentes Utilizados

### UI Components (shadcn-ui)

- **Dialog**: Para o modal
- **Form**: Gerenciamento de formulário com React Hook Form
- **FormControl, FormField, FormItem, FormLabel, FormMessage**: Elementos de formulário
- **FormDescription**: Descrições auxiliares
- **Input**: Campos de texto
- **Textarea**: Área de texto para descrição
- **Select, SelectContent, SelectItem, SelectTrigger, SelectValue**: Dropdowns
- **Button**: Botões de ação
- **Card**: Container para seção de upload
- **Toaster**: Notificações

### Ícones (Lucide React)

- `Upload`: Botão de upload
- `X`: Remover imagem
- `Loader2`: Indicador de carregamento
- `Church`: Ícone para Igreja
- `Music`: Ícone para Ministério

---

## 🎨 Estilos e Classes Tailwind

### Classes Personalizadas Utilizadas

- `input-modern`: (se existente) Estilo moderno para inputs
- `btn-gradient-primary`: (se existente) Botão com gradiente
- `card-elevated`: (se existente) Card com elevação
- Classes padrão do Tailwind CSS

### Paleta de Cores

- **Primary**: Para ações principais
- **Destructive**: Para ações destrutivas (remover)
- **Muted**: Para estados desabilitados
- **Background**: Cor de fundo padrão

---

## 🔄 Fluxo de Upload de Imagem

```
1. Usuário clica em "Enviar Logo"
2. Abre seletor de arquivo
3. Valida tipo (deve ser imagem)
4. Valida tamanho (máx 5MB)
5. Lê arquivo em Base64
6. Exibe preview
7. Armazena em form.setValue()
8. Salva junto com dados do formulário
```

---

## ⚠️ Considerações Importantes

### 1. **Armazenamento de Imagens**

Atualmente, as imagens são convertidas em Base64 e armazenadas como string. Para produção, considere:

- **Supabase Storage**: Upload para storage externo
- **CDN**: Servir imagens via CDN
- **Compressão**: Comprimir antes de salvar
- **Otimização**: Considerar webp para melhor performance

### 2. **Migração do Banco**

O campo `pastor_name` foi adicionado à interface Church, mas **não existe automaticamente no banco**. Será necessário:

1. Criar migração SQL (mencionada acima)
2. Executar migração no Supabase
3. Deploy da aplicação

### 3. **Compatibilidade com Dados Existentes**

- Igrejas existentes terão `pastor_name` como NULL
- O formulário tratará como campo obrigatório para novas igrejas
- Considere adicionar validação de migration de dados

### 4. **Performance**

- Preview em Base64 é ideal para arquivos pequenos
- Para arquivos maiores, considere stream upload
- Lazy loading de imagens no list view

---

## 📊 Estados do Formulário

### Estados de Carregamento

```
isPending = createMinistry.isPending || updateMinistry.isPending || uploading
```

Quando `isPending` é true:
- Inputs são desabilitados
- Buttons mostram spinner
- Arquivo select é desabilitado

### Estados de Validação

Validação em tempo real usando Zod:
- Erros aparecem abaixo de cada campo
- Visualmente destacados em vermelho
- Mensagens claras em português

---

## 🧪 Testes Sugeridos

```typescript
// Teste upload de imagem válida
// Teste validação de tamanho máximo
// Teste validação de tipo de arquivo
// Teste preview update
// Teste remoção de preview
// Teste submit com dados válidos
// Teste requisição em erro
// Teste modo edit vs create
```

---

## 🚀 Próximas Melhorias Possíveis

1. **Supabase Storage Integration**
   - Upload para storage real
   - URLs persistentes
   - Validação no servidor

2. **Crop de Imagem**
   - Permitir recorte antes de salvar
   - Aspect ratio customizado

3. **Multiple Images**
   - Para ministério: fotos de membros
   - Galeria de imagens

4. **Lazy Loading**
   - Carregar imagens apenas quando necessário
   - Thumbnail geração

5. **Undo/Redo**
   - Desfazer alterações
   - Histórico de mudanças

6. **Drag & Drop**
   - Arrastar imagens para upload
   - Melhor UX

---

## 📝 Arquivo de Contexto Atualizado

Verifique [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) para informações gerais sobre o projeto.

---

**Última Atualização**: 18 de janeiro de 2026  
**Status**: Implementação Completa ✅
