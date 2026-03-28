import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ler .env manualmente
const envPath = join(__dirname, '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_KEY = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Testando conexão com Supabase...\n');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_KEY ? `${SUPABASE_KEY.substring(0, 20)}...` : 'NÃO DEFINIDA');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  try {
    console.log('\n📊 Testando tabela schedules...');
    
    // Testar se a tabela existe
    const { data, error, count } = await supabase
      .from('schedules')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (error) {
      console.error('❌ Erro ao acessar schedules:', error.message);
      console.error('Detalhes:', error);
      return;
    }

    console.log(`✅ Tabela schedules acessível! Total de registros: ${count || 0}`);
    
    if (data && data.length > 0) {
      console.log('\n📋 Exemplo de escala encontrada:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('\n⚠️ Nenhuma escala encontrada no banco.');
    }

    // Testar schedule_assignments
    console.log('\n📊 Testando tabela schedule_assignments...');
    const { data: assignments, error: assignError } = await supabase
      .from('schedule_assignments')
      .select('*')
      .limit(3);

    if (assignError) {
      console.error('❌ Erro ao acessar schedule_assignments:', assignError.message);
    } else {
      console.log(`✅ Tabela schedule_assignments acessível! Registros: ${assignments?.length || 0}`);
    }

    // Testar query complexa com joins
    console.log('\n🔗 Testando query com relacionamentos...');
    const { data: fullData, error: fullError } = await supabase
      .from('schedules')
      .select(`
        *,
        church:churches(id, name),
        ministry:ministries(id, name),
        schedule_assignments(
          id,
          profile_id,
          role_assigned,
          team:teams(id, name)
        )
      `)
      .limit(1);

    if (fullError) {
      console.error('❌ Erro na query com joins:', fullError.message);
      console.error('Código:', fullError.code);
      console.error('Detalhes:', fullError.details);
    } else {
      console.log('✅ Query com relacionamentos funcionando!');
      if (fullData && fullData.length > 0) {
        console.log('\n📋 Dados completos:');
        console.log(JSON.stringify(fullData[0], null, 2));
      }
    }

    // Verificar estrutura da tabela
    console.log('\n🔍 Verificando colunas da tabela schedules...');
    const { data: columns, error: colError } = await supabase
      .from('schedules')
      .select('*')
      .limit(1);
    
    if (!colError && columns && columns[0]) {
      console.log('Colunas disponíveis:', Object.keys(columns[0]).join(', '));
    }

  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

testConnection();
