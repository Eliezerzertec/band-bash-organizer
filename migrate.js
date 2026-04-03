import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.API_EXTERNAL_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('SUPABASE_URL/API_EXTERNAL_URL/VITE_SUPABASE_URL nao definida');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY/SERVICE_ROLE_KEY nao definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addColorColumn() {
  try {
    const { data, error } = await supabase.rpc('sql', {
      query: `ALTER TABLE teams ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blue';`
    });

    if (error) {
      console.error('Erro ao executar migração:', error);
    } else {
      console.log('Migração executada com sucesso');
    }
  } catch (err) {
    console.error('Erro:', err);
  }
}

addColorColumn();
