// Script de diagnóstico para verificar e corrigir a inconsistência entre eventos e transações financeiras
// Execute usando: node src/scripts/diagnose-event.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para converter string de data para objeto Date
const parseDataEvento = (dataString) => {
  if (!dataString) return new Date();
  try {
    return new Date(dataString);
  } catch (e) {
    console.error('Erro ao converter data:', e);
    return new Date();
  }
};

// Função para extrair valores financeiros de texto de observações
const extrairValoresFinanceiros = (observacoes) => {
  if (!observacoes) {
    return { totalValue: 0, downPayment: 0, remainingValue: 0, notes: '' };
  }

  const valorTotalMatch = observacoes.match(/Valor Total: R\$(\d+(\.\d+)?)/);
  const entradaMatch = observacoes.match(/Entrada: R\$(\d+(\.\d+)?)/);
  const valorRestanteMatch = observacoes.match(/Valor Restante: R\$(\d+(\.\d+)?)/);

  const totalValue = valorTotalMatch ? parseFloat(valorTotalMatch[1]) : 0;
  const downPayment = entradaMatch ? parseFloat(entradaMatch[1]) : 0;
  const remainingValue = valorRestanteMatch ? parseFloat(valorRestanteMatch[1]) : 0;

  // Remove as linhas de valores das observações para obter apenas as notas
  const notes = observacoes
    .replace(/Valor Total: R\$\d+(\.\d+)?(\n|$)/, '')
    .replace(/Entrada: R\$\d+(\.\d+)?(\n|$)/, '')
    .replace(/Valor Restante: R\$\d+(\.\d+)?(\n|$)/, '')
    .trim();

  return { totalValue, downPayment, remainingValue, notes };
};

// Função para verificar um evento específico
async function verificarEvento(eventoId) {
  console.log(`\n🔍 Verificando evento ID: ${eventoId}`);
  
  // 1. Buscar o evento
  const { data: evento, error: erroEvento } = await supabase
    .from('agenda_eventos')
    .select('*')
    .eq('id', eventoId)
    .single();
  
  if (erroEvento) {
    console.error('❌ Erro ao buscar evento:', erroEvento.message);
    return;
  }
  
  console.log(`✅ Evento encontrado: ${evento.titulo}`);
  console.log(`📝 Observações: ${evento.observacoes}`);
  
  // 2. Extrair valores financeiros das observações
  const valoresEvento = extrairValoresFinanceiros(evento.observacoes);
  console.log('💰 Valores no evento:');
  console.log(`   - Valor Total: R$ ${valoresEvento.totalValue.toFixed(2)}`);
  console.log(`   - Entrada: R$ ${valoresEvento.downPayment.toFixed(2)}`);
  console.log(`   - Valor Restante: R$ ${valoresEvento.remainingValue.toFixed(2)}`);
  
  // 3. Buscar transações financeiras relacionadas a este evento
  const { data: transacoes, error: erroTransacoes } = await supabase
    .from('financeiro_transacoes')
    .select('*')
    .eq('categoria', 'Entrada de Evento')
    .ilike('observacoes', `%${eventoId}%`);
  
  if (erroTransacoes) {
    console.error('❌ Erro ao buscar transações:', erroTransacoes.message);
    return;
  }
  
  // 4. Verificar transações encontradas
  if (!transacoes || transacoes.length === 0) {
    console.log('⚠️ Não foram encontradas transações financeiras para este evento.');
    
    // Criar transação se necessário
    if (valoresEvento.downPayment > 0) {
      console.log('🔧 Criando transação financeira para o evento...');
      await criarTransacaoFinanceira(evento, valoresEvento);
    }
    return;
  }
  
  console.log(`📊 Encontradas ${transacoes.length} transações relacionadas:`);
  
  // 5. Exibir e comparar os valores
  let totalTransacoes = 0;
  transacoes.forEach((transacao, i) => {
    console.log(`\n📌 Transação ${i+1}: ${transacao.descricao}`);
    console.log(`   - ID: ${transacao.id}`);
    console.log(`   - Valor: R$ ${transacao.valor.toFixed(2)}`);
    console.log(`   - Criada em: ${new Date(transacao.criado_em).toLocaleString()}`);
    console.log(`   - Observações: ${transacao.observacoes}`);
    
    totalTransacoes += transacao.valor;
  });
  
  console.log('\n📊 Comparação:');
  console.log(`   - Valor de entrada no evento: R$ ${valoresEvento.downPayment.toFixed(2)}`);
  console.log(`   - Soma das transações: R$ ${totalTransacoes.toFixed(2)}`);
  
  // 6. Verificar inconsistência
  if (Math.abs(valoresEvento.downPayment - totalTransacoes) > 0.01) {
    console.log('\n⚠️ INCONSISTÊNCIA DETECTADA: Os valores não coincidem!');
    
    const respostaContinuar = await pergunta('\n🔄 Deseja corrigir esta inconsistência? (s/n): ');
    if (respostaContinuar.toLowerCase() === 's') {
      await corrigirInconsistencia(evento, valoresEvento, transacoes);
    }
  } else {
    console.log('\n✅ Os valores estão consistentes entre evento e transações.');
  }
}

