
import { useState } from 'react';
import { imageService } from './imageService';

export const useImageStorage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await imageService.uploadImage(file, userId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no upload';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getImages = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const images = await imageService.getImages(userId);
      return images;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar imagens';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadImage,
    getImages,
    loading,
    error
  };
};

// Funções auxiliares para compatibilidade
export async function uploadSingleImage(file: File, options: any) {
  try {
    if (options.validateFile) options.validateFile(file);

    if (options.onProgress) options.onProgress(10, 'Validando imagem...');
    if (options.onProgress) options.onProgress(30, 'Comprimindo imagem...');

    // Mock upload - retorna URL simulada
    const imageUrl = URL.createObjectURL(file);

    if (options.generateThumbnails && imageUrl) {
      if (options.onProgress) options.onProgress(90, 'Gerando miniatura...');
    }

    if (options.onSuccess) options.onSuccess(imageUrl);
    if (options.onProgress) options.onProgress(100, 'Upload concluído!');

    return { url: imageUrl };
  } catch (err) {
    if (options.onError) options.onError(err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function uploadFilesBatch(files: File[], processFn: any) {
  return await processFn(files);
}
