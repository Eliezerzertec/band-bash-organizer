# 🎨 Visualização dos Formulários Aprimorados

## 📐 Estrutura Visual

### ChurchFormDialog - Formulário de Igreja

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        Nova Igreja                                    [×]  ║
║                                                            ║
├────────────────────────────────────────────────────────────┤
║                                                            ║
║   ┌──────────────────────────────────────────────────────┐ ║
║   │                                                      │ ║
║   │              ┌────────────────────┐                │ ║
║   │              │  Logo Preview      │                │ ║
║   │              │     ou             │                │ ║
║   │              │  Ícone de Igreja   │                │ ║
║   │              │                  [X]                │ ║
║   │              └────────────────────┘                │ ║
║   │                                                      │ ║
║   │                 Logo da Igreja                       │ ║
║   │              [+ Enviar Logo]                         │ ║
║   │           PNG, JPG ou GIF (Máx. 5MB)               │ ║
║   │                                                      │ ║
║   └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║   ┌─────────────────────────┐ ┌──────────────────────────┐ ║
║   │ Nome da Igreja *        │ │ Pastor Responsável *    │ ║
║   │ [________________]      │ │ [____________________]  │ ║
║   └─────────────────────────┘ └──────────────────────────┘ ║
║                                                            ║
║   ┌──────────────────────────────────────────────────────┐ ║
║   │ Endereço                                           │ ║
║   │ [____________________________________________________] │ ║
║   │ Endereço completo da sede da igreja               │ ║
║   └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║   ┌──────────────────────────────────────────────────────┐ ║
║   │ Contato                                            │ ║
║   │ [____________________________________________________] │ ║
║   │ Telefone ou email principal de contato            │ ║
║   └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║   [Cancelar]                         [Criar Igreja →]      ║
║                                                            ║
└────────────────────────────────────────────────────────────┘
```

### MinistryFormDialog - Formulário de Ministério

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        Novo Ministério                              [×]    ║
║                                                            ║
├────────────────────────────────────────────────────────────┤
║                                                            ║
║   ┌──────────────────────────────────────────────────────┐ ║
║   │                                                      │ ║
║   │              ┌────────────────────┐                │ ║
║   │              │  Logo Preview      │                │ ║
║   │              │     ou             │                │ ║
║   │              │  Ícone de Música   │                │ ║
║   │              │                  [X]                │ ║
║   │              └────────────────────┘                │ ║
║   │                                                      │ ║
║   │              Logo do Ministério                      │ ║
║   │              [+ Enviar Logo]                         │ ║
║   │            PNG, JPG ou GIF (Máx. 5MB)              │ ║
║   │                                                      │ ║
║   └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║   ┌────────────────────────┐ ┌──────────────────────────┐ ║
║   │ Nome do Ministério *   │ │ Igreja *               │ ║
║   │ [_______________]      │ │ [Selecione a igreja ▼]│ ║
║   └────────────────────────┘ └──────────────────────────┘ ║
║                                                            ║
║   ┌──────────────────────────────────────────────────────┐ ║
║   │ Responsável do Ministério                          │ ║
║   │ [Selecione o responsável ▼]                         │ ║
║   │ Pessoa responsável por coordenar este ministério   │ ║
║   └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║   ┌──────────────────────────────────────────────────────┐ ║
║   │ Descrição                                          │ ║
║   │ ┌────────────────────────────────────────────────┐ │ ║
║   │ │ Descreva o ministério, seus objetivos...     │ │ ║
║   │ │                                              │ │ ║
║   │ │                                              │ │ ║
║   │ └────────────────────────────────────────────────┘ │ ║
║   │ Informações adicionais sobre o ministério        │ ║
║   └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║   [Cancelar]                      [Criar Ministério →]     ║
║                                                            ║
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Fluxo de Upload

### Etapa 1: Antes do Upload
```
┌──────────────────────────┐
│   Upload de Imagem       │
│                          │
│   ┌────────────────────┐ │
│   │  Ícone Padrão      │ │
│   │                    │ │
│   │    🏛️ (Igreja)     │ │
│   │     ou             │ │
│   │    🎵 (Música)     │ │
│   └────────────────────┘ │
│                          │
│  Logo da Igreja/Ministério
│  [+ Enviar Logo]         │
│ PNG, JPG, GIF (Máx. 5MB)│
└──────────────────────────┘
```

### Etapa 2: Durante Upload
```
┌──────────────────────────┐
│   Upload de Imagem       │
│                          │
│   ┌────────────────────┐ │
│   │   ⏳ Enviando...   │ │
│   │                    │ │
│   │   [▓▓▓▓▓▓░░░░]     │ │
│   └────────────────────┘ │
│                          │
│  Logo da Igreja/Ministério
│  [⏳ Enviando...]        │
│ PNG, JPG, GIF (Máx. 5MB)│
└──────────────────────────┘
```

### Etapa 3: Após Upload (Com Preview)
```
┌──────────────────────────┐
│   Upload de Imagem       │
│                          │
│   ┌────────────────────┐ │
│   │  ┌──────────────┐ │ │
│   │  │              │ │ │
│   │  │  Imagem      │ │ │
│   │  │  Preview     │ │ │
│   │  │            [X]│ │
│   │  └──────────────┘ │ │
│   └────────────────────┘ │
│                          │
│  Logo da Igreja/Ministério
│  [✓ Trocar Logo]         │
│ PNG, JPG, GIF (Máx. 5MB)│
└──────────────────────────┘
```

---

## 📋 Estados dos Campos

### Campo Obrigatório (Vazio)
```
┌──────────────────────────────────┐
│ Nome da Igreja *                 │
│ [________________________] ←─ cursor
│                           ↑
│                    vazio/inválido
└──────────────────────────────────┘
```

### Campo Obrigatório (Preenchido)
```
┌──────────────────────────────────┐
│ Nome da Igreja *                 │
│ [Igreja do Evangelho_______]
│  ✓ válido
└──────────────────────────────────┘
```

### Campo com Erro
```
┌──────────────────────────────────┐
│ Nome da Igreja *                 │
│ [________________________]
│ ✗ Nome da Igreja é obrigatório
│   ↑ mensagem de erro em vermelho
└──────────────────────────────────┘
```

### Dropdown (Desabilitado durante submit)
```
┌──────────────────────────────────┐
│ Igreja *                         │
│ [Selecione a igreja ▼] ←─ disabled/gray
└──────────────────────────────────┘
```

---

## 🎬 Animações

### Spinner de Carregamento
```
Frame 1:  ◜   
Frame 2:  ◝   
Frame 3:  ◞   
Frame 4:  ◟
```

### Botão Enviando
```
Antes:  [+ Enviar Logo]
Durante: [◜ Enviando...]
Depois:  [✓ Logo Enviada]
```

---

## 🎨 Paleta de Cores

### Elementos Principais

| Elemento | Cor | Hex | Uso |
|----------|-----|-----|-----|
| Fundo Principal | Background | - | Área de diálogo |
| Fundo Secundário | Muted | - | Área de upload |
| Borda Dashed | Border/Muted | - | Upload section |
| Texto Principal | Foreground | - | Labels e títulos |
| Texto Secundário | Muted Foreground | - | Descriptions |
| Ícone Primário | Primary | - | Ícones ativos |
| Ícone Muted | Muted Foreground | - | Ícones inativos |
| Botão Primário | Primary | - | Ações principais |
| Botão Outline | Outline | - | Ações secundárias |
| Erro/Remover | Destructive | - | Ações destrutivas |

---

## 📱 Responsividade

### Desktop (≥768px)
```
┌────────────────────────────────────────────┐
│                                            │
│  ┌────────────────────────────────────┐   │
│  │     Upload com Preview             │   │
│  │     (w-32 h-32)                    │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌─────────────────────┐ ┌──────────────┐ │
│  │ Campo 1             │ │ Campo 2      │ │
│  │                     │ │              │ │
│  └─────────────────────┘ └──────────────┘ │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ Campo Completo                     │   │
│  │                                    │   │
│  └────────────────────────────────────┘   │
│                                            │
│  [Cancelar] [Ação Principal →]            │
│                                            │
└────────────────────────────────────────────┘
```

### Tablet/Mobile (<768px)
```
┌──────────────────────┐
│                      │
│  ┌────────────────┐  │
│  │ Upload Preview │  │
│  │ (w-32 h-32)   │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │ Campo 1        │  │
│  │                │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │ Campo 2        │  │
│  │                │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │ Campo Completo │  │
│  │                │  │
│  └────────────────┘  │
│                      │
│  [Cancelar]          │
│  [Ação Principal]    │
│                      │
└──────────────────────┘
```

---

## ⌨️ Interações

### Hover em Botão
```
[  Enviar Logo  ]  →  [  Enviar Logo  ]  (levemente mais escuro)
```

### Focus em Input
```
[______________] → [_____focus___________] (com borda primária)
```

### Remover Logo (Hover)
```
     [X]        →        [X]  (background mais escuro)
