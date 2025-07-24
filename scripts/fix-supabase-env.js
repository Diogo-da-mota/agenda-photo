#!/usr/bin/env node

/**
 * 🔧 Script de Correção Automática do Ambiente Supabase
 * 
 * Este script resolve definitivamente problemas de variáveis de ambiente
 * do Supabase, garantindo que a aplicação funcione corretamente.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output no terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bold');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Configurações do Supabase (do arquivo .env atual)
const SUPABASE_CONFIG = {
  url: 'https://adxwgpfkvizpqdvortpu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o'
};

// Caminhos dos arquivos
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(PROJECT_ROOT, '.env');
const ENV_LOCAL_FILE = path.join(PROJECT_ROOT, '.env.local');
const ENV_EXAMPLE_FILE = path.join(PROJECT_ROOT, 'env.example');
const VITE_CACHE_DIR = path.join(PROJECT_ROOT, 'node_modules', '.vite');

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function readEnvFile(filePath) {
  if (!checkFileExists(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

function writeEnvFile(filePath, envVars) {
  const lines = [
    '# Configurações do Supabase',
    `VITE_SUPABASE_URL=${envVars.VITE_SUPABASE_URL}`,
    `VITE_SUPABASE_ANON_KEY=${envVars.VITE_SUPABASE_ANON_KEY}`,
    '',
    '# Configurações de Servidor (para backend e scripts)',
    `SUPABASE_URL=${envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL}`,
    `SUPABASE_SERVICE_ROLE_KEY=${envVars.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI4NTk5OSwiZXhwIjoyMDYzODYxOTk5fQ.example_service_key_here'}`,
    `SUPABASE_SERVICE_KEY=${envVars.SUPABASE_SERVICE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI4NTk5OSwiZXhwIjoyMDYzODYxOTk5fQ.example_service_key_here'}`,
    '',
    '# Configurações de Autenticação (opcional)',
    `VITE_AUTH_API_URL=${envVars.VITE_AUTH_API_URL || ''}`,
    '',
    '# ATENÇÃO: Nunca adicione chaves privadas aqui!',
    '# VITE_SUPABASE_SERVICE_KEY=nao-armazenar-no-cliente'
  ];
  
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
}

function clearViteCache() {
  if (checkFileExists(VITE_CACHE_DIR)) {
    try {
      fs.rmSync(VITE_CACHE_DIR, { recursive: true, force: true });
      logSuccess('Cache do Vite limpo com sucesso');
    } catch (error) {
      logWarning(`Não foi possível limpar o cache do Vite: ${error.message}`);
    }
  }
}

function validateJWT(token) {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3;
}

function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function main() {
  logHeader('🔧 CORREÇÃO AUTOMÁTICA DO AMBIENTE SUPABASE');
  
  logInfo('Verificando arquivos de ambiente...');
  
  // 1. Verificar arquivos existentes
  const envExists = checkFileExists(ENV_FILE);
  const envLocalExists = checkFileExists(ENV_LOCAL_FILE);
  const envExampleExists = checkFileExists(ENV_EXAMPLE_FILE);
  
  logInfo(`Arquivo .env: ${envExists ? '✅ Existe' : '❌ Não existe'}`);
  logInfo(`Arquivo .env.local: ${envLocalExists ? '✅ Existe' : '❌ Não existe'}`);
  logInfo(`Arquivo env.example: ${envExampleExists ? '✅ Existe' : '❌ Não existe'}`);
  
  // 2. Ler configurações existentes
  let currentEnv = {};
  if (envExists) {
    currentEnv = { ...currentEnv, ...readEnvFile(ENV_FILE) };
  }
  if (envLocalExists) {
    currentEnv = { ...currentEnv, ...readEnvFile(ENV_LOCAL_FILE) };
  }
  
  logInfo('\nVariáveis encontradas:');
  Object.keys(currentEnv).forEach(key => {
    if (key.includes('SUPABASE')) {
      const value = currentEnv[key];
      const displayValue = value ? `${value.substring(0, 20)}...` : 'VAZIO';
      logInfo(`  ${key}: ${displayValue}`);
    }
  });
  
  // 3. Verificar se as variáveis essenciais existem
  const hasUrl = currentEnv.VITE_SUPABASE_URL && validateURL(currentEnv.VITE_SUPABASE_URL);
  const hasKey = currentEnv.VITE_SUPABASE_ANON_KEY && validateJWT(currentEnv.VITE_SUPABASE_ANON_KEY);
  
  logInfo('\nValidação das variáveis:');
  logInfo(`  VITE_SUPABASE_URL: ${hasUrl ? '✅ Válida' : '❌ Inválida ou ausente'}`);
  logInfo(`  VITE_SUPABASE_ANON_KEY: ${hasKey ? '✅ Válida' : '❌ Inválida ou ausente'}`);
  
  // 4. Corrigir se necessário
  let needsCorrection = !hasUrl || !hasKey;
  
  if (needsCorrection) {
    logWarning('\nProblemas detectados! Aplicando correções...');
    
    // Usar configurações conhecidas como fallback
    const correctedEnv = {
      ...currentEnv,
      VITE_SUPABASE_URL: currentEnv.VITE_SUPABASE_URL || SUPABASE_CONFIG.url,
      VITE_SUPABASE_ANON_KEY: currentEnv.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey
    };
    
    // Escrever arquivo .env corrigido
    writeEnvFile(ENV_FILE, correctedEnv);
    logSuccess('Arquivo .env corrigido e atualizado');
    
    // Criar .env.local se não existir
    if (!envLocalExists) {
      writeEnvFile(ENV_LOCAL_FILE, correctedEnv);
      logSuccess('Arquivo .env.local criado');
    }
  } else {
    logSuccess('\nTodas as variáveis estão corretas!');
  }
  
  // 5. Limpar cache do Vite
  logInfo('\nLimpando cache do Vite...');
  clearViteCache();
  
  // 6. Instruções finais
  logHeader('✅ CORREÇÃO CONCLUÍDA');
  
  if (needsCorrection) {
    logSuccess('Problemas corrigidos com sucesso!');
    logInfo('\nPróximos passos:');
    logInfo('1. Reinicie o servidor de desenvolvimento: npm run dev');
    logInfo('2. Se o problema persistir, execute: npm run build');
    logInfo('3. Verifique o console do navegador para logs de diagnóstico');
  } else {
    logSuccess('Ambiente já estava configurado corretamente!');
  }
  
  logInfo('\nSe o problema persistir, verifique:');
  logInfo('• Se o servidor Supabase está online');
  logInfo('• Se as credenciais não expiraram');
  logInfo('• Se não há problemas de rede/firewall');
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// Executar script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as fixSupabaseEnv };