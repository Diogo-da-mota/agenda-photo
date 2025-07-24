import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye } from 'lucide-react';
import LazyImage from '../LazyImage';
import { VirtualizedGridProps, GridItem } from './VirtualizedGrid.types';
import { useVirtualizedGrid } from './VirtualizedGrid.hooks';

/**
 * Grid virtualizado para performance otimizada com grandes listas
 * Renderiza apenas itens visíveis + buffer para scroll suave
 */
export const VirtualizedGrid: React.FC<VirtualizedGridProps> = ({
  items,
  itemHeight = 300,
  itemWidth = 250,
  gap = 16,
  overscan = 3,
  onLoadMore,
  onItemClick,
  onItemDelete,
  className = '',
  editable = true,
  enablePreload = true,
  preloadDistance = 200
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 600 });
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const {
    visibleItems,
    totalHeight,
    totalWidth,
    columnsCount,
    rowsCount,
    preloadImages,
    handleScroll: onScroll
  } = useVirtualizedGrid({
    items,
    containerSize,
    scrollTop,
    scrollLeft,
    itemHeight,
    itemWidth,
    gap,
    overscan,
    enablePreload,
    preloadDistance
  });

  // Observar mudanças no tamanho do container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(container);
    
    // Definir tamanho inicial
    setContainerSize({
      width: container.clientWidth,
      height: container.clientHeight
    });

    return () => resizeObserver.disconnect();
  }, []);

  // Handler de scroll otimizado
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const newScrollTop = target.scrollTop;
    const newScrollLeft = target.scrollLeft;
    
    setScrollTop(newScrollTop);
    setScrollLeft(newScrollLeft);
    
    // Callback personalizado de scroll
    onScroll?.(newScrollTop, newScrollLeft);
    
    // Verificar se precisa carregar mais itens
    const scrollPercentage = newScrollTop / (target.scrollHeight - target.clientHeight);
    if (scrollPercentage > 0.8 && onLoadMore) {
      onLoadMore();
    }
  }, [onScroll, onLoadMore]);

  // Preload de imagens baseado em scroll
  useEffect(() => {
    if (enablePreload) {
      const imageUrls = visibleItems
        .map(item => item.imageUrl)
        .filter(Boolean) as string[];
      
      preloadImages(imageUrls);
    }
  }, [visibleItems, enablePreload, preloadImages]);

  const handleItemClick = useCallback((item: GridItem, index: number) => {
    onItemClick?.(item, index);
  }, [onItemClick]);

  const handleItemDelete = useCallback((item: GridItem, index: number) => {
    onItemDelete?.(item, index);
  }, [onItemDelete]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "virtual-grid-container relative overflow-auto",
        "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
        "dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800",
        className
      )}
      style={{ height: '100%' }}
      onScroll={handleScroll}
    >
      {/* Container virtual com altura total */}
      <div
        className="virtual-grid-content relative"
        style={{
          height: totalHeight,
          width: totalWidth,
          minWidth: '100%'
        }}
      >
        {/* Renderizar apenas itens visíveis */}
        {visibleItems.map((item) => {
          const row = Math.floor(item.index / columnsCount);
          const col = item.index % columnsCount;
          const x = col * (itemWidth + gap);
          const y = row * (itemHeight + gap);

          return (
            <div
              key={item.id}
              className="virtual-grid-item absolute"
              style={{
                left: x,
                top: y,
                width: itemWidth,
                height: itemHeight
              }}
            >
              <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-0 relative h-full">
                  {/* Imagem principal */}
                  <div className="relative h-4/5 overflow-hidden">
                    <LazyImage
                      src={item.imageUrl}
                      alt={item.title || `Item ${item.id}`}
                      className="w-full h-full transition-transform duration-300 group-hover:scale-110"
                      onClick={() => handleItemClick(item, item.index)}
                      priority={item.index < 6} // Prioridade para primeiros itens
                    />
                    
                    {/* Overlay com ações */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.imageUrl, '_blank');
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
                            handleItemDelete(item, item.index);
                          }}
                          className="bg-red-500/80 hover:bg-red-600/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Informações do item */}
                  <div className="h-1/5 p-3 flex flex-col justify-center">
                    <h3 className="text-sm font-medium truncate text-foreground">
                      {item.title || 'Sem título'}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.subtitle}
                      </p>
                    )}
                    {item.metadata && (
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        {item.metadata.category && (
                          <span className="truncate">{item.metadata.category}</span>
                        )}
                        {item.metadata.date && (
                          <span>{new Date(item.metadata.date).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Indicador de carregamento */}
      {onLoadMore && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-muted-foreground">
            {items.length} itens carregados
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualizedGrid; 