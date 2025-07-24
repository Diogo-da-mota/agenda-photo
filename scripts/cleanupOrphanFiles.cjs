
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Validação das variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY precisam estar definidas no arquivo .env');
  process.exit(1);
}

// Cria o cliente Supabase com a chave de serviço para ter acesso total
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'imagens';

/**
 * Busca todos os arquivos de forma paginada em um bucket do Supabase Storage.
 * @param {string} bucketName - O nome do bucket.
 * @returns {Promise<string[]>} Uma lista com os caminhos de todos os arquivos.
 */
async function getAllFilesFromStorage(bucketName) {
  console.log(`🔎 Buscando todos os arquivos do bucket "${bucketName}"...`);
  let allFiles = [];
  let offset = 0;
  const limit = 1000; // O Supabase retorna no máximo 1000 por vez
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(null, { limit, offset, sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      console.error(`❌ Erro ao listar arquivos do Storage (offset: ${offset}):`, error);
      throw error;
    }

    const filePaths = data.map(file => file.name);
    allFiles.push(...filePaths);
    
    if (filePaths.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
  }
  console.log(`✅ Encontrados ${allFiles.length} arquivos no Storage.`);
  return allFiles;
}

/**
 * Busca todas as URLs de imagem da tabela do banco de dados.
 * @returns {Promise<Set<string>>} Um Set com os nomes dos arquivos extraídos das URLs.
 */
async function getAllImageUrlsFromDB() {
  console.log('🔎 Buscando todas as URLs de imagem do banco de dados...');
  const { data, error } = await supabase
    .from('portfolio_imagens')
    .select('imagem_url');

  if (error) {
    console.error('❌ Erro ao buscar URLs do banco de dados:', error);
    throw error;
  }

  const fileNames = new Set();
  for (const record of data) {
    try {
      const url = new URL(record.imagem_url);
      // Extrai o path após o nome do bucket, ex: 'user_id/imagem.jpg'
      const pathParts = url.pathname.split(`/${BUCKET_NAME}/`);
      if (pathParts.length > 1) {
        fileNames.add(pathParts[1]);
      }
    } catch (e) {
      console.warn(`⚠️ URL inválida encontrada no banco e ignorada: ${record.imagem_url}`);
    }
  }

  console.log(`✅ Encontrados ${fileNames.size} registros de imagens válidas no banco.`);
  return fileNames;
}

/**
 * Compara as listas e encontra os arquivos órfãos.
 * @param {string[]} storageFiles - Lista de arquivos do Storage.
 * @param {Set<string>} dbFileNames - Set de nomes de arquivos do banco.
 * @returns {string[]} Uma lista com os caminhos dos arquivos órfãos.
 */
function findOrphanFiles(storageFiles, dbFileNames) {
  console.log('🔬 Comparando arquivos do Storage com registros do banco...');
  const orphanFiles = storageFiles.filter(filePath => !dbFileNames.has(filePath));
  console.log(`✅ Análise concluída: ${orphanFiles.length} arquivos órfãos encontrados.`);
  return orphanFiles;
}

/**
 * Remove os arquivos órfãos do Supabase Storage.
 * @param {string[]} orphanFiles - A lista de arquivos a serem removidos.
 */
async function deleteOrphanFiles(orphanFiles) {
  if (orphanFiles.length === 0) {
    console.log('🎉 Nenhum arquivo órfão para remover. O Storage está limpo!');
    return;
  }

  console.log(`🗑️ Preparando para remover ${orphanFiles.length} arquivos órfãos...`);

  // Para segurança, vamos remover em lotes de 100
  const batchSize = 100;
  for (let i = 0; i < orphanFiles.length; i += batchSize) {
    const batch = orphanFiles.slice(i, i + batchSize);
    console.log(`    - Removendo lote de ${batch.length} arquivos...`);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(batch);

    if (error) {
      console.error('❌ Erro ao remover um lote de arquivos:', error);
      // Continua para o próximo lote em vez de parar
    }
  }

  console.log('✅ Processo de limpeza concluído com sucesso!');
}

async function main() {
  console.log('--- INICIANDO SCRIPT DE LIMPEZA DE ARQUIVOS ÓRFÃOS ---');
  try {
    const storageFiles = await getAllFilesFromStorage(BUCKET_NAME);
    const dbFileNames = await getAllImageUrlsFromDB();
    const orphanFiles = findOrphanFiles(storageFiles, dbFileNames);
    
    await deleteOrphanFiles(orphanFiles);

  } catch (error) {
    console.error('🛑 Ocorreu um erro crítico durante a execução do script:', error.message);
    process.exit(1);
  } finally {
    console.log('--- SCRIPT DE LIMPEZA FINALIZADO ---');
  }
}

main(); 