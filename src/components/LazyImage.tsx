import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useImageCache, optimizeImageUrl } from '@/utils/imageCache';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
  children?: React.ReactNode; // Para overlay content
  quality?: number;
  priority?: 'high' | 'low';
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className,
  width,
  height,
  onClick,
  children,
  quality = 80,
  priority = 'low'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const { getImage, preloadImages, isImageCached } = useImageCache();

  // Otimizar URL uma única vez
  const optimizedUrl = useMemo(() => 
    optimizeImageUrl(src, width, height, quality), 
    [src, width, height, quality]
  );

  // Verificar se imagem já está em cache
  const isCached = useMemo(() => 
    isImageCached(optimizedUrl), 
    [optimizedUrl, isImageCached]
  );

  // Se está em cache, carregar imediatamente
  useEffect(() => {
    if (isCached) {
      setIsLoaded(true);
      setIsInView(true);
    }
  }, [isCached]);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (isCached) return; // Pular se já está em cache

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Começar a carregar 50px antes de aparecer
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [isCached]);

  // Carregar imagem quando entrar na viewport (apenas se não estiver em cache)
  useEffect(() => {
    if (!isInView || !src || isCached) return;

    const loadImage = async () => {
      try {
        setError(false);
        
        // Usar cache inteligente - retorna URL otimizada
        const cachedUrl = await getImage(optimizedUrl);
        
        // Carregar imagem diretamente sem dupla verificação
        const img = new Image();
        img.onload = () => setIsLoaded(true);
        img.onerror = () => {
          setError(true);
          setIsLoaded(true);
        };
        img.src = cachedUrl;
        
      } catch (err) {
        console.warn('[LazyImage] Erro ao carregar imagem:', err);
        setError(true);
        setIsLoaded(true);
      }
    };

    loadImage();
  }, [isInView, src, optimizedUrl, getImage, isCached]);

  // Preload para imagens de alta prioridade
  useEffect(() => {
    if (priority === 'high' && src && !isCached) {
      preloadImages([optimizedUrl], 'high');
    }
  }, [src, priority, optimizedUrl, preloadImages, isCached]);

  return (
    <div 
      ref={imgRef}
      className={cn("relative overflow-hidden group", className)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Placeholder skeleton - só aparece se não estiver carregada E não estiver em cache */}
      {!isLoaded && !isCached && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse"
          style={{ 
            width: width || '100%', 
            height: height || '100%',
            minHeight: height ? `${height}px` : '200px'
          }}
        />
      )}
      
      {/* Actual image - aparece imediatamente se estiver em cache */}
      {(isInView || isCached) && !error && (
        <img
          src={isCached ? optimizedUrl : optimizedUrl}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "w-full h-full object-cover transition-all duration-300 ease-in-out",
            "group-hover:scale-105",
            (isLoaded || isCached) ? "opacity-100" : "opacity-0"
          )}
          loading={priority === 'high' ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setError(true);
            setIsLoaded(true);
          }}
        />
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Erro ao carregar</p>
          </div>
        </div>
      )}
      
      {/* Overlay content */}
      {children && (isLoaded || isCached) && !error && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {children}
        </div>
      )}
      
      {/* Loading indicator para imagens de alta prioridade */}
      {priority === 'high' && !isLoaded && !isCached && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default LazyImage; 