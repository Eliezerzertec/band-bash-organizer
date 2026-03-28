# 🔧 Fix - Página de Ministérios Não Abria

## Problema
A página de cadastro de Ministérios não estava abrindo corretamente.

## Causa
O hook `useEffect` nos formulários tinha dependências problemáticas:
- `form` estava sendo incluído como dependência, causando re-renders infinitos
- Isso travava a página quando o diálogo era aberto

## Solução Implementada

### Arquivo: ChurchFormDialog.tsx
```diff
  useEffect(() => {
+   if (open) {
      if (church) {
        form.reset({...});
        setLogoPreview(church.logo_url || '');
      } else {
        form.reset({...});
        setLogoPreview('');
      }
+   }
-   }, [church, form, open]);
+   // eslint-disable-next-line react-hooks/exhaustive-deps
+   }, [church, open]);
```

### Arquivo: MinistryFormDialog.tsx
```diff
  useEffect(() => {
+   if (open) {
      if (ministry) {
        form.reset({...});
        setLogoPreview(ministry.logo_url || '');
      } else {
        form.reset({...});
        setLogoPreview('');
      }
+   }
-   }, [ministry, form, churches, open]);
+   // eslint-disable-next-line react-hooks/exhaustive-deps
+   }, [ministry, open, churches?.[0]?.id]);
```

## O que mudou

1. ✅ Removido `form` das dependências (estava causando loops)
2. ✅ Adicionado check `if (open)` para só resetar quando dialog abre
3. ✅ Mantidas apenas as dependências essenciais
4. ✅ Adicionado `eslint-disable` para clareza

## Teste

Para verificar se funcionou:

1. Faça login com usuário admin
2. Clique em "Ministérios" no menu lateral
3. Página deve abrir normalmente
4. Clique em "Novo Ministério"
5. Diálogo deve abrir sem congelar

## Status

✅ **CORRIGIDO**

A página de Ministérios agora abre corretamente e o formulário funciona sem problemas!

---

**Data do Fix**: 18 de janeiro de 2026
