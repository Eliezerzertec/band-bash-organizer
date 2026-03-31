# Validação de Fluxo - 31/03/2026

## Escopo validado

- Subida da aplicação em modo desenvolvimento
- Carregamento da rota pública de login
- Redirecionamento de rotas protegidas sem autenticação
- Tentativa de autenticação com credencial documentada de membro

## Resultado

### 1. Aplicação sobe corretamente
- Vite acessível em `http://127.0.0.1:4173`
- Build já validada anteriormente com sucesso

### 2. Fluxo público está consistente
- A rota `/login` renderiza corretamente
- Acesso direto a `/member-dashboard` sem sessão redireciona para `/login`

### 3. Fluxo autenticado não pôde ser homologado integralmente
- Tentativa de login com `membro@louvor.com / membro123`
- Resposta do Supabase Auth: `Invalid login credentials`
- Conclusão: o frontend está enviando a autenticação corretamente, mas a conta documentada não existe ou não corresponde ao backend atual

## Console do navegador

- Sem erro de renderização da aplicação na tela de login
- Warnings não bloqueantes do React Router v6 future flags
- Warning não bloqueante de `autocomplete` no campo de senha

## Ação necessária para homologação completa

1. Confirmar uma credencial real de admin e uma de membro no Supabase atual
2. Revalidar os passos:
   - login do membro
   - redirecionamento para `/member-dashboard`
   - abertura de `/schedules`
   - conferência de escalas, equipe, instrumento/função, ministério e local

## Observação importante

As credenciais listadas em `PROJECT_CONTEXT.md` devem ser tratadas como exemplos documentais até que sejam confirmadas no ambiente conectado.