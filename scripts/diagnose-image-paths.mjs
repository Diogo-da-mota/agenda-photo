import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuração do Ambiente ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL (ou VITE_SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY não encontradas.');
  console.error('Certifique-se de que seu arquivo .env está na raiz do projeto e contém as chaves corretas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const BUCKET_NAME = 'imagens';

// --- Função getPathFromUrl (Cópia exata de delete.ts) ---
const getPathFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlObject = new URL(url);
    const pathSegments = urlObject.pathname.split('/');
    const publicIndex = pathSegments.indexOf('public');
    if (publicIndex === -1 || publicIndex + 2 > pathSegments.length) {
      console.warn(`⚠️  URL com formato inesperado: ${url}`);
      return null;
    }
    return pathSegments.slice(publicIndex + 2).join('/');
  } catch (error) {
    console.error(`❌ Erro ao parsear URL: ${url}`, error);
    return null;
  }
};

// --- Funções de Diagnóstico ---

// 1. Busca todos os caminhos de imagem do banco de dados
async function getDatabaseImagePaths() {
  console.log('🔍 Buscando URLs de imagem do banco de dados...');
  const { data, error } = await supabase
    .from('portfolio_trabalhos')
    .select('id, titulo, imagens');

  if (error) {
    console.error('❌ Erro ao buscar trabalhos do portfólio:', error);
    return null;
  }

  const allPaths = data.flatMap(trabalho => 
    (trabalho.imagens || []).map(url => ({
      trabalhoId: trabalho.id,
      trabalhoTitulo: trabalho.titulo,
      originalUrl: url,
      generatedPath: getPathFromUrl(url)
    }))
  );
  
  console.log(`✅ Encontradas ${allPaths.length} referências de imagem no DB.`);
  return allPaths.filter(p => p.generatedPath);
}

// 2. Lista todos os arquivos no Storage
async function listAllStorageFiles(bucketName) {
  console.log(`🗂️  Listando todos os arquivos do bucket "${bucketName}"... (Isso pode demorar)`);
  let allFiles = [];
  let marker = null;

  while (true) {
    const { data, error } = await supabase.storage.from(bucketName).list(null, {
      limit: 1000,
      offset: marker ? 1 : 0, // In Supabase, offset is used for pagination continuation.
      // After first page, we need to skip the marker if it were used like S3.
      // Supabase's list is simpler, so we manage pages by tracking total files fetched.
    });

    if (error) {
      console.error(`❌ Erro ao listar arquivos do Storage:`, error);
      return null;
    }

    if (data.length === 0) {
      break;
    }
    
    // Flatten structure by adding folder path to file name
    const processFiles = (files, currentPath) => {
        for (const file of files) {
            const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
            if (file.id === null) { // It's a folder
                // Note: Supabase list doesn't return folder contents recursively in one go.
                // This script would need to be enhanced for deep recursion if needed.
                // For 'Portfolio/image.jpg' structure, this is fine.
            } else {
                 allFiles.push(filePath);
            }
        }
    }

    const { data: rootFiles, error: rootError } = await supabase.storage.from(bucketName).list();
    if(rootError) throw rootError;
    
    for(const file of rootFiles) {
        if(file.id === null) { // It's a folder
            const { data: folderFiles, error: folderError } = await supabase.storage.from(bucketName).list(file.name);
            if(folderError) throw folderError;
            processFiles(folderFiles, file.name);
        } else {
            allFiles.push(file.name);
        }
    }
    break; // For simplicity, handle one level deep, which matches 'Portfolio/image.jpg'
  }
  
  console.log(`✅ Encontrados ${allFiles.length} arquivos no Storage.`);
  return allFiles;
}


// --- Execução Principal ---
async function runDiagnostics() {
  console.log('🚀 Iniciando diagnóstico de caminhos de imagem do portfólio...');
  
  const dbPaths = await getDatabaseImagePaths();
  const storageFiles = await listAllStorageFiles(BUCKET_NAME);

  if (!dbPaths || !storageFiles) {
    console.error('❌ Diagnóstico abortado devido a erros anteriores.');
    return;
  }

  const dbPathSet = new Set(dbPaths.map(p => p.generatedPath));
  const storageFileSet = new Set(storageFiles);

  let mismatches = 0;
  console.log('\n--- 📊 Análise de Divergências ---');
  
  for (const dbPathData of dbPaths) {
    if (!storageFileSet.has(dbPathData.generatedPath)) {
      console.log(`\n❌ DIVERGÊNCIA ENCONTRADA (Arquivo do DB não existe no Storage)`);
      console.log(`  - Trabalho: "${dbPathData.trabalhoTitulo}" (ID: ${dbPathData.trabalhoId})`);
      console.log(`  - URL no DB: ${dbPathData.originalUrl}`);
      console.log(`  - Caminho Gerado: ${dbPathData.generatedPath}`);
      mismatches++;
    }
  }

  if (mismatches === 0) {
    console.log('✅ Nenhuma divergência encontrada! Os caminhos gerados a partir do DB parecem corresponder aos arquivos no Storage.');
  } else {
    console.log(`\n🚨 Resumo: Encontradas ${mismatches} divergências. Os caminhos gerados pela função getPathFromUrl não estão corretos.`);
  }

  // Verificar se há caminhos com "Portfolio" vs "portfolio"
  const caseMismatches = dbPaths.filter(p => 
      !storageFileSet.has(p.generatedPath) &&
      storageFileSet.has(p.generatedPath.replace('portfolio', 'Portfolio'))
  );

  if (caseMismatches.length > 0) {
      console.log('\n--- 🕵️ Análise de Caixa (Case-Sensitivity) ---');
      console.log('💡 Encontrados possíveis erros de maiúsculas/minúsculas!');
      console.log('A função está gerando "portfolio" (minúsculo), mas o arquivo no Storage parece ser "Portfolio" (maiúsculo).');
      caseMismatches.forEach(m => {
          console.log(`  - Exemplo: ${m.generatedPath}`);
      });
  }

  console.log('\n🏁 Diagnóstico concluído.');
}

runDiagnostics(); 