// Função para criar uma transação financeira
async function criarTransacaoFinanceira(evento, valoresEvento) {
  const { v4: uuidv4 } = require('uuid');
  const dataEvento = parseDataEvento(evento.data_inicio);
  
  const novaTransacao = {
    id: uuidv4(),
    descricao: `Entrada - ${evento.tipo || 'Evento'} (${evento.titulo})`,
    valor: valoresEvento.downPayment,
    tipo: 'receita',
    status: 'recebido',
    data_transacao: new Date().toISOString(),
    categoria: 'Entrada de Evento',
    observacoes: `Valor de entrada para evento do tipo "${evento.tipo || 'Evento'}" agendado para ${dataEvento.toLocaleDateString()}. ID do evento: ${evento.id}`,
    user_id: evento.user_id,
    clienteName: evento.titulo,
    data_evento: evento.data_inicio,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('financeiro_transacoes')
    .insert([novaTransacao])
    .select();
  
  if (error) {
    console.error('❌ Erro ao criar transação:', error);
  } else {
    console.log('✅ Transação financeira criada com sucesso!');
  }
}

// Função para corrigir inconsistência entre evento e transações
async function corrigirInconsistencia(evento, valoresEvento, transacoes) {
  // Estratégia: Atualizar o valor da transação para corresponder ao valor de entrada do evento
  
  if (transacoes.length === 1) {
    // Caso mais comum: uma transação com valor diferente
    const transacao = transacoes[0];
    
    console.log(`🔧 Atualizando valor da transação de R$ ${transacao.valor} para R$ ${valoresEvento.downPayment}`);
    
    const { error } = await supabase
      .from('financeiro_transacoes')
      .update({ 
        valor: valoresEvento.downPayment,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', transacao.id);
    
    if (error) {
      console.error('❌ Erro ao atualizar transação:', error);
    } else {
      console.log('✅ Transação atualizada com sucesso!');
    }
    
  } else if (transacoes.length > 1) {
    // Caso complexo: múltiplas transações
    console.log('⚠️ Múltiplas transações encontradas. Recomendação:');
    console.log('   1. Manter apenas a transação mais recente');
    console.log('   2. Atualizar seu valor para corresponder ao valor de entrada do evento');
    
    // Ordenar transações por data (mais recente primeiro)
    transacoes.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
    
    const transacaoMaisRecente = transacoes[0];
    console.log(`\n🔍 Transação mais recente: ${transacaoMaisRecente.id} (${new Date(transacaoMaisRecente.criado_em).toLocaleString()})`);
    
    const respostaAtualizar = await pergunta('\n🔄 Atualizar valor desta transação? (s/n): ');
    if (respostaAtualizar.toLowerCase() === 's') {
      // Atualizar transação mais recente
      const { error: erroAtualizacao } = await supabase
        .from('financeiro_transacoes')
        .update({ 
          valor: valoresEvento.downPayment,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', transacaoMaisRecente.id);
      
      if (erroAtualizacao) {
        console.error('❌ Erro ao atualizar transação:', erroAtualizacao);
      } else {
        console.log('✅ Transação atualizada com sucesso!');
      }
      
      // Perguntar se deseja remover as outras transações
      const respostaRemover = await pergunta('\n🗑️ Remover as transações duplicadas? (s/n): ');
      if (respostaRemover.toLowerCase() === 's') {
        for (let i = 1; i < transacoes.length; i++) {
          const { error: erroRemocao } = await supabase
            .from('financeiro_transacoes')
            .delete()
            .eq('id', transacoes[i].id);
          
          if (erroRemocao) {
            console.error(`❌ Erro ao remover transação ${transacoes[i].id}:`, erroRemocao);
          } else {
            console.log(`✅ Transação ${transacoes[i].id} removida com sucesso!`);
          }
        }
      }
    }
  }
}

// Função para entrada do usuário (readline)
function pergunta(texto) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(texto, (resposta) => {
      rl.close();
      resolve(resposta);
    });
  });
}

// Função principal
async function main() {
  console.log('🔍 DIAGNÓSTICO DE INCONSISTÊNCIA ENTRE EVENTOS E TRANSAÇÕES');
  console.log('========================================================');
  
  // Obter ID do evento para diagnóstico
  const eventoId = process.argv[2];
  
  if (!eventoId) {
    console.log('\n❌ Você precisa fornecer o ID do evento como argumento.');
    console.log('Exemplo: node src/scripts/diagnose-event.js SEU_ID_EVENTO');
    return;
  }
  
  try {
    await verificarEvento(eventoId);
    console.log('\n✅ Diagnóstico concluído!');
  } catch (error) {
    console.error('\n❌ Erro durante o diagnóstico:', error);
  }
}

// Executar o script
main().catch(console.error); 