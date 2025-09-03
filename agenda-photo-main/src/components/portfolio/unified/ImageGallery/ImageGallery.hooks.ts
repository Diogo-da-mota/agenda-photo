
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { UseImageGalleryProps, UseImageGalleryReturn, ImageItem } from './ImageGallery.types';

export const useImageGallery = ({
  externalImages,
  onDelete,
  refreshTrigger = 0,
  searchTerm = '',
  maxItems,
  mode = 'private',
  enableCache = true
}: UseImageGalleryProps): UseImageGalleryReturn => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Normalizar imagens externas para o formato padrão
  const normalizeImages = (imgs: any[]): ImageItem[] => {
    return imgs.map(img => {
      if ('url' in img && 'id' in img) {
        return {
          id: img.id,
          url: img.url,
          alt: img.alt || `Imagem ${img.id}`,
          metadata: img.metadata
        } as ImageItem;
      }
      return img as ImageItem;
    });
  };

  // Carregar imagens
  const loadImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (externalImages) {
        // Usar imagens externas fornecidas
        const normalizedImages = normalizeImages(externalImages);
        setImages(normalizedImages);
      } else {
        // Carregar imagens da tabela 'imagens' consolidada
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Usuário não autenticado');
        }
        
        const { data: imagensData, error } = await supabase
          .from('imagens')
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        const normalizedImages = (imagensData || []).map(img => ({
          id: img.id,
          url: img.url,
          alt: `Imagem ${img.nome || img.id}`,
          metadata: {
            name: img.nome || 'Sem nome',
            size: undefined, // tabela imagens não tem filesize
            type: undefined  // tabela imagens não tem mimetype
          }
        }));
        
        setImages(normalizedImages);
      }
    } catch (err) {
      console.error('Erro ao carregar imagens:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar imagens');
    } finally {
      setIsLoading(false);
    }
  };

  // Recarregar imagens quando refreshTrigger mudar
  useEffect(() => {
    loadImages();
  }, [refreshTrigger, externalImages]);

  // Filtrar imagens baseado no termo de busca
  const filteredImages = useMemo(() => {
    let filtered = images;
    
    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar limite máximo de itens
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }
    
    return filtered;
  }, [images, searchTerm, maxItems]);

  // Função para deletar imagem
  const handleDelete = async (imageId: string, imageUrl: string) => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      
      let success = false;
      
      // Se um manipulador de exclusão personalizado foi fornecido, use-o
      if (onDelete) {
        onDelete(imageId);
        success = true;
      } else {
        // Caso contrário, use a função padrão de exclusão usando tabela 'imagens'
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Usuário não autenticado');
        }
        
        // Busca o registro da imagem pelo ID
        const { data, error: fetchError } = await supabase
          .from('imagens')
          .select('id')
          .eq('id', imageId)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError || !data) {
          console.error('Erro ao buscar imagem:', fetchError);
          success = false;
        } else {
          // Exclui o registro do banco de dados
          const { error: deleteError } = await supabase
            .from('imagens')
            .delete()
            .eq('id', data.id);
          
          success = !deleteError;
        }
      }
      
      if (success) {
        setImages(prev => prev.filter(img => img.id !== imageId));
      } else {
        setError('Não foi possível excluir a imagem');
      }
    } catch (err) {
      console.error('Erro ao excluir imagem:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir imagem');
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para visualizar imagem em nova aba
  const handleView = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  // Função para recarregar imagens
  const refetch = () => {
    loadImages();
  };

  return {
    images,
    isLoading,
    error,
    isDeleting,
    handleDelete,
    handleView,
    filteredImages,
    refetch
  };
}; 
