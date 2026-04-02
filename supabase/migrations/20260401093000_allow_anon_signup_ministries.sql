-- Permite leitura publica dos ministerios e dados basicos da igreja para o cadastro de musico
DROP POLICY IF EXISTS "Anon can view ministries for signup" ON public.ministries;
DROP POLICY IF EXISTS "Anon can view churches for signup" ON public.churches;

CREATE POLICY "Anon can view ministries for signup"
  ON public.ministries FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anon can view churches for signup"
  ON public.churches FOR SELECT
  TO anon, authenticated
  USING (true);
