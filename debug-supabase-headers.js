// Script para debugar headers do Supabase e identificar a causa do erro 406

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://adxwgpfkvizpqdvortpu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o';

// Interceptar fetch para capturar headers
const originalFetch = globalThis.fetch;
let capturedHeaders = null;
let capturedUrl = null;

globalThis.fetch = async function(input, init) {
  const url = typeof input === 'string' ? input : input.url;
  
  // Capturar apenas requisições do Supabase
  if (url.includes('supabase.co/rest/v1/agenda_eventos')) {
    console.log('\n🔍 INTERCEPTANDO REQUISIÇÃO SUPABASE:');
    console.log('URL:', url);
    console.log('Method:', init?.method || 'GET');
    console.log('Headers enviados:', init?.headers || 'Nenhum header customizado');
    
    capturedUrl = url;
    capturedHeaders = init?.headers || {};
  }
  
  return originalFetch(input, init);
};

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para testar a requisição problemática
async function testarRequisicaoProblematica() {
  console.log('🚀 INICIANDO TESTE DE HEADERS SUPABASE');
  console.log('=' .repeat(60));
  
  try {
    // Reproduzir exatamente a requisição que está falhando
    const { data, error } = await supabase
      .from('agenda_eventos')
      .select('id, titulo, cpf_cliente, telefone, endereco_cliente')
      .eq('cpf_cliente', '705.978.501-94')
      .eq('titulo', 'Yasmine Gonçalves Vieira')
      .single();
    
    console.log('\n📊 RESULTADO DA REQUISIÇÃO:');
    if (error) {
      console.log('❌ Erro:', error.message);
      console.log('   Código:', error.code);
      console.log('   Detalhes:', error.details);
      console.log('   Hint:', error.hint);
    } else {
      console.log('✅ Sucesso:', data ? 'Dados encontrados' : 'Nenhum dado');
    }
    
  } catch (err) {
    console.log('❌ Erro inesperado:', err.message);
  }
  
  console.log('\n🔍 ANÁLISE DOS HEADERS CAPTURADOS:');
  if (capturedHeaders) {
    console.log('Headers enviados pelo Supabase client:');
    Object.entries(capturedHeaders).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  } else {
    console.log('❌ Nenhum header customizado capturado');
  }
  
  if (capturedUrl) {
    console.log('\n🌐 URL COMPLETA CAPTURADA:');
    console.log(capturedUrl);
    
    // Analisar a URL
    const url = new URL(capturedUrl);
    console.log('\n📋 ANÁLISE DA URL:');
    console.log('Base:', url.origin + url.pathname);
    console.log('Query params:');
    url.searchParams.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
  }
}

// Função para testar headers esperados vs enviados
function analisarHeadersEsperados() {
  console.log('\n📡 HEADERS ESPERADOS PELO SUPABASE REST API:');
  const headersEsperados = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`
  };
  
  Object.entries(headersEsperados).forEach(([key, value]) => {
    const valorTruncado = key.toLowerCase().includes('key') || key.toLowerCase().includes('auth') 
      ? value.substring(0, 20) + '...' 
      : value;
    console.log(`  ${key}: ${valorTruncado}`);
  });
  
  console.log('\n⚠️  HEADERS PROBLEMÁTICOS IDENTIFICADOS:');
  console.log('  ❌ Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
  console.log('     ^ Este header foi encontrado em testClienteAccess.ts');
  console.log('     ^ Supabase espera: application/json');
  
  console.log('\n🎯 POSSÍVEL CAUSA DO ERRO 406:');
  console.log('  1. O navegador pode estar enviando Accept header incorreto');
  console.log('  2. Algum interceptador pode estar modificando os headers');
  console.log('  3. Configuração específica do MacOS/Chrome pode estar interferindo');
}

// Executar testes
async function executarTodosOsTestes() {
  await testarRequisicaoProblematica();
  analisarHeadersEsperados();
  
  console.log('\n🏁 TESTE CONCLUÍDO');
  console.log('=' .repeat(60));
}

// Executar
executarTodosOsTestes().catch(console.error);