/**
 * Utilitário para download de imagens compatível com iOS
 * Solução específica para problema de download em dispositivos Apple
 */

import { deviceDetection } from './deviceDetection';
import { toast } from 'sonner';

export interface DownloadImageOptions {
  filename?: string;
  quality?: number;
  showInstructions?: boolean;
  fallbackToNewTab?: boolean;
}

/**
 * Download de imagem compatível com iOS usando Canvas + toBlob
 */
export const downloadImageIOS = async (
  imageUrl: string, 
  options: DownloadImageOptions = {}
): Promise<void> => {
  const {
    filename = 'image.jpg',
    quality = 0.9,
    showInstructions = true,
    fallbackToNewTab = true
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas não suportado'));
      return;
    }

    // Configurar CORS para evitar problemas de segurança
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Configurar canvas com dimensões da imagem
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Desenhar imagem no canvas
        ctx.drawImage(img, 0, 0);

        // Converter para blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Erro ao converter imagem'));
            return;
          }

          const url = URL.createObjectURL(blob);
          
          // Para iOS: abrir em nova aba para permitir salvamento
          const newWindow = window.open(url, '_blank');
          
          if (!newWindow) {
            // Se popup foi bloqueado, tentar fallback
            if (fallbackToNewTab) {
              window.location.href = url;
            } else {
              reject(new Error('Popup bloqueado'));
              return;
            }
          }

          // Mostrar instruções para usuário iOS
          if (showInstructions) {
            setTimeout(() => {
              toast.info(
                'Para salvar a imagem: toque e segure a imagem, depois selecione "Salvar na Galeria de Fotos"',
                { duration: 8000 }
              );
            }, 1000);
          }

          // Limpar URL após uso
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 10000);

          resolve();
        }, 'image/jpeg', quality);

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Erro ao carregar imagem'));
    };

    // Carregar imagem
    img.src = imageUrl;
  });
};

/**
 * Download normal para dispositivos que suportam o atributo download
 */
export const downloadImageNormal = async (
  imageUrl: string,
  filename: string = 'image.jpg'
): Promise<void> => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Erro ao baixar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

/**
 * Download usando Share API (para dispositivos compatíveis)
 */
export const downloadImageShare = async (
  imageUrl: string,
  filename: string = 'image.jpg'
): Promise<void> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Baixar Imagem',
      });
    } else {
      throw new Error('Share API não suportada para arquivos');
    }
  } catch (error) {
    throw new Error(`Erro no compartilhamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

/**
 * Função principal de download que escolhe o método apropriado baseado no dispositivo
 */
export const downloadImageUniversal = async (
  imageUrl: string,
  options: DownloadImageOptions = {}
): Promise<void> => {
  const { filename = 'image.jpg' } = options;
  const deviceInfo = deviceDetection.getDeviceInfo();

  console.log('Device Info:', deviceInfo);
  console.log('Downloading image:', imageUrl);

  try {
    if (deviceInfo.isIOS) {
      // iOS: Usar método específico com canvas
      console.log('Using iOS download method');
      await downloadImageIOS(imageUrl, options);
      toast.success('Imagem aberta para download (iOS)');
    } else if (deviceInfo.supportsShare && options.fallbackToNewTab !== false) {
      // Tentar Share API primeiro (se disponível)
      console.log('Trying Share API');
      try {
        await downloadImageShare(imageUrl, filename);
        toast.success('Imagem compartilhada com sucesso!');
      } catch {
        // Fallback para download normal
        console.log('Share API failed, using normal download');
        await downloadImageNormal(imageUrl, filename);
        toast.success('Imagem baixada com sucesso!');
      }
    } else {
      // Download normal para outros dispositivos
      console.log('Using normal download method');
      await downloadImageNormal(imageUrl, filename);
      toast.success('Imagem baixada com sucesso!');
    }
  } catch (error) {
    console.error('Download error:', error);
    toast.error(`Erro ao baixar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    throw error;
  }
};

/**
 * Função específica para download de fotos da galeria (mantém compatibilidade)
 */
export const downloadPhotoCard = async (
  imageUrl: string,
  cardName: string,
  options: Partial<DownloadImageOptions> = {}
): Promise<void> => {
  const filename = `${cardName}_photo.jpg`;
  
  return downloadImageUniversal(imageUrl, {
    filename,
    ...options
  });
};