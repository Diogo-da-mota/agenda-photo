import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verificarRLS() {
  console.log('🔍 VERIFICANDO POLÍTICAS RLS DA TABELA AGENDA_EVENTOS');
  console.log('============================================================');
  
  try {
    // Verificar se RLS está habilitado
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_class')
      .select('relname, relrowsecurity')
      .eq('relname', 'agenda_eventos');
    
    if (rlsError) {
      console.error('❌ Erro ao verificar status RLS:', rlsError.message);
    } else {
      console.log('📊 Status RLS:', rlsStatus);
    }
    
    // Verificar políticas existentes
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'agenda_eventos');
    
    if (policiesError) {
      console.error('❌ Erro ao verificar políticas:', policiesError.message);
    } else {
      console.log('📋 Políticas encontradas:', policies.length);
      policies.forEach((policy, index) => {
        console.log(`   ${index + 1}. ${policy.policyname} (${policy.cmd}) - Roles: ${policy.roles}`);
      });
    }
    
    // Testar acesso com ANON_KEY
    console.log('\n🧪 Testando acesso com ANON_KEY...');
    const anonSupabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    
    const { data: testData, error: testError } = await anonSupabase
      .from('agenda_eventos')
      .select('id, titulo, cpf_cliente')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro no teste ANON:', testError.message);
    } else {
      console.log('✅ Teste ANON bem-sucedido:', testData.length, 'registros');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

verificarRLS();