import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuração Idêntica ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.resolve(projectRoot, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'imagens';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente são necessárias.');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);
// --- Fim da Configuração ---

/**
 * Extrai o caminho do arquivo de uma URL do Supabase Storage.
 */
function getPathFromUrl(url) {
  try {
    const urlObject = new URL(url);
    const pathSegments = urlObject.pathname.split('/');
    const bucketIndex = pathSegments.indexOf(BUCKET_NAME);
    return bucketIndex === -1 ? null : pathSegments.slice(bucketIndex + 1).join('/');
  } catch {
    return null;
  }
}

/**
 * Verifica a existência de uma lista de arquivos no Storage.
 * @param filePaths - Array com os caminhos dos arquivos.
 * @returns Um Set com os caminhos dos arquivos que realmente existem.
 */
async function checkFilesExist(filePaths) {
  // O Supabase não tem um método "exists" em lote, então buscamos os metadados.
  // Isso é mais eficiente do que fazer um loop de chamadas individuais.
  const { data: existingFilesData, error } = await supabase.storage.from(BUCKET_NAME).list(null, {
    limit: 10000, // Assumindo que o número de arquivos totais é menor que o limite
  });

  if (error) {
    console.error('Erro ao listar arquivos do Storage para verificação:', error);
    return new Set();
  }

  const existingFileNames = new Set(existingFilesData.map(f => f.name));
  const verifiedPaths = filePaths.filter(path => existingFileNames.has(path));

  return new Set(verifiedPaths);
}

/**
 * Lógica principal do script de sincronização.
 */
async function runSync() {
  console.log('Iniciando sincronização do Banco de Dados com o Storage...');

  try {
    const { data: trabalhos, error: fetchError } = await supabase
      .from('portfolio_trabalhos')
      .select('id, titulo, imagens, imagem_capa');

    if (fetchError) throw fetchError;

    const correctionsToApply = [];
    const allFilePathsToCheck = new Set();

    // 1. Coletar todos os caminhos de arquivo para uma única verificação em lote
    trabalhos.forEach(trabalho => {
      trabalho.imagens?.forEach(url => {
        const path = getPathFromUrl(url);
        if (path) allFilePathsToCheck.add(path);
      });
    });

    const existingFilePaths = await checkFilesExist(Array.from(allFilePathsToCheck));

    // 2. Determinar quais correções são necessárias
    for (const trabalho of trabalhos) {
      if (!trabalho.imagens || trabalho.imagens.length === 0) continue;

      const originalImageCount = trabalho.imagens.length;
      const validImageUrls = [];
      const invalidImageUrls = [];

      trabalho.imagens.forEach(url => {
        const path = getPathFromUrl(url);
        if (path && existingFilePaths.has(path)) {
          validImageUrls.push(url);
        } else {
          invalidImageUrls.push(url);
        }
      });
      
      if (invalidImageUrls.length > 0) {
        let newCoverImage = trabalho.imagem_capa;
        // Se a imagem de capa era uma das inválidas, define uma nova
        if (invalidImageUrls.includes(trabalho.imagem_capa)) {
          newCoverImage = validImageUrls.length > 0 ? validImageUrls[0] : null;
        }

        correctionsToApply.push({
          id: trabalho.id,
          titulo: trabalho.titulo,
          invalidUrls: invalidImageUrls,
          newImageArray: validImageUrls,
          newCoverImage: newCoverImage,
          needsUpdate: originalImageCount !== validImageUrls.length || newCoverImage !== trabalho.imagem_capa
        });
      }
    }

    // 3. Exibir o relatório
    if (correctionsToApply.length === 0) {
      console.log('✅ Banco de Dados está consistente com o Storage. Nenhuma ação necessária.');
      return;
    }

    console.log(`\n🔴 Encontrados ${correctionsToApply.length} trabalhos com ${correctionsToApply.reduce((acc, c) => acc + c.invalidUrls.length, 0)} imagens quebradas.`);
    correctionsToApply.forEach(corr => {
      console.log(`\n  - Trabalho: "${corr.titulo}" (ID: ${corr.id})`);
      corr.invalidUrls.forEach(url => console.log(`    - ❌ URL Inválida: ${url}`));
    });

    // 4. Aplicar correções, se a flag for passada
    const shouldFix = process.argv.includes('--fix');
    if (shouldFix) {
      console.log('\n\n🔥 Aplicando correções... (Flag --fix detectada)');
      const updatePromises = correctionsToApply
        .filter(c => c.needsUpdate)
        .map(c => 
          supabase.from('portfolio_trabalhos').update({ 
            imagens: c.newImageArray,
            imagem_capa: c.newCoverImage,
            atualizado_em: new Date().toISOString()
          }).eq('id', c.id)
        );
      
      const results = await Promise.all(updatePromises);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        console.error('❌ Ocorreram erros ao atualizar alguns registros:', errors);
      } else {
        console.log('✅ Banco de Dados sincronizado com sucesso!');
      }

    } else {
      console.log('\n\n👉 Modo de "listagem apenas". Nenhuma alteração foi feita no banco de dados.');
      console.log('👉 Para aplicar essas correções, rode o script com a flag: node scripts/sync-db-with-storage.mjs --fix');
    }

  } catch (error) {
    console.error('\n❌ O script de sincronização falhou:', error.message);
    process.exit(1);
  }
}

runSync(); 