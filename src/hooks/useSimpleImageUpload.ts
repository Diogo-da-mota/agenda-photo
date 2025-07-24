
import { useState, useCallback } from 'react';
import { handleImageUpload } from '@/features/images/services';
import { toast } from '@/hooks/use-toast';

interface UseSimpleImageUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
  maxSize?: number; // MB
}

export const useSimpleImageUpload = (options: UseSimpleImageUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File) => {
    if (!file) {
      const errorMsg = "Nenhum arquivo fornecido para upload.";
      setError(errorMsg);
      options.onError?.(errorMsg);
      return null;
    }

    // Validação de tamanho
    const maxSizeMB = options.maxSize || 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      const errorMsg = `Arquivo muito grande (${(file.size / (1024 * 1024)).toFixed(1)}MB). Máximo: ${maxSizeMB}MB.`;
      setError(errorMsg);
      options.onError?.(errorMsg);
      toast({
        title: "Erro no upload",
        description: errorMsg,
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const url = await handleImageUpload(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (url) {
        options.onSuccess?.(url);
        toast({
          title: "Upload concluído",
          description: "Sua imagem foi enviada com sucesso.",
        });
      }
      
      return url;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido no upload";
      setError(errorMsg);
      options.onError?.(errorMsg);
      toast({
        title: "Erro no upload",
        description: errorMsg,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [options]);

  const resetUpload = useCallback(() => {
    setError(null);
    setProgress(0);
    setIsUploading(false);
  }, []);

  return {
    uploadImage,
    resetUpload,
    isUploading,
    progress,
    error
  };
};
