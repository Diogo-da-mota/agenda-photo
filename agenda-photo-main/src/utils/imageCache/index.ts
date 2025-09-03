// Exportações do sistema de cache de imagens
export { AdvancedImageCache, imageCache } from './ImageCache';
export { ImagePreloader, useImagePreloader } from './ImagePreloader';

// Tipos e interfaces
export type {
  CachedImage,
  CacheConfig,
  CacheStrategy
} from './ImageCache';

export type {
  PreloadStrategy,
  ScrollBehavior,
  ViewportInfo
} from './ImagePreloader'; 