```

### Dropdown Aberto
```
[Igreja ▼]  →  ┌─────────────┐
                │ Igreja 1    │
                │ Igreja 2    │
                │ Igreja 3    │
                └─────────────┘
```

---

## 🔔 Notificações

### Sucesso
```
╔════════════════════════════════════════╗
║ ✓ Igreja criada com sucesso!          ║
║                                        ║
║ [fechar]                              ║
╚════════════════════════════════════════╝
```

### Erro
```
╔════════════════════════════════════════╗
║ ✗ Erro ao criar igreja                ║
║ Mensagem de erro específica            ║
║                                        ║
║ [fechar]                              ║
╚════════════════════════════════════════╝
```

### Validação
```
╔════════════════════════════════════════╗
║ ⚠ Erro de Validação                   ║
║ Por favor, selecione uma imagem       ║
║                                        ║
║ [fechar]                              ║
╚════════════════════════════════════════╝
```

---

## 📐 Dimensões

### Diálogo
- **Desktop**: máximo 550px (Church) / 600px (Ministry)
- **Altura Máxima**: 90vh com scroll interno
- **Padding**: espaço proporcionado

### Preview de Logo
- **Largura**: 128px (w-32)
- **Altura**: 128px (h-32)
- **Borda Raio**: lg (rounded-lg)
- **Borda**: 2px com cor primary/20

### Ícones
- **Padrão**: 16px (w-4 h-4)
- **Grande**: 48px (w-12 h-12)
- **Botão**: 16px (w-4 h-4)

### Textarea
- **Altura Mínima**: 96px (min-h-24)
- **Max Height**: 240px (overflow com scroll)

---

## 🎯 Foco na Acessibilidade

### Labels
```tsx
<FormLabel className="font-semibold">
  Nome da Igreja *
