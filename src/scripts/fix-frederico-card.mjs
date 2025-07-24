// Script específico para corrigir a inconsistência no card Frederico
// Execute usando: node src/scripts/fix-frederico-card.mjs

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Configurar dotenv
dotenv.config();

// Obter diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Para depuração - verificar se as variáveis de ambiente estão disponíveis
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  
  // Tentar carregar manualmente do arquivo .env
  try {
    const envPath = resolve(dirname(__dirname), '../.env');
    console.log(`📂 Tentando carregar variáveis do arquivo: ${envPath}`);
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = envContent.split('\n').reduce((acc, line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        acc[match[1]] = match[2].replace(/^['"](.*)['"]$/, '$1');
      }
      return acc;
    }, {});
    
    if (envVars.VITE_SUPABASE_URL && envVars.VITE_SUPABASE_ANON_KEY) {
      console.log('✅ Variáveis carregadas manualmente com sucesso!');
      process.env.VITE_SUPABASE_URL = envVars.VITE_SUPABASE_URL;
      process.env.VITE_SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY;
    }
  } catch (e) {
    console.error(`❌ Falha ao carregar .env manualmente: ${e.message}`);
  }
}

// Confirmar se temos as variáveis após a tentativa de carregamento manual
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ ERRO: As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessárias.');
  console.error('Por favor, crie um arquivo .env na raiz do projeto com essas variáveis.');
  process.exit(1);
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Configurações específicas para o card Frederico
const FREDERICO_EVENTO_ID = '7f1492dd-cab8-4b9c-9025-38260f0e95a2'; // Substitua pelo ID real do evento Frederico
const VALOR_CORRETO = 1000.00;  // Valor correto que deve constar na entrada (R$ 1.000,00)

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

