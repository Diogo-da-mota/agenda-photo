#!/usr/bin/env node

/**
 * 🔍 IDENTIFICADOR SEGURO DE ARQUIVOS DE TESTE
 * 
 * Este script APENAS LISTA arquivos que podem ser de teste.
 * NÃO MODIFICA, NÃO DELETA, NÃO MOVE nenhum arquivo.
 * 
 * Uso: node scripts/identify-test-files-safe.js
 */

const fs = require('fs');
const path = require('path');

// Critérios de identificação
const TEST_PATTERNS = {
  // Nomes que indicam arquivos de teste
  names: [
    /test[._-]/i,
    /teste[._-]/i,
    /demo[._-]/i,
    /temp[._-]/i,
    /tmp[._-]/i,
    /backup[._-]/i,
    /bkp[._-]/i,
    /obsolete/i,
    /deprecated/i,
    /old[._-]/i,
    /experimental/i,
    /playground/i
  ],
  
  // Diretórios que normalmente contêm testes
  directories: [
    '__tests__',
    'test',
    'tests',
    'testing',
    'temp',
    'tmp',
    'backup',
    'obsolete',
    '__archive__'
  ],
  
  // Extensões comuns de arquivos temporários
  extensions: [
    '.tmp',
    '.temp',
    '.bak',
    '.old',
    '.test.js',
    '.test.ts',
    '.test.tsx'
  ]
};

// Arquivos/diretórios a ignorar
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage'
];

class SafeTestFileIdentifier {
  constructor() {
    this.results = {
      testFiles: [],
      backupDirs: [],
      untracked: [],
      large: [],
      suspicious: []
    };
  }

  // Verificar se arquivo/diretório deve ser ignorado
  shouldIgnore(filePath) {
    return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
  }

  // Verificar se nome corresponde a padrões de teste
  matchesTestPattern(fileName) {
    return TEST_PATTERNS.names.some(pattern => pattern.test(fileName));
  }

  // Verificar se extensão é suspeita
  hasSuspiciousExtension(fileName) {
    return TEST_PATTERNS.extensions.some(ext => fileName.endsWith(ext));
  }

  // Verificar se está em diretório de teste
  isInTestDirectory(filePath) {
    const pathParts = filePath.split(path.sep);
    return TEST_PATTERNS.directories.some(testDir => 
      pathParts.some(part => part === testDir)
    );
  }

  // Verificar tamanho do arquivo/diretório
  async getSize(filePath) {
    try {
      const stats = await fs.promises.stat(filePath);
      if (stats.isDirectory()) {
        return await this.getDirSize(filePath);
      }
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  // Calcular tamanho de diretório
  async getDirSize(dirPath) {
    try {
      const files = await fs.promises.readdir(dirPath);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.promises.stat(filePath);
        
        if (stats.isDirectory()) {
          totalSize += await this.getDirSize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  // Verificar se arquivo está no git
  isTracked(filePath) {
    // Simplificado - em produção usaria git ls-files
    return true; // Assumir que está trackado por padrão
  }

  // Analisar um arquivo/diretório
  async analyzeItem(itemPath, relativePath) {
    if (this.shouldIgnore(relativePath)) {
      return;
    }

    const fileName = path.basename(itemPath);
    const size = await this.getSize(itemPath);
    const sizeInMB = size / (1024 * 1024);

    const analysis = {
      path: relativePath,
      name: fileName,
      size: size,
      sizeFormatted: sizeInMB > 1 ? `${sizeInMB.toFixed(1)}MB` : `${Math.round(size / 1024)}KB`,
      reasons: []
    };

    // Verificar diferentes critérios
    if (this.matchesTestPattern(fileName)) {
      analysis.reasons.push('Nome indica arquivo de teste');
    }

    if (this.hasSuspiciousExtension(fileName)) {
      analysis.reasons.push('Extensão suspeita');
    }

    if (this.isInTestDirectory(relativePath)) {
      analysis.reasons.push('Em diretório de teste');
    }

    if (sizeInMB > 100) {
      analysis.reasons.push(`Arquivo/diretório grande (${analysis.sizeFormatted})`);
      this.results.large.push(analysis);
    }

    if (fileName.includes('backup') || fileName.includes('bkp')) {
      analysis.reasons.push('Possível backup');
      this.results.backupDirs.push(analysis);
    }

    // Se tem alguma razão suspeita, adicionar aos resultados
    if (analysis.reasons.length > 0) {
      this.results.suspicious.push(analysis);
      
      if (this.isInTestDirectory(relativePath) || this.matchesTestPattern(fileName)) {
        this.results.testFiles.push(analysis);
      }
    }
  }

  // Escanear diretório recursivamente
  async scanDirectory(dirPath, basePath = dirPath) {
    try {
      const items = await fs.promises.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const relativePath = path.relative(basePath, itemPath);
        
        const stats = await fs.promises.stat(itemPath);
        
        if (stats.isDirectory()) {
          await this.analyzeItem(itemPath, relativePath);
          await this.scanDirectory(itemPath, basePath);
        } else {
          await this.analyzeItem(itemPath, relativePath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Erro ao escanear ${dirPath}: ${error.message}`);
    }
  }

  // Gerar relatório
  generateReport() {
    console.log('\n🔍 RELATÓRIO DE IDENTIFICAÇÃO DE ARQUIVOS DE TESTE');
    console.log('=' .repeat(60));
    console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
    console.log(`🔒 Modo: APENAS ANÁLISE (nenhum arquivo modificado)`);
    console.log('=' .repeat(60));

    // Arquivos de teste
    if (this.results.testFiles.length > 0) {
      console.log('\n📝 ARQUIVOS DE TESTE IDENTIFICADOS:');
      this.results.testFiles.forEach(item => {
        console.log(`  📄 ${item.path} (${item.sizeFormatted})`);
        item.reasons.forEach(reason => {
          console.log(`     └─ ${reason}`);
        });
      });
    }

    // Backups grandes
    if (this.results.large.length > 0) {
      console.log('\n📦 ARQUIVOS/DIRETÓRIOS GRANDES:');
      this.results.large
        .sort((a, b) => b.size - a.size)
        .forEach(item => {
          console.log(`  📦 ${item.path} (${item.sizeFormatted})`);
        });
    }

    // Resumo
    console.log('\n📊 RESUMO:');
    console.log(`  └─ Arquivos de teste: ${this.results.testFiles.length}`);
    console.log(`  └─ Backups/grandes: ${this.results.large.length}`);
    console.log(`  └─ Total suspeitos: ${this.results.suspicious.length}`);

    console.log('\n⚠️  IMPORTANTE:');
    console.log('  • Esta é apenas uma análise - nenhum arquivo foi modificado');
    console.log('  • Todos os arquivos listados precisam de análise manual');
    console.log('  • Arquivos untracked no git podem ser perdidos se deletados');
  }
}

// Executar análise
async function main() {
  const identifier = new SafeTestFileIdentifier();
  
  console.log('🔍 Iniciando identificação segura de arquivos de teste...');
  console.log('⏳ Analisando estrutura do projeto...');
  
  await identifier.scanDirectory(process.cwd());
  identifier.generateReport();
  
  console.log('\n✅ Análise concluída com segurança!');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro durante análise:', error.message);
    process.exit(1);
  });
}

module.exports = SafeTestFileIdentifier; 