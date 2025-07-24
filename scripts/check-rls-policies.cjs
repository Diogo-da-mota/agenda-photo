// Script para verificar as políticas RLS na tabela portfolio_trabalhos
const { createClient } = require('@supabase/supabase-js');

// Configurar cliente Supabase com valores do ambiente
const supabaseUrl = "https://adxwgpfkvizpqdvortpu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o";

const supabase = createClient(supabaseUrl, supabaseKey);

// Função principal
async function main() {
  try {
    console.log('Verificando políticas RLS e registros em portfolio_trabalhos...');
    
    // 1. Tentar obter todos os registros (sujeito a RLS)
    console.log('\n1. Consulta normal (com RLS):');
    const { data: registros, error } = await supabase
      .from('portfolio_trabalhos')
      .select('id, titulo, user_id, url_imagem_drive');
    
    if (error) {
      console.error('❌ Erro ao buscar registros:', error);
    } else {
      console.log(`✓ Total de registros (com RLS): ${registros?.length || 0}`);
      if (registros && registros.length > 0) {
        registros.forEach((registro, index) => {
          console.log(`  ${index + 1}. ${registro.titulo} (User ID: ${registro.user_id})`);
        });
      } else {
        console.log('  Nenhum registro encontrado (com RLS ativa)');
      }
    }
    
    // 2. Fazer login para poder usar funções do servidor
    console.log('\n2. Tentando fazer login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'senha123'
    });
    
    if (authError) {
      console.error('❌ Erro ao fazer login:', authError);
      return;
    }
    
    console.log(`✅ Login realizado com sucesso! User ID: ${authData.user.id}`);
    
    // 3. Usar função RPC para listar todos os registros (bypass RLS)
    console.log('\n3. Consultando todos os registros (bypass RLS):');
    const { data: allRegistros, error: rpcError } = await supabase.rpc('execute_sql', {
      statement: `
        SELECT id, titulo, user_id, url_imagem_drive 
        FROM portfolio_trabalhos 
        ORDER BY criado_em DESC;
      `
    });
    
    if (rpcError) {
      console.error('❌ Erro ao executar consulta SQL:', rpcError);
    } else {
      console.log(`✓ Total de registros (bypass RLS): ${allRegistros?.length || 0}`);
      if (allRegistros && allRegistros.length > 0) {
        allRegistros.forEach((registro, index) => {
          console.log(`  ${index + 1}. ${registro.titulo} (User ID: ${registro.user_id})`);
          console.log(`     ID: ${registro.id}`);
          console.log(`     Imagem: ${registro.url_imagem_drive || 'Não definida'}`);
        });
      } else {
        console.log('  Nenhum registro encontrado (mesmo com bypass RLS)');
      }
    }
    
    // 4. Verificar se o usuário logado tem registros associados
    console.log('\n4. Registros associados ao usuário logado:');
    const { data: userRegistros, error: userError } = await supabase
      .from('portfolio_trabalhos')
      .select('id, titulo')
      .eq('user_id', authData.user.id);
    
    if (userError) {
      console.error('❌ Erro ao buscar registros do usuário:', userError);
    } else {
      console.log(`✓ Total de registros do usuário: ${userRegistros?.length || 0}`);
      if (userRegistros && userRegistros.length > 0) {
        userRegistros.forEach((registro, index) => {
          console.log(`  ${index + 1}. ${registro.titulo} (ID: ${registro.id})`);
        });
      } else {
        console.log('  Usuário não tem registros associados');
      }
    }
    
    // 5. Verificar políticas RLS
    console.log('\n5. Verificando políticas RLS:');
    const { data: policies, error: policiesError } = await supabase.rpc('execute_sql', {
      statement: `
        SELECT 
          schemaname, 
          tablename, 
          policyname, 
          roles, 
          cmd, 
          qual 
        FROM 
          pg_policies 
        WHERE 
          tablename = 'portfolio_trabalhos';
      `
    });
    
    if (policiesError) {
      console.error('❌ Erro ao consultar políticas:', policiesError);
    } else {
      console.log(`✓ Total de políticas: ${policies?.length || 0}`);
      if (policies && policies.length > 0) {
        policies.forEach((policy, index) => {
          console.log(`\n  Política ${index + 1}:`);
          console.log(`  Nome: ${policy.policyname}`);
          console.log(`  Comando: ${policy.cmd}`);
          console.log(`  Roles: ${policy.roles}`);
          console.log(`  Condição: ${policy.qual}`);
        });
      } else {
        console.log('  Nenhuma política RLS encontrada');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar script
main(); 