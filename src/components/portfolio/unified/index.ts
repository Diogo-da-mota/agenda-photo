// Exportações dos componentes unificados do portfólio
export { default as ImageGallery } from './ImageGallery';
export { default as LazyImage } from './LazyImage';
export { default as VirtualizedGrid } from './VirtualizedGrid';

// Exportar tipos
export type { ImageGalleryProps, ImageItem, ImageMetadata } from './ImageGallery/ImageGallery.types';
export type { UseImageGalleryProps, UseImageGalleryReturn } from './ImageGallery/ImageGallery.types';
export type { VirtualizedGridProps, GridItem, GridItemMetadata } from './VirtualizedGrid/VirtualizedGrid.types';

// Exportar hooks
export { useImageGallery } from './ImageGallery/ImageGallery.hooks';
export { useVirtualizedGrid } from './VirtualizedGrid/VirtualizedGrid.hooks'; 