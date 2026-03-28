import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://buavxdpzdckkhtzdggnq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY não definida');
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
