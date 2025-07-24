import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuração Idêntica ao Script de Auditoria ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.resolve(projectRoot, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'imagens';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias.');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);
// --- Fim da Configuração ---


/**
 * Reutiliza a lógica do script de auditoria para encontrar arquivos órfãos.
 */
async function findOrphanFiles() {
  // Funções internas para buscar dados (simplificadas do script anterior)
  async function getAllStorageFiles(bucketName) {
    const { data, error } = await supabase.storage.from(bucketName).list(null, { limit: 10000 });
    if (error) throw error;
    // Ignorar placeholders do Supabase Storage
    return data.filter(file => file.name !== '.emptyFolderPlaceholder').map(file => file.name);
  }

  function getFileNameFromUrl(url) {
    try {
      const urlObject = new URL(url);
      const pathSegments = urlObject.pathname.split('/');
      const bucketIndex = pathSegments.indexOf(BUCKET_NAME);
      return bucketIndex === -1 ? null : pathSegments.slice(bucketIndex + 1).join('/');
    } catch { return null; }
  }

  async function getDbImageFiles() {
    const { data, error } = await supabase.from('portfolio_trabalhos').select('imagens');
    if (error) throw error;
    const urls = new Set();
    data.forEach(item => item.imagens?.forEach(url => {
      const fileName = getFileNameFromUrl(url);
      if (fileName) urls.add(fileName);
    }));
    return urls;
  }

  const [storageFiles, dbFiles] = await Promise.all([getAllStorageFiles(BUCKET_NAME), getDbImageFiles()]);
  return storageFiles.filter(file => !dbFiles.has(file));
}


/**
 * Lógica principal do script de limpeza.
 */
async function runCleanup() {
  console.log('Iniciando script de limpeza de arquivos órfãos do Storage...');
  
  try {
    const orphanFiles = await findOrphanFiles();

    if (orphanFiles.length === 0) {
      console.log('✅ Nenhum arquivo órfão encontrado. Nenhuma ação necessária.');
      return;
    }

    console.log(`\n🔴 Encontrados ${orphanFiles.length} arquivos órfãos para processar:`);
    orphanFiles.forEach(file => console.log(`  - ${file}`));

    // Verifica o argumento passado na linha de comando
    const shouldDelete = process.argv.includes('--delete');

    if (shouldDelete) {
      console.log('\n🔥 Deletando arquivos órfãos... (Flag --delete detectada)');
      
      const { data, error } = await supabase.storage.from(BUCKET_NAME).remove(orphanFiles);

      if (error) {
        console.error('❌ Erro ao deletar arquivos:', error);
      } else {
        console.log('✅ Arquivos deletados com sucesso!');
        console.log('Itens removidos:', data.map(d => d.name));
      }
    } else {
      console.log('\n👉 Modo de "listagem apenas". Nenhum arquivo foi deletado.');
      console.log('👉 Para deletar esses arquivos, rode o script com a flag: node scripts/cleanup-orphan-storage-files.mjs --delete');
    }

  } catch (error) {
    console.error('\n❌ O script de limpeza falhou:', error.message);
    process.exit(1);
  }
}

runCleanup(); 