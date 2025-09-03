
export interface QualityConfig {
  baseQuality: number;
  fileSize: number;
  maxDimensions: { maxWidth: number; maxHeight: number };
}

export function calculateOptimalQuality(config: QualityConfig): number {
  let adjustedQuality = config.baseQuality;

  // Ajustar qualidade com base no tamanho da imagem
  if (config.fileSize > 5 * 1024 * 1024) {
    console.log('⚠️ Imagem muito grande, aplicando compressão mais agressiva');
    adjustedQuality = Math.max(0.5, config.baseQuality - 0.2);
  } else if (config.fileSize < 200 * 1024) {
    console.log('ℹ️ Imagem pequena, mantendo qualidade alta');
    adjustedQuality = Math.min(0.9, config.baseQuality + 0.1);
  }

  return adjustedQuality;
}

export function determineOutputFormat(
  originalType: string,
  fileSize: number,
  canvas: HTMLCanvasElement
): string {
  let outputMimeType = originalType;

  // Forçar JPEG para imagens grandes não-PNG para melhor compressão
  if (fileSize > 1024 * 1024 && originalType !== 'image/png' && originalType !== 'image/gif') {
    outputMimeType = 'image/jpeg';
  }

  // Tentar WebP para melhor compressão se o navegador suportar
  const isWebPSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  if (isWebPSupported && originalType !== 'image/gif') {
    console.log('ℹ️ WebP suportado, usando para melhor compressão');
    outputMimeType = 'image/webp';
  }

  return outputMimeType;
}
