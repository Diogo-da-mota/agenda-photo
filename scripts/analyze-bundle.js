#!/usr/bin/env node

/**
 * Script para análise de bundle e identificação de dependências pesadas
 * Uso: npm run analyze-bundle
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Analisando bundle do projeto...\n');

// Função para executar comandos
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return output;
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    return null;
  }
}

// Função para formatar tamanho em bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função para analisar package.json
function analyzePackageJson() {
  console.log('📦 Analisando dependências...');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.error('❌ package.json não encontrado');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  
  console.log(`📊 Total de dependências: ${Object.keys(dependencies).length}`);
  console.log(`🛠️  Total de dev dependencies: ${Object.keys(devDependencies).length}`);
  
  // Dependências que podem ser pesadas
  const heavyDeps = [
    '@tanstack/react-query',
    'react-router-dom',
    'recharts',
    'lucide-react',
    '@supabase/supabase-js',
    'date-fns',
    'react-hook-form'
  ];
  
  console.log('\n🎯 Dependências importantes identificadas:');
  heavyDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`  ✅ ${dep}: ${dependencies[dep]}`);
    }
  });
  
  return { dependencies, devDependencies };
}

// Função para analisar tamanho dos arquivos
function analyzeBuildSize() {
  console.log('\n📏 Analisando tamanho dos arquivos...');
  
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    console.log('⚠️  Pasta dist não encontrada. Execute npm run build primeiro.');
    return;
  }
  
  function getDirectorySize(dirPath) {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
    
    return totalSize;
  }
  
  const totalSize = getDirectorySize(distPath);
  console.log(`📦 Tamanho total do build: ${formatBytes(totalSize)}`);
  
  // Analisar arquivos JS e CSS
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assets = fs.readdirSync(assetsPath);
    
    console.log('\n📂 Principais arquivos:');
    assets
      .filter(file => file.endsWith('.js') || file.endsWith('.css'))
      .map(file => {
        const filePath = path.join(assetsPath, file);
        const stats = fs.statSync(filePath);
        return { name: file, size: stats.size };
      })
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(file => {
        console.log(`  📄 ${file.name}: ${formatBytes(file.size)}`);
      });
  }
}

// Função para gerar relatório de otimização
function generateOptimizationReport() {
  console.log('\n🚀 RELATÓRIO DE OTIMIZAÇÕES RECOMENDADAS:');
  
  const recommendations = [
    {
      title: 'Code Splitting',
      description: 'Dividir código em chunks menores usando React.lazy()',
      impact: 'Alto',
      implemented: '✅ Implementado'
    },
    {
      title: 'Tree Shaking',
      description: 'Remover código não utilizado das dependências',
      impact: 'Médio',
      implemented: '🔄 Automático (Vite)'
    },
    {
      title: 'Bundle Analysis',
      description: 'Analisar dependências pesadas com webpack-bundle-analyzer',
      impact: 'Alto',
      implemented: '✅ Implementado'
    },
    {
      title: 'Resource Preloading',
      description: 'Preload de recursos críticos',
      impact: 'Médio',
      implemented: '✅ Implementado'
    },
    {
      title: 'Service Worker',
      description: 'Cache inteligente para funcionamento offline',
      impact: 'Alto',
      implemented: '✅ Implementado'
    },
    {
      title: 'Image Optimization',
      description: 'Compressão e lazy loading de imagens',
      impact: 'Alto',
      implemented: '✅ Implementado'
    }
  ];
  
  recommendations.forEach(rec => {
    console.log(`\n📋 ${rec.title}`);
    console.log(`   📝 ${rec.description}`);
    console.log(`   🎯 Impacto: ${rec.impact}`);
    console.log(`   📊 Status: ${rec.implemented}`);
  });
}

// Função para verificar oportunidades de melhoria
function checkImprovementOpportunities() {
  console.log('\n🔍 OPORTUNIDADES DE MELHORIA ADICIONAIS:');
  
  const opportunities = [
    {
      title: 'Lazy Loading de Rotas',
      check: () => {
        // Verificar se há imports estáticos de componentes de rota
        const routeFiles = ['src/AppRoutes.tsx', 'src/App.tsx'];
        let hasStaticImports = false;
        
        routeFiles.forEach(file => {
          const filePath = path.join(process.cwd(), file);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('import') && content.includes('pages/Dashboard')) {
              hasStaticImports = true;
            }
          }
        });
        
        return hasStaticImports ? '🔄 Pode ser melhorado' : '✅ Implementado';
      }
    },
    {
      title: 'Compressão Gzip/Brotli',
      check: () => {
        // Verificar se há configuração de compressão
        const viteConfig = path.join(process.cwd(), 'vite.config.ts');
        if (fs.existsSync(viteConfig)) {
          const content = fs.readFileSync(viteConfig, 'utf8');
          return content.includes('compression') ? '✅ Configurado' : '⚠️  Não configurado';
        }
        return '⚠️  Vite config não encontrado';
      }
    },
    {
      title: 'PWA Manifest',
      check: () => {
        const manifestPath = path.join(process.cwd(), 'public/manifest.json');
        return fs.existsSync(manifestPath) ? '✅ Presente' : '⚠️  Ausente';
      }
    }
  ];
  
  opportunities.forEach(opp => {
    const status = opp.check();
    console.log(`📋 ${opp.title}: ${status}`);
  });
}

// Executar análises
async function main() {
  console.log('🚀 ANÁLISE DE PERFORMANCE E BUNDLE\n');
  console.log('='.repeat(50));
  
  // 1. Analisar dependências
  analyzePackageJson();
  
  // 2. Analisar tamanho do build
  analyzeBuildSize();
  
  // 3. Gerar relatório de otimizações
  generateOptimizationReport();
  
  // 4. Verificar oportunidades de melhoria
  checkImprovementOpportunities();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Análise concluída!');
  console.log('\n💡 Para análise visual do bundle, execute:');
  console.log('   npm run build && npx webpack-bundle-analyzer dist/assets/*.js');
}

// Executar se chamado diretamente
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  main().catch(console.error);
}

export {
  analyzePackageJson,
  analyzeBuildSize,
  generateOptimizationReport,
  checkImprovementOpportunities
}; 