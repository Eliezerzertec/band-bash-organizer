# Confirmação de Deletar - Sistema Global

## Data: 20 de janeiro de 2026

### Mudança Implementada

Adicionado sistema de confirmação **global e obrigatório** antes de qualquer operação de delete em toda a aplicação.

### Como Funciona

Quando você tenta deletar qualquer item, uma janela de confirmação aparece com a mensagem:

```
Tem certeza que deseja deletar "[Nome do Item]"? Esta ação não pode ser desfeita.
```

Se você clicar em **OK**, o item será deletado. Se clicar em **Cancelar**, a ação é abortada.

### Arquivos Criados/Modificados

#### Novo Hook
- **`src/hooks/useConfirmDelete.ts`** - Hook reutilizável para confirmação de delete
  - Função: `confirmDelete(itemName, onConfirm)`
  - Usa `window.confirm()` para exibir diálogo nativo

#### Páginas Atualizadas
1. **`src/pages/Schedules.tsx`**
   - Delete de escalas com confirmação
   - Nome: `schedule.title`

2. **`src/pages/Churches.tsx`**
   - Delete de igrejas com confirmação
   - Nome: `church.name`

3. **`src/pages/Ministries.tsx`**
   - Delete de ministérios com confirmação
   - Nome: `ministry.name`

4. **`src/pages/Teams.tsx`**
   - Delete de equipes com confirmação
   - Nome: `team.name`

#### Componentes Atualizados
1. **`src/components/forms/MemberFormDialog.tsx`**
   - Delete de membros com confirmação
   - Nome: `member.name`
   - Removido AlertDialog antigo (já não é necessário)

### Pontos com Confirmação de Delete

✅ **Escalas** - Página Schedules
✅ **Igrejas** - Página Churches
✅ **Ministérios** - Página Ministries
✅ **Equipes** - Página Teams
✅ **Membros** - Modal de edição de membros

### Implementação Técnica

```typescript
// Usar em qualquer lugar:
const { confirmDelete } = useConfirmDelete();

// No onClick:
onClick={() => confirmDelete(itemName, () => {
  // executar delete
  deleteFunction.mutate(id);
})}
```

### Benefícios

- ✅ **Segurança** - Impede deletagens acidentais
- ✅ **Consistência** - Mesmo padrão em toda aplicação
- ✅ **Reutilizabilidade** - Hook genérico pode ser usado em novos formulários
- ✅ **Experiência** - Usuário tem confirmação visual clara
- ✅ **Simplificidade** - Usa diálogo nativo do navegador

### Teste Agora

1. Vá para qualquer página (Escalas, Igrejas, Ministérios, Equipes)
2. Clique no ícone de menu (três pontos)
3. Clique em "Deletar"
4. Confirme a janela que aparecer
5. O item será deletado apenas se confirmar

Ou edite um membro e clique no botão "Deletar" - mesmo padrão se aplica!
