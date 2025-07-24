import { useState, useCallback } from 'react';
import {
  uploadFilesToSupabase,
  SupabaseStorageResponse,
  SupabaseStorageProgress,
  SupabaseStorageOptions,
} from '@/services/supabaseStorageService';
import { logger } from '@/utils/logger';

// =================================
// 1. INTERFACES E TIPOS
// =================================

export interface SupabaseUploadState {
  isUploading: boolean;
  progress: SupabaseStorageProgress | null;
  error: string | null;
  results: SupabaseStorageResponse | null;
}

export interface UseSupabaseUploadOptions {
  onSuccess?: (response: SupabaseStorageResponse) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: SupabaseStorageProgress) => void;
  storageOptions?: SupabaseStorageOptions;
}

const initialState: SupabaseUploadState = {
  isUploading: false,
  progress: null,
  error: null,
  results: null,
};

// =================================
// 2. HOOK APRIMORADO
// =================================

export const useSupabaseStorageUpload = (options: UseSupabaseUploadOptions = {}) => {
  const [state, setState] = useState<SupabaseUploadState>(initialState);

  const { onSuccess, onError, onProgress, storageOptions } = options;

  const resetState = useCallback(() => {
    setState(initialState);
    logger.info('[useSupabaseStorageUpload] Estado resetado.');
  }, []);

  const uploadFiles = useCallback(async (files: File[], overrideOptions?: SupabaseStorageOptions) => {
    if (!files.length) return;

    logger.info(`[useSupabaseStorageUpload] Iniciando upload de ${files.length} arquivo(s).`);
    setState({ ...initialState, isUploading: true });

    const combinedOptions: SupabaseStorageOptions = {
      ...storageOptions,
      ...overrideOptions,
      onProgress: (progress) => {
        setState((prev) => ({ ...prev, progress }));
        if (onProgress) onProgress(progress);
      },
    };

    try {
      const response = await uploadFilesToSupabase(files, combinedOptions);

      setState((prev) => ({
        ...prev,
        results: response,
        error: response.success ? null : response.errors.map(e => e.error).join('; '),
      }));

      if (response.success) {
        if (onSuccess) onSuccess(response);
      } else {
        if (onError) onError(response.errors.map(e => e.error).join('; '));
      }
      return response;

    } catch (error: any) {
      const errorMessage = error.message || 'Ocorreu um erro desconhecido.';
      logger.error('[useSupabaseStorageUpload] Erro catastrófico no upload:', error);
      setState((prev) => ({
        ...prev,
        progress: null,
        error: errorMessage,
        results: null,
      }));
      if (onError) onError(errorMessage);
    } finally {
      setState((prev) => ({ ...prev, isUploading: false }));
    }
  }, [onSuccess, onError, onProgress, storageOptions]);

  return {
    uploadFiles,
    status: state,
    resetStatus: resetState,
  };
}; 