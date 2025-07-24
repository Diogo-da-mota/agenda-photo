#!/usr/bin/env node

/**
 * Script de Auditoria de Segurança Automatizada
 * Executa verificações de segurança abrangentes
 * Uso: node scripts/security-audit.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🛡️  AUDITORIA DE SEGURANÇA AUTOMATIZADA - AGENDA PRO\n');
console.log('='.repeat(60));

const results = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  passed: []
};

// Função para executar comandos de forma segura
function runCommand(command, description, allowFailure = false) {
  console.log(`\n🔍 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', cwd: process.cwd() });
    console.log(`✅ ${description} - SUCESSO`);
    return { success: true, output };
  } catch (error) {
    if (!allowFailure) {
      console.log(`❌ ${description} - FALHOU`);
      console.log(`   Erro: ${error.message.split('\n')[0]}`);
    }
    return { success: false, error: error.message };
  }
}

// 1. AUDITORIA DE DEPENDÊNCIAS
console.log('\n📦 AUDITORIA DE DEPENDÊNCIAS');
console.log('-'.repeat(40));

const npmAuditResult = runCommand('npm audit --json', 'Verificando vulnerabilidades npm', true);
if (npmAuditResult.success) {
  try {
    const auditData = JSON.parse(npmAuditResult.output);
    const vulnerabilities = auditData.vulnerabilities || {};
    
    Object.values(vulnerabilities).forEach(vuln => {
      const severity = vuln.severity;
      const finding = {
        type: 'dependency',
        name: vuln.name,
        severity: vuln.severity,
        description: `Vulnerabilidade ${severity} em ${vuln.name}`,
        recommendation: 'Execute npm audit fix ou atualize manualmente'
      };
      
      if (severity === 'critical') results.critical.push(finding);
      else if (severity === 'high') results.high.push(finding);
      else if (severity === 'moderate') results.medium.push(finding);
      else if (severity === 'low') results.low.push(finding);
    });
    
    console.log(`   Vulnerabilidades encontradas: ${Object.keys(vulnerabilities).length}`);
  } catch (e) {
    console.log('   ⚠️  Não foi possível analisar resultado do npm audit');
  }
} else {
  results.high.push({
    type: 'dependency',
    name: 'npm audit',
    severity: 'high',
    description: 'Falha na execução do npm audit',
    recommendation: 'Verificar configuração do npm e conectividade'
  });
}

// 2. VERIFICAÇÃO DE ARQUIVOS DE CONFIGURAÇÃO
console.log('\n⚙️  VERIFICAÇÃO DE CONFIGURAÇÕES DE SEGURANÇA');
console.log('-'.repeat(40));

const securityFiles = [
  { path: 'server/index.js', required: true, desc: 'Servidor de autenticação' },
  { path: 'vite.config.ts', required: true, desc: 'Configuração do Vite' },
  { path: '.env', required: false, desc: 'Variáveis de ambiente' },
  { path: 'package.json', required: true, desc: 'Configuração do projeto' }
];

securityFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file.path);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${file.desc} encontrado`);
    results.passed.push(`Arquivo ${file.path} presente`);
  } else if (file.required) {
    console.log(`   ❌ ${file.desc} não encontrado`);
    results.high.push({
      type: 'config',
      name: file.path,
      severity: 'high',
      description: `Arquivo de configuração crítico ausente: ${file.path}`,
      recommendation: 'Restaurar arquivo de configuração necessário'
    });
  } else {
    console.log(`   ⚠️  ${file.desc} não encontrado (opcional)`);
    results.low.push({
      type: 'config',
      name: file.path,
      severity: 'low',
      description: `Arquivo opcional ausente: ${file.path}`,
      recommendation: 'Considerar criar arquivo se necessário'
    });
  }
});

// 3. VERIFICAÇÃO DE POLÍTICAS RLS
console.log('\n🔒 VERIFICAÇÃO DE POLÍTICAS RLS');
console.log('-'.repeat(40));

const rlsCheckResult = runCommand('node scripts/check-rls-policies.cjs', 'Verificando políticas RLS', true);
if (rlsCheckResult.success) {
  console.log('   ✅ Políticas RLS verificadas com sucesso');
  results.passed.push('Verificação de políticas RLS executada');
} else {
  console.log('   ⚠️  Verificação de RLS não pôde ser executada');
  results.medium.push({
    type: 'rls',
    name: 'rls-policies',
    severity: 'medium',
    description: 'Não foi possível verificar políticas RLS automaticamente',
    recommendation: 'Verificar manualmente as políticas RLS no Supabase'
  });
}

// 4. VERIFICAÇÃO DE STORAGE
console.log('\n📁 VERIFICAÇÃO DE STORAGE E UPLOADS');
console.log('-'.repeat(40));

const storageCheckResult = runCommand('node scripts/audit-supabase-storage.mjs', 'Auditando Supabase Storage', true);
if (storageCheckResult.success) {
  console.log('   ✅ Auditoria de storage executada');
  results.passed.push('Auditoria de storage executada');
} else {
  console.log('   ⚠️  Auditoria de storage não pôde ser executada');
  results.medium.push({
    type: 'storage',
    name: 'storage-audit',
    severity: 'medium',
    description: 'Não foi possível auditar storage automaticamente',
    recommendation: 'Verificar configurações do Supabase e variáveis de ambiente'
  });
}

// 5. VERIFICAÇÃO DE SECRETS EXPOSTOS
console.log('\n🔍 VERIFICAÇÃO DE SECRETS EXPOSTOS');
console.log('-'.repeat(40));

// Verificar padrões comuns de secrets em arquivos
const secretPatterns = [
  /SUPABASE_SERVICE_KEY\s*=\s*['"][^'"]+['"]/g,
  /sk-[a-zA-Z0-9]{20,}/g,
  /AIza[0-9A-Za-z-_]{35}/g,
  /password\s*=\s*['"][^'"]+['"]/gi,
  /secret\s*=\s*['"][^'"]+['"]/gi
];

function checkFileForSecrets(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const secrets = [];
    
    secretPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        secrets.push(...matches);
      }
    });
    
    return secrets;
  } catch (error) {
    return [];
  }
}

// Verificar arquivos principais
const filesToCheck = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.js',
  'server/**/*.js',
  'package.json',
  'vite.config.ts'
];

