-- Tabela de avaliações entre pares (membros avaliam colegas)
CREATE TABLE IF NOT EXISTS peer_evaluations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  evaluated_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  church_id           UUID REFERENCES churches(id) ON DELETE CASCADE,

  -- Critérios: 1 a 5 estrelas
  musicality          SMALLINT NOT NULL CHECK (musicality BETWEEN 1 AND 5),
  punctuality         SMALLINT NOT NULL CHECK (punctuality BETWEEN 1 AND 5),
  music_preparation   SMALLINT NOT NULL CHECK (music_preparation BETWEEN 1 AND 5),
  group_behavior      SMALLINT NOT NULL CHECK (group_behavior BETWEEN 1 AND 5),
  temperament         SMALLINT NOT NULL CHECK (temperament BETWEEN 1 AND 5),
  group_contribution  SMALLINT NOT NULL CHECK (group_contribution BETWEEN 1 AND 5),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Um membro avalia cada colega apenas uma vez (pode atualizar)
  CONSTRAINT uq_peer_eval UNIQUE (evaluator_id, evaluated_id)
);

-- Índices para consultas de agregação
CREATE INDEX IF NOT EXISTS idx_peer_eval_evaluated ON peer_evaluations (evaluated_id);
CREATE INDEX IF NOT EXISTS idx_peer_eval_evaluator ON peer_evaluations (evaluator_id);
CREATE INDEX IF NOT EXISTS idx_peer_eval_church    ON peer_evaluations (church_id);

-- View que calcula a média por critério e o escore geral de cada membro avaliado
CREATE OR REPLACE VIEW peer_evaluation_scores AS
SELECT
  evaluated_id                                    AS profile_id,
  COUNT(*)                                        AS total_evaluators,
  ROUND(AVG(musicality)::numeric, 2)              AS avg_musicality,
  ROUND(AVG(punctuality)::numeric, 2)             AS avg_punctuality,
  ROUND(AVG(music_preparation)::numeric, 2)       AS avg_music_preparation,
  ROUND(AVG(group_behavior)::numeric, 2)          AS avg_group_behavior,
  ROUND(AVG(temperament)::numeric, 2)             AS avg_temperament,
  ROUND(AVG(group_contribution)::numeric, 2)      AS avg_group_contribution,
  -- Escore geral: média de todos os critérios (escala 1-5)
  ROUND((
    AVG(musicality) +
    AVG(punctuality) +
    AVG(music_preparation) +
    AVG(group_behavior) +
    AVG(temperament) +
    AVG(group_contribution)
  )::numeric / 6, 2)                              AS overall_score
FROM peer_evaluations
GROUP BY evaluated_id;

-- RLS
ALTER TABLE peer_evaluations ENABLE ROW LEVEL SECURITY;

-- Membro pode ver avaliações que fez ou que recebeu
CREATE POLICY "member_see_own_evals" ON peer_evaluations
  FOR SELECT USING (
    auth.uid() = evaluator_id OR auth.uid() = evaluated_id
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Membro pode criar avaliação (não pode avaliar a si mesmo)
CREATE POLICY "member_insert_eval" ON peer_evaluations
  FOR INSERT WITH CHECK (
    auth.uid() = evaluator_id
    AND evaluator_id <> evaluated_id
  );

-- Membro pode atualizar apenas a própria avaliação
CREATE POLICY "member_update_own_eval" ON peer_evaluations
  FOR UPDATE USING (auth.uid() = evaluator_id);

-- Admin pode deletar qualquer avaliação
CREATE POLICY "admin_delete_eval" ON peer_evaluations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );
