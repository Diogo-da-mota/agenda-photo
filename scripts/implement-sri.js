#!/usr/bin/env node

/**
 * Script para implementar SRI (Subresource Integrity) em recursos externos
 * Gera hashes SHA-384 para recursos CDN e atualiza HTML
 */

import fs from 'fs';
import crypto from 'crypto';
import https from 'https';
import path from 'path';

// Recursos externos comuns que precisam de SRI
const externalResources = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

async function generateSRIHash(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      response.on('end', () => {
        const content = Buffer.concat(chunks);
        const hash = crypto.createHash('sha384').update(content).digest('base64');
        resolve(`sha384-${hash}`);
      });
      
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function updateHTMLWithSRI() {
  console.log('🔒 Implementando SRI (Subresource Integrity)...');
  
  const htmlPath = path.join(process.cwd(), 'index.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.warn('⚠️  index.html não encontrado');
    return;
  }
  
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  try {
    // Gerar hashes para recursos externos
    for (const resource of externalResources) {
      console.log(`📝 Gerando hash para: ${resource}`);
      
      try {
        const hash = await generateSRIHash(resource);
        console.log(`✅ Hash gerado: ${hash.substring(0, 20)}...`);
        
        // Atualizar HTML com SRI
        const linkRegex = new RegExp(`<link[^>]*href="${resource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g');
        
        htmlContent = htmlContent.replace(linkRegex, (match) => {
          // Adicionar integrity e crossorigin se não existirem
          if (!match.includes('integrity=')) {
            match = match.replace('>', ` integrity="${hash}" crossorigin="anonymous">`);
          }
          return match;
        });
        
      } catch (error) {
        console.warn(`⚠️  Não foi possível gerar hash para ${resource}:`, error.message);
      }
    }
    
    // Adicionar meta tag para SRI
    const metaTag = `<meta http-equiv="Content-Security-Policy" content="require-sri-for script style;">`;
    
    if (!htmlContent.includes('require-sri-for')) {
      htmlContent = htmlContent.replace('<head>', `<head>\n    ${metaTag}`);
    }
    
    // Salvar HTML atualizado
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('✅ SRI implementado com sucesso no index.html');
    
  } catch (error) {
    console.error('❌ Erro ao implementar SRI:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  updateHTMLWithSRI();
}

export default updateHTMLWithSRI;
