/**
 * ✅ SERVIÇO S3 PROFISSIONAL OTIMIZADO
 * Integração Amazon S3 + Supabase para múltiplos usuários
 * Uploads concorrentes controlados + Retry automático
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import axios, { AxiosProgressEvent } from 'axios';

// ============================================
// INTERFACES E TIPOS PROFISSIONAIS
// ============================================

export interface S3UploadResponse {
  success: boolean;
  urls?: string[];
  error?: string;
  message?: string;
  details?: {
    successful: number;
    failed: number;
    errors?: string[];
    uploadTime?: number;
    averageSpeed?: string;
  };
}

export interface S3UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentFile: string;
  completedFiles: number;
  totalFiles: number;
  estimatedTimeRemaining?: number;
  currentSpeed?: string;
}

export interface S3UploadOptions {
  concurrent?: boolean;         // Upload concorrente (padrão: true)
  maxConcurrent?: number;       // Máximo simultâneo (padrão: 20)
  retryAttempts?: number;       // Tentativas de retry (padrão: 3)
  compressionQuality?: number;  // Qualidade compressão (padrão: 0.8)
  enableCompression?: boolean;  // Ativar compressão (padrão: true)
  chunkSize?: number;          // Tamanho do chunk para arquivos grandes (padrão: 5MB)
}

export interface S3FileMetadata {
  titulo?: string;
  categoria?: string;
  local?: string;
  descricao?: string;
  portfolioId?: string;
  source?: string;
  compressed?: boolean;
  originalSize?: number;
  [key: string]: any;
}

// ============================================
// CONFIGURAÇÕES OTIMIZADAS
// ============================================

const S3_CONFIG = {
  maxFileSize: 10 * 1024 * 1024,           // 10MB por arquivo
  maxConcurrentUploads: 5,                  // Máximo de uploads simultâneos
  maxUserStorage: 3 * 1024 * 1024 * 1024,  // 3GB por usuário
  allowedTypes: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'image/heic', 'image/avif'              // Tipos modernos
  ],
  retryDelay: 1000,                         // 1 segundo entre retries
  compressionQuality: 0.8,                  // 80% qualidade
  chunkSize: 5 * 1024 * 1024,              // 5MB chunks para large files
  edgeFunctionUrl: '/functions/v1/s3-upload' // Usar Edge Function S3
};

// ============================================
// COMPRESSÃO DE IMAGENS
// ============================================

/**
 * Comprime uma imagem mantendo qualidade
 */
const compressImage = async (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calcular dimensões otimizadas
      const maxDimension = 2048; // 2K max
      let { width, height } = img;
      
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Desenhar e comprimir
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File(
              [blob], 
              file.name, 
              { 
                type: file.type, 
                lastModified: file.lastModified 
              }
            );
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback para arquivo original
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => resolve(file); // Fallback para arquivo original
    img.src = URL.createObjectURL(file);
  });
};

