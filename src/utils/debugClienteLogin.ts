import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dados do cliente para teste
const clienteTestData = {
  nome: 'Talytta Schulze Neves',
  cpfFormatado: '700.469.101-23',
  cpfSemFormatacao: '70046910123',
  tituloCompleto: '2 Talytta Schulze Neves'
};

async function debugClienteLogin() {
  console.log('🔍 Iniciando debug do login do cliente...');
  console.log('Dados de teste:', clienteTestData);
  console.log('\n' + '='.repeat(50));

  try {
    // 1. Buscar todos os registros que contenham 'Talytta' no título
    console.log('\n1. Buscando registros com "Talytta" no título...');
    const { data: registrosTalytta, error: errorTalytta } = await supabase
      .from('agenda_eventos')
      .select('*')
      .ilike('titulo', '%Talytta%');

    if (errorTalytta) {
      console.error('❌ Erro ao buscar registros com Talytta:', errorTalytta);
    } else {
      console.log(`✅ Encontrados ${registrosTalytta?.length || 0} registros com "Talytta":`);
      registrosTalytta?.forEach((registro, index) => {
        console.log(`   ${index + 1}. ID: ${registro.id}, Título: "${registro.titulo}", CPF: "${registro.cpf_cliente}"`);
      });
    }

    // 2. Verificar registro com CPF sem formatação
    console.log('\n2. Buscando por CPF sem formatação (70046910123)...');
    const { data: registrosCpfSem, error: errorCpfSem } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('cpf_cliente', clienteTestData.cpfSemFormatacao);

    if (errorCpfSem) {
      console.error('❌ Erro ao buscar por CPF sem formatação:', errorCpfSem);
    } else {
      console.log(`✅ Encontrados ${registrosCpfSem?.length || 0} registros com CPF sem formatação:`);
      registrosCpfSem?.forEach((registro, index) => {
        console.log(`   ${index + 1}. ID: ${registro.id}, Título: "${registro.titulo}", CPF: "${registro.cpf_cliente}"`);
      });
    }

    // 3. Verificar registro com CPF formatado
    console.log('\n3. Buscando por CPF formatado (700.469.101-23)...');
    const { data: registrosCpfCom, error: errorCpfCom } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('cpf_cliente', clienteTestData.cpfFormatado);

    if (errorCpfCom) {
      console.error('❌ Erro ao buscar por CPF formatado:', errorCpfCom);
    } else {
      console.log(`✅ Encontrados ${registrosCpfCom?.length || 0} registros com CPF formatado:`);
      registrosCpfCom?.forEach((registro, index) => {
        console.log(`   ${index + 1}. ID: ${registro.id}, Título: "${registro.titulo}", CPF: "${registro.cpf_cliente}"`);
      });
    }

    // 4. Testar a consulta exata que está falhando (como no contexto de autenticação)
    console.log('\n4. Testando consulta exata que está falhando...');
    console.log('Consulta: cpf_cliente = 70046910123 AND titulo ILIKE %2 Talytta Schulze Neves%');
    
    const { data: consultaExata, error: errorConsultaExata } = await supabase
      .from('agenda_eventos')
      .select('id, titulo, cpf_cliente, telefone, endereco_cliente')
      .eq('cpf_cliente', clienteTestData.cpfSemFormatacao)
      .ilike('titulo', `%${clienteTestData.tituloCompleto}%`);

    if (errorConsultaExata) {
      console.error('❌ Erro na consulta exata:', errorConsultaExata);
      console.error('Detalhes do erro:', JSON.stringify(errorConsultaExata, null, 2));
    } else {
      console.log(`✅ Consulta exata retornou ${consultaExata?.length || 0} registros:`);
      consultaExata?.forEach((registro, index) => {
        console.log(`   ${index + 1}. ID: ${registro.id}, Título: "${registro.titulo}", CPF: "${registro.cpf_cliente}"`);
      });
    }

    // 5. Testar variações da consulta
    console.log('\n5. Testando variações da consulta...');
    
    // Variação 1: Apenas por título
    console.log('\n5.1. Apenas por título completo...');
    const { data: apenasTitle, error: errorApenasTitle } = await supabase
      .from('agenda_eventos')
      .select('*')
      .ilike('titulo', `%${clienteTestData.tituloCompleto}%`);

    if (errorApenasTitle) {
      console.error('❌ Erro na busca apenas por título:', errorApenasTitle);
    } else {
      console.log(`✅ Busca apenas por título retornou ${apenasTitle?.length || 0} registros`);
    }

    // Variação 2: Apenas por CPF
    console.log('\n5.2. Apenas por CPF...');
    const { data: apenasCpf, error: errorApenasCpf } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('cpf_cliente', clienteTestData.cpfSemFormatacao);

    if (errorApenasCpf) {
      console.error('❌ Erro na busca apenas por CPF:', errorApenasCpf);
    } else {
      console.log(`✅ Busca apenas por CPF retornou ${apenasCpf?.length || 0} registros`);
    }

    // 6. Verificar políticas RLS
    console.log('\n6. Verificando informações da tabela e políticas...');
    
    // Tentar uma consulta simples para verificar se RLS está bloqueando
    const { data: consultaSimples, error: errorConsultaSimples } = await supabase
      .from('agenda_eventos')
      .select('count')
      .limit(1);

    if (errorConsultaSimples) {
      console.error('❌ Erro na consulta simples (possível problema de RLS):', errorConsultaSimples);
    } else {
      console.log('✅ Consulta simples funcionou - RLS não está bloqueando completamente');
    }

    // 7. Mostrar estrutura dos dados encontrados
    console.log('\n7. Estrutura detalhada dos dados encontrados...');
    if (registrosTalytta && registrosTalytta.length > 0) {
      console.log('Estrutura do primeiro registro encontrado:');
      console.log(JSON.stringify(registrosTalytta[0], null, 2));
    }

    console.log('\n' + '='.repeat(50));
    console.log('🏁 Debug concluído!');

  } catch (error) {
    console.error('💥 Erro geral durante o debug:', error);
  }
}

// Executar o debug
debugClienteLogin();

export { debugClienteLogin };