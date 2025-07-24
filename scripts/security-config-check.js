#!/usr/bin/env node

/**
 * Script de Verificação de Configurações de Segurança
 * Verifica configurações específicas de segurança da aplicação
 * Uso: node scripts/security-config-check.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 VERIFICAÇÃO DE CONFIGURAÇÕES DE SEGURANÇA\n');
console.log('='.repeat(50));

const checks = [];

// Função para adicionar resultado de check
function addCheck(category, name, status, description, recommendation = null) {
  checks.push({
    category,
    name,
    status, // 'pass', 'warn', 'fail'
    description,
    recommendation
  });
}

// 1. VERIFICAÇÃO DO VITE CONFIG
console.log('\n📦 VERIFICANDO VITE CONFIG');
console.log('-'.repeat(30));

const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Verificar headers de segurança
  const securityHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options', 
    'X-XSS-Protection',
    'Referrer-Policy',
    'Content-Security-Policy'
  ];
  
  securityHeaders.forEach(header => {
    if (viteConfig.includes(header)) {
      console.log(`   ✅ ${header} configurado`);
      addCheck('vite', header, 'pass', `Header ${header} encontrado na configuração`);
    } else {
      console.log(`   ❌ ${header} ausente`);
      addCheck('vite', header, 'fail', `Header ${header} não encontrado`, `Adicionar header ${header} ao vite.config.ts`);
    }
  });
  
  // Verificar se CSP é muito permissivo
  if (viteConfig.includes("'unsafe-inline'")) {
    console.log(`   ⚠️  CSP permite 'unsafe-inline'`);
    addCheck('vite', 'CSP-unsafe-inline', 'warn', "CSP permite 'unsafe-inline'", "Considerar remover 'unsafe-inline' para maior segurança");
  } else {
    console.log(`   ✅ CSP não permite 'unsafe-inline'`);
    addCheck('vite', 'CSP-unsafe-inline', 'pass', "CSP não permite 'unsafe-inline'");
  }
  
  // Verificar configuração de build
  if (viteConfig.includes('sourcemap: false')) {
    console.log(`   ✅ Sourcemaps desabilitados em produção`);
    addCheck('vite', 'sourcemap', 'pass', 'Sourcemaps desabilitados para produção');
  } else {
    console.log(`   ⚠️  Sourcemaps podem estar habilitados`);
    addCheck('vite', 'sourcemap', 'warn', 'Verificar se sourcemaps estão desabilitados em produção', 'Configurar sourcemap: false para produção');
  }
  
} else {
  console.log('   ❌ vite.config.ts não encontrado');
  addCheck('vite', 'config-file', 'fail', 'Arquivo vite.config.ts não encontrado', 'Criar arquivo de configuração do Vite');
}

// 2. VERIFICAÇÃO DO SERVER CONFIG
console.log('\n🖥️  VERIFICANDO SERVER CONFIG');
console.log('-'.repeat(30));

const serverConfigPath = path.join(process.cwd(), 'server/index.js');
if (fs.existsSync(serverConfigPath)) {
  const serverConfig = fs.readFileSync(serverConfigPath, 'utf8');
  
  // Verificar middlewares de segurança
  const securityMiddlewares = [
    { name: 'helmet', pattern: /helmet\(/ },
    { name: 'cors', pattern: /cors\(/ },
    { name: 'csurf', pattern: /(csurf\(|csrf\(|csrf\.)/},
    { name: 'rate-limit', pattern: /(rateLimit|express-rate-limit)/ },
    { name: 'cookie-parser', pattern: /cookieParser\(\)/ }
  ];
  
  securityMiddlewares.forEach(middleware => {
    if (middleware.pattern.test(serverConfig)) {
      console.log(`   ✅ ${middleware.name} configurado`);
      addCheck('server', middleware.name, 'pass', `Middleware ${middleware.name} encontrado`);
    } else {
      console.log(`   ❌ ${middleware.name} ausente`);
      addCheck('server', middleware.name, 'fail', `Middleware ${middleware.name} não encontrado`, `Adicionar middleware ${middleware.name}`);
    }
  });
  
  // Verificar configuração de cookies
  if (serverConfig.includes('httpOnly: true')) {
    console.log(`   ✅ Cookies HttpOnly configurados`);
    addCheck('server', 'httpOnly-cookies', 'pass', 'Cookies HttpOnly configurados');
  } else {
    console.log(`   ❌ Cookies HttpOnly não configurados`);
    addCheck('server', 'httpOnly-cookies', 'fail', 'Cookies HttpOnly não configurados', 'Configurar httpOnly: true para cookies');
  }
  
  if (serverConfig.includes('secure: true') || serverConfig.includes('NODE_ENV === "production"')) {
    console.log(`   ✅ Cookies seguros para produção`);
    addCheck('server', 'secure-cookies', 'pass', 'Cookies seguros configurados para produção');
  } else {
    console.log(`   ⚠️  Verificar configuração de cookies seguros`);
    addCheck('server', 'secure-cookies', 'warn', 'Verificar se cookies secure estão configurados para produção', 'Configurar secure: true para cookies em produção');
  }
  
  // Verificar limite de payload
  if (serverConfig.includes('limit:')) {
    console.log(`   ✅ Limite de payload configurado`);
    addCheck('server', 'payload-limit', 'pass', 'Limite de payload configurado');
  } else {
    console.log(`   ⚠️  Limite de payload não encontrado`);
    addCheck('server', 'payload-limit', 'warn', 'Limite de payload não configurado', 'Configurar limite de payload para prevenir ataques DoS');
  }
  
} else {
  console.log('   ❌ server/index.js não encontrado');
  addCheck('server', 'config-file', 'fail', 'Arquivo server/index.js não encontrado', 'Verificar se servidor está configurado');
}

// 3. VERIFICAÇÃO DO PACKAGE.JSON
console.log('\n📋 VERIFICANDO PACKAGE.JSON');
console.log('-'.repeat(30));

const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Verificar dependências de segurança
  const securityDeps = [
    'helmet',
    'cors', 
    'csurf',
    'express-rate-limit',
    'cookie-parser',
    'dompurify'
  ];
  
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  securityDeps.forEach(dep => {
    if (allDeps[dep]) {
      console.log(`   ✅ ${dep} instalado (${allDeps[dep]})`);
      addCheck('dependencies', dep, 'pass', `Dependência de segurança ${dep} instalada`);
    } else {
      console.log(`   ❌ ${dep} não encontrado`);
      addCheck('dependencies', dep, 'fail', `Dependência de segurança ${dep} não encontrada`, `Instalar ${dep} para melhorar segurança`);
    }
  });
  
  // Verificar scripts de segurança
  const securityScripts = [
    'audit',
    'security:audit',
    'lighthouse'
  ];
  
  if (packageJson.scripts) {
    securityScripts.forEach(script => {
      const hasScript = Object.keys(packageJson.scripts).some(key => 
        key.includes(script) || packageJson.scripts[key].includes(script)
      );
      
      if (hasScript) {
        console.log(`   ✅ Script relacionado a ${script} encontrado`);
        addCheck('scripts', script, 'pass', `Script de segurança relacionado a ${script} encontrado`);
      } else {
        console.log(`   ⚠️  Script ${script} não encontrado`);
        addCheck('scripts', script, 'warn', `Script ${script} não encontrado`, `Adicionar script ${script} para automação de segurança`);
      }
    });
  }
  
} else {
  console.log('   ❌ package.json não encontrado');
  addCheck('package', 'config-file', 'fail', 'Arquivo package.json não encontrado', 'Verificar estrutura do projeto');
}

// 4. VERIFICAÇÃO DE ARQUIVOS ENV
console.log('\n🔐 VERIFICANDO CONFIGURAÇÃO DE AMBIENTE');
console.log('-'.repeat(30));

const envExamplePath = path.join(process.cwd(), 'env.example');
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envExamplePath)) {
  console.log(`   ✅ env.example encontrado`);
  addCheck('env', 'example-file', 'pass', 'Arquivo env.example presente para referência');
} else {
  console.log(`   ⚠️  env.example não encontrado`);
  addCheck('env', 'example-file', 'warn', 'Arquivo env.example não encontrado', 'Criar env.example com variáveis necessárias');
}

if (fs.existsSync(envPath)) {
  console.log(`   ⚠️  .env encontrado (verificar se não está no git)`);
  addCheck('env', 'env-file', 'warn', 'Arquivo .env presente - verificar gitignore', 'Garantir que .env está no .gitignore');
  
  // Verificar se contém variáveis críticas
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    console.log(`   ⚠️  Service role key encontrada no .env`);
    addCheck('env', 'service-key', 'warn', 'Service role key no arquivo .env', 'Usar apenas em servidor, nunca no cliente');
  }
} else {
  console.log(`   ✅ .env não encontrado no repositório`);
  addCheck('env', 'env-file', 'pass', 'Arquivo .env não presente no repositório');
}

// 5. VERIFICAÇÃO DE GITIGNORE
console.log('\n📁 VERIFICANDO GITIGNORE');
console.log('-'.repeat(30));

const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  
  const criticalPatterns = [
    '.env',
    'node_modules',
    'dist',
    '*.log'
  ];
  
  criticalPatterns.forEach(pattern => {
    if (gitignoreContent.includes(pattern)) {
      console.log(`   ✅ ${pattern} está no .gitignore`);
      addCheck('gitignore', pattern, 'pass', `Padrão ${pattern} presente no .gitignore`);
    } else {
      console.log(`   ❌ ${pattern} ausente do .gitignore`);
      addCheck('gitignore', pattern, 'fail', `Padrão ${pattern} ausente do .gitignore`, `Adicionar ${pattern} ao .gitignore`);
    }
  });
} else {
  console.log('   ❌ .gitignore não encontrado');
  addCheck('gitignore', 'file', 'fail', 'Arquivo .gitignore não encontrado', 'Criar arquivo .gitignore');
}

// 6. RELATÓRIO FINAL
console.log('\n' + '='.repeat(50));
console.log('📊 RELATÓRIO DE CONFIGURAÇÃO');
console.log('='.repeat(50));

const passed = checks.filter(c => c.status === 'pass').length;
const warnings = checks.filter(c => c.status === 'warn').length;
const failed = checks.filter(c => c.status === 'fail').length;
const total = checks.length;

console.log(`\n📈 RESUMO:`);
console.log(`   ✅ Aprovados: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
console.log(`   ⚠️  Avisos: ${warnings}/${total} (${Math.round(warnings/total*100)}%)`);
console.log(`   ❌ Falharam: ${failed}/${total} (${Math.round(failed/total*100)}%)`);

// Score de configuração
const configScore = Math.round((passed / total) * 100);
console.log(`\n🎯 SCORE DE CONFIGURAÇÃO: ${configScore}/100`);

if (configScore >= 90) {
  console.log('   🟢 EXCELENTE - Configuração muito segura');
} else if (configScore >= 75) {
  console.log('   🟡 BOM - Algumas melhorias recomendadas');
} else if (configScore >= 50) {
  console.log('   🟠 MÉDIO - Várias configurações precisam ser ajustadas');
} else {
  console.log('   🔴 BAIXO - Muitas configurações críticas ausentes');
}

// Mostrar problemas por categoria
const categories = [...new Set(checks.map(c => c.category))];

categories.forEach(category => {
  const categoryChecks = checks.filter(c => c.category === category);
  const categoryFailed = categoryChecks.filter(c => c.status === 'fail');
  const categoryWarnings = categoryChecks.filter(c => c.status === 'warn');
  
  if (categoryFailed.length > 0 || categoryWarnings.length > 0) {
    console.log(`\n📂 ${category.toUpperCase()}:`);
    
    categoryFailed.forEach(check => {
      console.log(`   ❌ ${check.name}: ${check.description}`);
      if (check.recommendation) {
        console.log(`      → ${check.recommendation}`);
      }
    });
    
    categoryWarnings.forEach(check => {
      console.log(`   ⚠️  ${check.name}: ${check.description}`);
      if (check.recommendation) {
        console.log(`      → ${check.recommendation}`);
      }
    });
  }
});

// Salvar relatório
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(process.cwd(), `security-config-${timestamp}.json`);

const report = {
  timestamp: new Date().toISOString(),
  score: configScore,
  summary: { passed, warnings, failed, total },
  checks
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n💾 Relatório salvo em: ${reportPath}`);

console.log('\n💡 PRÓXIMOS PASSOS:');
if (failed === 0 && warnings === 0) {
  console.log('   ✅ Excelente! Todas as configurações estão corretas.');
} else {
  console.log('   1. Corrigir configurações que falharam');
  console.log('   2. Revisar avisos e implementar melhorias');
  console.log('   3. Executar este script novamente para verificar');
}

console.log('\n='.repeat(50));
console.log('🔧 VERIFICAÇÃO CONCLUÍDA');
console.log('='.repeat(50));

// Exit code baseado no resultado
if (failed > 0) {
  process.exit(1);
} else if (warnings > 0) {
  process.exit(0); // Warnings não causam falha
} else {
  process.exit(0);
}
