## ✅ Avatar do Membro no Menu Superior Direito

### Implementação Realizada

**Arquivo:** [src/components/layout/Header.tsx](src/components/layout/Header.tsx)

#### Alterações:
1. ✅ Importado `useCurrentProfile` hook
2. ✅ Buscado perfil do membro autenticado
3. ✅ Exibição do avatar no botão do menu superior direito
4. ✅ Fallback para ícone se não tiver avatar

#### O que Mudou:
```tsx
// ANTES
{user?.avatar ? (
  <img src={user.avatar} alt={user.name} className="..." />
) : (
  <div className="..."><User className="..." /></div>
)}
<span>{user?.name}</span>

// DEPOIS
{currentProfile?.avatar_url ? (
  <img src={currentProfile.avatar_url} alt={currentProfile.name} className="..." />
) : (
  <div className="..."><User className="..." /></div>
)}
<span>{currentProfile?.name || user?.email}</span>
```

### Como Funciona

**Fluxo:**
```
1. Membro faz login
2. useAuth() traz dados básicos (id, email, role)
3. useCurrentProfile() busca dados completos (nome, avatar_url, telefone, etc.)
4. Avatar é exibido no menu superior direito
5. Quando membro edita perfil, avatar é atualizado
6. Header recarrega e exibe novo avatar automaticamente
```

### Estilos

**Avatar Container:**
- Tamanho: 8x8 (mobile) / 9x9 (desktop)
- Formato: Arredondado (`rounded-xl`)
- Fundo: Branco transparente se sem foto
- Sobra: Sombra suave

**Comportamento:**
- ✅ Responsivo (mobile/desktop)
- ✅ Click abre menu com opções (Perfil, Configurações, Sair)
- ✅ Mostra nome do membro ao lado (apenas desktop)
- ✅ Fallback para ícone se sem foto

### Resultado Visual

```
┌──────────────────────────────────┐
│ Título da Página     [🔔] [🌙] [👤 João Silva] ✅
└──────────────────────────────────┘
                        ↑
                    Avatar aqui!
```

---
**Status:** ✅ IMPLEMENTADO
**Requer:** Membro com foto de perfil para aparecer
**Fallback:** Ícone de usuário se sem foto
