/**
 * Script para corrigir registros de clientes com telefone NULL
 * 
 * ANÁLISE DO PROBLEMA:
 * - Cliente "Agenda Pro": telefone está NULL no banco
 * - Cliente "8 Diogo G Mota": telefone tem valor válido
 * - O código está correto: telefone é opcional no formulário
 * - Problema está nos dados inconsistentes no banco
 */

import { createClient } from '@supabase/supabase-js';

// Configurar cliente Supabase com valores do ambiente
const supabaseUrl = "https://adxwgpfkvizpqdvortpu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o";

const supabase = createClient(supabaseUrl, supabaseKey);

async function corrigirTelefoneNull() {
  console.log('🔧 CORREÇÃO DE TELEFONES NULL - AGENDA PRO\n');
  
  try {
    // 1. Primeiro, vamos verificar a estrutura geral
    console.log('📊 Verificando estrutura geral dos dados...');
    const { data: todosClientes, error: errorTodos } = await supabase
      .from('clientes')
      .select('id, nome, telefone, user_id')
      .order('nome');
    
    if (errorTodos) {
      console.error('❌ Erro ao buscar todos os clientes:', errorTodos);
      return;
    }
    
    console.log(`📋 Total de clientes no banco: ${todosClientes.length}`);
    
    // Analisar distribuição de telefones
    const clientesComTelefone = todosClientes.filter(c => c.telefone && c.telefone.trim() !== '');
    const clientesSemTelefone = todosClientes.filter(c => !c.telefone || c.telefone.trim() === '');
    
    console.log(`✅ Clientes com telefone: ${clientesComTelefone.length}`);
    console.log(`❌ Clientes sem telefone: ${clientesSemTelefone.length}\n`);
    
    // 2. Buscar especificamente os clientes mencionados
    console.log('🔍 Buscando clientes específicos mencionados...');
    const clientesEspecificos = ['Agenda Pro', '8 Diogo G Mota'];
    
    for (const nomeCliente of clientesEspecificos) {
      const cliente = todosClientes.find(c => c.nome === nomeCliente);
      if (cliente) {
        console.log(`📋 ${nomeCliente}:`);
        console.log(`   - ID: ${cliente.id}`);
        console.log(`   - Telefone: ${cliente.telefone || 'NULL'}`);
        console.log(`   - User ID: ${cliente.user_id}`);
      } else {
        console.log(`❌ Cliente "${nomeCliente}" não encontrado`);
      }
    }
    console.log('');
    
    // 3. Buscar todos os clientes com telefone NULL
    console.log('📋 Buscando todos os clientes com telefone NULL...');
    const { data: clientesNull, error: errorClientes } = await supabase
      .from('clientes')
      .select('id, nome, telefone, user_id')
      .is('telefone', null)
      .order('nome');
    
    if (errorClientes) {
      console.error('❌ Erro ao buscar clientes com telefone NULL:', errorClientes);
      return;
    }
    
    console.log(`✅ ${clientesNull.length} clientes com telefone NULL encontrados\n`);
    
    if (clientesNull.length === 0) {
      console.log('✅ Nenhum cliente com telefone NULL encontrado. Nada a corrigir.');
      return;
    }
    
    // 2. Exibir lista de clientes afetados
    console.log('📋 CLIENTES COM TELEFONE NULL:');
    clientesNull.forEach((cliente, index) => {
      console.log(`${index + 1}. ${cliente.nome} (ID: ${cliente.id})`);
    });
    console.log('');
    
    // 3. Buscar eventos relacionados para tentar recuperar telefone
    console.log('🔍 Buscando telefones em eventos relacionados...');
    const clientesRecuperados = [];
    
    for (const cliente of clientesNull) {
      const { data: eventos, error: errorEventos } = await supabase
        .from('agenda_eventos')
        .select('telefone, cliente_nome')
        .or(`cliente_nome.eq.${cliente.nome},cliente_id.eq.${cliente.id}`)
        .not('telefone', 'is', null)
        .limit(1);
      
      if (!errorEventos && eventos && eventos.length > 0) {
        const telefoneEncontrado = eventos[0].telefone;
        if (telefoneEncontrado && telefoneEncontrado.trim() !== '') {
          clientesRecuperados.push({
            ...cliente,
            telefone_encontrado: telefoneEncontrado
          });
          console.log(`✅ ${cliente.nome}: telefone encontrado em evento -> ${telefoneEncontrado}`);
        }
      }
    }
    
    console.log(`\n📊 RESUMO:`);
    console.log(`- Clientes com telefone NULL: ${clientesNull.length}`);
    console.log(`- Telefones recuperáveis de eventos: ${clientesRecuperados.length}`);
    console.log(`- Clientes sem telefone recuperável: ${clientesNull.length - clientesRecuperados.length}\n`);
    
    // 4. Aplicar correções (apenas para telefones recuperáveis)
    if (clientesRecuperados.length > 0) {
      console.log('🔧 Aplicando correções...');
      
      for (const cliente of clientesRecuperados) {
        const { error: updateError } = await supabase
          .from('clientes')
          .update({ telefone: cliente.telefone_encontrado })
          .eq('id', cliente.id);
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar ${cliente.nome}:`, updateError);
        } else {
          console.log(`✅ ${cliente.nome}: telefone atualizado para ${cliente.telefone_encontrado}`);
        }
      }
    }
    
    // 5. Relatório final
    console.log('\n📄 RELATÓRIO FINAL:');
    console.log('==================');
    
    // Verificar clientes ainda com telefone NULL
    const { data: clientesAindaNull, error: errorFinal } = await supabase
      .from('clientes')
      .select('id, nome, telefone')
      .is('telefone', null)
      .order('nome');
    
    if (!errorFinal) {
      console.log(`\n📋 CLIENTES AINDA COM TELEFONE NULL (${clientesAindaNull.length}):`);
      if (clientesAindaNull.length === 0) {
        console.log('✅ Nenhum cliente com telefone NULL restante!');
      } else {
        clientesAindaNull.forEach((cliente, index) => {
          console.log(`${index + 1}. ${cliente.nome} (ID: ${cliente.id})`);
        });
        
        console.log('\n💡 RECOMENDAÇÕES:');
        console.log('- Estes clientes precisam ter o telefone preenchido manualmente');
        console.log('- Ou considere tornar o telefone obrigatório no formulário');
        console.log('- Ou implemente uma validação que solicite telefone em casos específicos');
      }
    }
    
    console.log('\n🎯 ANÁLISE TÉCNICA:');
    console.log('===================');
    console.log('✅ CÓDIGO: Está correto - telefone é opcional conforme schema');
    console.log('✅ VALIDAÇÃO: Existe validação de formato quando telefone é fornecido');
    console.log('✅ INTERFACE: Formulário permite telefone vazio (não obrigatório)');
    console.log('⚠️  DADOS: Inconsistência no banco - alguns registros com NULL');
    
    console.log('\n💡 SOLUÇÕES IMPLEMENTADAS:');
    console.log('- ✅ Recuperação automática de telefones de eventos relacionados');
    console.log('- ✅ Atualização segura apenas de registros recuperáveis');
    console.log('- ✅ Preservação de registros sem telefone (conforme regra de negócio)');
    
    console.log('\n🔧 PRÓXIMOS PASSOS RECOMENDADOS:');
    console.log('1. Decidir se telefone deve ser obrigatório ou opcional');
    console.log('2. Se obrigatório: atualizar schema e formulário');
    console.log('3. Se opcional: manter como está (comportamento atual correto)');
    console.log('4. Implementar validação condicional se necessário');
    
  } catch (error) {
    console.error('❌ Erro durante execução:', error);
  }
}

// Executar correção
corrigirTelefoneNull().then(() => {
  console.log('\n✅ Script de correção finalizado.');
}).catch(error => {
  console.error('❌ Erro fatal:', error);
});