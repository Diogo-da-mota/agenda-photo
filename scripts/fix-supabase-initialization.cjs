#!/usr/bin/env node

/**
 * Script para verificar e corrigir problemas de inicialização do Supabase
 * 
 * Este script:
 * 1. Verifica todas as inicializações do Supabase no projeto
 * 2. Identifica usos diretos de import.meta.env
 * 3. Sugere correções para usar envConfig centralizado
 * 4. Verifica se há múltiplas inicializações conflitantes
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

// Padrões problemáticos
const PROBLEMATIC_PATTERNS = [
  {
    pattern: /createClient\s*\(\s*import\.meta\.env\.VITE_SUPABASE_URL/g,
    description: 'Uso direto de import.meta.env.VITE_SUPABASE_URL',
    suggestion: 'Use envConfig.supabaseUrl'
  },
  {
    pattern: /createClient\s*\(\s*import\.meta\.env\.VITE_SUPABASE_ANON_KEY/g,
    description: 'Uso direto de import.meta.env.VITE_SUPABASE_ANON_KEY',
    suggestion: 'Use envConfig.supabaseAnonKey'
  },
  {
    pattern: /createClient\s*\(\s*[^,]*,\s*[^,]*,/g,
    description: 'Múltiplas inicializações do createClient',
    suggestion: 'Considere usar o cliente centralizado de @/lib/supabase'
  }
];

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath, results);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const { pattern, description, suggestion } of PROBLEMATIC_PATTERNS) {
        const matches = content.match(pattern);
        if (matches) {
          results.push({
            file: path.relative(srcDir, filePath),
            matches: matches.length,
            description,
            suggestion,
            content: matches
          });
        }
      }
    }
  }
  
  return results;
}

function generateReport() {
  console.log('🔍 Verificando problemas de inicialização do Supabase...\n');
  
  const issues = scanDirectory(srcDir);
  
  if (issues.length === 0) {
    console.log('✅ Nenhum problema encontrado!');
    return;
  }
  
  console.log(`❌ Encontrados ${issues.length} problemas:\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}`);
    console.log(`   Problema: ${issue.description}`);
    console.log(`   Sugestão: ${issue.suggestion}`);
    console.log(`   Ocorrências: ${issue.matches}`);
    console.log('');
  });
  
  console.log('📋 Recomendações:');
  console.log('1. Use sempre o cliente centralizado: import { supabase } from "@/lib/supabase"');
  console.log('2. Para clientes especiais, use: import { envConfig } from "@/lib/env-config"');
  console.log('3. Evite múltiplas inicializações do createClient');
  console.log('4. Teste sempre após as correções');
}

// Executar verificação
generateReport();