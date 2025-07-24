export interface ImageMetadata {
  name?: string;
  size?: number;
  type?: string;
  lastModified?: number;
  width?: number;
  height?: number;
}

export interface ImageItem {
  id: string;
  url: string;
  alt?: string;
  metadata?: ImageMetadata;
  thumbnail?: string;
  isLoading?: boolean;
  error?: string;
}

export interface ImageGalleryProps {
  // Imagens externas (opcional)
  images?: ImageItem[] | { id: string; url: string }[];
  
  // Callbacks
  onDelete?: (id: string) => void;
  onImageClick?: (image: ImageItem) => void;
  
  // Configurações de comportamento
  refreshTrigger?: number;
  emptyMessage?: string;
  editable?: boolean;
  searchTerm?: string;
  mode?: 'public' | 'private';
  maxItems?: number;
  
  // Configurações de performance
  virtualized?: boolean;
  enableCache?: boolean;
  
  // Configurações de layout
  layout?: 'grid' | 'masonry' | 'list';
  className?: string;
}

export interface UseImageGalleryProps {
  externalImages?: ImageItem[] | { id: string; url: string }[];
  onDelete?: (id: string) => void;
  refreshTrigger?: number;
  searchTerm?: string;
  maxItems?: number;
  mode?: 'public' | 'private';
  enableCache?: boolean;
}

export interface UseImageGalleryReturn {
  images: ImageItem[];
  isLoading: boolean;
  error: string | null;
  isDeleting: boolean;
  handleDelete: (imageId: string, imageUrl: string) => Promise<void>;
  handleView: (imageUrl: string) => void;
  filteredImages: ImageItem[];
  refetch: () => void;
} 