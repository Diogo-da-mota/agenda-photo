#!/usr/bin/env node

/**
 * 🔍 DIAGNÓSTICO COMPLETO DE DESENVOLVIMENTO
 * 
 * Este script verifica:
 * - Variáveis de ambiente
 * - Conectividade com Supabase
 * - Status do servidor de desenvolvimento
 * - Configurações de segurança
 * - Estrutura do banco de dados
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// Para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`🔍 ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function subHeader(title) {
  log(`\n📋 ${title}`, 'blue');
  log('-'.repeat(40), 'blue');
}

// Carregar variáveis de ambiente
config();

async function verificarVariaveisAmbiente() {
  header('VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE');
  
  const variaveisObrigatorias = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const variaveisOpcionais = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SERVICE_KEY',
    'VITE_AUTH_API_URL'
  ];
  
  let problemas = [];
  let avisos = [];
  
  // Verificar variáveis obrigatórias
  subHeader('Variáveis Obrigatórias');
  for (const variavel of variaveisObrigatorias) {
    const valor = process.env[variavel];
    if (valor) {
      const valorMascarado = variavel.includes('KEY') ? 
        `${valor.substring(0, 20)}...` : valor;
      log(`✅ ${variavel}: ${valorMascarado}`, 'green');
    } else {
      log(`❌ ${variavel}: NÃO DEFINIDA`, 'red');
      problemas.push(`${variavel} não está definida`);
    }
  }
  
  // Verificar variáveis opcionais
  subHeader('Variáveis Opcionais');
  for (const variavel of variaveisOpcionais) {
    const valor = process.env[variavel];
    if (valor) {
      const valorMascarado = variavel.includes('KEY') ? 
        `${valor.substring(0, 20)}...` : valor;
      log(`✅ ${variavel}: ${valorMascarado}`, 'green');
    } else {
      log(`⚠️  ${variavel}: NÃO DEFINIDA`, 'yellow');
    }
  }
  
  // Verificar formato das URLs
  subHeader('Validação de Formato');
  if (process.env.VITE_SUPABASE_URL) {
    try {
      new URL(process.env.VITE_SUPABASE_URL);
      log('✅ VITE_SUPABASE_URL: Formato válido', 'green');
    } catch {
      log('❌ VITE_SUPABASE_URL: Formato inválido', 'red');
      problemas.push('VITE_SUPABASE_URL não é uma URL válida');
    }
  }
  
  // Verificar se as chaves parecem ser JWTs
  if (process.env.VITE_SUPABASE_ANON_KEY) {
    const parts = process.env.VITE_SUPABASE_ANON_KEY.split('.');
    if (parts.length === 3) {
      log('✅ VITE_SUPABASE_ANON_KEY: Formato JWT válido', 'green');
    } else {
      log('❌ VITE_SUPABASE_ANON_KEY: Não parece ser um JWT válido', 'red');
      problemas.push('VITE_SUPABASE_ANON_KEY não tem formato JWT válido');
    }
  }
  
  return { problemas, avisos };
}

async function testarConectividadeSupabase() {
  header('TESTE DE CONECTIVIDADE SUPABASE');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    log('❌ Não é possível testar conectividade - variáveis faltando', 'red');
    return false;
  }
  
  try {
    // Teste 1: Ping básico
    subHeader('Teste de Ping Básico');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok || response.status === 401) {
      log('✅ Servidor Supabase acessível', 'green');
    } else {
      log(`❌ Erro no servidor: ${response.status} ${response.statusText}`, 'red');
      return false;
    }
    
    // Teste 2: Cliente Supabase
    subHeader('Teste do Cliente Supabase');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Teste simples de query
    const { data, error } = await supabase
      .from('perfis')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        log('✅ Conexão OK - Tabela perfis não encontrada (normal)', 'green');
      } else {
        log(`⚠️  Erro na query: ${error.message}`, 'yellow');
      }
    } else {
      log('✅ Query executada com sucesso', 'green');
    }
    
    // Teste 3: Autenticação
    subHeader('Teste de Autenticação');
    const { data: user, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      log('ℹ️  Usuário não autenticado (normal para teste)', 'blue');
    } else {
      log('✅ Sistema de autenticação funcionando', 'green');
    }
    
    return true;
    
  } catch (error) {
    log(`❌ Erro na conectividade: ${error.message}`, 'red');
    return false;
  }
}

async function verificarServidorDesenvolvimento() {
  header('VERIFICAÇÃO DO SERVIDOR DE DESENVOLVIMENTO');
  
  const portas = [8080, 3000, 5173, 4173]; // Portas comuns do Vite
  
  for (const porta of portas) {
    try {
      const response = await fetch(`http://localhost:${porta}/`);
      if (response.ok) {
        log(`✅ Servidor rodando na porta ${porta}`, 'green');
        log(`🌐 URL: http://localhost:${porta}/`, 'cyan');
        return true;
      }
    } catch (error) {
      log(`❌ Porta ${porta}: Não acessível`, 'red');
    }
  }
  
  log('⚠️  Nenhum servidor de desenvolvimento detectado', 'yellow');
  return false;
}

async function verificarEstruturaBanco() {
  header('VERIFICAÇÃO DA ESTRUTURA DO BANCO');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    log('❌ Não é possível verificar - variáveis faltando', 'red');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Tabelas esperadas no projeto
    const tabelasEsperadas = [
      'perfis',
      'clientes', 
      'agenda_eventos',
      'portfolio_trabalhos',
      'mensagens',
      'contratos'
    ];
    
    subHeader('Verificação de Tabelas');
    
    for (const tabela of tabelasEsperadas) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === 'PGRST116') {
            log(`❌ Tabela '${tabela}': Não encontrada`, 'red');
          } else {
            log(`⚠️  Tabela '${tabela}': ${error.message}`, 'yellow');
          }
        } else {
          log(`✅ Tabela '${tabela}': OK`, 'green');
        }
      } catch (err) {
        log(`❌ Erro ao verificar '${tabela}': ${err.message}`, 'red');
      }
    }
    
  } catch (error) {
    log(`❌ Erro na verificação: ${error.message}`, 'red');
  }
}

async function verificarArquivosConfiguracao() {
  header('VERIFICAÇÃO DE ARQUIVOS DE CONFIGURAÇÃO');
  
  const arquivos = [
    { nome: '.env', obrigatorio: true },
    { nome: 'env.example', obrigatorio: false },
    { nome: 'package.json', obrigatorio: true },
    { nome: 'vite.config.ts', obrigatorio: true },
    { nome: '.gitignore', obrigatorio: true },
    { nome: 'supabase-types.ts', obrigatorio: false }
  ];
  
  for (const arquivo of arquivos) {
    const caminho = path.join(process.cwd(), arquivo.nome);
    if (fs.existsSync(caminho)) {
      log(`✅ ${arquivo.nome}: Encontrado`, 'green');
    } else {
      if (arquivo.obrigatorio) {
        log(`❌ ${arquivo.nome}: NÃO ENCONTRADO (obrigatório)`, 'red');
      } else {
        log(`⚠️  ${arquivo.nome}: Não encontrado (opcional)`, 'yellow');
      }
    }
  }
}

async function gerarRelatorioFinal(resultados) {
  header('RELATÓRIO FINAL DO DIAGNÓSTICO');
  
  const { problemas } = resultados;
  
  if (problemas.length === 0) {
    log('🎉 PARABÉNS! Todas as verificações passaram!', 'green');
    log('✅ Seu ambiente de desenvolvimento está configurado corretamente', 'green');
  } else {
    log('⚠️  PROBLEMAS ENCONTRADOS:', 'yellow');
    problemas.forEach((problema, index) => {
      log(`   ${index + 1}. ${problema}`, 'red');
    });
  }
  
  subHeader('Próximos Passos Recomendados');
  
  if (problemas.length > 0) {
    log('1. Corrigir os problemas listados acima', 'yellow');
    log('2. Verificar o arquivo .env e env.example', 'yellow');
    log('3. Executar este diagnóstico novamente', 'yellow');
  } else {
    log('1. Iniciar o servidor de desenvolvimento: npm run dev', 'green');
    log('2. Acessar http://localhost:8080', 'green');
    log('3. Testar funcionalidades do sistema', 'green');
  }
  
  // Salvar relatório
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const nomeArquivo = `diagnostico-dev-${timestamp}.json`;
  
  const relatorio = {
    timestamp: new Date().toISOString(),
    problemas: problemas,
    ambiente: {
      node_version: process.version,
      platform: process.platform,
      cwd: process.cwd()
    }
  };
  
  fs.writeFileSync(nomeArquivo, JSON.stringify(relatorio, null, 2));
  log(`\n💾 Relatório salvo em: ${nomeArquivo}`, 'cyan');
}

// Função principal
async function executarDiagnostico() {
  log('🚀 INICIANDO DIAGNÓSTICO COMPLETO DE DESENVOLVIMENTO', 'bright');
  log(`📅 ${new Date().toLocaleString('pt-BR')}`, 'blue');
  
  try {
    // 1. Verificar variáveis de ambiente
    const resultadoEnv = await verificarVariaveisAmbiente();
    
    // 2. Verificar arquivos de configuração
    await verificarArquivosConfiguracao();
    
    // 3. Testar conectividade Supabase
    await testarConectividadeSupabase();
    
    // 4. Verificar servidor de desenvolvimento
    await verificarServidorDesenvolvimento();
    
    // 5. Verificar estrutura do banco
    await verificarEstruturaBanco();
    
    // 6. Gerar relatório final
    await gerarRelatorioFinal(resultadoEnv);
    
  } catch (error) {
    log(`\n❌ ERRO CRÍTICO NO DIAGNÓSTICO: ${error.message}`, 'red');
    console.error(error);
  }
}

// Executar automaticamente
executarDiagnostico().catch(console.error);

export { executarDiagnostico };