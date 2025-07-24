import { useMemo, useCallback, useRef } from 'react';
import { UseVirtualizedGridProps, UseVirtualizedGridReturn, GridItem, ScrollDirection } from './VirtualizedGrid.types';

export const useVirtualizedGrid = ({
  items,
  containerSize,
  scrollTop,
  scrollLeft,
  itemHeight,
  itemWidth,
  gap,
  overscan,
  enablePreload = true,
  preloadDistance = 200
}: UseVirtualizedGridProps): UseVirtualizedGridReturn => {
  const lastScrollTop = useRef(0);
  const lastScrollLeft = useRef(0);
  const imageCache = useRef(new Set<string>());

  // Calcular número de colunas baseado na largura do container
  const columnsCount = useMemo(() => {
    if (containerSize.width === 0) return 1;
    return Math.floor((containerSize.width + gap) / (itemWidth + gap)) || 1;
  }, [containerSize.width, itemWidth, gap]);

  // Calcular número de linhas
  const rowsCount = useMemo(() => {
    return Math.ceil(items.length / columnsCount);
  }, [items.length, columnsCount]);

  // Calcular dimensões totais
  const totalHeight = useMemo(() => {
    return rowsCount * itemHeight + (rowsCount - 1) * gap;
  }, [rowsCount, itemHeight, gap]);

  const totalWidth = useMemo(() => {
    return columnsCount * itemWidth + (columnsCount - 1) * gap;
  }, [columnsCount, itemWidth, gap]);

  // Detectar direção do scroll
  const scrollDirection = useMemo((): ScrollDirection => {
    const vertical = scrollTop > lastScrollTop.current ? 'down' : 
                    scrollTop < lastScrollTop.current ? 'up' : 'none';
    const horizontal = scrollLeft > lastScrollLeft.current ? 'right' : 
                      scrollLeft < lastScrollLeft.current ? 'left' : 'none';
    
    lastScrollTop.current = scrollTop;
    lastScrollLeft.current = scrollLeft;
    
    return { vertical, horizontal };
  }, [scrollTop, scrollLeft]);

  // Calcular itens visíveis com overscan
  const visibleItems = useMemo((): GridItem[] => {
    if (containerSize.height === 0 || items.length === 0) return [];

    // Calcular range de linhas visíveis
    const startRow = Math.floor(scrollTop / (itemHeight + gap));
    const endRow = Math.ceil((scrollTop + containerSize.height) / (itemHeight + gap));
    
    // Aplicar overscan
    const startRowWithOverscan = Math.max(0, startRow - overscan);
    const endRowWithOverscan = Math.min(rowsCount - 1, endRow + overscan);
    
    // Calcular índices dos itens
    const startIndex = startRowWithOverscan * columnsCount;
    const endIndex = Math.min(items.length - 1, (endRowWithOverscan + 1) * columnsCount - 1);
    
    // Mapear itens com índices
    const visibleItemsArray: GridItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (items[i]) {
        visibleItemsArray.push({
          ...items[i],
          index: i
        });
      }
    }
    
    return visibleItemsArray;
  }, [
    items,
    containerSize.height,
    scrollTop,
    itemHeight,
    gap,
    overscan,
    columnsCount,
    rowsCount
  ]);

  // Preload inteligente de imagens
  const preloadImages = useCallback((urls: string[]) => {
    if (!enablePreload) return;

    urls.forEach(url => {
      if (!url || imageCache.current.has(url)) return;
      
      const img = new Image();
      img.onload = () => {
        imageCache.current.add(url);
      };
      img.onerror = () => {
        // Remover da cache se falhou
        imageCache.current.delete(url);
      };
      img.src = url;
    });
  }, [enablePreload]);

  // Preload baseado na direção do scroll
  const handleScroll = useCallback((newScrollTop: number, newScrollLeft: number) => {
    if (!enablePreload) return;

    // Calcular itens para preload baseado na direção
    const preloadCount = scrollDirection.vertical === 'down' ? 
      Math.ceil(preloadDistance / itemHeight) * columnsCount : 
      Math.ceil(preloadDistance / itemHeight) * columnsCount;

    let preloadStartIndex = 0;
    let preloadEndIndex = 0;

    if (scrollDirection.vertical === 'down') {
      // Preload para baixo
      const lastVisibleIndex = visibleItems[visibleItems.length - 1]?.index || 0;
      preloadStartIndex = lastVisibleIndex + 1;
      preloadEndIndex = Math.min(items.length - 1, preloadStartIndex + preloadCount);
    } else if (scrollDirection.vertical === 'up') {
      // Preload para cima
      const firstVisibleIndex = visibleItems[0]?.index || 0;
      preloadEndIndex = firstVisibleIndex - 1;
      preloadStartIndex = Math.max(0, preloadEndIndex - preloadCount);
    }

    // Coletar URLs para preload
    const preloadUrls: string[] = [];
    for (let i = preloadStartIndex; i <= preloadEndIndex; i++) {
      if (items[i]?.imageUrl) {
        preloadUrls.push(items[i].imageUrl);
      }
    }

    if (preloadUrls.length > 0) {
      preloadImages(preloadUrls);
    }
  }, [
    enablePreload,
    preloadDistance,
    itemHeight,
    columnsCount,
    visibleItems,
    items,
    scrollDirection,
    preloadImages
  ]);

  return {
    visibleItems,
    totalHeight,
    totalWidth,
    columnsCount,
    rowsCount,
    preloadImages,
    handleScroll
  };
}; 