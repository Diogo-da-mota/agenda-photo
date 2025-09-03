import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageOff } from 'lucide-react';
import { imageCache } from '@/utils/imageCache/ImageCache';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  priority?: boolean;
  quality?: number;
  blur?: boolean;
  enableCache?: boolean;
}

/**
 * Componente de imagem otimizado com lazy loading e cache avançado
 * Inclui placeholder, tratamento de erro e otimizações de performance
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  onLoad,
  onError,
  onClick,
  loading = 'lazy',
  sizes,
  priority = false,
  quality = 75,
  blur = true,
  enableCache = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Carrega 50px antes de entrar na viewport
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Carregar imagem com cache quando entrar na viewport
  useEffect(() => {
    if (!isInView || !src) return;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        if (enableCache) {
          // Usar cache avançado
          const cachePriority = priority ? 'high' : 'normal';
          const cachedUrl = await imageCache.getImage(src, cachePriority);
          setCachedSrc(cachedUrl);
        } else {
          // Carregamento direto sem cache
          setCachedSrc(src);
        }
      } catch (error) {
        console.error('Erro ao carregar imagem:', error);
        setHasError(true);
        setIsLoading(false);
        onError?.();
      }
    };

    loadImage();
  }, [isInView, src, enableCache, priority, onError]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const handleClick = () => {
    if (!hasError && !isLoading) {
      onClick?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-gray-100 dark:bg-gray-800",
        onClick && "cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      {/* Placeholder/Skeleton durante carregamento */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          {placeholder ? (
            <img
              src={placeholder}
              alt=""
              className={cn(
                "w-full h-full object-cover",
                blur && "blur-sm"
              )}
            />
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </div>
      )}

      {/* Estado de erro */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
          <ImageOff className="w-8 h-8 mb-2" />
          <span className="text-sm">Erro ao carregar</span>
        </div>
      )}

      {/* Imagem principal */}
      {isInView && !hasError && cachedSrc && (
        <img
          ref={imgRef}
          src={cachedSrc}
          alt={alt}
          loading={loading}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          style={{
            aspectRatio: 'inherit'
          }}
        />
      )}

      {/* Overlay para hover effects (opcional) */}
      {onClick && !hasError && !isLoading && (
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200" />
      )}

      {/* Indicador de cache (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && enableCache && cachedSrc && (
        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
          C
        </div>
      )}
    </div>
  );
};

export default LazyImage; 