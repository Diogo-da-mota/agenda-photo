import { useState, useEffect, useMemo, useCallback } from 'react';
import { TrabalhoPortfolioResumo } from '@/services/portfolioService';

interface VirtualizedItem {
  index: number;
  trabalho: TrabalhoPortfolioResumo;
  height: number;
  top: number;
}

interface UseVirtualizedPortfolioProps {
  trabalhos: TrabalhoPortfolioResumo[];
  containerHeight: number;
  itemMinHeight: number;
  itemMaxHeight: number;
  overscan?: number;
}

export const useVirtualizedPortfolio = ({
  trabalhos,
  containerHeight,
  itemMinHeight,
  itemMaxHeight,
  overscan = 5
}: UseVirtualizedPortfolioProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());

  // Calcular altura estimada para cada item baseado no aspect ratio
  const getEstimatedHeight = useCallback((trabalho: TrabalhoPortfolioResumo, index: number) => {
    // Usar altura já medida se disponível
    if (itemHeights.has(index)) {
      return itemHeights.get(index)!;
    }

    // Estimar altura baseada no índice para criar efeito masonry
    const baseHeight = itemMinHeight;
    const variation = (itemMaxHeight - itemMinHeight) * 0.5;
    const randomFactor = Math.sin(index * 2.5) * 0.5 + 0.5; // Pseudo-random baseado no índice
    
    return Math.floor(baseHeight + variation * randomFactor);
  }, [itemHeights, itemMinHeight, itemMaxHeight]);

  // Calcular posições virtuais dos itens
  const virtualItems = useMemo(() => {
    const items: VirtualizedItem[] = [];
    let currentTop = 0;

    for (let i = 0; i < trabalhos.length; i++) {
      const height = getEstimatedHeight(trabalhos[i], i);
      
      items.push({
        index: i,
        trabalho: trabalhos[i],
        height,
        top: currentTop
      });

      currentTop += height + 8; // +8 para gap
    }

    return items;
  }, [trabalhos, getEstimatedHeight]);

  // Calcular altura total do container virtual
  const totalHeight = useMemo(() => {
    return virtualItems.length > 0 
      ? virtualItems[virtualItems.length - 1].top + virtualItems[virtualItems.length - 1].height
      : 0;
  }, [virtualItems]);

  // Calcular quais itens estão visíveis
  const visibleItems = useMemo(() => {
    const startIndex = virtualItems.findIndex(item => 
      item.top + item.height >= scrollTop
    );
    
    const endIndex = virtualItems.findIndex(item => 
      item.top > scrollTop + containerHeight
    );

    const start = Math.max(0, startIndex - overscan);
    const end = endIndex === -1 
      ? virtualItems.length 
      : Math.min(virtualItems.length, endIndex + overscan);

    return virtualItems.slice(start, end);
  }, [virtualItems, scrollTop, containerHeight, overscan]);

  // Função para atualizar altura real de um item
  const updateItemHeight = useCallback((index: number, height: number) => {
    setItemHeights(prev => {
      const newMap = new Map(prev);
      newMap.set(index, height);
      return newMap;
    });
  }, []);

  // Função para lidar com scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Hook para observar mudanças de altura dos elementos
  const useItemHeight = useCallback((index: number) => {
    const [ref, setRef] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
      if (!ref) return;

      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          updateItemHeight(index, height);
        }
      });

      resizeObserver.observe(ref);

      return () => {
        resizeObserver.disconnect();
      };
    }, [ref, index]);

    return setRef;
  }, [updateItemHeight]);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    useItemHeight,
    scrollTop
  };
};

// Hook simplificado para scroll infinito otimizado
export const useOptimizedInfiniteScroll = (
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void,
  threshold = 0.8
) => {
  const [isNearBottom, setIsNearBottom] = useState(false);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    const nearBottom = scrollPercentage > threshold;
    setIsNearBottom(nearBottom);

    // Trigger fetch quando próximo do final
    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, threshold]);

  return {
    handleScroll,
    isNearBottom
  };
};

// Hook para preload inteligente de imagens
export const useImagePreloader = (
  visibleItems: VirtualizedItem[],
  preloadDistance = 3
) => {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const imagesToPreload: string[] = [];
    
    // Coletar URLs das imagens que devem ser pré-carregadas
    visibleItems.forEach((item, index) => {
      // Preload imagens visíveis e próximas
      if (index <= visibleItems.length + preloadDistance) {
        if (item.trabalho.imagem_principal) {
          imagesToPreload.push(item.trabalho.imagem_principal);
        }
      }
    });

    // Preload apenas imagens que ainda não foram carregadas
    const newImages = imagesToPreload.filter(url => !preloadedImages.has(url));
    
    if (newImages.length > 0) {
      // Preload em background
      Promise.all(
        newImages.map(url => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = img.onerror = () => resolve();
            img.src = url;
          });
        })
      ).then(() => {
        setPreloadedImages(prev => {
          const newSet = new Set(prev);
          newImages.forEach(url => newSet.add(url));
          return newSet;
        });
      });
    }
  }, [visibleItems, preloadDistance, preloadedImages]);

  return preloadedImages;
}; 