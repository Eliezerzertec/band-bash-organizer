# 🎯 Guia de Uso - Formulários Aprimorados

## 📦 O que foi implementado

Formulários completos e profissionais para cadastro de:

1. **✨ Igreja** - Com upload de logo e pastor responsável
2. **🎵 Ministério** - Com upload de logo e responsável do ministério

---

## 🚀 Como Usar

### Formulário de Igreja (ChurchFormDialog)

#### 1. Importar o Componente

```tsx
import { ChurchFormDialog } from '@/components/forms/ChurchFormDialog';
```

#### 2. Adicionar Estado

```tsx
const [churchDialogOpen, setChurchDialogOpen] = useState(false);
const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
```

#### 3. Usar o Componente

```tsx
// Abrir para novo cadastro
<Button onClick={() => {
  setSelectedChurch(null);
  setChurchDialogOpen(true);
}}>
  Nova Igreja
</Button>

// Abrir para editar
<Button onClick={() => {
  setSelectedChurch(church);
  setChurchDialogOpen(true);
}}>
  Editar
</Button>

// Renderizar o formulário
<ChurchFormDialog
  open={churchDialogOpen}
  onOpenChange={setChurchDialogOpen}
  church={selectedChurch}
/>
```

#### 4. Campos do Formulário

| Campo | Tipo | Obrigatório | Limite | Descrição |
|-------|------|-------------|--------|-----------|
| Nome da Igreja | Text | ✅ | 100 chars | Ex: Igreja do Evangelho |
| Pastor Responsável | Text | ✅ | 100 chars | Ex: Pastor João Silva |
| Endereço | Text | ❌ | 255 chars | Endereço completo |
| Contato | Text | ❌ | 50 chars | Telefone ou email |
| Logo | Image | ❌ | 5MB | PNG, JPG ou GIF |

---

### Formulário de Ministério (MinistryFormDialog)

#### 1. Importar o Componente

```tsx
import { MinistryFormDialog } from '@/components/forms/MinistryFormDialog';
```

#### 2. Adicionar Estado

```tsx
const [ministryDialogOpen, setMinistryDialogOpen] = useState(false);
const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
```

#### 3. Usar o Componente

```tsx
// Abrir para novo cadastro
<Button onClick={() => {
  setSelectedMinistry(null);
  setMinistryDialogOpen(true);
}}>
  Novo Ministério
</Button>

// Abrir para editar
<Button onClick={() => {
  setSelectedMinistry(ministry);
  setMinistryDialogOpen(true);
}}>
  Editar
</Button>

// Renderizar o formulário
<MinistryFormDialog
  open={ministryDialogOpen}
  onOpenChange={setMinistryDialogOpen}
  ministry={selectedMinistry}
/>
```

#### 4. Campos do Formulário

| Campo | Tipo | Obrigatório | Limite | Descrição |
|-------|------|-------------|--------|-----------|
| Nome do Ministério | Text | ✅ | 100 chars | Ex: Louvor e Adoração |
| Igreja | Select | ✅ | - | Selecione a igreja |
| Responsável | Select | ❌ | - | Coordenador do ministério |
| Descrição | Textarea | ❌ | 500 chars | Informações adicionais |
| Logo | Image | ❌ | 5MB | PNG, JPG ou GIF |

---

## 🖼️ Upload de Imagens

### Processo

1. **Clique no Botão de Upload**
   - Abre seletor de arquivo nativo

2. **Selecione a Imagem**
   - Aceita PNG, JPG, GIF
   - Máximo 5MB

3. **Visualize o Preview**
   - Imagem aparece em tempo real
   - Qualidade WYSIWYG

4. **Remova se Necessário**
   - Botão X remove a imagem
   - Clique novamente para escolher outra

5. **Salve o Formulário**
   - Imagem é armazenada junto com os dados

### Limitações Atuais

- ✅ Suporta múltiplos tipos de imagem
- ✅ Validação de tamanho (5MB)
- ✅ Preview em Base64
- ⚠️ Armazenado como texto Base64 no banco
- ⚠️ Não otimizado para grandes quantidades

### Futuras Melhorias

```
[ ] Usar Supabase Storage para imagens
[ ] Gerar thumbnails automaticamente
[ ] Suporte a drag & drop
[ ] Crop/resize de imagem
[ ] Compressão automática
```

---

## 🎨 Customização do Estilo

### Classes Tailwind Utilizadas

```tsx
// Diálogo
<DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">

// Card de upload
<Card className="p-4 bg-muted/30 border-dashed">

// Preview de imagem
<div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">

// Botão remover
<button className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1">
```

### Modificar Cores

Para customizar as cores, edite os valores no formulário:

```tsx
// Exemplo: Mudar cor da borda do preview
border-2 border-blue-500  // Altere para sua cor

// Exemplo: Mudar cor do botão X
bg-red-500 hover:bg-red-600  // Altere conforme necessário
```

---

