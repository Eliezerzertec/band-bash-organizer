-- Corrige RLS de peer_evaluations para mapear auth.uid() (auth.users.id)
-- para profiles.id (evaluator_id / evaluated_id)

ALTER TABLE IF EXISTS peer_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_see_own_evals" ON peer_evaluations;
DROP POLICY IF EXISTS "member_insert_eval" ON peer_evaluations;
DROP POLICY IF EXISTS "member_update_own_eval" ON peer_evaluations;
DROP POLICY IF EXISTS "admin_delete_eval" ON peer_evaluations;

CREATE POLICY "member_see_own_evals"
ON peer_evaluations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = peer_evaluations.evaluator_id
      AND p.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = peer_evaluations.evaluated_id
      AND p.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY "member_insert_eval"
ON peer_evaluations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = peer_evaluations.evaluator_id
      AND p.user_id = auth.uid()
  )
  AND evaluator_id <> evaluated_id
);

CREATE POLICY "member_update_own_eval"
ON peer_evaluations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = peer_evaluations.evaluator_id
      AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = peer_evaluations.evaluator_id
      AND p.user_id = auth.uid()
  )
  AND evaluator_id <> evaluated_id
);

CREATE POLICY "admin_delete_eval"
ON peer_evaluations
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);
