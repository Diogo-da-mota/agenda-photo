
export { imageService } from './imageService';
export { monitoringService } from './monitoringService';
export { storageService } from './storageService';
export { useImageStore } from './imageStore';
export { useImageStorage, uploadSingleImage, uploadFilesBatch } from './useImageStorage';

// Função mock para compatibilidade
export const handleImageUpload = async (file: File): Promise<string> => {
  console.log('Mock handleImageUpload para arquivo:', file.name);
  return URL.createObjectURL(file);
};
