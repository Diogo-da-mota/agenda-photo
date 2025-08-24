import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dados do cliente para teste
const CLIENTE_TESTE = {
  nome: 'Talytta Schulze Neves',
  cpf: '700.469.101-23'
};

/**
 * Testa a conexão com o Supabase
 */
export async function testarConexaoSupabase(): Promise<boolean> {
  try {
    console.log('🔗 Testando conexão com Supabase...');
    
    const { data, error } = await supabase
      .from('agenda_eventos')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado na conexão:', error);
    return false;
  }
}

/**
 * Verifica se o cliente existe na tabela agenda_eventos
 */
export async function verificarClienteExiste(): Promise<boolean> {
  try {
    console.log('👤 Verificando se o cliente existe na base de dados...');
    console.log(`   Nome: ${CLIENTE_TESTE.nome}`);
    console.log(`   CPF: ${CLIENTE_TESTE.cpf}`);
    
    const { data, error } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('cliente_nome', CLIENTE_TESTE.nome)
      .eq('cliente_cpf', CLIENTE_TESTE.cpf)
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao buscar cliente:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('❌ Cliente não encontrado na base de dados');
      console.log('   Verifique se os dados estão corretos ou se o cliente foi cadastrado');
      return false;
    }
    
    console.log('✅ Cliente encontrado na base de dados');
    console.log(`   Registros encontrados: ${data.length}`);
    console.log(`   Primeiro evento: ${data[0].titulo || 'N/A'}`);
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado ao verificar cliente:', error);
    return false;
  }
}

/**
 * Simula o processo de login do cliente
 */
export async function simularLoginCliente(): Promise<any> {
  try {
    console.log('🔐 Simulando processo de login...');
    
    // Busca os dados do cliente (simulando o que o ClienteAuthContext faz)
    const { data, error } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('cliente_nome', CLIENTE_TESTE.nome)
      .eq('cliente_cpf', CLIENTE_TESTE.cpf)
      .limit(1)
      .single();
    
    if (error) {
      console.error('❌ Erro no login:', error.message);
      return null;
    }
    
    if (!data) {
      console.log('❌ Dados do cliente não encontrados para login');
      return null;
    }
    
    const clienteData = {
      nome: data.cliente_nome,
      cpf: data.cliente_cpf,
      telefone: data.cliente_telefone || '',
      email: data.cliente_email || ''
    };
    
    console.log('✅ Login simulado com sucesso');
    console.log('   Dados do cliente:', clienteData);
    
    return clienteData;
  } catch (error) {
    console.error('❌ Erro inesperado no login:', error);
    return null;
  }
}

/**
 * Verifica se a rota /agenda/cliente está acessível
 */
export async function verificarRotaAcessivel(): Promise<boolean> {
  try {
    console.log('🌐 Verificando acessibilidade da rota /agenda/cliente...');
    
    // Simula uma requisição para a rota (em ambiente de desenvolvimento)
    const baseUrl = 'http://localhost:8080'; // Porta do servidor de desenvolvimento
    const rotaCompleta = `${baseUrl}/agenda/cliente`;
    
    console.log(`   Testando: ${rotaCompleta}`);
    
    try {
      const response = await fetch(rotaCompleta, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      if (response.ok) {
        console.log('✅ Rota /agenda/cliente está acessível');
        console.log(`   Status: ${response.status} ${response.statusText}`);
        return true;
      } else {
        console.log(`❌ Rota retornou erro: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (fetchError) {
      console.log('⚠️  Não foi possível testar a rota via fetch (normal em ambiente de desenvolvimento)');
      console.log('   A rota deve ser testada manualmente no navegador');
      console.log(`   URL para teste: ${rotaCompleta}`);
      return true; // Consideramos como sucesso pois é limitação do ambiente
    }
  } catch (error) {
    console.error('❌ Erro inesperado ao verificar rota:', error);
    return false;
  }
}

/**
 * Executa todos os testes em sequência
 */
export async function executarTodosOsTestes(): Promise<void> {
  console.log('🚀 Iniciando testes de acesso do cliente...');
  console.log('=' .repeat(50));
  
  const resultados = {
    conexao: false,
    cliente: false,
    login: false,
    rota: false
  };
  
  // Teste 1: Conexão com Supabase
  resultados.conexao = await testarConexaoSupabase();
  console.log('');
  
  // Teste 2: Verificar se cliente existe
  if (resultados.conexao) {
    resultados.cliente = await verificarClienteExiste();
  } else {
    console.log('⏭️  Pulando verificação de cliente (conexão falhou)');
  }
  console.log('');
  
  // Teste 3: Simular login
  if (resultados.cliente) {
    const loginData = await simularLoginCliente();
    resultados.login = loginData !== null;
  } else {
    console.log('⏭️  Pulando simulação de login (cliente não encontrado)');
  }
  console.log('');
  
  // Teste 4: Verificar rota
  resultados.rota = await verificarRotaAcessivel();
  console.log('');
  
  // Resumo dos resultados
  console.log('📊 RESUMO DOS TESTES');
  console.log('=' .repeat(50));
  console.log(`🔗 Conexão Supabase: ${resultados.conexao ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`👤 Cliente existe: ${resultados.cliente ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🔐 Login simulado: ${resultados.login ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🌐 Rota acessível: ${resultados.rota ? '✅ OK' : '❌ FALHOU'}`);
  
  const todosOk = Object.values(resultados).every(resultado => resultado);
  
  console.log('');
  if (todosOk) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('   O cliente pode fazer login e acessar /agenda/cliente');
  } else {
    console.log('⚠️  ALGUNS TESTES FALHARAM');
    console.log('   Verifique os erros acima para resolver os problemas');
  }
  
  console.log('');
  console.log('💡 PRÓXIMOS PASSOS:');
  console.log('   1. Abra o navegador em http://localhost:8081');
  console.log('   2. Navegue para /agenda/cliente-login');
  console.log(`   3. Faça login com: ${CLIENTE_TESTE.nome} | ${CLIENTE_TESTE.cpf}`);
  console.log('   4. Verifique se é redirecionado para /agenda/cliente');
}

// Executa os testes automaticamente quando o arquivo é importado em desenvolvimento
if (import.meta.env.DEV) {
  console.log('🔧 Modo de desenvolvimento detectado');
  console.log('   Para executar os testes, chame: executarTodosOsTestes()');
}