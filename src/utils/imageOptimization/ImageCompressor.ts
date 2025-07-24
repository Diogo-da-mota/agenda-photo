/**
 * Sistema de compressão e otimização de imagens
 * Reduz tamanho de imagens automaticamente para melhor performance
 */

export interface CompressionOptions {
  quality: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  enableResize?: boolean;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
}

export class ImageCompressor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Comprimir uma única imagem
   */
  async compressImage(
    file: File, 
    options: CompressionOptions = { quality: 0.8 }
  ): Promise<CompressionResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = async () => {
        try {
          const result = await this.processImage(img, file, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Comprimir múltiplas imagens em paralelo
   */
  async compressImages(
    files: File[], 
    options: CompressionOptions = { quality: 0.8 }
  ): Promise<CompressionResult[]> {
    const promises = files.map(file => this.compressImage(file, options));
    return Promise.all(promises);
  }

  /**
   * Compressão automática baseada no tamanho do arquivo
   */
  async autoCompress(file: File): Promise<CompressionResult> {
    const sizeInMB = file.size / (1024 * 1024);
    
    let options: CompressionOptions;
    
    if (sizeInMB > 5) {
      // Imagens muito grandes - compressão agressiva
      options = {
        quality: 0.6,
        maxWidth: 1920,
        maxHeight: 1080,
        format: 'webp',
        enableResize: true
      };
    } else if (sizeInMB > 2) {
      // Imagens médias - compressão moderada
      options = {
        quality: 0.75,
        maxWidth: 2560,
        maxHeight: 1440,
        format: 'webp',
        enableResize: true
      };
    } else {
      // Imagens pequenas - compressão leve
      options = {
        quality: 0.85,
        format: 'webp'
      };
    }

    return this.compressImage(file, options);
  }

  private processImage(
    img: HTMLImageElement, 
    originalFile: File, 
    options: CompressionOptions
  ): Promise<CompressionResult> {
    const { quality, maxWidth, maxHeight, format, enableResize } = options;
    
    // Calcular dimensões finais
    let { width, height } = this.calculateDimensions(
      img.width, 
      img.height, 
      maxWidth, 
      maxHeight, 
      enableResize
    );

    // Configurar canvas
    this.canvas.width = width;
    this.canvas.height = height;

    // Limpar canvas
    this.ctx.clearRect(0, 0, width, height);

    // Desenhar imagem redimensionada
    this.ctx.drawImage(img, 0, 0, width, height);

    // Determinar formato final
    const outputFormat = this.getOutputFormat(format, originalFile.type);
    
    // Converter para blob
    return new Promise<CompressionResult>((resolve) => {
      this.canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Falha na compressão');
          }

          const compressedFile = new File(
            [blob], 
            this.generateFileName(originalFile.name, outputFormat),
            { type: blob.type }
          );

          const compressionRatio = ((originalFile.size - blob.size) / originalFile.size) * 100;

          resolve({
            compressedFile,
            originalSize: originalFile.size,
            compressedSize: blob.size,
            compressionRatio: Math.round(compressionRatio * 100) / 100,
            format: outputFormat
          });
        },
        outputFormat,
        quality
      );
    });
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number,
    enableResize?: boolean
  ): { width: number; height: number } {
    if (!enableResize || (!maxWidth && !maxHeight)) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    let width = originalWidth;
    let height = originalHeight;

    if (maxWidth && width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  }

  private getOutputFormat(requestedFormat?: string, originalFormat?: string): string {
    if (requestedFormat) {
      return `image/${requestedFormat}`;
    }

    // Se o navegador suporta WebP, usar WebP
    if (this.supportsWebP()) {
      return 'image/webp';
    }

    // Fallback para formato original ou JPEG
    return originalFormat || 'image/jpeg';
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  }

  private generateFileName(originalName: string, format: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const extension = format.split('/')[1];
    return `${nameWithoutExt}_compressed.${extension}`;
  }

  /**
   * Verificar se uma imagem precisa ser comprimida
   */
  static needsCompression(file: File, maxSizeInMB: number = 1): boolean {
    const sizeInMB = file.size / (1024 * 1024);
    return sizeInMB > maxSizeInMB;
  }

  /**
   * Obter estatísticas de compressão
   */
  static getCompressionStats(results: CompressionResult[]): {
    totalOriginalSize: number;
    totalCompressedSize: number;
    averageCompressionRatio: number;
    totalSavings: number;
  } {
    const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0);
    const averageCompressionRatio = results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length;
    const totalSavings = totalOriginalSize - totalCompressedSize;

    return {
      totalOriginalSize,
      totalCompressedSize,
      averageCompressionRatio: Math.round(averageCompressionRatio * 100) / 100,
      totalSavings
    };
  }
}

// Instância singleton
export const imageCompressor = new ImageCompressor(); 