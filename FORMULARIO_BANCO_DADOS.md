# 📊 ESTRUTURA COMPLETA: Formulário → Banco de Dados

## ✅ Campos do Formulário vs Tabela

### Tabela: `public.profiles`

| Campo | Tipo | Origem | Obrigatório | Descrição |
|-------|------|--------|-------------|-----------|
| `id` | UUID | Auto | ✅ | PK - Identificador único |
| `user_id` | UUID | Auth | ✅ | FK - Link com usuario de auth |
| `name` | TEXT | Formulário | ✅ | Nome Completo |
| `email` | TEXT | Formulário | ✅ | Email do membro |
| `phone` | TEXT | Formulário | ❌ | Telefone (opcional) |
| `status` | ENUM | Formulário | ✅ | Ativo/Inativo (padrão: active) |
| `musical_skills` | TEXT[] | Formulário | ❌ | Array de habilidades musicais |
| `avatar_url` | TEXT | Futuro | ❌ | URL do avatar (opcional) |
| `created_at` | TIMESTAMPTZ | Auto | ✅ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Auto | ✅ | Data de atualização |

---

## 🔐 Permissões RLS (Segurança)

### 5 Policies Criadas

| # | Policy | Operação | Quem | O que permite |
|---|--------|----------|------|--------------|
| 1 | `authenticated_can_insert_profiles` | INSERT | Autenticados | Inserir novo perfil |
| 2 | `view_profiles_in_church` | SELECT | Autenticados | Ver perfis da sua igreja |
| 3 | `users_update_own_profile` | UPDATE | Autenticados | Editar seu próprio perfil |
| 4 | `users_delete_own_profile` | DELETE | Autenticados | Deletar seu próprio perfil |
| 5 | `service_role_all_access` | ALL | Service Role | Tudo (backend) |

---

## 📋 Fluxo Completo

### 1️⃣ Formulário Preenche Dados
```
Nome: João Silva
Email: joao@example.com
Telefone: (11) 99999-9999
Senha: SenhaSegura123
Status: Ativo
Habilidades: Voz, Guitarra, Teclado
```

### 2️⃣ App Valida (Zod Schema)
✅ Nome: 1-100 caracteres
✅ Email: formato válido
✅ Telefone: até 20 caracteres (opcional)
✅ Senha: mínimo 6 caracteres
✅ Status: 'active' ou 'inactive'
✅ Habilidades: array de strings

### 3️⃣ Supabase Auth Cria Usuário
```
auth.users:
- id: abc123def456
- email: joao@example.com
- encrypted_password: ***
- email_confirmed_at: null (até confirmar)
```

### 4️⃣ App Insere Perfil
```
INSERT INTO profiles (
  user_id,
  name,
  email,
  phone,
  status,
  musical_skills
) VALUES (
  'abc123def456',
  'João Silva',
  'joao@example.com',
  '(11) 99999-9999',
  'active',
  ['Voz', 'Guitarra', 'Teclado']
)
```

### 5️⃣ RLS Valida
✅ Policy 1: `authenticated_can_insert_profiles` permite (WITH CHECK true)
✅ Perfil criado com sucesso!

### 6️⃣ Email de Confirmação Enviado
📧 João recebe email para confirmar seu email e definir seu próprio senha se quiser

---

## 🎼 Musical Skills (Habilidades)

12 opções disponíveis no formulário:
```
['Voz', 'Violão', 'Guitarra', 'Baixo', 'Bateria', 
 'Teclado', 'Piano', 'Percussão', 'Flauta', 
 'Saxofone', 'Trompete', 'Trombone']
```

Armazenado como: `TEXT[]` (array PostgreSQL)

---

## 🔒 Segurança por Role

### Autenticado (Membro Normal)
- ✅ VER: Seu perfil + perfis de membros da mesma chiesa
- ✅ EDITAR: Seu próprio perfil
- ✅ NÃO pode: Editar outras pessoas

### Admin (via formulário)
- ✅ CRIAR: Novos membros (permite INSERT)
- ✅ VER: Todos os perfis de sua chiesa
- ✅ EDITAR: Seu próprio perfil
- ⚠️ OBS: Editar outros perfis precisa de role separada

### Service Role (Backend)
- ✅ FAZER TUDO: Create, Read, Update, Delete
- ⚠️ Nunca expor a chave publicmente

---

## 🚀 Como Ativar Agora

### No Supabase Dashboard:

1. **SQL Editor** → **New Query**
2. Copie arquivo: `SETUP_PROFILES_COMPLETE.sql`
3. Cole e **Execute**
4. Veja a tabela com 5 policies criadas
5. Teste criar novo membro na app

---

## 📊 Exemplo de Dados Salvos

```json
{
  "id": "uuid-1234-5678",
  "user_id": "uuid-9999-0000",
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "(11) 99999-9999",
  "status": "active",
  "musical_skills": ["Voz", "Guitarra", "Teclado"],
  "avatar_url": null,
  "created_at": "2026-01-18T10:30:00Z",
  "updated_at": "2026-01-18T10:30:00Z"
}
```

---

## ✨ Status Final

- ✅ Tabela `profiles` existe
- ✅ Campos para todos os dados do formulário
- ✅ 5 Policies RLS configuradas
- ✅ Segurança por chiesa (multi-tenant)
- ✅ Pronto para usar!

