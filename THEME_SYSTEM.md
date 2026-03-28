# Sistema de Temas - Dark/Light Mode

## Status: ✅ ATIVO E FUNCIONANDO

A aplicação **Band Bash Organizer** já possui um sistema completo de temas implementado com suporte total a **Dark Mode** e **Light Mode**.

---

## Como Usar

### 1. Alterar o Tema

No **Header** (barra superior), clique no ícone de **Tema** (lua/sol) no canto superior direito:

- **Claro** (Light Mode) - Fundo branco, texto escuro
- **Escuro** (Dark Mode) - Fundo escuro, texto claro  
- **Sistema** - Segue a preferência do seu sistema operacional

### 2. Cores Automáticas

Todas as cores mudamautomaticamente conforme o tema selecionado:

#### 🌞 **Light Mode (Claro)**
- **Fundo:** Branco/Creme (#F5F5F5)
- **Texto:** Preto/Cinza escuro
- **Primary:** Azul vibrante
- **Sucessos:** Verde claro
- **Avisos:** Laranja
- **Erros:** Vermelho

#### 🌙 **Dark Mode (Escuro)**
- **Fundo:** Cinza/Preto (#1A1A2E)
- **Texto:** Branco/Cinza claro
- **Primary:** Azul luminoso
- **Sucessos:** Verde brilhante
- **Avisos:** Laranja brilhante
- **Erros:** Vermelho brilhante

---

## Componentes Afetados

✅ **Todos** os componentes da aplicação respeitam o tema:

- Cartões (cards)
- Formulários
- Botões
- Inputs
- Tabelas
- Modais/Diálogos
- Sidebar
- Header
- Gráficos
- Estatísticas
- Notificações

---

## Configuração Técnica

### Localização

- **Arquivo de Estilos:** `src/index.css`
- **Configuração Tailwind:** `tailwind.config.ts`
- **Componente Toggle:** `src/components/ui/theme-toggle.tsx`

### Tecnologia

- **Library:** `next-themes`
- **CSS Variables:** Usando `--variavel-theme`
- **Método:** Class-based (adiciona classe `dark` ao HTML)

---

## Variáveis de Cores Disponíveis

Para usar cores que respeitem o tema em novos componentes:

```tsx
// Exemplo em Tailwind CSS
<div className="bg-background text-foreground">
  {/* Adapta automaticamente conforme tema */}
</div>

<div className="bg-card border border-border">
  {/* Card com cor de tema */}
</div>

<button className="bg-primary text-primary-foreground">
  {/* Botão com cores primárias do tema */}
</button>
```

### Cores Disponíveis

- `background` - Fundo da página
- `foreground` - Texto principal
- `card` - Fundo dos cartões
- `primary` / `primary-foreground` - Cor primária
- `secondary` / `secondary-foreground` - Cor secundária
- `success` / `success-light` - Sucesso
- `warning` / `warning-light` - Aviso
- `destructive` / `destructive-light` - Erro
- `accent` / `accent-light` - Acentos
- `border` - Bordas
- `muted` / `muted-foreground` - Textos mutados
- E mais...

---

## Preferência Salva

A preferência de tema é **automaticamente salva** no navegador e **restaurada** na próxima visita.

---

## Teste Agora

1. Clique no ícone de tema no header (canto superior direito)
2. Selecione "Escuro" ou "Claro"
3. Observe todas as cores mudarem automaticamente
4. Recarregue a página - a preferência será mantida!

✅ **Tudo pronto para usar!** 🎨
