
import { useState } from 'react';

interface ImageData {
  id: string;
  url: string;
  user_id: string;
  filename?: string;
  filesize?: number;
  mimetype?: string;
  created_at: string;
}

export const useImageStore = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);

  const addImage = (image: ImageData) => {
    setImages(prev => [...prev, image]);
  };

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const getImages = async (userId: string): Promise<ImageData[]> => {
    setLoading(true);
    try {
      // Mock data - em um ambiente real seria uma consulta ao Supabase
      // Log removido por segurança - não expor userId
      return [];
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    images,
    loading,
    addImage,
    removeImage,
    getImages
  };
};
