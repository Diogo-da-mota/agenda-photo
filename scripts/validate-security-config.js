#!/usr/bin/env node

/**
 * Script para verificar e corrigir configurações de segurança nas variáveis de ambiente
 * Valida configurações essenciais para segurança
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

// Configurações de segurança obrigatórias
const requiredSecurityConfig = {
  // Configurações de sessão
  SESSION_SECRET: {
    description: 'Chave secreta para sessões',
    generate: () => crypto.randomBytes(32).toString('hex'),
    validate: (value) => value && value.length >= 32
  },
  JWT_SECRET: {
    description: 'Chave secreta para JWT',
    generate: () => crypto.randomBytes(32).toString('hex'),
    validate: (value) => value && value.length >= 32
  },
  
  // Configurações de ambiente
  NODE_ENV: {
    description: 'Ambiente de execução',
    default: 'production',
    validate: (value) => ['development', 'production', 'test'].includes(value)
  },
  
  // Configurações de CORS
  ALLOWED_ORIGINS: {
    description: 'Domínios permitidos para CORS',
    default: 'https://bright-spark-welcome.vercel.app,https://agendaphoto.com.br',
    validate: (value) => value && value.includes('https://')
  },
  
  // Configurações de rate limiting
  RATE_LIMIT_WINDOW_MS: {
    description: 'Janela de tempo para rate limiting (ms)',
    default: '900000', // 15 minutos
    validate: (value) => !isNaN(value) && parseInt(value) > 0
  },
  RATE_LIMIT_MAX_REQUESTS: {
    description: 'Máximo de requisições por janela',
    default: '100',
    validate: (value) => !isNaN(value) && parseInt(value) > 0
  },
  
  // Configurações de cookies
  COOKIE_SECURE: {
    description: 'Usar cookies seguros (HTTPS)',
    default: 'true',
    validate: (value) => ['true', 'false'].includes(value)
  },
  COOKIE_SAME_SITE: {
    description: 'Política SameSite para cookies',
    default: 'strict',
    validate: (value) => ['strict', 'lax', 'none'].includes(value)
  },
  
  // Configurações de logging
  LOG_LEVEL: {
    description: 'Nível de log',
    default: 'info',
    validate: (value) => ['error', 'warn', 'info', 'debug'].includes(value)
  },
  SECURITY_LOG_ENABLED: {
    description: 'Habilitar logs de segurança',
    default: 'true',
    validate: (value) => ['true', 'false'].includes(value)
  }
};

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

function writeEnvFile(filePath, env) {
  const content = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(filePath, content + '\n');
}

function validateAndFixSecurityConfig() {
  console.log('🔒 Validando configurações de segurança...');
  
  // Ler arquivo .env atual
  const currentEnv = readEnvFile(envPath);
  let needsUpdate = false;
  const issues = [];
  
  // Verificar cada configuração obrigatória
  for (const [key, config] of Object.entries(requiredSecurityConfig)) {
    const currentValue = currentEnv[key];
    
    if (!currentValue) {
      // Gerar valor se não existir
      const newValue = config.generate ? config.generate() : config.default;
      currentEnv[key] = newValue;
      needsUpdate = true;
      issues.push(`✅ Adicionado: ${key} = ${config.description}`);
    } else if (!config.validate(currentValue)) {
      // Validar valor existente
      const newValue = config.generate ? config.generate() : config.default;
      currentEnv[key] = newValue;
      needsUpdate = true;
      issues.push(`🔧 Corrigido: ${key} = ${config.description}`);
    } else {
      issues.push(`✅ Válido: ${key}`);
    }
  }
  
  // Verificar configurações específicas do Supabase
  if (!currentEnv.SUPABASE_URL || !currentEnv.SUPABASE_ANON_KEY) {
    issues.push('⚠️  Configurações do Supabase não encontradas');
  } else {
    // Validar formato das URLs do Supabase
    if (!currentEnv.SUPABASE_URL.startsWith('https://')) {
      issues.push('🔧 SUPABASE_URL deve usar HTTPS');
    }
    if (currentEnv.SUPABASE_URL.includes('localhost')) {
      issues.push('⚠️  SUPABASE_URL aponta para localhost');
    }
  }
  
  // Atualizar arquivo .env se necessário
  if (needsUpdate) {
    writeEnvFile(envPath, currentEnv);
    console.log('📝 Arquivo .env atualizado com configurações de segurança');
  }
  
  // Atualizar env.example
  const exampleEnv = { ...currentEnv };
  // Remover valores sensíveis do example
  for (const key of ['SESSION_SECRET', 'JWT_SECRET', 'SUPABASE_SERVICE_KEY']) {
    if (exampleEnv[key]) {
      exampleEnv[key] = 'your-secret-key-here';
    }
  }
  writeEnvFile(envExamplePath, exampleEnv);
  
  // Relatório
  console.log('\n📋 Relatório de Configurações de Segurança:');
  issues.forEach(issue => console.log(`  ${issue}`));
  
  console.log('\n🔐 Configurações de Segurança Validadas:');
  console.log(`  - Chaves secretas: ${currentEnv.SESSION_SECRET ? '✅' : '❌'}`);
  console.log(`  - CORS configurado: ${currentEnv.ALLOWED_ORIGINS ? '✅' : '❌'}`);
  console.log(`  - Rate limiting: ${currentEnv.RATE_LIMIT_MAX_REQUESTS ? '✅' : '❌'}`);
  console.log(`  - Cookies seguros: ${currentEnv.COOKIE_SECURE === 'true' ? '✅' : '❌'}`);
  console.log(`  - Logs de segurança: ${currentEnv.SECURITY_LOG_ENABLED === 'true' ? '✅' : '❌'}`);
  
  return issues;
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAndFixSecurityConfig();
}

export default validateAndFixSecurityConfig;
