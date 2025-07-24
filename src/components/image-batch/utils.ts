
/**
 * Formata o tamanho do arquivo para exibição
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Cria um objeto de item de imagem a partir de um arquivo
 */
export const createImageItem = (file: File): {
  id: string;
  file: File;
  previewUrl: string;
  status: 'waiting' | 'processing' | 'success' | 'error';
} => {
  const previewUrl = URL.createObjectURL(file);
  return {
    id: Math.random().toString(36).substring(2, 11),
    file,
    previewUrl,
    status: 'waiting'
  };
};
