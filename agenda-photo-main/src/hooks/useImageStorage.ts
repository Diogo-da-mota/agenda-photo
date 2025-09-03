
import { handleImageUpload } from '@/features/images/services'; 
import { generateThumbnail as genThumb } from "@/services/image/uploadService";

export async function uploadSingleImage(file: File, {
  validateFile,
  onProgress,
  onSuccess,
  onError,
  generateThumbnails,
}: any) {
  try {
    if (validateFile) validateFile(file);

    if (onProgress) onProgress(10, 'Validando imagem...');
    if (onProgress) onProgress(30, 'Comprimindo imagem...');

    const imageUrl = await handleImageUpload(file);

    if (generateThumbnails && imageUrl) {
      if (onProgress) onProgress(90, 'Gerando miniatura...');
      await genThumb(imageUrl);
    }

    if (onSuccess) onSuccess(imageUrl);

    if (onProgress) onProgress(100, 'Upload concluído!');

    return { url: imageUrl };
  } catch (err) {
    if (onError) onError(err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

// Função para upload múltiplo aproveitando a original existente
export async function uploadFilesBatch(files: File[], processFn: any) {
  // reimportar lógica do arquivo antigo se quiser
  return await processFn(files);
}
