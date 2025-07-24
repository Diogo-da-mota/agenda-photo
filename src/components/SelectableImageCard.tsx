/**
 * Card de imagem com funcionalidade de seleção múltipla
 * FASE 1 - Core Functionality
 */

import React, { useState, useCallback } from 'react';
import { Download, Eye, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DownloadProgress } from '@/types/download-multiple';

interface SelectableImageCardProps {
  image: {
    id: string;
    url: string;
    nome_arquivo: string;
    ordem?: number;
    destaque?: boolean;
  };
  isSelected: boolean;
  isSelectionMode: boolean;
  downloadProgress?: DownloadProgress;
  onSelect: (imageId: string, event?: React.MouseEvent) => void;
  onDownload: (imageId: string) => void;
  onView: (imageId: string) => void;
  className?: string;
}

export const SelectableImageCard: React.FC<SelectableImageCardProps> = ({
  image,
  isSelected,
  isSelectionMode,
  downloadProgress,
  onSelect,
  onDownload,
  onView,
  className
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleCardClick = useCallback((event: React.MouseEvent) => {
    if (isSelectionMode) {
      event.preventDefault();
      onSelect(image.id, event);
    }
  }, [isSelectionMode, onSelect, image.id]);

  const handleSelectClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(image.id, event);
  }, [onSelect, image.id]);

  const handleDownloadClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onDownload(image.id);
  }, [onDownload, image.id]);

  const handleViewClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onView(image.id);
  }, [onView, image.id]);

  const isDownloading = downloadProgress?.status === 'downloading';
  const downloadCompleted = downloadProgress?.status === 'completed';
  const downloadFailed = downloadProgress?.status === 'error';

  return (
    <div
      className={cn(
        "group relative bg-white rounded-lg overflow-hidden shadow-sm border",
        "transition-all duration-200 ease-in-out",
        "hover:shadow-md hover:scale-[1.02]",
        isSelectionMode && "cursor-pointer",
        isSelected && "ring-2 ring-blue-500 ring-offset-2",
        downloadCompleted && "ring-2 ring-green-500 ring-offset-2",
        downloadFailed && "ring-2 ring-red-500 ring-offset-2",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Checkbox de seleção */}
      {isSelectionMode && (
        <div
          className={cn(
            "absolute top-2 left-2 z-10",
            "w-6 h-6 rounded-full border-2 bg-white shadow-sm",
            "flex items-center justify-center",
            "transition-all duration-200",
            isSelected 
              ? "border-blue-500 bg-blue-500" 
              : "border-gray-300 hover:border-blue-400"
          )}
          onClick={handleSelectClick}
        >
          {isSelected && (
            <Check className="h-4 w-4 text-white" />
          )}
        </div>
      )}

      {/* Indicador de destaque */}
      {image.destaque && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Destaque
          </div>
        </div>
      )}

      {/* Status de download */}
      {downloadProgress && (
        <div className="absolute top-2 right-2 z-10">
          {isDownloading && (
            <div className="bg-blue-500 text-white p-2 rounded-full">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {downloadCompleted && (
            <div className="bg-green-500 text-white p-2 rounded-full">
              <Check className="h-4 w-4" />
            </div>
          )}
          {downloadFailed && (
            <div className="bg-red-500 text-white p-2 rounded-full">
              <span className="text-xs font-bold">!</span>
            </div>
          )}
        </div>
      )}

      {/* Container da imagem */}
      <div className="relative aspect-square bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-sm">Erro ao carregar</div>
            </div>
          </div>
        ) : (
          <img
            src={image.url}
            alt={image.nome_arquivo}
            className={cn(
              "w-full h-full object-cover",
              "transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}

        {/* Overlay com ações */}
        <div
          className={cn(
            "absolute inset-0 bg-black bg-opacity-0",
            "flex items-center justify-center gap-2",
            "transition-all duration-200",
            "group-hover:bg-opacity-40"
          )}
        >
          <Button
            size="sm"
            variant="secondary"
            className={cn(
              "opacity-0 group-hover:opacity-100",
              "transition-opacity duration-200",
              "bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            )}
            onClick={handleViewClick}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            className={cn(
              "opacity-0 group-hover:opacity-100",
              "transition-opacity duration-200",
              "bg-blue-600 hover:bg-blue-700"
            )}
            onClick={handleDownloadClick}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Progresso de download */}
      {downloadProgress && isDownloading && (
        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Baixando...</span>
            <span>{Math.round(downloadProgress.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress.progress}%` }}
            />
          </div>
        </div>
      )}


    </div>
  );
};

// Componente de grid de imagens selecionáveis
interface SelectableImageGridProps {
  images: Array<{
    id: string;
    url: string;
    nome_arquivo: string;
    ordem?: number;
    destaque?: boolean;
  }>;
  selectedImages: Set<string>;
  isSelectionMode: boolean;
  downloadProgresses: Map<string, DownloadProgress>;
  onSelect: (imageId: string, event?: React.MouseEvent) => void;
  onDownload: (imageId: string) => void;
  onView: (imageId: string) => void;
  className?: string;
}

export const SelectableImageGrid: React.FC<SelectableImageGridProps> = ({
  images,
  selectedImages,
  isSelectionMode,
  downloadProgresses,
  onSelect,
  onDownload,
  onView,
  className
}) => {
  return (
    <div
      className={cn(
        "grid gap-4",
        "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className
      )}
    >
      {images.map((image) => (
        <SelectableImageCard
          key={image.id}
          image={image}
          isSelected={selectedImages.has(image.id)}
          isSelectionMode={isSelectionMode}
          downloadProgress={downloadProgresses.get(image.id)}
          onSelect={onSelect}
          onDownload={onDownload}
          onView={onView}
        />
      ))}
    </div>
  );
};