
// Exportações centralizadas do sistema de imagens
export * from './imageService';
export * from './monitoringService';
export * from './supabaseStorage';

// Reexportação da função handleImageUpload do módulo principal
export { handleImageUpload, getPortfolioImages, deletePortfolioImage } from '@/features/images/services/imageService';