## ⚙️ Configuração do Banco de Dados

### Executar Migração

1. **Usando Supabase CLI**

```bash
supabase migration new add_pastor_name_to_churches
# Edite o arquivo criado com a migração
supabase db push
```

2. **Manualmente no Supabase**

Acesse: https://app.supabase.com → SQL Editor

Execute o SQL:

```sql
ALTER TABLE churches 
ADD COLUMN pastor_name VARCHAR(100) DEFAULT NULL;

CREATE INDEX idx_churches_pastor_name ON churches(pastor_name);
```

### Schema da Tabela

```sql
CREATE TABLE churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  pastor_name VARCHAR(100),  -- ✨ Novo campo
  address VARCHAR(255),
  contact VARCHAR(50),
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔍 Troubleshooting

### Problema: Upload não funciona

**Solução**: Verifique se:
- [ ] Arquivo é uma imagem válida
- [ ] Arquivo é menor que 5MB
- [ ] Navegador permite file input

### Problema: Imagem não salva

**Solução**: Verifique:
- [ ] Conexão com Supabase
- [ ] Campos obrigatórios preenchidos
- [ ] Console do navegador para erros

### Problema: Opção "Pastor Responsável" não aparece

**Solução**: Execute a migração:

```bash
supabase db push
```

### Problema: Responsável do Ministério vazio

**Solução**: 
- Campo é opcional
- Verifique se há perfis cadastrados em `useProfiles`

---

## 📝 Código de Exemplo Completo

```tsx
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { ChurchFormDialog } from '@/components/forms/ChurchFormDialog';
import { MinistryFormDialog } from '@/components/forms/MinistryFormDialog';
import { useChurches, Church } from '@/hooks/useChurches';
import { useMinistries, Ministry } from '@/hooks/useMinistries';
import { Plus } from 'lucide-react';

export default function ManagementPage() {
  // Estado para Igreja
  const [churchDialogOpen, setChurchDialogOpen] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  
  // Estado para Ministério
  const [ministryDialogOpen, setMinistryDialogOpen] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);

  // Dados
  const { data: churches } = useChurches();
  const { data: ministries } = useMinistries();

  return (
    <MainLayout title="Gerenciamento" subtitle="Gerencie igrejas e ministérios">
      <div className="space-y-8">
        {/* Seção de Igrejas */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Igrejas</h2>
            <Button 
              onClick={() => {
                setSelectedChurch(null);
                setChurchDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Igreja
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {churches?.map(church => (
              <div 
                key={church.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted"
                onClick={() => {
                  setSelectedChurch(church);
                  setChurchDialogOpen(true);
                }}
              >
                {church.logo_url && (
                  <img 
                    src={church.logo_url} 
                    alt={church.name}
                    className="w-12 h-12 rounded mb-2"
                  />
                )}
                <h3 className="font-semibold">{church.name}</h3>
                <p className="text-sm text-muted-foreground">{church.pastor_name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Seção de Ministérios */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Ministérios</h2>
            <Button 
              onClick={() => {
                setSelectedMinistry(null);
                setMinistryDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Ministério
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ministries?.map(ministry => (
              <div 
                key={ministry.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted"
                onClick={() => {
                  setSelectedMinistry(ministry);
                  setMinistryDialogOpen(true);
                }}
              >
                {ministry.logo_url && (
                  <img 
                    src={ministry.logo_url} 
                    alt={ministry.name}
                    className="w-12 h-12 rounded mb-2"
                  />
                )}
                <h3 className="font-semibold">{ministry.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {ministry.church?.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Diálogos */}
      <ChurchFormDialog
        open={churchDialogOpen}
        onOpenChange={setChurchDialogOpen}
        church={selectedChurch}
      />

      <MinistryFormDialog
        open={ministryDialogOpen}
        onOpenChange={setMinistryDialogOpen}
        ministry={selectedMinistry}
      />
    </MainLayout>
  );
}
```

---

## 🎓 Best Practices

### ✅ Recomendado

```tsx
// Limpar preview após fechar diálogo
const handleCloseDialog = () => {
  setSelectedChurch(null);
  setChurchDialogOpen(false);
}

// Validar antes de submeter
if (!name || !pastor_name) {
  toast({ description: 'Preencha os campos obrigatórios' });
  return;
}

// Mostrar feedback ao usuário
toast({ title: 'Igreja criada com sucesso!' });
```

### ❌ Evitar

```tsx
// Não deixe em estado aberto indefinidamente
// Não deixe preview obsoleto na tela
// Não ignore erros de validação
// Não deixe upload em background sem feedback
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique [FORMS_IMPROVEMENTS.md](./FORMS_IMPROVEMENTS.md)
2. Confira o [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)
3. Revise o código em `src/components/forms/`
4. Verifique erros no console do navegador (F12)

---

**Última Atualização**: 18 de janeiro de 2026  
**Versão**: 1.0 ✅
