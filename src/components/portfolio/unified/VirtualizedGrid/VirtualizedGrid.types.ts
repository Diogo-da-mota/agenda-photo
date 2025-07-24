export interface GridItemMetadata {
  category?: string;
  date?: string;
  size?: number;
  type?: string;
  tags?: string[];
}

export interface GridItem {
  id: string;
  index: number;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  metadata?: GridItemMetadata;
}

export interface VirtualizedGridProps {
  // Dados
  items: Omit<GridItem, 'index'>[];
  
  // Configurações de layout
  itemHeight?: number;
  itemWidth?: number;
  gap?: number;
  overscan?: number;
  
  // Callbacks
  onLoadMore?: () => void;
  onItemClick?: (item: GridItem, index: number) => void;
  onItemDelete?: (item: GridItem, index: number) => void;
  
  // Configurações de comportamento
  className?: string;
  editable?: boolean;
  enablePreload?: boolean;
  preloadDistance?: number;
}

export interface UseVirtualizedGridProps {
  items: Omit<GridItem, 'index'>[];
  containerSize: { width: number; height: number };
  scrollTop: number;
  scrollLeft: number;
  itemHeight: number;
  itemWidth: number;
  gap: number;
  overscan: number;
  enablePreload?: boolean;
  preloadDistance?: number;
}

export interface UseVirtualizedGridReturn {
  visibleItems: GridItem[];
  totalHeight: number;
  totalWidth: number;
  columnsCount: number;
  rowsCount: number;
  preloadImages: (urls: string[]) => void;
  handleScroll?: (scrollTop: number, scrollLeft: number) => void;
}

export interface ScrollDirection {
  vertical: 'up' | 'down' | 'none';
  horizontal: 'left' | 'right' | 'none';
} 