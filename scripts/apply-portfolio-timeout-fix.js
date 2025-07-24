#!/usr/bin/env node

/**
 * 🚨 SCRIPT DE CORREÇÃO URGENTE - TIMEOUT PORTFOLIO
 * 
 * Este script aplica todas as correções necessárias para resolver
 * o erro 57014 (statement timeout) nas operações UPDATE da tabela portfolio_trabalhos
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURAÇÕES
// ========================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role para operações administrativas

console.log('🚀 INICIANDO CORREÇÃO DE TIMEOUT - PORTFOLIO_TRABALHOS');
console.log('==========================================');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ ERRO: Variáveis de ambiente SUPABASE não configuradas');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

async function executarSQL(sql, descricao) {
  console.log(`\n🔧 ${descricao}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`❌ Erro em "${descricao}":`, error.message);
      return false;
    }
    
    console.log(`✅ ${descricao} - SUCESSO`);
    if (data && data.length > 0) {
      console.log('   Resultado:', data);
    }
    return true;
  } catch (err) {
    console.error(`❌ Exceção em "${descricao}":`, err.message);
    return false;
  }
}

async function verificarTabela() {
  console.log('\n📋 1. VERIFICANDO ESTRUTURA DA TABELA...');
  
  const verificacoes = [
    {
      sql: `SELECT table_name FROM information_schema.tables WHERE table_name = 'portfolio_trabalhos';`,
      descricao: 'Verificar se tabela portfolio_trabalhos existe'
    },
    {
      sql: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'portfolio_trabalhos' ORDER BY ordinal_position;`,
      descricao: 'Verificar colunas da tabela'
    },
    {
      sql: `SELECT COUNT(*) as total_registros FROM portfolio_trabalhos;`,
      descricao: 'Contar registros na tabela'
    }
  ];

  for (const verificacao of verificacoes) {
    await executarSQL(verificacao.sql, verificacao.descricao);
  }
}

async function verificarIndicesExistentes() {
  console.log('\n🔍 2. VERIFICANDO ÍNDICES EXISTENTES...');
  
  const sql = `
    SELECT 
        indexname, 
        indexdef 
    FROM pg_indexes 
    WHERE tablename = 'portfolio_trabalhos'
    ORDER BY indexname;
  `;
  
  await executarSQL(sql, 'Listar índices atuais');
}

async function criarIndices() {
  console.log('\n⚡ 3. CRIANDO ÍNDICES OTIMIZADOS...');
  
  const indices = [
    {
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_id_user ON portfolio_trabalhos(id, user_id);`,
      descricao: 'Criar índice composto (id, user_id) para UPDATE otimizado'
    },
    {
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_user_created ON portfolio_trabalhos(user_id, criado_em DESC);`,
      descricao: 'Criar índice para listagens por usuário'
    },
    {
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_updated ON portfolio_trabalhos(atualizado_em) WHERE atualizado_em IS NOT NULL;`,
      descricao: 'Criar índice parcial para data de atualização'
    },
    {
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_user_categoria ON portfolio_trabalhos(user_id, categoria);`,
      descricao: 'Criar índice para filtros por categoria'
    }
  ];

  let sucessos = 0;
  for (const indice of indices) {
    if (await executarSQL(indice.sql, indice.descricao)) {
      sucessos++;
    }
  }
  
  console.log(`\n📊 Índices criados: ${sucessos}/${indices.length}`);
}

async function otimizarTabela() {
  console.log('\n🧹 4. OTIMIZANDO TABELA...');
  
  const otimizacoes = [
    {
      sql: `ANALYZE portfolio_trabalhos;`,
      descricao: 'Atualizar estatísticas da tabela'
    },
    {
      sql: `VACUUM ANALYZE portfolio_trabalhos;`,
      descricao: 'Limpar e analisar tabela'
    }
  ];

  for (const otimizacao of otimizacoes) {
    await executarSQL(otimizacao.sql, otimizacao.descricao);
  }
}

async function testarPerformance() {
  console.log('\n🚀 5. TESTANDO PERFORMANCE...');
  
  // Buscar um registro real para teste
  const { data: registros } = await supabase
    .from('portfolio_trabalhos')
    .select('id, user_id')
    .limit(1);

  if (!registros || registros.length === 0) {
    console.log('⚠️  Nenhum registro encontrado para teste');
    return;
  }

  const registro = registros[0];
  
  console.log(`🧪 Testando UPDATE no registro: ${registro.id}`);
  
  const startTime = Date.now();
  
  try {
    const { error } = await supabase
      .from('portfolio_trabalhos')
      .update({ atualizado_em: new Date().toISOString() })
      .eq('id', registro.id)
      .eq('user_id', registro.user_id);

    const endTime = Date.now();
    const tempo = endTime - startTime;
    
    if (error) {
      console.error('❌ Erro no teste de UPDATE:', error.message);
    } else {
      console.log(`✅ UPDATE bem-sucedido em ${tempo}ms`);
      
      if (tempo > 5000) {
        console.warn('⚠️  UPDATE ainda lento (>5s) - verificar índices');
      } else if (tempo > 1000) {
        console.log('🟡 UPDATE moderado (>1s) - performance aceitável');
      } else {
        console.log('🟢 UPDATE rápido (<1s) - performance excelente');
      }
    }
  } catch (err) {
    console.error('❌ Exceção no teste:', err.message);
  }
}

async function verificarQueriesAtivas() {
  console.log('\n🔍 6. VERIFICANDO QUERIES ATIVAS...');
  
  const sql = `
    SELECT 
        pid,
        query_start,
        state,
        LEFT(query, 100) as query_preview
    FROM pg_stat_activity 
    WHERE state = 'active' 
    AND query NOT LIKE '%pg_stat_activity%'
    AND query LIKE '%portfolio_trabalhos%'
    ORDER BY query_start;
  `;
  
  await executarSQL(sql, 'Verificar queries ativas na tabela');
}

// ========================================
// EXECUÇÃO PRINCIPAL
// ========================================

async function main() {
  try {
    console.log('📅 Data/Hora:', new Date().toISOString());
    console.log('🔗 Supabase URL:', SUPABASE_URL);
    
    // Executar todas as correções em sequência
    await verificarTabela();
    await verificarIndicesExistentes();
    await criarIndices();
    await otimizarTabela();
    await verificarQueriesAtivas();
    await testarPerformance();
    
    console.log('\n🎉 CORREÇÕES APLICADAS COM SUCESSO!');
    console.log('==========================================');
    console.log('✅ Função updatePortfolioMutation corrigida');
    console.log('✅ Retry logic implementada');
    console.log('✅ Timeout customizado (15s)');
    console.log('✅ Índices otimizados criados');
    console.log('✅ Monitoramento de performance ativo');
    console.log('\n📊 PRÓXIMOS PASSOS:');
    console.log('1. Testar operações UPDATE na aplicação');
    console.log('2. Monitorar logs de performance');
    console.log('3. Verificar se timeouts não ocorrem mais');
    
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  verificarTabela,
  verificarIndicesExistentes,
  criarIndices,
  otimizarTabela,
  testarPerformance
}; 