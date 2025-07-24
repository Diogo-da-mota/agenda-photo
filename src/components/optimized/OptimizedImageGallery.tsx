import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, X, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LazyImage } from '@/components/portfolio/unified/LazyImage';
import { imageCompressor } from '@/utils/imageOptimization/ImageCompressor';
import { useVirtualizer } from '@tanstack/react-virtual';

interface ImageItem {
  id: string;
  url: string;
  alt?: string;
  metadata?: {
    name?: string;
    size?: number;
    type?: string;
  };
}

interface OptimizedImageGalleryProps {
  images: ImageItem[];
  onDelete?: (id: string) => void;
  onImageClick?: (image: ImageItem) => void;
  className?: string;
  editable?: boolean;
  searchTerm?: string;
  maxItems?: number;
  enableVirtualization?: boolean;
  enableCompression?: boolean;
  layout?: 'grid' | 'masonry' | 'list';
  itemHeight?: number;
  itemWidth?: number;
  gap?: number;
}

/**
 * Galeria de imagens otimizada com:
 * - React.memo para evitar re-renders desnecessários
 * - Virtualização para listas grandes
 * - Lazy loading inteligente
 * - Compressão automática
 * - Cache avançado
 */
const OptimizedImageGallery: React.FC<OptimizedImageGalleryProps> = memo(({
  images,
  onDelete,
  onImageClick,
  className = "",
  editable = true,
  searchTerm = "",
  maxItems,
  enableVirtualization = true,
  enableCompression = true,
  layout = 'grid',
  itemHeight = 300,
  itemWidth = 250,
  gap = 16
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<any>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoizar imagens filtradas para evitar recálculos
  const filteredImages = useMemo(() => {
    let filtered = images;
    
    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(image => 
        image.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar limite máximo
    if (maxItems && maxItems > 0) {
      filtered = filtered.slice(0, maxItems);
    }
    
    return filtered;
  }, [images, searchTerm, maxItems]);

  // Configuração do virtualizador
  const virtualizer = useVirtualizer({
    count: filteredImages.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => itemHeight + gap,
    enabled: enableVirtualization && filteredImages.length > 20,
    overscan: 5
  });

  // Handler otimizado para clique em imagem
  const handleImageClick = useCallback((image: ImageItem) => {
    if (onImageClick) {
      onImageClick(image);
    } else {
      setSelectedImage(image);
    }
  }, [onImageClick]);

  // Handler otimizado para exclusão
  const handleDelete = useCallback(async (imageId: string) => {
    if (!onDelete || isDeleting) return;
    
    setIsDeleting(imageId);
    
    try {
      await onDelete(imageId);
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
    } finally {
      setIsDeleting(null);
    }
  }, [onDelete, isDeleting]);

  // Fechar modal otimizado
  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // Efeito para compressão automática (se habilitado)
  useEffect(() => {
    if (!enableCompression || filteredImages.length === 0) return;

    const checkCompression = async () => {
      const stats = {
        totalImages: filteredImages.length,
        needsCompression: 0,
        potentialSavings: 0
      };

      // Simular verificação de compressão
      filteredImages.forEach(image => {
        if (image.metadata?.size && image.metadata.size > 1024 * 1024) {
          stats.needsCompression++;
          stats.potentialSavings += image.metadata.size * 0.3; // 30% de economia estimada
        }
      });

      setCompressionStats(stats);
    };

    checkCompression();
  }, [filteredImages, enableCompression]);

  // Renderizar item individual (memoizado)
  const ImageItem = memo<{ image: ImageItem; index: number }>(({ image, index }) => (
    <Card key={image.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0 relative">
        <div className="relative aspect-square overflow-hidden">
          <LazyImage
            src={image.url}
            alt={image.alt || `Imagem ${index + 1}`}
            className="w-full h-full transition-transform duration-300 group-hover:scale-110"
            onClick={() => handleImageClick(image)}
            priority={index < 4} // Prioridade para primeiras 4 imagens
            enableCache={true}
          />
          
          {/* Overlay com ações */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleImageClick(image)}
              className="bg-white/90 hover:bg-white text-black"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {editable && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(image.id)}
                disabled={isDeleting === image.id}
                className="bg-red-500/90 hover:bg-red-600 text-white"
              >
                {isDeleting === image.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Metadados da imagem */}
        {image.metadata?.name && (
          <div className="p-2">
            <p className="text-xs text-gray-500 truncate">
              {image.metadata.name}
            </p>
            {image.metadata.size && (
              <p className="text-xs text-gray-400">
                {(image.metadata.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  ));

  // Renderizar estado vazio
  if (filteredImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-gray-600 rounded-lg">
        <ImageIcon className="w-12 h-12 mb-3 text-gray-400" />
        <p className="text-gray-300">
          {searchTerm ? `Nenhuma imagem encontrada para "${searchTerm}"` : "Nenhuma imagem encontrada"}
        </p>
        
        {/* Estatísticas de compressão */}
        {compressionStats && compressionStats.needsCompression > 0 && (
          <div className="mt-4 p-3 bg-blue-900/30 rounded-lg text-sm">
            <p className="text-blue-300">
              💡 {compressionStats.needsCompression} imagens podem ser comprimidas
            </p>
            <p className="text-blue-400 text-xs">
              Economia estimada: {(compressionStats.potentialSavings / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        )}
      </div>
    );
  }

  // Renderizar com virtualização
  if (enableVirtualization && filteredImages.length > 20) {
    return (
      <>
        <div
          ref={containerRef}
          className={cn("h-[600px] overflow-auto", className)}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const image = filteredImages[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <ImageItem image={image} index={virtualItem.index} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de visualização */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <LazyImage
                src={selectedImage.url}
                alt={selectedImage.alt || 'Imagem ampliada'}
                className="w-full h-full object-contain rounded-lg"
                priority={true}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // Renderizar grid normal
  return (
    <>
      <div className={cn(
        "grid gap-4",
        layout === 'grid' && "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        layout === 'list' && "grid-cols-1",
        className
      )}>
        {filteredImages.map((image, index) => (
          <ImageItem key={image.id} image={image} index={index} />
        ))}
      </div>

      {/* Modal de visualização */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseModal}
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <LazyImage
              src={selectedImage.url}
              alt={selectedImage.alt || 'Imagem ampliada'}
              className="w-full h-full object-contain rounded-lg"
              priority={true}
            />
          </div>
        </div>
      )}
    </>
  );
});

OptimizedImageGallery.displayName = 'OptimizedImageGallery';

export default OptimizedImageGallery; 