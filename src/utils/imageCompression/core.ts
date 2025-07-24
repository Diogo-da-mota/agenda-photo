
import { validateImageFile, defaultValidationConfig } from './validation';
import { calculateDimensions, drawImageToCanvas } from './resize';
import { calculateOptimalQuality, determineOutputFormat } from './quality';
import { dataURLtoBlob, createOptimizedFileName, logCompressionStats } from './conversion';

export interface CompressedImage {
  file: File;
  width: number;
  height: number;
  dataUrl: string;
}

export interface CompressionConfig {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSize?: number;
  allowedTypes?: string[];
}

const DEFAULT_CONFIG: Required<CompressionConfig> = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.7,
  maxSize: 10 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
};

export async function compressImageCore(
  file: File,
  config: CompressionConfig = {}
): Promise<CompressedImage> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return new Promise((resolve, reject) => {
    // Validação do arquivo
    try {
      validateImageFile(file, {
        maxSize: finalConfig.maxSize,
        validTypes: finalConfig.allowedTypes
      });
    } catch (error) {
      reject(error);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    const readerTimeout = setTimeout(() => {
      reject(new Error('Tempo esgotado ao carregar a imagem. O arquivo pode ser muito grande ou a conexão muito lenta.'));
    }, 15000);
    
    reader.onload = (event) => {
      clearTimeout(readerTimeout);
      
      const img = new Image();
      
      const imageLoadTimeout = setTimeout(() => {
        reject(new Error('Tempo esgotado ao processar a imagem. A imagem pode estar corrompida ou ser muito complexa.'));
      }, 15000);
      
      img.onload = () => {
        clearTimeout(imageLoadTimeout);
        
        try {
          const originalDimensions = { width: img.width, height: img.height };
          
          console.log('🔍 Detalhes originais da imagem:', {
            largura: originalDimensions.width,
            altura: originalDimensions.height,
            tamanho: (file.size / 1024).toFixed(2) + 'KB',
            tipo: file.type
          });
          
          // Calcular dimensões finais
          const resizeResult = calculateDimensions(
            originalDimensions.width,
            originalDimensions.height,
            { maxWidth: finalConfig.maxWidth, maxHeight: finalConfig.maxHeight }
          );
          
          // Não redimensionar se a imagem for menor que as dimensões máximas
          const finalDimensions = (originalDimensions.width <= finalConfig.maxWidth && 
                                  originalDimensions.height <= finalConfig.maxHeight && 
                                  file.size < 500 * 1024) 
            ? { ...originalDimensions, wasResized: false }
            : resizeResult;
          
          if (!finalDimensions.wasResized) {
            console.log('ℹ️ Imagem já está em tamanho adequado, aplicando apenas compressão leve');
          }
          
          // Criar canvas e desenhar imagem
          const canvas = document.createElement('canvas');
          const shouldFillBackground = file.type !== 'image/png' && file.type !== 'image/webp';
          drawImageToCanvas(canvas, img, finalDimensions.width, finalDimensions.height, shouldFillBackground);
          
          // Calcular qualidade e formato de saída
          const adjustedQuality = calculateOptimalQuality({
            baseQuality: finalConfig.quality,
            fileSize: file.size,
            maxDimensions: { maxWidth: finalConfig.maxWidth, maxHeight: finalConfig.maxHeight }
          });
          
          const outputMimeType = determineOutputFormat(file.type, file.size, canvas);
          const dataUrl = canvas.toDataURL(outputMimeType, adjustedQuality);
          
          // Converter para blob/file
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                console.error('❌ Falha ao gerar blob da imagem');
                const dataUrlBlob = dataURLtoBlob(dataUrl);
                if (!dataUrlBlob) {
                  reject(new Error('Falha ao comprimir a imagem'));
                  return;
                }
                blob = dataUrlBlob;
              }
              
              const filename = createOptimizedFileName(file.name, outputMimeType);
              const compressedFile = new File([blob], filename, { type: outputMimeType });
              
              logCompressionStats(file, compressedFile, originalDimensions, finalDimensions, outputMimeType);
              
              resolve({
                file: compressedFile,
                width: finalDimensions.width,
                height: finalDimensions.height,
                dataUrl
              });
            },
            outputMimeType,
            adjustedQuality
          );
        } catch (error) {
          console.error('❌ Erro durante a compressão da imagem:', error);
          reject(new Error(`Erro durante a compressão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`));
        }
      };
      
      img.onerror = () => {
        clearTimeout(imageLoadTimeout);
        reject(new Error('Não foi possível carregar a imagem. O formato pode não ser suportado ou a imagem está corrompida.'));
      };
      
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error('Falha ao ler o arquivo de imagem'));
      }
    };
    
    reader.onerror = () => {
      clearTimeout(readerTimeout);
      reject(new Error('Não foi possível ler o arquivo. O arquivo pode estar corrompido ou inacessível.'));
    };
  });
}
