# Sistema de Escalas (Schedules)

## Visão Geral

O sistema de escalas permite criar e gerenciar escalações de membros para eventos do ministério de louvor. Cada escala pode ter múltiplos membros com habilidades e equipes específicas.

## Estrutura de Dados

### Schedule (Escala Principal)
```typescript
{
  id: string;
  title: string;                    // Título da escala (ex: "Louvor - Domingo 24/01")
  description: string | null;       // Descrição detalhada
  event_date: string;               // Data do evento (YYYY-MM-DD)
  start_time: string;               // Hora de início (HH:mm)
  end_time: string | null;          // Hora de término (HH:mm)
  location: string | null;          // Local do evento
  church_id: string;                // ID da Igreja (obrigatório)
  ministry_id: string | null;       // ID do Ministério (opcional)
  created_by: string | null;        // Usuário que criou
  created_at: timestamp;
  updated_at: timestamp;
  
  // Relações
  schedule_assignments?: ScheduleAssignment[];
  church?: { name: string };
  ministry?: { name: string };
}
```

### ScheduleAssignment (Escalação Individual)
```typescript
{
  id: string;
  schedule_id: string;              // FK para Schedule
  profile_id: string;               // FK para Profile (membro)
  team_id: string | null;           // FK para Team (equipe do membro)
  role_assigned: string | null;     // Habilidade atribuída (ex: "vocal", "guitarra")
  notes: string | null;             // Notas específicas para este membro
  created_at: timestamp;
  
  // Relações
  profile?: Profile;
  team?: Team;
}
```

## Funcionalidades

### Criar Nova Escala
1. **Informações Básicas**
   - Título (obrigatório)
   - Descrição (opcional)
   - Data (obrigatório)
   - Hora de início (obrigatório)
   - Hora de término (opcional)
   - Local (opcional)

2. **Igreja e Ministério**
   - Selecionar Igreja (obrigatório)
   - Selecionar Ministério (opcional)

3. **Membros da Escala**
   - Adicionar membros ativos ao checkbox
   - Para cada membro, definir:
     - **Habilidade**: Vocal, Guitarra, Bateria, Baixo, Teclado, Violoncelo, Violino
     - **Equipe**: Equipe do membro (opcional, pode deixar em branco)

### Editar Escala
- Atualizar todos os campos
- Adicionar/remover membros
- Modificar habilidades e equipes dos membros

### Visualizar Escalas
- Lista com filtro por data
- Vista de calendário
- Detalhes com membros escalados

## Critérios de Seleção

### Contagem de Escalações
O monitor de atividade usa a contagem de escalações do mês para determinar:
- **Ideal**: 0.5 - 1.5 escalações/mês
- **Baixo**: < 0.5 escalações/mês
- **Alto**: > 1.5 escalações/mês

### Habilidades Disponíveis
1. **Vocal** - Vocalista/Cantor
2. **Guitarra** - Guitarrista/Violão
3. **Bateria** - Baterista/Percussão
4. **Baixo** - Baixista
5. **Teclado** - Tecladista/Organista
6. **Violoncelo** - Violoncelista
7. **Violino** - Violinista

## Integração com Outras Funcionalidades

### 1. Monitor de Atividades
- Conta escalações do mês para cada membro
- Determina nível de participação (verde/azul/vermelho)
- Usado na avaliação de membros

### 2. Substituições
- Baseado em escalas existentes
- Permite pedir substituição de um membro escalado

### 3. Membros
- Cada escala incrementa contador de participação
- Afeta escore de avaliação do membro

### 4. Equipes
- Cada escala pode conter membros de múltiplas equipes
- Rastreia participação por equipe

## Fluxo de Uso

### Administrador
1. Acessar página "Escalas"
2. Clicar em "Novo Escala"
3. Preencher dados básicos
4. Selecionar Igreja e Ministério
5. Adicionar membros com suas habilidades e equipes
6. Salvar

### Membro
1. Ver suas escalas futuras no dashboard
2. Confirmar ou pedir substituição
3. Aparecer na lista de participantes

## Banco de Dados

### Tabelas Necessárias

#### schedules
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location VARCHAR(255),
  church_id UUID NOT NULL REFERENCES churches(id),
  ministry_id UUID REFERENCES ministries(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### schedule_assignments
```sql
CREATE TABLE schedule_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  role_assigned VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Índices Recomendados
```sql
CREATE INDEX idx_schedules_church_id ON schedules(church_id);
CREATE INDEX idx_schedules_ministry_id ON schedules(ministry_id);
CREATE INDEX idx_schedules_event_date ON schedules(event_date);
CREATE INDEX idx_assignments_schedule_id ON schedule_assignments(schedule_id);
CREATE INDEX idx_assignments_profile_id ON schedule_assignments(profile_id);
```

## Validações

### No Formulário
- ✅ Título obrigatório (max 100 caracteres)
- ✅ Data obrigatória
- ✅ Hora de início obrigatória
- ✅ Igreja obrigatória
- ✅ Mínimo 1 membro escalado
- ✅ Descrição max 500 caracteres
- ✅ Local max 255 caracteres

### No Banco
- ✅ Datas válidas
- ✅ Horários válidos (start_time < end_time)
- ✅ Referências de FK corretas
- ✅ Sem duplicatas de membro na mesma escala

## Melhorias Futuras

- [ ] Confirmar presença dos membros escalados
- [ ] Histórico de presença/faltas
- [ ] Avisos automáticos para membros escalados
- [ ] Relatório de participação por período
- [ ] Escalas recorrentes (semanais, mensais)
- [ ] Conflito de horários
- [ ] Sugestão automática de membros baseada em critérios
- [ ] Importar escalas de outros sistemas
- [ ] Export para PDF/Excel
