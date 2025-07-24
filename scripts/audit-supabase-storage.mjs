import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// =================================
// 1. CONFIGURAÇÃO INICIAL
// =================================
console.log('Iniciando script de auditoria do Supabase Storage...');

// Obter o diretório do projeto para carregar o .env corretamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Carregar variáveis de ambiente do arquivo .env na raiz do projeto
const result = dotenv.config({ path: path.resolve(projectRoot, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usar a chave de serviço
const BUCKET_NAME = 'imagens';

// --- DIAGNÓSTICO ---
console.log('--- Verificação de Variáveis de Ambiente ---');
console.log(`Buscando em: ${path.resolve(projectRoot, '.env')}`);
if (result.error) {
  console.log('Erro ao carregar .env:', result.error);
} else {
  console.log('Variáveis encontradas no arquivo .env:', Object.keys(result.parsed || {}));
}
console.log(`\nVariável 'VITE_SUPABASE_URL' foi carregada pelo script: ${!!supabaseUrl}`);
console.log(`Variável 'SUPABASE_SERVICE_ROLE_KEY' foi carregada pelo script: ${!!supabaseServiceKey}`);
console.log('-------------------------------------------');
// --- FIM DIAGNÓSTICO ---

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem ser definidas no seu arquivo .env');
  console.error('👉 Verifique se os nomes das variáveis estão corretos. A chave de serviço NÃO deve ter o prefixo "VITE_".');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('✅ Conectado ao Supabase com sucesso.');

// =================================
// 2. FUNÇÕES AUXILIARES
// =================================

/**
 * Lista todos os arquivos em um bucket do Supabase Storage, lidando com a paginação.
 * @param bucketName - O nome do bucket.
 * @returns Um array com os nomes de todos os arquivos.
 */
async function getAllFilesFromStorage(bucketName) {
  console.log(`Buscando todos os arquivos do bucket "${bucketName}"...`);
  let allFiles = [];
  let offset = 0;
  const limit = 1000; // O máximo permitido pela API

  while (true) {
    const { data: files, error } = await supabase.storage.from(bucketName).list(null, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      console.error(`❌ Erro ao listar arquivos do Storage (offset: ${offset}):`, error);
      throw error;
    }

    if (files.length === 0) {
      break; // Não há mais arquivos
    }

    allFiles.push(...files);
    offset += files.length;
    console.log(`... ${allFiles.length} arquivos encontrados até agora.`);
  }

  console.log(`✅ Total de ${allFiles.length} arquivos encontrados no Storage.`);
  return allFiles.map(file => file.name);
}

/**
 * Extrai o nome do arquivo da URL completa do Supabase Storage.
 * Ex: https://.../imagens/user-id/card-slug/image.jpg -> user-id/card-slug/image.jpg
 * @param url - A URL da imagem.
 * @returns O nome do arquivo no bucket.
 */
function getFileNameFromUrl(url) {
  try {
    const urlObject = new URL(url);
    const pathSegments = urlObject.pathname.split('/');
    const bucketIndex = pathSegments.indexOf(BUCKET_NAME);
    if (bucketIndex === -1) return null;
    return pathSegments.slice(bucketIndex + 1).join('/');
  } catch (e) {
    return null;
  }
}

/**
 * Busca todas as URLs de imagem da tabela portfolio_trabalhos.
 * @returns Um Set com todas as URLs de imagem em uso.
 */
async function getDatabaseImageUrls() {
  console.log('Buscando todas as URLs de imagem do banco de dados...');
  const { data, error } = await supabase
    .from('portfolio_trabalhos')
    .select('imagens');

  if (error) {
    console.error('❌ Erro ao buscar URLs do banco de dados:', error);
    throw error;
  }

  const imageUrlsInUse = new Set();
  data.forEach(trabalho => {
    if (trabalho.imagens) {
      trabalho.imagens.forEach(url => {
        const fileName = getFileNameFromUrl(url);
        if (fileName) {
          imageUrlsInUse.add(fileName);
        }
      });
    }
  });

  console.log(`✅ ${imageUrlsInUse.size} URLs de imagem únicas estão em uso no banco de dados.`);
  return imageUrlsInUse;
}


// =================================
// 3. LÓGICA PRINCIPAL DA AUDITORIA
// =================================

async function runAudit() {
  try {
    const [storageFiles, dbImageFiles] = await Promise.all([
      getAllFilesFromStorage(BUCKET_NAME),
      getDatabaseImageUrls(),
    ]);

    console.log('\n🔍 Comparando arquivos do Storage com o Banco de Dados...');

    // Filtrar para encontrar arquivos que existem no Storage mas não no DB
    const orphanFiles = storageFiles.filter(file => !dbImageFiles.has(file));

    // =================================
    // 4. RELATÓRIO FINAL
    // =================================
    console.log('\n\n--- 📊 RELATÓRIO DE AUDITORIA DO SUPABASE STORAGE ---');
    console.log(`Data da Auditoria: ${new Date().toLocaleString('pt-BR')}`);
    console.log('-----------------------------------------------------\n');
    console.log(`Total de arquivos no Storage ("${BUCKET_NAME}"): ${storageFiles.length}`);
    console.log(`Total de imagens referenciadas no DB: ${dbImageFiles.size}`);
    
    if (orphanFiles.length > 0) {
      console.log(`\n🔴 Encontrados ${orphanFiles.length} arquivos órfãos (presentes no Storage, mas não no DB):`);
      orphanFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
      console.log('\n👉 RECOMENDAÇÃO: Investigue e remova esses arquivos para economizar espaço e manter a consistência.');
    } else {
      console.log('\n✅ NENHUM ARQUIVO ÓRFÃO ENCONTRADO. Seu Storage está consistente com o banco de dados!');
    }
    console.log('\n--- FIM DO RELATÓRIO ---');

  } catch (error) {
    console.error('\n❌ A auditoria falhou devido a um erro crítico:', error.message);
    process.exit(1);
  }
}

runAudit(); 