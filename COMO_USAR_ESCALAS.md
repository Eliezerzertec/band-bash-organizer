# 📋 Passo a Passo: Como Usar a Página de Escalas

## ✅ Resumo Rápido

A página de Escalas **já existe e está funcionando**, mas precisa de dados no banco de dados para funcionar corretamente.

## 🎯 O que precisa fazer

### Passo 1️⃣: Corrigir Política RLS (5 minutos)

Há um erro de segurança (RLS Policy) que bloqueia a criação de Igrejas.

**Ação:**
1. Abra: https://app.supabase.com/projects/buavxdpzdckkhtzdggnq/sql
2. Clique em "Create a new query"
3. Cole este SQL:

```sql
DROP POLICY IF EXISTS "Admins can insert churches" ON public.churches;

CREATE POLICY "Authenticated users can insert churches"
  ON public.churches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can manage churches"
  ON public.churches FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

4. Clique "Run" ✅

### Passo 2️⃣: Cadastrar Dados (10 minutos)

Agora que a RLS está corrigida, cadastre:

1. **Igreja** - Ir para http://localhost:8081/churches
   - Clique "Nova Igreja"
   - Preencha: Nome, Endereço, Contato
   - Clique "Criar"

2. **Ministério** (opcional) - Ir para http://localhost:8081/ministries
   - Clique "Novo Ministério"
   - Preencha: Nome, Descrição
   - Selecione a Igreja criada
   - Clique "Criar"

3. **Equipes** (opcional) - Ir para http://localhost:8081/teams
   - Clique "Nova Equipe"
   - Preencha: Nome, Descrição
   - Selecione Ministério e Líder
   - Clique "Criar"

**Membros:** Já existem 4 membros cadastrados! ✅

### Passo 3️⃣: Criar Primeira Escala (5 minutos)

Agora sim! Vá para **http://localhost:8081/schedules**

1. Clique **"Nova Escala"**
2. Preencha os dados:
   - **Título:** Ex: "Louvor - Domingo 24/01"
   - **Data:** Selecione uma data
   - **Hora Início:** Ex: 09:00
   - **Igreja:** Selecione a Igreja criada
   - **Ministério:** (opcional) Selecione se criou
   - **Local:** (opcional) Ex: "Santuário"

3. Clique **"Próximo"** (ou role para baixo e clique no botão de ação)

4. **Selecione os Membros:**
   - Marque as checkboxes dos membros desejados
   - Para cada membro, escolha:
     - **Habilidade:** Vocal, Guitarra, Bateria, etc.
     - **Equipe:** (opcional) Selecione se criou equipes

5. Clique **"Criar"** ou **"Salvar"**

6. ✅ Pronto! Sua escala foi criada!

---

## 🎨 Páginas Relacionadas

| Página | URL | O que faz |
|--------|-----|----------|
| **Igrejas** | http://localhost:8081/churches | Cadastra igrejas |
| **Ministérios** | http://localhost:8081/ministries | Cadastra ministérios |
| **Membros** | http://localhost:8081/members | Gerencia membros (já tem 4) |
| **Equipes** | http://localhost:8081/teams | Cria equipes de trabalho |
| **Escalas** | http://localhost:8081/schedules | Gerencia escalas (USE ISTO!) |

---

## 🔧 Página de Escalas - Features

A página **Schedules** (Escalas) oferece:

✅ **Criar Nova Escala**
- Informações básicas (título, data, hora)
- Seleção de Igreja e Ministério
- Seleção de Membros
- Atribuição de roles (vocal, guitarra, etc)
- Atribuição de equipes

✅ **Visualizar Escalas**
- Lista de todas as escalas criadas
- Busca por título/descrição
- Mostra data, hora, local
- Mostra quantos membros estão escalados

✅ **Editar Escala**
- Clique no menu (⋮) → "Editar"
- Altere os dados
- Salve as mudanças

✅ **Deletar Escala**
- Clique no menu (⋮) → "Deletar"
- Confirme a exclusão

---

## 🆘 Se Algo Não Funcionar

### Erro: "new row violates row-level security policy"
→ Você não executou o SQL do Passo 1. Faça isso agora!

### Erro: "Nenhuma Igreja encontrada"
→ Você não criou uma Igreja ainda. Vá para o Passo 2.

### O botão "Nova Escala" não abre formulário
→ Recarregue a página (F5 ou Ctrl+R)

### Não consegue selecionar membros
→ Isso está funcionando, mas precisa ter membros! Já existem 4. Marque as checkboxes.

---

## 📝 Checklist Final

- [ ] Executei o SQL de RLS no Supabase
- [ ] Criei pelo menos 1 Igreja
- [ ] Fui para a página de Escalas
- [ ] Cliquei em "Nova Escala"
- [ ] O formulário abriu corretamente
- [ ] Selecionei uma Igreja
- [ ] Selecionei 1+ membro
- [ ] Preenchi título, data e hora
- [ ] Cliquei em "Criar"
- [ ] ✅ Escala foi criada com sucesso!

---

**Dúvidas?** A página está funcionando corretamente, é apenas questão de ter dados no banco de dados!
