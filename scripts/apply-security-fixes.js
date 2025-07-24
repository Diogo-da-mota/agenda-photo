#!/usr/bin/env node

/**
 * Script para Aplicar Correções de Segurança Automatizadas
 * Aplica correções automáticas para vulnerabilidades identificadas
 * Uso: node scripts/apply-security-fixes.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 APLICANDO CORREÇÕES DE SEGURANÇA AUTOMATIZADAS\n');
console.log('='.repeat(60));

const fixes = {
  applied: [],
  failed: [],
  skipped: []
};

// Função para aplicar correção
function applyFix(name, description, fixFunction) {
  console.log(`\n🔧 ${description}...`);
  try {
    const result = fixFunction();
    if (result.success) {
      console.log(`   ✅ ${description} - APLICADO`);
      fixes.applied.push({ name, description, details: result.details });
    } else {
      console.log(`   ⚠️  ${description} - PULADO: ${result.reason}`);
      fixes.skipped.push({ name, description, reason: result.reason });
    }
  } catch (error) {
    console.log(`   ❌ ${description} - FALHOU: ${error.message}`);
    fixes.failed.push({ name, description, error: error.message });
  }
}

// 1. CORREÇÃO DO PACKAGE.JSON - ADICIONAR SCRIPTS DE SEGURANÇA
applyFix('security-scripts', 'Adicionando scripts de segurança ao package.json', () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return { success: false, reason: 'package.json não encontrado' };
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const securityScripts = {
    'security:audit': 'node scripts/security-audit.js',
    'security:config': 'node scripts/security-config-check.js',
    'security:fix': 'node scripts/apply-security-fixes.js',
    'security:full': 'npm run security:audit && npm run security:config'
  };
  
  let added = [];
  
  // Adicionar scripts que não existem
  Object.entries(securityScripts).forEach(([script, command]) => {
    if (!packageJson.scripts[script]) {
      packageJson.scripts[script] = command;
      added.push(script);
    }
  });
  
  if (added.length > 0) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    return { success: true, details: `Scripts adicionados: ${added.join(', ')}` };
  } else {
    return { success: false, reason: 'Todos os scripts já existem' };
  }
});

// 2. CRIAR ARQUIVO .NVMRC PARA VERSÃO DO NODE
applyFix('nvmrc', 'Criando arquivo .nvmrc para versão do Node.js', () => {
  const nvmrcPath = path.join(process.cwd(), '.nvmrc');
  
  if (fs.existsSync(nvmrcPath)) {
    return { success: false, reason: 'Arquivo .nvmrc já existe' };
  }
  
  // Usar versão 18 LTS por padrão
  fs.writeFileSync(nvmrcPath, '18\n');
  return { success: true, details: 'Arquivo .nvmrc criado com Node.js v18' };
});

// 3. ATUALIZAR GITIGNORE PARA SEGURANÇA
applyFix('gitignore-security', 'Atualizando .gitignore com padrões de segurança', () => {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    return { success: false, reason: '.gitignore não encontrado' };
  }
  
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  
  const securityPatterns = [
    '# Arquivos de segurança',
    'security-audit-*.json',
    'security-config-*.json',
    '*.pem',
    '*.key',
    '*.crt',
    '.env.local',
    '.env.production',
    '.env.staging',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*'
  ];
  
  const missingPatterns = securityPatterns.filter(pattern => 
    !gitignoreContent.includes(pattern.replace('# ', ''))
  );
  
  if (missingPatterns.length > 0) {
    const newContent = gitignoreContent + '\n\n' + missingPatterns.join('\n') + '\n';
    fs.writeFileSync(gitignorePath, newContent);
    return { success: true, details: `Padrões adicionados: ${missingPatterns.length}` };
  } else {
    return { success: false, reason: 'Todos os padrões já existem' };
  }
});

// 4. CRIAR ARQUIVO DE CONFIGURAÇÃO DE SEGURANÇA
applyFix('security-config', 'Criando arquivo de configuração de segurança', () => {
  const configPath = path.join(process.cwd(), 'security.config.js');
  
  if (fs.existsSync(configPath)) {
    return { success: false, reason: 'Arquivo security.config.js já existe' };
  }
  
  const configContent = `// Configuração de Segurança - Agenda Pro
export const SECURITY_CONFIG = {
  // Configurações de rate limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo de requisições por IP
    auth: {
      windowMs: 60 * 60 * 1000, // 1 hora
      max: 10 // Máximo de tentativas de login
    }
  },
  
  // Configurações de cookies
  COOKIES: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  },
  
  // Headers de segurança
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  },
  
  // Configurações de CSP
  CSP: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://*.supabase.co"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  },
  
  // Configurações de validação
  VALIDATION: {
    maxPayloadSize: '10kb',
    maxStringLength: 1000,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf'
    ]
  },
  
  // Configurações de auditoria
  AUDIT: {
    enableLogging: true,
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    retentionDays: 90,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'session'
    ]
  }
};

export default SECURITY_CONFIG;
`;
  
  fs.writeFileSync(configPath, configContent);
  return { success: true, details: 'Arquivo security.config.js criado' };
});

// 5. CRIAR DOCUMENTAÇÃO DE SEGURANÇA
applyFix('security-docs', 'Criando documentação de segurança', () => {
  const docsPath = path.join(process.cwd(), 'SECURITY.md');
  
  if (fs.existsSync(docsPath)) {
    return { success: false, reason: 'SECURITY.md já existe' };
  }
  
  const securityDocs = `# 🛡️ Guia de Segurança - Agenda Pro

## 📋 Visão Geral

Este documento descreve as práticas e configurações de segurança implementadas na aplicação Agenda Pro.

## 🔐 Autenticação e Autorização

### Supabase Auth
- Autenticação baseada em JWT
- MFA/2FA implementado com TOTP
- Row Level Security (RLS) em todas as tabelas

### Gestão de Sessões
- Cookies HttpOnly para tokens
- Proteção CSRF implementada
- Timeout automático de sessão

## 🛡️ Proteções Implementadas

### Headers de Segurança
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security

### Rate Limiting
- 100 requisições por 15 minutos (geral)
- 10 tentativas de login por hora
- Proteção contra ataques de força bruta

### Validação de Entrada
- Sanitização automática de dados
- Validação de tipos MIME
- Limite de tamanho de payload (10KB)
- Limite de tamanho de arquivo (10MB)

## 🔍 Monitoramento e Auditoria

### Logs de Segurança
- Todas as tentativas de autenticação
- Violações de rate limit
- Tentativas de acesso não autorizado
- Uploads de arquivos

### Scripts de Auditoria
\`\`\`bash
# Auditoria completa
npm run security:full

# Auditoria de dependências
npm run security:audit

# Verificação de configurações
npm run security:config
\`\`\`

## 🚨 Resposta a Incidentes

### Em caso de violação de segurança:
1. Isolar o sistema afetado
2. Analisar logs de auditoria
3. Identificar o vetor de ataque
4. Aplicar correções necessárias
5. Documentar o incidente

### Contatos de Emergência
- Administrador do Sistema: [email]
- Equipe de Segurança: [email]

## 📊 Relatórios de Auditoria

Os relatórios de auditoria são executados automaticamente e salvos em:
- \`security-audit-[timestamp].json\`
- \`security-config-[timestamp].json\`

## 🔄 Manutenção

### Tarefas Regulares
- [ ] Verificar vulnerabilidades em dependências (semanal)
- [ ] Revisar logs de segurança (diário)
- [ ] Atualizar dependências (mensal)
- [ ] Executar auditoria completa (quinzenal)

### Atualizações de Segurança
- Aplicar patches críticos imediatamente
- Testar em ambiente de desenvolvimento primeiro
- Documentar todas as mudanças

## 📝 Checklist de Deployment

Antes de fazer deploy para produção:
- [ ] Executar \`npm run security:full\`
- [ ] Verificar se não há vulnerabilidades críticas
- [ ] Confirmar que todas as variáveis de ambiente estão configuradas
- [ ] Verificar configurações de HTTPS
- [ ] Testar autenticação e autorização
- [ ] Verificar logs de auditoria

## 🔗 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [Node.js Security Best Practices](https://nodejs.org/en/security/)

---

**Última atualização:** ${new Date().toISOString().split('T')[0]}
`;
  
  fs.writeFileSync(docsPath, securityDocs);
  return { success: true, details: 'Documentação SECURITY.md criada' };
});

// 6. ATUALIZAR VITE CONFIG PARA REMOVER UNSAFE-INLINE (OPCIONAL)
applyFix('vite-csp-hardening', 'Endurecendo CSP no vite.config.ts (removendo unsafe-inline)', () => {
  const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
  
  if (!fs.existsSync(viteConfigPath)) {
    return { success: false, reason: 'vite.config.ts não encontrado' };
  }
  
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Verificar se já está corrigido
  if (!viteConfig.includes("'unsafe-inline'")) {
    return { success: false, reason: 'CSP já não contém unsafe-inline' };
  }
  
  // Esta correção é comentada pois pode quebrar a aplicação
  // É recomendado fazer manualmente e testar
  return { success: false, reason: 'Correção manual recomendada - pode quebrar estilos inline' };
});

// 7. CRIAR SCRIPT DE BACKUP DE SEGURANÇA
applyFix('backup-script', 'Criando script de backup de configurações de segurança', () => {
  const scriptPath = path.join(process.cwd(), 'scripts/backup-security-config.js');
  
  if (fs.existsSync(scriptPath)) {
    return { success: false, reason: 'Script de backup já existe' };
  }
  
  const backupScript = `#!/usr/bin/env node

/**
 * Script de Backup de Configurações de Segurança
 * Faz backup das configurações críticas de segurança
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(process.cwd(), 'backups', \`security-\${timestamp}\`);

console.log('📦 Criando backup de configurações de segurança...');

// Criar diretório de backup
fs.mkdirSync(backupDir, { recursive: true });

// Arquivos críticos para backup
const criticalFiles = [
  'package.json',
  'vite.config.ts',
  'server/index.js',
  'security.config.js',
  '.env.example',
  'SECURITY.md'
];

criticalFiles.forEach(file => {
  const srcPath = path.join(process.cwd(), file);
  const destPath = path.join(backupDir, file);
  
  if (fs.existsSync(srcPath)) {
    // Criar diretório se necessário
    const destDir = path.dirname(destPath);
    fs.mkdirSync(destDir, { recursive: true });
    
    fs.copyFileSync(srcPath, destPath);
    console.log(\`✅ \${file} copiado\`);
  } else {
    console.log(\`⚠️  \${file} não encontrado\`);
  }
});

console.log(\`📦 Backup salvo em: \${backupDir}\`);
`;
  
  fs.writeFileSync(scriptPath, backupScript);
  fs.chmodSync(scriptPath, '755'); // Tornar executável
  return { success: true, details: 'Script de backup criado' };
});

// RELATÓRIO FINAL
console.log('\n' + '='.repeat(60));
console.log('📊 RELATÓRIO DE CORREÇÕES APLICADAS');
console.log('='.repeat(60));

console.log(`\n📈 RESUMO:`);
console.log(`   ✅ Aplicadas: ${fixes.applied.length}`);
console.log(`   ⚠️  Puladas: ${fixes.skipped.length}`);
console.log(`   ❌ Falharam: ${fixes.failed.length}`);

if (fixes.applied.length > 0) {
  console.log(`\n✅ CORREÇÕES APLICADAS:`);
  fixes.applied.forEach((fix, index) => {
    console.log(`   ${index + 1}. ${fix.description}`);
    if (fix.details) {
      console.log(`      → ${fix.details}`);
    }
  });
}

if (fixes.skipped.length > 0) {
  console.log(`\n⚠️  CORREÇÕES PULADAS:`);
  fixes.skipped.forEach((fix, index) => {
    console.log(`   ${index + 1}. ${fix.description}`);
    console.log(`      → ${fix.reason}`);
  });
}

if (fixes.failed.length > 0) {
  console.log(`\n❌ CORREÇÕES QUE FALHARAM:`);
  fixes.failed.forEach((fix, index) => {
    console.log(`   ${index + 1}. ${fix.description}`);
    console.log(`      → ${fix.error}`);
  });
}

// Salvar relatório
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(process.cwd(), `security-fixes-${timestamp}.json`);

const report = {
  timestamp: new Date().toISOString(),
  summary: {
    applied: fixes.applied.length,
    skipped: fixes.skipped.length,
    failed: fixes.failed.length
  },
  details: fixes
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n💾 Relatório salvo em: ${reportPath}`);

console.log(`\n💡 PRÓXIMOS PASSOS:`);
console.log(`   1. Executar 'npm run security:config' para verificar melhorias`);
console.log(`   2. Executar 'npm audit fix' para corrigir dependências`);
console.log(`   3. Revisar e testar mudanças em ambiente de desenvolvimento`);
console.log(`   4. Executar auditoria completa: 'npm run security:full'`);

console.log(`\n` + '='.repeat(60));
console.log(`🔧 CORREÇÕES CONCLUÍDAS`);
console.log('='.repeat(60));

// Exit code
if (fixes.failed.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
