/**
 * Lightbox Melhorado - Fase 2
 * Navegação com setas, swipe mobile, preload, contador e melhor UX
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, ChevronLeft, ChevronRight, CheckSquare, Square, Share2 } from 'lucide-react';

export interface LightboxImage {
  id: string;
  src: string;
  alt?: string;
  title?: string;
  downloadUrl?: string;
  fileName: string;
}

export interface ImprovedLightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  onDownload?: (image: LightboxImage) => void;
  onShare?: (image: LightboxImage) => void;
  showDownload?: boolean;
  showShare?: boolean;
  showInfo?: boolean;
  showThumbnails?: boolean;
  enableKeyboardNavigation?: boolean;
  enableSwipeNavigation?: boolean;
  enableZoom?: boolean;
  autoPlay?: boolean;
  downloadInProgress?: boolean;
}

export const ImprovedLightbox: React.FC<ImprovedLightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
  onDownload,
  onShare,
  showDownload = true,
  showShare = false,
  showInfo = true,
  showThumbnails = false,
  enableKeyboardNavigation = true,
  enableSwipeNavigation = true,
  enableZoom = false,
  autoPlay = false,
  downloadInProgress = false
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Atualizar índice quando prop mudar
  useEffect(() => {
    setCurrentImageIndex(currentIndex);
  }, [currentIndex]);

  // Notificar mudança de índice
  useEffect(() => {
    onIndexChange?.(currentImageIndex);
  }, [currentImageIndex, onIndexChange]);

  // Preload de imagens adjacentes
  useEffect(() => {
    if (!isOpen || images.length === 0) return;

    const preloadImage = (index: number) => {
      if (index < 0 || index >= images.length || preloadedImages.has(index)) return;

      const img = new Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set(prev).add(index));
      };
      img.src = images[index].src;
    };

    // Preload imagem atual e adjacentes
    preloadImage(currentImageIndex);
    preloadImage(currentImageIndex - 1);
    preloadImage(currentImageIndex + 1);
  }, [currentImageIndex, isOpen, images, preloadedImages]);

  // Navegação por teclado
  useEffect(() => {
    if (!isOpen || !enableKeyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentImageIndex, images, enableKeyboardNavigation]);

  // Navegação
  const goToPrevious = useCallback(() => {
    if (images.length === 0) return;
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
    setIsLoading(true);
  }, [images.length]);

  const goToNext = useCallback(() => {
    if (images.length === 0) return;
    setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
    setIsLoading(true);
  }, [images.length]);

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeNavigation) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipeNavigation) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!enableSwipeNavigation || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Handlers
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (onDownload && images[currentImageIndex]) {
      onDownload(images[currentImageIndex]);
    }
  };

  const handleShare = () => {
    if (onShare && images[currentImageIndex]) {
      onShare(images[currentImageIndex]);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentImageIndex];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header com controles */}
      {showInfo && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              {/* Contador */}
              <span className="text-sm font-medium bg-black/30 px-3 py-1 rounded-full">
                {currentImageIndex + 1} de {images.length}
              </span>
              
              {/* Nome do arquivo */}
              <span className="text-sm text-white/80 truncate max-w-xs">
                {currentImage.title || currentImage.fileName}
              </span>
            </div>

            {/* Botão fechar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10 h-10 w-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Navegação lateral esquerda */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 h-12 w-12 p-0"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}

      {/* Imagem principal */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white" />
          </div>
        )}
        
        <img
          ref={imageRef}
          src={currentImage.src}
          alt={currentImage.alt || currentImage.fileName}
          className={`w-full h-full object-contain transition-opacity duration-200 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </div>

      {/* Navegação lateral direita */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 h-12 w-12 p-0"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}

      {/* Footer com ações */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-4">
        <div className="flex items-center justify-center gap-3">
          {/* Botão de compartilhamento */}
          {showShare && onShare && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          )}

          {/* Botão de download */}
          {showDownload && onDownload && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={downloadInProgress}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              {downloadInProgress ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {downloadInProgress ? 'Baixando...' : 'Baixar'}
            </Button>
          )}
        </div>
      </div>

      {/* Indicadores de navegação (pontos) */}
      {showThumbnails && images.length > 1 && images.length <= 10 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
          <div className="flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentImageIndex(index);
                  setIsLoading(true);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedLightbox;