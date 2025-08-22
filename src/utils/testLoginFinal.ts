import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dados corretos do cliente (como devem ser inseridos no formulário)
const clienteTestData = {
  nome: 'Talytta Schulze Neves',
  cpfFormatado: '700.469.101-23' // CPF formatado como está no banco
};

async function testLoginFinal() {
  console.log('🧪 Teste final do login do cliente');
  console.log('Dados de teste:', clienteTestData);
  console.log('\n' + '='.repeat(50));

  try {
    // Simular a consulta exata que será feita após a correção
    console.log('\n1. Testando consulta corrigida...');
    console.log(`Buscando por: cpf_cliente = "${clienteTestData.cpfFormatado}" AND titulo ILIKE "%${clienteTestData.nome}%"`);
    
    const { data, error } = await supabase
      .from('agenda_eventos')
      .select('id, titulo, cpf_cliente, telefone, endereco_cliente')
      .eq('cpf_cliente', clienteTestData.cpfFormatado)
      .ilike('titulo', `%${clienteTestData.nome}%`)
      .single();

    if (error) {
      console.error('❌ Erro na consulta:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem:', error.message);
      return false;
    }

    if (data) {
      console.log('✅ Login bem-sucedido!');
      console.log('Dados do cliente encontrados:');
      console.log(`   - ID: ${data.id}`);
      console.log(`   - Título: "${data.titulo}"`);
      console.log(`   - CPF: "${data.cpf_cliente}"`);
      console.log(`   - Telefone: "${data.telefone}"`);
      console.log(`   - Endereço: "${data.endereco_cliente}"`);
      
      console.log('\n🎉 SUCESSO: O cliente pode fazer login com os dados:');
      console.log(`   - Nome: ${clienteTestData.nome}`);
      console.log(`   - CPF: ${clienteTestData.cpfFormatado}`);
      
      return true;
    } else {
      console.log('❌ Nenhum registro encontrado');
      return false;
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
    return false;
  }
}

// Executar o teste
testLoginFinal().then(success => {
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🏆 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('O cliente pode agora fazer login e acessar /agenda/cliente');
  } else {
    console.log('❌ TESTE FALHOU - Verifique os dados ou configuração');
  }
});

export { testLoginFinal };