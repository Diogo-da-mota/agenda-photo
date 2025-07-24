import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, X, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ImageGalleryProps, ImageItem } from './ImageGallery.types';
import { useImageGallery } from './ImageGallery.hooks';
import LazyImage from '../LazyImage';

/**
 * Componente unificado de galeria de imagens
 * Consolida funcionalidades de ImageGallery.jsx e ImageGallery.tsx
 * Suporta modo público e privado com otimizações de performance
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images: externalImages,
  onDelete,
  refreshTrigger = 0,
  emptyMessage = "Nenhuma imagem encontrada",
  editable = true,
  className = "",
  searchTerm = "",
  mode = 'private',
  maxItems,
  virtualized = false,
  enableCache = true,
  onImageClick,
  layout = 'grid'
}) => {
  const {
    images,
    isLoading,
    error,
    isDeleting,
    handleDelete,
    handleView,
    filteredImages
  } = useImageGallery({
    externalImages,
    onDelete,
    refreshTrigger,
    searchTerm,
    maxItems,
    mode,
    enableCache
  });

  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  // Renderizar skeleton durante carregamento
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", className)}>
        {Array.from({ length: maxItems || 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Renderizar erro se houver
  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300">
        {error}
      </div>
    );
  }

  // Renderizar estado vazio
  if (filteredImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-gray-600 rounded-lg">
        <ImageIcon className="w-12 h-12 mb-3 text-gray-400" />
        <p className="text-gray-300">{emptyMessage}</p>
      </div>
    );
  }

  // Layout em grid (padrão)
  if (layout === 'grid') {
    return (
      <>
        <div className={cn(
          "grid gap-4",
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
          className
        )}>
          {filteredImages.map((image) => (
            <Card key={image.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0 relative">
                {/* Imagem principal com LazyImage */}
                <div className="relative aspect-square overflow-hidden">
                  <LazyImage
                    src={image.url}
                    alt={image.alt || `Imagem ${image.id}`}
                    className="w-full h-full transition-transform duration-300 group-hover:scale-110"
                    onClick={() => {
                      if (onImageClick) {
                        onImageClick(image);
                      } else {
                        setSelectedImage(image);
                      }
                    }}
                  />
                  
                  {/* Overlay com ações */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(image.url);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {editable && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(image.id, image.url);
                        }}
                        disabled={isDeleting}
                        className="bg-red-500/80 hover:bg-red-600/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Informações da imagem */}
                {image.metadata && (
                  <div className="p-3">
                    <p className="text-sm text-muted-foreground truncate">
                      {image.metadata.name || 'Sem nome'}
                    </p>
                    {image.metadata.size && (
                      <p className="text-xs text-muted-foreground">
                        {(image.metadata.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de visualização */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
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

  // Layout em masonry
  if (layout === 'masonry') {
    return (
      <div className={cn(
        "columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4",
        className
      )}>
        {filteredImages.map((image) => (
          <Card key={image.id} className="break-inside-avoid group overflow-hidden hover:shadow-lg transition-shadow mb-4">
            <CardContent className="p-0 relative">
              <div className="relative overflow-hidden">
                <LazyImage
                  src={image.url}
                  alt={image.alt || `Imagem ${image.id}`}
                  className="w-full transition-transform duration-300 group-hover:scale-105"
                  onClick={() => {
                    if (onImageClick) {
                      onImageClick(image);
                    } else {
                      setSelectedImage(image);
                    }
                  }}
                />
                
                {/* Overlay com ações */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(image.url);
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {editable && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id, image.url);
                      }}
                      disabled={isDeleting}
                      className="bg-red-500/80 hover:bg-red-600/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return null;
};

export default ImageGallery; 