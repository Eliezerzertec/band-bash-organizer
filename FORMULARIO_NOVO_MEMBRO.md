# 📋 Formulário de Cadastro de Membros - Campos Completos

## ✨ Novo Formulário Redesenhado

O formulário de cadastro agora inclui **todos os campos** conforme a estrutura do banco de dados:

### Campos Obrigatórios (*)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **Nome Completo** | Texto | Nome do membro (máx 100 caracteres) |
| **Email** | Email | Email único para login |
| **Senha de Acesso** | Senha | Mínimo 6 caracteres |
| **Status** | Select | Ativo ou Inativo |

### Campos Opcionais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **Telefone** | Texto | Contato (máx 20 caracteres) |
| **Habilidades Musicais** | Multi-select | Instrumentos / vozes |

---

## 🎼 Habilidades Musicais Disponíveis

Selecione uma ou mais:
- Voz
- Violão
- Guitarra
- Baixo
- Bateria
- Teclado
- Piano
- Percussão
- Flauta
- Saxofone
- Trompete
- Trombone

---

## 💾 Campos Salvos no Banco de Dados

Tabela: `profiles`

| Campo | Tipo | Obrigatório | Padrão |
|-------|------|-------------|--------|
| `name` | TEXT | ✅ | - |
| `email` | TEXT | ✅ | - |
| `phone` | TEXT | ❌ | null |
| `status` | ENUM | ✅ | 'active' |
| `musical_skills` | ARRAY | ❌ | [] |
| `avatar_url` | TEXT | ❌ | null |
| `created_at` | TIMESTAMP | ✅ | now() |
| `updated_at` | TIMESTAMP | ✅ | now() |

---

## 📸 Screenshots do Formulário

### Layout
```
┌─────────────────────────────────┐
│ Novo Membro                   ✕ │
├─────────────────────────────────┤
│ ℹ️ Preencha os dados do novo     │
│    membro. Email de confirmação │
├─────────────────────────────────┤
│ Nome Completo *                 │
│ [____________________________]   │
│ Email *                         │
│ [____________________________]   │
│ Telefone                        │
│ [____________________________]   │
│ Senha de Acesso *               │
│ [___________] [Mostrar]         │
│ Status *                        │
│ [Selecione ▼]                   │
│ Habilidades Musicais            │
│ [Voz] [Violão] [Guitarra] [Baixo] │
│ [Bateria] [Teclado] ...         │
│                                 │
│        [Cancelar] [Criar Membro]│
└─────────────────────────────────┘
```

---

## 🔄 Fluxo de Criação

1. **Usuário preenche formulário**
   - Nome, Email, Senha (obrigatórios)
   - Status, Telefone, Habilidades (opcionais)

2. **Clica em "Criar Membro"**
   - Validação de dados no cliente
   - Confirmação de campos obrigatórios

3. **Supabase processa**
   - Cria usuário em `auth.users`
   - Cria perfil em `profiles` com todos os dados
   - Atribui role padrão (member)

4. **Sucesso**
   - ✅ Toast: "Membro criado com sucesso!"
   - 📧 Email de confirmação enviado
   - 📋 Lista atualiza em tempo real

---

## 🛠️ Técnico: O que foi Mudado

### CreateMemberDialog.tsx
- ✅ Schema Zod expandido com `status` e `musical_skills`
- ✅ Select para Status (active/inactive)
- ✅ Multi-select para Habilidades Musicais
- ✅ Interface melhorada com grid layout
- ✅ Contador de habilidades selecionadas

### useProfiles.ts (useCreateMember)
- ✅ Aceita campos adicionais: `status`, `musical_skills`
- ✅ Passa todos os dados para `profiles.upsert()`
- ✅ Mantém `status` padrão como 'active' se não informado
- ✅ Mantém `musical_skills` como array vazio se não informado

---

## ✨ Benefícios

- 📊 Dados mais completos no primeiro cadastro
- 🎵 Habilidades musicais capturadas automaticamente
- ✅ Status controlado já na criação
- 📱 Interface responsiva e intuitiva
- 💾 Salva tudo no banco em uma operação

---

## 📝 Exemplo de Uso

Criando "Maria da Silva":
```
Nome: Maria da Silva
Email: maria@example.com
Telefone: (11) 98765-4321
Senha: MariaSenha123
Status: Ativo
Habilidades: Voz, Teclado, Guitarra
```

**Resultado no banco:**
```json
{
  "user_id": "uuid-xxxx",
  "name": "Maria da Silva",
  "email": "maria@example.com",
  "phone": "(11) 98765-4321",
  "status": "active",
  "musical_skills": ["Voz", "Teclado", "Guitarra"],
  "avatar_url": null,
  "created_at": "2026-01-18T...",
  "updated_at": "2026-01-18T..."
}
```