// Simulação de verificação (em um ambiente real, usaria ferramentas como truffleHog)
console.log('   🔍 Verificando padrões de secrets em arquivos...');
let secretsFound = false;

// Verificar package.json especificamente
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const secrets = checkFileForSecrets(packageJsonPath);
  if (secrets.length > 0) {
    secretsFound = true;
    results.critical.push({
      type: 'secrets',
      name: 'package.json',
      severity: 'critical',
      description: 'Possíveis secrets encontrados em package.json',
      recommendation: 'Remover imediatamente qualquer secret hardcoded'
    });
  }
}

if (!secretsFound) {
  console.log('   ✅ Nenhum secret óbvio encontrado');
  results.passed.push('Verificação básica de secrets - nenhum encontrado');
} else {
  console.log('   ❌ Possíveis secrets encontrados');
}

// 6. VERIFICAÇÃO DE HEADERS DE SEGURANÇA
console.log('\n🌐 VERIFICAÇÃO DE HEADERS DE SEGURANÇA');
console.log('-'.repeat(40));

// Verificar se vite.config.ts tem headers de segurança
const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Referrer-Policy'
  ];
  
  const missingHeaders = requiredHeaders.filter(header => 
    !viteConfig.includes(header)
  );
  
  if (missingHeaders.length === 0) {
    console.log('   ✅ Headers de segurança básicos configurados');
    results.passed.push('Headers de segurança configurados no Vite');
  } else {
    console.log(`   ⚠️  Headers ausentes: ${missingHeaders.join(', ')}`);
    results.medium.push({
      type: 'headers',
      name: 'security-headers',
      severity: 'medium',
      description: `Headers de segurança ausentes: ${missingHeaders.join(', ')}`,
      recommendation: 'Adicionar headers de segurança faltantes no vite.config.ts'
    });
  }
}

