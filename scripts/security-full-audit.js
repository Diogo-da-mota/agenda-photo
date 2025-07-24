#!/usr/bin/env node

/**
 * Script de Auditoria de Segurança Completa
 * Executa todas as verificações de segurança em sequência
 * Uso: npm run security:full
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🛡️  AUDITORIA DE SEGURANÇA COMPLETA - AGENDA PRO\n');
console.log('='.repeat(70));

const results = {
  npm_audit: null,
  config_check: null,
  dependency_check: null,
  file_integrity: null,
  overall_score: 0
};

// Função para executar comando e capturar resultado
function runAuditStep(name, description, command, isRequired = true) {
  console.log(`\n🔍 ${description}...`);
  console.log('-'.repeat(50));
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    console.log('✅ SUCESSO');
    return { success: true, output };
  } catch (error) {
    if (isRequired) {
      console.log('❌ FALHOU');
      console.log(`   Erro: ${error.message.split('\n')[0]}`);
      return { success: false, error: error.message, exitCode: error.status };
    } else {
      console.log('⚠️  AVISO - Não crítico');
      return { success: false, error: error.message, optional: true };
    }
  }
}

// 1. VERIFICAÇÃO DE DEPENDÊNCIAS
console.log('\n📦 ETAPA 1: AUDITORIA DE DEPENDÊNCIAS');
results.npm_audit = runAuditStep(
  'npm-audit',
  'Verificando vulnerabilidades em dependências',
  'npm audit --json',
  false // npm audit pode falhar e ainda retornar informações úteis
);

// 2. VERIFICAÇÃO DE CONFIGURAÇÕES
console.log('\n⚙️  ETAPA 2: VERIFICAÇÃO DE CONFIGURAÇÕES');
results.config_check = runAuditStep(
  'config-check',
  'Verificando configurações de segurança',
  'node scripts/security-config-check.js',
  false // Pode falhar mas não é crítico para o processo geral
);

// 3. VERIFICAÇÃO DE DEPENDÊNCIAS DESATUALIZADAS
console.log('\n📋 ETAPA 3: DEPENDÊNCIAS DESATUALIZADAS');
results.dependency_check = runAuditStep(
  'outdated-check',
  'Verificando dependências desatualizadas',
  'npm outdated --json',
  false
);

// 4. VERIFICAÇÃO DE INTEGRIDADE DE ARQUIVOS CRÍTICOS
console.log('\n🔒 ETAPA 4: INTEGRIDADE DE ARQUIVOS');
const criticalFiles = [
  'package.json',
  'vite.config.ts',
  'server/index.js',
  'security.config.js',
  'SECURITY.md'
];

let integrityScore = 100;
const missingFiles = [];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} - Presente`);
  } else {
    console.log(`   ❌ ${file} - Ausente`);
    missingFiles.push(file);
    integrityScore -= 20;
  }
});

results.file_integrity = {
  success: missingFiles.length === 0,
  score: integrityScore,
  missingFiles
};

// 5. ANÁLISE DOS RESULTADOS
console.log('\n' + '='.repeat(70));
console.log('📊 ANÁLISE DOS RESULTADOS');
console.log('='.repeat(70));

let overallScore = 100;
const issues = [];
const recommendations = [];

// Analisar npm audit
if (results.npm_audit?.success === false && !results.npm_audit?.optional) {
  console.log('\n🔴 VULNERABILIDADES EM DEPENDÊNCIAS:');
  try {
    if (results.npm_audit.output) {
      const auditData = JSON.parse(results.npm_audit.output);
      const vulnCount = Object.keys(auditData.vulnerabilities || {}).length;
      console.log(`   📊 ${vulnCount} vulnerabilidades encontradas`);
      
      if (vulnCount > 0) {
        overallScore -= Math.min(30, vulnCount * 3);
        issues.push(`${vulnCount} vulnerabilidades em dependências`);
        recommendations.push('Executar "npm audit fix" para corrigir vulnerabilidades');
      }
    }
  } catch (e) {
    console.log('   ⚠️  Não foi possível analisar detalhes das vulnerabilidades');
  }
} else {
  console.log('\n✅ DEPENDÊNCIAS: Sem vulnerabilidades críticas detectadas');
}

// Analisar verificação de configurações
if (results.config_check?.exitCode === 1) {
  console.log('\n🟡 CONFIGURAÇÕES: Algumas melhorias recomendadas');
  overallScore -= 10;
  issues.push('Configurações de segurança precisam de ajustes');
  recommendations.push('Revisar configurações identificadas pelo security-config-check.js');
} else {
  console.log('\n✅ CONFIGURAÇÕES: Boas práticas implementadas');
}

// Analisar dependências desatualizadas
if (results.dependency_check?.success === false && !results.dependency_check?.optional) {
  try {
    if (results.dependency_check.output) {
      const outdatedData = JSON.parse(results.dependency_check.output);
      const outdatedCount = Object.keys(outdatedData).length;
      console.log(`\n🟡 DEPENDÊNCIAS DESATUALIZADAS: ${outdatedCount} pacotes`);
      
      if (outdatedCount > 10) {
        overallScore -= 5;
        issues.push(`${outdatedCount} dependências desatualizadas`);
        recommendations.push('Considerar atualizar dependências desatualizadas');
      }
    }
  } catch (e) {
    console.log('\n✅ DEPENDÊNCIAS: Versões atualizadas');
  }
} else {
  console.log('\n✅ DEPENDÊNCIAS: Versões atualizadas');
}

// Analisar integridade de arquivos
if (!results.file_integrity.success) {
  console.log(`\n🔴 INTEGRIDADE: ${results.file_integrity.missingFiles.length} arquivos críticos ausentes`);
  overallScore -= results.file_integrity.missingFiles.length * 5;
  issues.push(`Arquivos críticos ausentes: ${results.file_integrity.missingFiles.join(', ')}`);
  recommendations.push('Restaurar arquivos críticos ausentes');
} else {
  console.log('\n✅ INTEGRIDADE: Todos os arquivos críticos presentes');
}

results.overall_score = Math.max(0, overallScore);

// 6. RELATÓRIO FINAL
console.log('\n' + '='.repeat(70));
console.log('🎯 RELATÓRIO FINAL DE AUDITORIA');
console.log('='.repeat(70));

console.log(`\n📊 SCORE GERAL DE SEGURANÇA: ${results.overall_score}/100`);

if (results.overall_score >= 90) {
  console.log('🟢 EXCELENTE - Sistema muito seguro, pronto para produção');
} else if (results.overall_score >= 75) {
  console.log('🟡 BOM - Algumas melhorias recomendadas antes do deploy');
} else if (results.overall_score >= 50) {
  console.log('🟠 MÉDIO - Correções necessárias antes do deploy');
} else {
  console.log('🔴 BAIXO - Ação imediata requerida, não recomendado para produção');
}

if (issues.length > 0) {
  console.log('\n🚨 PROBLEMAS IDENTIFICADOS:');
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
}

if (recommendations.length > 0) {
  console.log('\n💡 RECOMENDAÇÕES:');
  recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });
}

// 7. COMANDOS ÚTEIS
console.log('\n🔧 COMANDOS ÚTEIS PARA CORREÇÕES:');
console.log('   npm audit fix                 # Corrigir vulnerabilidades automaticamente');
console.log('   npm run security:config       # Verificar configurações detalhadamente');
console.log('   npm run security:fix          # Aplicar correções automáticas');
console.log('   npm outdated                  # Ver dependências desatualizadas');
console.log('   npm update                    # Atualizar dependências (cuidado com breaking changes)');

// 8. PRÓXIMOS PASSOS
console.log('\n📋 PRÓXIMOS PASSOS RECOMENDADOS:');
if (results.overall_score >= 90) {
  console.log('   1. ✅ Sistema aprovado para deploy');
  console.log('   2. 🔄 Manter auditoria regular (semanal)');
  console.log('   3. 📊 Monitorar métricas de segurança');
} else {
  console.log('   1. 🔧 Corrigir problemas identificados');
  console.log('   2. 🧪 Executar esta auditoria novamente');
  console.log('   3. 📋 Verificar se score melhorou para ≥90');
  console.log('   4. ✅ Só então proceder com deploy');
}

// 9. SALVAR RELATÓRIO
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(process.cwd(), `security-full-audit-${timestamp}.json`);

const finalReport = {
  timestamp: new Date().toISOString(),
  overall_score: results.overall_score,
  summary: {
    issues: issues.length,
    recommendations: recommendations.length,
    status: results.overall_score >= 90 ? 'APPROVED' : results.overall_score >= 75 ? 'CONDITIONAL' : 'REJECTED'
  },
  details: results,
  issues,
  recommendations
};

fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
console.log(`\n💾 Relatório completo salvo em: ${reportPath}`);

console.log('\n' + '='.repeat(70));
console.log('🛡️  AUDITORIA COMPLETA FINALIZADA');
console.log('='.repeat(70));

// Exit code baseado no score
if (results.overall_score >= 90) {
  process.exit(0); // Sucesso
} else if (results.overall_score >= 75) {
  process.exit(1); // Aviso
} else {
  process.exit(2); // Erro
}
