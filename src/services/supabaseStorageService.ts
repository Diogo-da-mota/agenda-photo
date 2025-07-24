import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

// =================================
// 1. INTERFACES E TIPOS
// =================================

/**
 * Resposta da operação de upload para o Supabase Storage.
 */
export interface SupabaseStorageResponse {
  success: boolean;
  urls: string[];
  errors: { file: string; error: string }[];
  details?: any[];
}

/**
 * Progresso do upload.
 */
export interface SupabaseStorageProgress {
  totalFiles: number;
  uploadedFiles: number;
  percentage: number;
  currentFileName: string;
}

/**
 * Opções para a operação de upload.
 */
export interface SupabaseStorageOptions {
  bucket?: string;
  pathPrefix?: string; // Ex: 'portfolio/user-id/project-title'
  upsert?: boolean;
  onProgress?: (progress: SupabaseStorageProgress) => void;
}

// =================================
// 2. CONFIGURAÇÕES
// =================================

const STORAGE_CONFIG = {
  defaultBucket: 'imagens', // Bucket padrão corrigido para manter consistência
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

// =================================
// 3. LÓGICA DE UPLOAD ROBUSTA
// =================================

/**
 * Garante que um bucket exista, criando-o se necessário.
 * @param bucketName - O nome do bucket a ser verificado/criado.
 */
const ensureBucketExists = async (bucketName: string): Promise<void> => {
  logger.info(`[SupabaseStorage] Verificando existência do bucket "${bucketName}"...`);
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Não foi possível listar os buckets: ${listError.message}`);
  }

  const bucketExists = buckets.some((bucket) => bucket.name === bucketName);

  if (bucketExists) {
    logger.info(`[SupabaseStorage] ✅ Bucket "${bucketName}" já existe.`);
    return;
  }

  logger.warn(`[SupabaseStorage] ⚠️ Bucket "${bucketName}" não encontrado. Tentando criar...`);

  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    public: true, // Buckets são públicos para visualização de imagens
  });

  if (createError) {
    // Ignora o erro se o bucket já existir (condição de corrida)
    if (createError.message.includes('already exists')) {
        logger.info(`[SupabaseStorage] ✅ Bucket "${bucketName}" foi criado por outro processo.`);
        return;
    }
    throw new Error(`Falha ao criar o bucket "${bucketName}": ${createError.message}`);
  }

  logger.info(`[SupabaseStorage] ✅ Bucket "${bucketName}" criado com sucesso.`);
};

/**
 * Realiza o upload de arquivos para o Supabase Storage com criação automática de bucket.
 */
export const uploadFilesToSupabase = async (
  files: File[],
  options: SupabaseStorageOptions = {}
): Promise<SupabaseStorageResponse> => {
  const bucketName = options.bucket || STORAGE_CONFIG.defaultBucket;
  const upsert = options.upsert || false;

  const response: SupabaseStorageResponse = {
    success: false,
    urls: [],
    errors: [],
    details: [],
  };

  try {
    // ETAPA DE VERIFICAÇÃO E CRIAÇÃO AUTOMÁTICA
    await ensureBucketExists(bucketName);

    logger.info(`[SupabaseStorage] Iniciando upload de ${files.length} arquivo(s) para o bucket "${bucketName}"...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = {
        totalFiles: files.length,
        uploadedFiles: i,
        percentage: Math.round((i / files.length) * 100),
        currentFileName: file.name,
      };
      if (options.onProgress) options.onProgress(progress);

      // Validações
      if (file.size > STORAGE_CONFIG.maxFileSize) {
        response.errors.push({ file: file.name, error: `Arquivo excede o limite de ${STORAGE_CONFIG.maxFileSize / (1024 * 1024)}MB.` });
        continue;
      }
      if (!STORAGE_CONFIG.allowedTypes.includes(file.type)) {
        response.errors.push({ file: file.name, error: `Tipo de arquivo não é permitido.` });
        continue;
      }

      const cleanFileName = file.name.replace(/\s/g, '_');
      const uniqueFileName = `${Date.now()}-${cleanFileName}`;
      const filePath = options.pathPrefix 
        ? `${options.pathPrefix}/${uniqueFileName}`
        : uniqueFileName;

      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: '3600', upsert });

      if (uploadError) {
        response.errors.push({ file: file.name, error: uploadError.message });
        continue;
      }

      // Adicionado para robustez: verificar se o 'data' e 'path' existem
      if (!data?.path) {
        response.errors.push({ file: file.name, error: 'Falha no upload: o caminho do arquivo não foi retornado.' });
        continue;
      }

      // Forma mais segura de obter a URL pública
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);

      if (publicUrlData?.publicUrl) {
        response.urls.push(publicUrlData.publicUrl);
        response.details?.push(data);
      } else {
        response.errors.push({ file: file.name, error: 'Falha ao obter URL pública após o upload.' });
      }
    }

  } catch (error: any) {
    logger.error('[SupabaseStorage] Falha crítica na operação de upload:', error);
    response.errors.push({ file: 'Operação Geral', error: error.message });
  }
  
  if (options.onProgress) {
    options.onProgress({
      totalFiles: files.length,
      uploadedFiles: files.length - response.errors.length,
      percentage: 100,
      currentFileName: '',
    });
  }

  response.success = response.errors.length === 0;
  return response;
}; 