// ============================================
// VALIDAÇÕES PROFISSIONAIS
// ============================================

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Verificar tamanho
  if (file.size > S3_CONFIG.maxFileSize) {
    return {
      isValid: false,
      error: `Arquivo ${file.name} excede ${S3_CONFIG.maxFileSize / (1024 * 1024)}MB`
    };
  }

  // Verificar tipo
  if (!S3_CONFIG.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo ${file.type} não permitido. Aceitos: ${S3_CONFIG.allowedTypes.join(', ')}`
    };
  }

  // Verificar nome
  if (file.name.length > 255) {
    return {
      isValid: false,
      error: `Nome muito longo: ${file.name}`
    };
  }

  return { isValid: true };
};

export const validateFiles = (files: File[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (files.length === 0) {
    errors.push('Nenhum arquivo selecionado');
    return { isValid: false, errors };
  }

  // ✅ CORREÇÃO: Removida limitação de 50 arquivos para permitir uploads ilimitados

  // Validar cada arquivo
  files.forEach(file => {
    const validation = validateFile(file);
    if (!validation.isValid && validation.error) {
      errors.push(validation.error);
    }
  });

  // Verificar tamanho total
  const totalSize = files.reduce((total, file) => total + file.size, 0);
  if (totalSize > S3_CONFIG.maxUserStorage) {
    errors.push(`Tamanho total excede ${S3_CONFIG.maxUserStorage / (1024 * 1024 * 1024)}GB`);
  }

  return { isValid: errors.length === 0, errors };
};

// ============================================
// UPLOAD CONCORRENTE PROFISSIONAL
// ============================================

/**
 * Upload múltiplo concorrente com controle de recursos
 */
export const uploadMultipleFilesConcurrent = async (
  files: File[],
  metadata: S3FileMetadata = {},
  onProgress?: (progress: S3UploadProgress) => void,
  options: S3UploadOptions = {}
): Promise<S3UploadResponse> => {
  const startTime = Date.now();
  
    const { 
    concurrent = true,
    maxConcurrent = 3,
    retryAttempts = 3,
    compressionQuality = 0.8,
    enableCompression = true
    } = options;

  try {
    logger.info('[S3Service] Iniciando upload concorrente otimizado:', {
      quantidade: files.length,
      concurrent,
      maxConcurrent,
      enableCompression
    });

    // Validar arquivos
    const validation = validateFiles(files);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join('; '),
        message: 'Validação falhou'
      };
    }

    // Obter autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return {
        success: false,
        error: 'Usuário não autenticado',
        message: 'Login necessário'
      };
    }

    // Comprimir arquivos se habilitado
    let processedFiles = files;
    if (enableCompression) {
      logger.info('[S3Service] Comprimindo imagens...');
      processedFiles = await Promise.all(
        files.map(file => 
          file.type.startsWith('image/') 
            ? compressImage(file, compressionQuality)
            : Promise.resolve(file)
        )
      );
    }

    const totalSize = processedFiles.reduce((total, file) => total + file.size, 0);
    const uploadedUrls: string[] = [];
    const failedFiles: string[] = [];
    let completedFiles = 0;
    let uploadedSize = 0;

    // Função para upload individual com retry
    const uploadSingleWithRetry = async (file: File, index: number): Promise<string | null> => {
      for (let attempt = 1; attempt <= retryAttempts; attempt++) {
        try {
          const result = await uploadSingleFileInternal(
          file, 
            { ...metadata, compressed: enableCompression && file.type.startsWith('image/') },
          session.access_token,
          (fileProgress) => {
              const globalProgress: S3UploadProgress = {
                loaded: uploadedSize + fileProgress.loaded,
                total: totalSize,
                percentage: Math.round(((uploadedSize + fileProgress.loaded) / totalSize) * 100),
                currentFile: file.name,
                completedFiles,
                totalFiles: files.length,
                currentSpeed: calculateSpeed(fileProgress.loaded, Date.now() - startTime)
              };
              onProgress?.(globalProgress);
            }
          );

          if (result.success && result.urls?.[0]) {
            return result.urls[0];
          } else {
            throw new Error(result.error || 'Upload falhou');
          }
        } catch (error) {
          logger.warn(`[S3Service] Tentativa ${attempt}/${retryAttempts} falhou para ${file.name}:`, error);
          
          if (attempt < retryAttempts) {
            await new Promise(resolve => setTimeout(resolve, S3_CONFIG.retryDelay * attempt));
        } else {
            throw error;
          }
        }
      }
      return null;
    };

    // Upload concorrente controlado
    if (concurrent && files.length > 1) {
      const batches = [];
      for (let i = 0; i < processedFiles.length; i += maxConcurrent) {
        batches.push(processedFiles.slice(i, i + maxConcurrent));
        }

      for (const batch of batches) {
        const batchPromises = batch.map(async (file, localIndex) => {
          try {
            const url = await uploadSingleWithRetry(file, localIndex);
            if (url) {
              uploadedUrls.push(url);
              uploadedSize += file.size;
              completedFiles++;
              logger.info(`[S3Service] ✅ Upload concorrente: ${file.name}`);
            } else {
              failedFiles.push(file.name);
            }
          } catch (error) {
            logger.error(`[S3Service] ❌ Falha no upload: ${file.name}`, error);
            failedFiles.push(file.name);
          }
        });

        await Promise.all(batchPromises);
        
        // Pequena pausa entre batches para não sobrecarregar
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } else {
      // Upload sequencial
      for (let i = 0; i < processedFiles.length; i++) {
        const file = processedFiles[i];
        try {
          const url = await uploadSingleWithRetry(file, i);
          if (url) {
            uploadedUrls.push(url);
            uploadedSize += file.size;
            completedFiles++;
          } else {
            failedFiles.push(file.name);
          }
      } catch (error) {
          logger.error(`[S3Service] Falha no upload sequencial: ${file.name}`, error);
        failedFiles.push(file.name);
        }
      }
    }

    // Progresso final
    onProgress?.({
        loaded: totalSize,
        total: totalSize,
        percentage: 100,
        currentFile: 'Concluído',
        completedFiles: uploadedUrls.length,
        totalFiles: files.length
      });

    const uploadTime = Date.now() - startTime;
    const averageSpeed = calculateSpeed(uploadedSize, uploadTime);

    const result: S3UploadResponse = {
      success: uploadedUrls.length > 0,
      urls: uploadedUrls,
      details: {
        successful: uploadedUrls.length,
        failed: failedFiles.length,
        errors: failedFiles.length > 0 ? failedFiles : undefined,
        uploadTime,
        averageSpeed
      },
      message: uploadedUrls.length === files.length 
        ? `✅ ${uploadedUrls.length} arquivos enviados com sucesso em ${(uploadTime/1000).toFixed(1)}s`
        : `⚠️ ${uploadedUrls.length}/${files.length} arquivos enviados`
    };

    logger.info('[S3Service] Upload concorrente concluído:', result.details);
    return result;

  } catch (error) {
    logger.error('[S3Service] Erro no upload concorrente:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: 'Falha no upload concorrente'
    };
  }
};

// ============================================
// UTILITÁRIOS
// ============================================

const calculateSpeed = (bytes: number, timeMs: number): string => {
  const speedBps = (bytes / timeMs) * 1000; // bytes per second
  if (speedBps > 1024 * 1024) {
    return `${(speedBps / (1024 * 1024)).toFixed(1)} MB/s`;
  } else if (speedBps > 1024) {
    return `${(speedBps / 1024).toFixed(1)} KB/s`;
  } else {
    return `${speedBps.toFixed(0)} B/s`;
  }
};

// Upload interno individual (mantido para compatibilidade)
const uploadSingleFileInternal = async (
  file: File,
  metadata: S3FileMetadata = {},
  accessToken: string,
  onProgress?: (progress: S3UploadProgress) => void
): Promise<S3UploadResponse> => {
  const { retryAttempts = 3, enableCompression = true, compressionQuality = 0.8 } = {};

  try {
    logger.info(`[S3Service] Upload single file: ${file.name}`);

    const finalFile = enableCompression ? await compressImage(file, compressionQuality) : file;

    const formData = new FormData();
    formData.append('files', finalFile);
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const url = `${import.meta.env.VITE_SUPABASE_URL}${S3_CONFIG.edgeFunctionUrl}`;
    
    return await uploadWithRetry(url, formData, accessToken, onProgress, finalFile.size, retryAttempts);

  } catch (error: any) {
    logger.error(`[S3Service] Erro no upload single file: ${file.name}`, error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido',
      message: 'Falha no upload do arquivo'
    };
  }
};

const uploadWithRetry = async (
  url: string,
  formData: FormData,
  accessToken: string,
  onProgress?: (progress: S3UploadProgress) => void,
  totalSize?: number,
  maxRetries: number = 3
): Promise<S3UploadResponse> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post<S3UploadResponse>(url, formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-Id': (await supabase.auth.getUser()).data.user?.id
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100),
              currentFile: 'Enviando...',
              completedFiles: 0,
              totalFiles: 1
            });
          }
        },
        timeout: 5 * 60 * 1000 // 5 minutos timeout
      });

      logger.info(`[S3Service] Tentativa ${attempt} bem-sucedida.`);
      return response.data;
    } catch (error: any) {
      if (attempt === maxRetries) {
        logger.error(`[S3Service] Falha no upload após ${maxRetries} tentativas.`, error);
        return {
          success: false,
          error: error.response?.data?.error || error.message || 'Erro de rede',
          message: 'Falha no upload após múltiplas tentativas'
        };
      }
      
      logger.warn(`[S3Service] Tentativa ${attempt} falhou. Retentando em ${S3_CONFIG.retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, S3_CONFIG.retryDelay));
    }
  }

  // Fallback de segurança (não deve ser alcançado)
  return { success: false, error: 'Erro inesperado no upload' };
};

// ============================================
// EXPORTS PRINCIPAIS
// ============================================

export const uploadSingleFile = uploadMultipleFilesConcurrent;
export const uploadMultipleFiles = uploadMultipleFilesConcurrent;

// Funções de compatibilidade e utilidades
export const getS3Info = () => S3_CONFIG;

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const extractFileNameFromS3Url = (url: string): string => {
  try {
    const urlObject = new URL(url);
    const pathSegments = urlObject.pathname.split('/');
    return pathSegments.pop() || '';
  } catch (error) {
    logger.warn(`[S3Service] URL inválida para extração de nome: ${url}`, error);
    // Fallback para extração simples
    const parts = url.split('/');
    return parts[parts.length - 1] || '';
  }
};