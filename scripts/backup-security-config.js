#!/usr/bin/env node

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
const backupDir = path.join(process.cwd(), 'backups', `security-${timestamp}`);

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
    console.log(`✅ ${file} copiado`);
  } else {
    console.log(`⚠️  ${file} não encontrado`);
  }
});

console.log(`📦 Backup salvo em: ${backupDir}`);