</FormLabel>
```

### Descrições
```tsx
<FormDescription>
  Telefone ou email principal de contato
</FormDescription>
```

### Mensagens de Erro
```tsx
<FormMessage />
```

### Atributos ARIA (implícitos no shadcn-ui)
- `aria-label` nos botões de ação
- `role="alert"` nas mensagens de erro
- `aria-disabled` em elementos desabilitados

---

## 🖱️ Fluxo de Cliques

### Novo Cadastro
```
1. Clica em "Nova Igreja"
   ↓
2. Dialog abre com preview vazio
   ↓
3. Preenche campos (obrigatórios)
   ↓
4. Clica "Enviar Logo" (opcional)
   ↓
5. Seleciona arquivo
   ↓
6. Preview aparece
   ↓
7. Clica "Criar Igreja"
   ↓
8. Toast de sucesso
   ↓
9. Dialog fecha
```

### Edição
```
1. Clica em "Editar" em um card
   ↓
2. Dialog abre com dados preenchidos
   ↓
3. Logo preview já está visível
   ↓
4. Modifica campos conforme necessário
   ↓
5. Clica "Atualizar Igreja"
   ↓
6. Toast de sucesso
   ↓
7. Dialog fecha
```

---

## 📊 Comparação: Antes vs Depois

### Antes (Simples)
```
┌─────────────────────────┐
│ Nova Igreja             │
├─────────────────────────┤
│ Nome: [_____________]   │
│ Endereço: [_________]   │
│ Contato: [__________]   │
│ URL Logo: [______http://...] │
│                         │
│ [Cancelar] [Criar]      │
└─────────────────────────┘
```

### Depois (Profissional)
```
┌────────────────────────────────────┐
│ Nova Igreja                    [×]  │
├────────────────────────────────────┤
│ ┌──────────────────────────────┐   │
│ │  Ícone  │  Logo Preview [X]  │   │
│ │         │  [+ Enviar Logo]   │   │
│ └──────────────────────────────┘   │
│                                    │
│ Nome * [_________] Pastor * [___]  │
│                                    │
│ Endereço [_____________________]   │
│ Telefone/Email [_______________]   │
│                                    │
│ [Cancelar]  [Criar Igreja →]      │
└────────────────────────────────────┘
```

---

**Última Visualização**: 18 de janeiro de 2026
