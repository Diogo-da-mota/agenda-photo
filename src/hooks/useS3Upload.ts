import { useState, useCallback } from 'react';
import { 
  uploadMultipleFilesConcurrent, 
  S3UploadResponse, 
  S3UploadProgress,
  S3FileMetadata,
  S3UploadOptions,
  validateFiles
} from '@/services/s3Service';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

/**
 * Interface para status do upload S3 com progresso sequencial
 */
export interface S3UploadStatus {
  isUploading: boolean;
  progress: S3UploadProgress | null;
  uploadedUrls: string[];
  failedFiles: string[];
  totalFiles: number;
  results: S3UploadResponse | null;
  // Novos campos para upload sequencial
  currentFileIndex: number;
  currentFileName: string;
  sequentialMode: boolean;
}

/**
 * Interface para opções do hook
 */
export interface UseS3UploadOptions {
  showToasts?: boolean;
  autoReset?: boolean;
  onSuccess?: (urls: string[]) => void;
  onError?: (error: string) => void;
  onProgress?: (status: S3UploadStatus) => void;
  // Opções de upload sequencial
  uploadOptions?: S3UploadOptions;
}

/**
 * Hook para gerenciar uploads para Amazon S3 com suporte sequencial
 */
export const useS3Upload = (options: UseS3UploadOptions = {}) => {
  const { 
    showToasts = true, 
    autoReset = true,
    onSuccess,
    onError,
    onProgress,
    uploadOptions = {}
  } = options;

  const { toast } = useToast();
  
  const [status, setStatus] = useState<S3UploadStatus>({
    isUploading: false,
    progress: null,
    uploadedUrls: [],
    failedFiles: [],
    totalFiles: 0,
    results: null,
    currentFileIndex: 0,
    currentFileName: '',
    sequentialMode: true
  });

  /**
   * Reset do status
   */
  const resetStatus = useCallback(() => {
    const newStatus: S3UploadStatus = {
      isUploading: false,
      progress: null,
      uploadedUrls: [],
      failedFiles: [],
      totalFiles: 0,
      results: null,
      currentFileIndex: 0,
      currentFileName: '',
      sequentialMode: true
    };
    
    setStatus(newStatus);
    logger.info('[useS3Upload] Status resetado');
  }, []);

  /**
   * Atualiza status e notifica callbacks
   */
  const updateStatus = useCallback((newStatus: Partial<S3UploadStatus>) => {
    setStatus(prevStatus => {
      const updatedStatus = { ...prevStatus, ...newStatus };
      
      if (onProgress) {
        onProgress(updatedStatus);
      }
      
      return updatedStatus;
    });
  }, [onProgress]);

  /**
   * Upload de múltiplos arquivos com modo concorrente
   */
  const uploadFiles = useCallback(async (
    files: File[],
    metadata: S3FileMetadata = {}
  ): Promise<{ success: boolean; urls: string[]; errors: string[] }> => {
    try {
      logger.info('[useS3Upload] Iniciando upload de arquivos:', {
        quantidade: files.length,
        uploadOptions,
        metadata
      });

      if (!files || files.length === 0) {
        const error = 'Nenhum arquivo selecionado para upload';
        if (showToasts) {
          toast({
            title: 'Erro',
            description: error,
            variant: 'destructive'
          });
        }
        if (onError) onError(error);
        return { success: false, urls: [], errors: [error] };
      }

      const validation = validateFiles(files);
      if (!validation.isValid) {
        const errorMessage = validation.errors.join('; ');
        
        if (showToasts) {
          toast({
            title: 'Arquivos inválidos',
            description: errorMessage,
            variant: 'destructive'
          });
        }
        
        if (onError) onError(errorMessage);
        return { success: false, urls: [], errors: validation.errors };
      }

      updateStatus({
        isUploading: true,
        totalFiles: files.length,
        uploadedUrls: [],
        failedFiles: [],
        results: null,
        currentFileIndex: 0,
        currentFileName: files[0]?.name || '',
        sequentialMode: true,
        progress: {
          loaded: 0,
          total: files.reduce((sum, file) => sum + file.size, 0),
          percentage: 0,
          currentFile: files[0]?.name || '',
          completedFiles: 0,
          totalFiles: files.length
        }
      });

      if (showToasts) {
        
      }

      const result = await uploadMultipleFilesConcurrent(
        files,
        metadata,
        (progress) => {
          updateStatus({ progress });
        },
        uploadOptions
      );

      updateStatus({
        isUploading: false,
        uploadedUrls: result.urls,
        failedFiles: result.details?.errors || [],
        results: result,
      });

      if (result.success) {
        if (showToasts) {
          
        }
        if (onSuccess) onSuccess(result.urls || []);
      } else {
        const errorMessage = result.error || 'Falha no upload sequencial';
        
        if (showToasts) {
          toast({
            title: 'Erro no upload',
            description: `❌ ${errorMessage} (${result.urls?.length}/${files.length} arquivos enviados)`,
            variant: 'destructive',
            duration: 7000
          });
        }
        
        if (onError) onError(errorMessage);
      }

      if (autoReset) {
        setTimeout(resetStatus, 3000);
      }

      return { 
        success: result.success, 
        urls: result.urls || [], 
        errors: result.details?.errors || []
      };

    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no upload sequencial';
      
      logger.error('[useS3Upload] Erro no upload:', error);

      updateStatus({
        isUploading: false,
        currentFileName: 'Erro',
        results: {
          success: false,
          error: errorMessage,
          message: 'Erro inesperado no upload sequencial'
        }
      });

      if (showToasts) {
        toast({
          title: 'Erro inesperado',
          description: `💥 ${errorMessage}`,
          variant: 'destructive',
          duration: 7000
        });
      }

      if (onError) onError(errorMessage);

      return { success: false, urls: [], errors: [errorMessage] };
    }
  }, [showToasts, onSuccess, onError, updateStatus, autoReset, resetStatus, toast, uploadOptions]);

  /**
   * Upload de arquivo único
   */
  const uploadSingleFileHook = useCallback(async (
    file: File,
    metadata: S3FileMetadata = {}
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    logger.info('[useS3Upload] Upload de arquivo único:', file.name);

    const result = await uploadFiles([file], metadata);

    return {
      success: result.success,
      url: result.urls[0],
      error: result.errors[0]
    };
  }, [uploadFiles]);

  /**
   * Cancela upload atual (se possível)
   */
  const cancelUpload = useCallback(() => {
    logger.warn('[useS3Upload] Tentativa de cancelamento - não implementado para Amazon S3');
    
    if (showToasts) {
      
    }

    // TODO: Implementar cancelamento se necessário
    // Por enquanto, apenas resetar status
    resetStatus();
  }, [showToasts, resetStatus, toast]);

  /**
   * Verifica se pode fazer upload
   */
  const canUpload = useCallback((): boolean => {
    return !status.isUploading;
  }, [status.isUploading]);

  return {
    // Estado
    status,
    isUploading: status.isUploading,
    progress: status.progress,
    uploadedUrls: status.uploadedUrls,
    failedFiles: status.failedFiles,
    results: status.results,

    // Novos campos sequenciais
    currentFileIndex: status.currentFileIndex,
    currentFileName: status.currentFileName,
    sequentialMode: status.sequentialMode,

    // Métodos
    uploadFiles,
    uploadSingleFile: uploadSingleFileHook,
    resetStatus,
    cancelUpload,
    canUpload,

    // Utilitários
    hasErrors: status.failedFiles.length > 0,
    hasSuccessfulUploads: status.uploadedUrls.length > 0,
    completionPercentage: status.progress?.percentage || 0,
    
    // Informações sequenciais
    getSequentialStatus: () => ({
      current: status.currentFileIndex + 1,
      total: status.totalFiles,
      fileName: status.currentFileName,
      percentage: status.progress?.percentage || 0
    })
  };
}; 