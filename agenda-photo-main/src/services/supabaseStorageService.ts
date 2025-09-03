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
  maxConcurrent?: number; // ✅ Máximo de uploads simultâneos (padrão: dinâmico 3-10)
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

// Configuração específica para anexos de contrato
const CONTRACT_STORAGE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
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
 * ✅ OTIMIZADO: Suporte a uploads paralelos para melhor performance
 */
export const uploadFilesToSupabase = async (
  files: File[],
  options: SupabaseStorageOptions = {}
): Promise<SupabaseStorageResponse> => {
  const bucketName = options.bucket || STORAGE_CONFIG.defaultBucket;
  const upsert = options.upsert || false;
  const maxConcurrent = options.maxConcurrent || Math.min(10, Math.max(3, Math.ceil(files.length / 5))); // Dinâmico: 3-10 baseado na quantidade

  const response: SupabaseStorageResponse = {
    success: false,
    urls: [],
    errors: [],
    details: [],
  };

  try {
    // ETAPA DE VERIFICAÇÃO E CRIAÇÃO AUTOMÁTICA
    await ensureBucketExists(bucketName);

    logger.info(`[SupabaseStorage] Iniciando upload paralelo de ${files.length} arquivo(s) para o bucket "${bucketName}" (máx ${maxConcurrent} simultâneos)...`);

    // ✅ VALIDAÇÃO PRÉVIA - Filtrar arquivos válidos antes do upload
    const validFiles: { file: File; fileName: string; filePath: string }[] = [];
    
    for (const file of files) {
      // Validações
      if (file.size > STORAGE_CONFIG.maxFileSize) {
        response.errors.push({ file: file.name, error: `Arquivo excede o limite de ${STORAGE_CONFIG.maxFileSize / (1024 * 1024)}MB.` });
        continue;
      }
      if (!STORAGE_CONFIG.allowedTypes.includes(file.type)) {
        response.errors.push({ file: file.name, error: `Tipo de arquivo não é permitido.` });
        continue;
      }

      // Sanitização robusta do nome do arquivo
      const sanitizeFileName = (fileName: string): string => {
        const lastDotIndex = fileName.lastIndexOf('.');
        const name = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
        const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
        
        const sanitizedName = name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/[^a-zA-Z0-9\-_]/g, '_') // Substitui caracteres especiais por underscore
          .replace(/_{2,}/g, '_') // Remove underscores duplos
          .replace(/^_|_$/g, ''); // Remove underscores no início e fim
        
        return sanitizedName + extension;
      };
      
      const cleanFileName = sanitizeFileName(file.name);
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${cleanFileName}`;
      const filePath = options.pathPrefix 
        ? `${options.pathPrefix}/${uniqueFileName}`
        : uniqueFileName;

      validFiles.push({ file, fileName: cleanFileName, filePath });
    }

    if (validFiles.length === 0) {
      response.success = response.errors.length === 0;
      return response;
    }

    // ✅ UPLOAD PARALELO EM LOTES CONTROLADOS
    let uploadedCount = 0;
    
    for (let i = 0; i < validFiles.length; i += maxConcurrent) {
      const batch = validFiles.slice(i, i + maxConcurrent);
      
      logger.info(`[SupabaseStorage] Processando lote ${Math.floor(i / maxConcurrent) + 1} (${batch.length} arquivos)`);
      
      // Upload paralelo do lote atual
      const batchPromises = batch.map(async ({ file, fileName, filePath }) => {
        try {
          const { data, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, { cacheControl: '3600', upsert });

          if (uploadError) {
            return { success: false, file: file.name, error: uploadError.message };
          }

          if (!data?.path) {
            return { success: false, file: file.name, error: 'Falha no upload: o caminho do arquivo não foi retornado.' };
          }

          // Obter URL pública
          const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);

          if (!publicUrlData?.publicUrl) {
            return { success: false, file: file.name, error: 'Falha ao obter URL pública após o upload.' };
          }

          return { 
            success: true, 
            file: file.name, 
            url: publicUrlData.publicUrl, 
            data 
          };

        } catch (error: any) {
          return { success: false, file: file.name, error: error.message };
        }
      });

      // Aguardar conclusão do lote
      const batchResults = await Promise.all(batchPromises);
      
      // Processar resultados do lote
      for (const result of batchResults) {
        if (result.success) {
          response.urls.push(result.url);
          response.details?.push(result.data);
          uploadedCount++;
        } else {
          response.errors.push({ file: result.file, error: result.error });
        }
      }

      // Atualizar progresso
      if (options.onProgress) {
        const progress = {
          totalFiles: files.length,
          uploadedFiles: uploadedCount,
          percentage: Math.round((uploadedCount / validFiles.length) * 100),
          currentFileName: batch[batch.length - 1]?.fileName || '',
        };
        options.onProgress(progress);
      }
    }

  } catch (error: any) {
    logger.error('[SupabaseStorage] Falha crítica na operação de upload:', error);
    response.errors.push({ file: 'Operação Geral', error: error.message });
  }
  
  // Progresso final
  if (options.onProgress) {
    options.onProgress({
      totalFiles: files.length,
      uploadedFiles: response.urls.length,
      percentage: 100,
      currentFileName: '',
    });
  }

  response.success = response.errors.length === 0;
  logger.info(`[SupabaseStorage] Upload concluído: ${response.urls.length} sucessos, ${response.errors.length} erros`);
  
  return response;
}; 

/**
 * Realiza o upload de anexos de contrato para o Supabase Storage.
 * Aceita PDFs, documentos do Office e imagens.
 */
export const uploadContractAttachments = async (
  files: File[],
  options: SupabaseStorageOptions = {}
): Promise<SupabaseStorageResponse> => {
  const bucketName = options.bucket || 'contratos';
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

    logger.info(`[SupabaseStorage] Iniciando upload de ${files.length} anexo(s) de contrato para o bucket "${bucketName}"...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = {
        totalFiles: files.length,
        uploadedFiles: i,
        percentage: Math.round((i / files.length) * 100),
        currentFileName: file.name,
      };
      if (options.onProgress) options.onProgress(progress);

      // Validações específicas para anexos de contrato
      if (file.size > CONTRACT_STORAGE_CONFIG.maxFileSize) {
        response.errors.push({ file: file.name, error: `Arquivo excede o limite de ${CONTRACT_STORAGE_CONFIG.maxFileSize / (1024 * 1024)}MB.` });
        continue;
      }
      if (!CONTRACT_STORAGE_CONFIG.allowedTypes.includes(file.type)) {
        response.errors.push({ file: file.name, error: `Tipo de arquivo não é permitido para anexos de contrato.` });
        continue;
      }

      // Sanitização robusta do nome do arquivo
      const sanitizeFileName = (fileName: string): string => {
        // Separar nome e extensão
        const lastDotIndex = fileName.lastIndexOf('.');
        const name = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
        const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
        
        // Remover acentos e caracteres especiais
        const sanitizedName = name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/[^a-zA-Z0-9\-_]/g, '_') // Substitui caracteres especiais por underscore
          .replace(/_{2,}/g, '_') // Remove underscores duplos
          .replace(/^_|_$/g, ''); // Remove underscores no início e fim
        
        return sanitizedName + extension;
      };
      
      const cleanFileName = sanitizeFileName(file.name);
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

      // Verificar se o 'data' e 'path' existem
      if (!data?.path) {
        response.errors.push({ file: file.name, error: 'Falha no upload: o caminho do arquivo não foi retornado.' });
        continue;
      }

      // Obter a URL pública
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);

      if (publicUrlData?.publicUrl) {
        response.urls.push(publicUrlData.publicUrl);
        response.details?.push(data);
      } else {
        response.errors.push({ file: file.name, error: 'Falha ao obter URL pública após o upload.' });
      }
    }

  } catch (error: any) {
    logger.error('[SupabaseStorage] Falha crítica na operação de upload de anexos de contrato:', error);
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