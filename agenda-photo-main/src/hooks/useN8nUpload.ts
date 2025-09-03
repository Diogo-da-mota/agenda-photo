import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

// ✅ MIGRAÇÃO SUPABASE - Interfaces compatíveis com N8N para manter compatibilidade
export interface N8NUploadResult {
  success: boolean;
  url?: string;
  message?: string;
  [key: string]: unknown;
}

export interface N8NUploadStatus {
  isUploading: boolean;
  progress: number;
  uploadedFiles: string[];
  failedFiles: string[];
  totalFiles: number;
  results: N8NUploadResult[];
}

export interface UseN8nUploadOptions {
  enabled?: boolean;
  portfolioTitle?: string;
  category?: string;
  description?: string;
  tags?: string[];
  onProgress?: (status: N8NUploadStatus) => void;
}

export const useN8nUpload = (options: UseN8nUploadOptions = {}) => {
  logger.info('[useN8nUpload] ✅ Hook simplificado - Sistema usa Amazon S3');

  const [status, setStatus] = useState<N8NUploadStatus>({
    isUploading: false,
    progress: 0,
    uploadedFiles: [],
    failedFiles: [],
    totalFiles: 0,
    results: []
  });

  const uploadFiles = useCallback(async (files: File[]) => {
    logger.info('[useN8nUpload] Simulando upload (Sistema usa Amazon S3)');
    
    setStatus(prev => ({
      ...prev,
      isUploading: true,
      totalFiles: files.length,
      uploadedFiles: [],
      failedFiles: []
    }));

    // Simular upload já que sistema usa Amazon S3
    setTimeout(() => {
      setStatus(prev => ({
        ...prev,
        isUploading: false,
        uploadedFiles: files.map(f => f.name),
        results: files.map(f => ({ success: true, url: f.name, message: 'Upload simulado' }))
      }));
    }, 1000);

    return {
      success: true,
      results: files.map(f => ({
        success: true,
        url: f.name,
        message: 'Upload simulado (Sistema usa Amazon S3)'
      }))
    };
  }, [options]);

  const uploadSingleFile = useCallback(async (file: File) => {
    const result = await uploadFiles([file]);
    return {
      success: result.success,
      url: result.results[0]?.url,
      message: result.success ? 'Upload simulado bem-sucedido' : 'Erro no upload simulado'
    };
  }, [uploadFiles]);

  const resetStatus = useCallback(() => {
    setStatus({
      isUploading: false,
      progress: 0,
      uploadedFiles: [],
      failedFiles: [],
      totalFiles: 0,
      results: []
    });
  }, []);

  return {
    uploadFiles,
    uploadSingleFile,
    status,
    resetStatus,
    isUploading: status.isUploading
  };
};