// Função principal para corrigir o evento Frederico
async function corrigirEventoFrederico() {
  console.log('🔧 Iniciando correção do card Frederico...');
  
  try {
    // 1. Buscar o evento Frederico
    console.log(`🔍 Buscando evento com ID: ${FREDERICO_EVENTO_ID}`);
    
    const { data: evento, error: erroEvento } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('id', FREDERICO_EVENTO_ID)
      .single();
    
    if (erroEvento) {
      console.error('❌ Erro ao buscar evento Frederico:', erroEvento.message);
      return;
    }
    
    console.log(`✅ Evento encontrado: ${evento.titulo}`);
    console.log(`📝 Observações: ${evento.observacoes}`);
    
    // 2. Extrair valores financeiros atuais
    const valoresEvento = extrairValoresFinanceiros(evento.observacoes);
    console.log('📊 Valores atuais no evento:');
    console.log(`   - Valor Total: R$ ${valoresEvento.totalValue.toFixed(2)}`);
    console.log(`   - Entrada: R$ ${valoresEvento.downPayment.toFixed(2)}`);
    console.log(`   - Valor Restante: R$ ${valoresEvento.remainingValue.toFixed(2)}`);
    
    // 3. Verificar se os valores correspondem ao esperado
    if (valoresEvento.downPayment !== VALOR_CORRETO) {
      console.log(`⚠️ Valor incorreto detectado (${valoresEvento.downPayment}). Atualizando observações do evento...`);
      
      // Calcular o novo valor restante
      const novoValorRestante = valoresEvento.totalValue - VALOR_CORRETO;
      
      // Atualizar observações com valores corretos
      const novasObservacoes = `Valor Total: R$${valoresEvento.totalValue}
Entrada: R$${VALOR_CORRETO}
Valor Restante: R$${novoValorRestante}
${valoresEvento.notes}`;
      
      // Atualizar o evento
      const { error: erroAtualizacaoEvento } = await supabase
        .from('agenda_eventos')
        .update({ 
          observacoes: novasObservacoes,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', FREDERICO_EVENTO_ID);
      
      if (erroAtualizacaoEvento) {
        console.error('❌ Erro ao atualizar observações do evento:', erroAtualizacaoEvento.message);
      } else {
        console.log('✅ Observações do evento atualizadas com sucesso!');
      }
    } else {
      console.log('✅ Valor de entrada no evento já está correto!');
    }
    
    // 4. Buscar transações financeiras relacionadas a este evento
    console.log('\n🔍 Buscando transações financeiras relacionadas...');
    
    const { data: transacoes, error: erroTransacoes } = await supabase
      .from('financeiro_transacoes')
      .select('*')
      .eq('categoria', 'Entrada de Evento')
      .ilike('observacoes', `%${FREDERICO_EVENTO_ID}%`);
    
    if (erroTransacoes) {
      console.error('❌ Erro ao buscar transações:', erroTransacoes.message);
      return;
    }
    
    // 5. Verificar e corrigir transações
    if (!transacoes || transacoes.length === 0) {
      console.log('⚠️ Não foram encontradas transações financeiras para este evento. Criando uma nova...');
      
      // Criar nova transação
      await criarTransacaoCorreta(evento, VALOR_CORRETO);
    } else {
      console.log(`📊 Encontradas ${transacoes.length} transações relacionadas.`);
      
      if (transacoes.length === 1) {
        // Caso simples: apenas uma transação
        const transacao = transacoes[0];
        
        if (transacao.valor !== VALOR_CORRETO) {
          console.log(`⚠️ Valor da transação incorreto: R$ ${transacao.valor.toFixed(2)} (deve ser R$ ${VALOR_CORRETO.toFixed(2)})`);
          console.log('🔧 Atualizando transação...');
          
          const { error: erroAtualizacao } = await supabase
            .from('financeiro_transacoes')
            .update({ 
              valor: VALOR_CORRETO,
              atualizado_em: new Date().toISOString()
            })
            .eq('id', transacao.id);
          
          if (erroAtualizacao) {
            console.error('❌ Erro ao atualizar transação:', erroAtualizacao.message);
          } else {
            console.log('✅ Transação atualizada com sucesso!');
          }
        } else {
          console.log('✅ Valor da transação já está correto!');
        }
      } else {
        // Caso complexo: múltiplas transações
        console.log('⚠️ Múltiplas transações encontradas para o mesmo evento.');
        console.log('🔧 Corrigindo para ter apenas uma transação...');
        
        // Ordenar por data de criação (mais recente primeiro)
        transacoes.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
        
        // Atualizar a transação mais recente
        const transacaoMaisRecente = transacoes[0];
        console.log(`🔍 Atualizando transação mais recente: ${transacaoMaisRecente.id}`);
        
        const { error: erroAtualizacao } = await supabase
          .from('financeiro_transacoes')
          .update({ 
            valor: VALOR_CORRETO,
            atualizado_em: new Date().toISOString()
          })
          .eq('id', transacaoMaisRecente.id);
        
        if (erroAtualizacao) {
          console.error('❌ Erro ao atualizar transação mais recente:', erroAtualizacao.message);
        } else {
          console.log('✅ Transação mais recente atualizada com sucesso!');
        }
        
        // Remover as transações duplicadas
        console.log('🗑️ Removendo transações duplicadas...');
        
        for (let i = 1; i < transacoes.length; i++) {
          const { error: erroRemocao } = await supabase
            .from('financeiro_transacoes')
            .delete()
            .eq('id', transacoes[i].id);
          
          if (erroRemocao) {
            console.error(`❌ Erro ao remover transação ${transacoes[i].id}:`, erroRemocao.message);
          } else {
            console.log(`✅ Transação ${transacoes[i].id} removida com sucesso!`);
          }
        }
      }
    }
    
    console.log('\n✅ Correção do card Frederico concluída!');
    console.log('🔄 Recarregue a página para ver as alterações.');
    
  } catch (erro) {
    console.error('\n❌ Erro durante a correção:', erro);
  }
}

// Função para criar uma nova transação financeira
async function criarTransacaoCorreta(evento, valor) {
  console.log(`🔧 Criando nova transação financeira com valor correto: R$ ${valor.toFixed(2)}`);
  
  const dataEvento = new Date(evento.data_inicio || new Date());
  
  const novaTransacao = {
    id: uuidv4(),
    descricao: `Entrada - ${evento.tipo || 'Casamento'} (${evento.titulo})`,
    valor,
    tipo: 'receita',
    status: 'recebido',
    data_transacao: new Date().toISOString(),
    categoria: 'Entrada de Evento',
    observacoes: `Valor de entrada para evento do tipo "${evento.tipo || 'Casamento'}" agendado para ${dataEvento.toLocaleDateString()}. ID do evento: ${evento.id}`,
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
    console.error('❌ Erro ao criar transação:', error.message);
  } else {
    console.log('✅ Transação financeira criada com sucesso!');
  }
}

// Executar a correção
corrigirEventoFrederico().catch(console.error); 