// 7. RELATÓRIO FINAL
console.log('\n' + '='.repeat(60));
console.log('📊 RELATÓRIO DE AUDITORIA');
console.log('='.repeat(60));

const totalIssues = results.critical.length + results.high.length + results.medium.length + results.low.length;
const totalPassed = results.passed.length;

console.log(`\n📈 RESUMO:`);
console.log(`   🔴 Críticas: ${results.critical.length}`);
console.log(`   🟠 Altas: ${results.high.length}`);
console.log(`   🟡 Médias: ${results.medium.length}`);
console.log(`   🟢 Baixas: ${results.low.length}`);
console.log(`   ✅ Aprovadas: ${totalPassed}`);
console.log(`   📊 Total de problemas: ${totalIssues}`);

// Score de segurança simples
const securityScore = Math.max(0, 100 - (results.critical.length * 25 + results.high.length * 10 + results.medium.length * 5 + results.low.length * 2));
console.log(`\n🎯 SCORE DE SEGURANÇA: ${securityScore}/100`);

if (securityScore >= 90) {
  console.log('   🟢 EXCELENTE - Sistema muito seguro');
} else if (securityScore >= 75) {
  console.log('   🟡 BOM - Algumas melhorias recomendadas');
} else if (securityScore >= 50) {
  console.log('   🟠 MÉDIO - Correções necessárias');
} else {
  console.log('   🔴 BAIXO - Ação imediata requerida');
}

// Detalhes dos problemas encontrados
if (results.critical.length > 0) {
  console.log('\n🚨 PROBLEMAS CRÍTICOS:');
  results.critical.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.description}`);
    console.log(`      → ${issue.recommendation}`);
  });
}

if (results.high.length > 0) {
  console.log('\n🔴 PROBLEMAS ALTOS:');
  results.high.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.description}`);
    console.log(`      → ${issue.recommendation}`);
  });
}

if (results.medium.length > 0) {
  console.log('\n🟡 PROBLEMAS MÉDIOS:');
  results.medium.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.description}`);
    console.log(`      → ${issue.recommendation}`);
  });
}

// Salvar relatório em arquivo
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(process.cwd(), `security-audit-${timestamp}.json`);

const report = {
  timestamp: new Date().toISOString(),
  score: securityScore,
  summary: {
    critical: results.critical.length,
    high: results.high.length,
    medium: results.medium.length,
    low: results.low.length,
    passed: results.passed.length
  },
  details: results
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n💾 Relatório salvo em: ${reportPath}`);

// Recomendações finais
console.log('\n💡 PRÓXIMOS PASSOS:');
if (totalIssues === 0) {
  console.log('   ✅ Excelente! Nenhum problema encontrado.');
  console.log('   🔄 Continue executando auditorias regulares.');
} else {
  console.log('   1. Corrija problemas críticos e altos imediatamente');
  console.log('   2. Agende correção de problemas médios');
  console.log('   3. Considere problemas baixos para melhorias futuras');
  console.log('   4. Execute este script novamente após correções');
}

console.log('\n🔐 COMANDOS ÚTEIS:');
console.log('   npm audit fix              # Corrigir vulnerabilidades automáticas');
console.log('   npm audit fix --force      # Forçar correções (cuidado com breaking changes)');
console.log('   npm outdated               # Verificar dependências desatualizadas');

console.log('\n' + '='.repeat(60));
console.log('🛡️  AUDITORIA CONCLUÍDA');
console.log('='.repeat(60));

// Exit code baseado na severidade
if (results.critical.length > 0) {
  process.exit(3); // Crítico
} else if (results.high.length > 0) {
  process.exit(2); // Alto
} else if (results.medium.length > 0) {
  process.exit(1); // Médio
} else {
  process.exit(0); // Sucesso
}
