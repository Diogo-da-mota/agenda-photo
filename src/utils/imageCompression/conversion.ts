
export function dataURLtoBlob(dataurl: string): Blob | null {
  try {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('❌ Erro ao converter dataURL para Blob:', e);
    return null;
  }
}

export function createOptimizedFileName(originalName: string, outputMimeType: string): string {
  let extension = outputMimeType.split('/')[1];
  if (extension === 'jpeg') extension = 'jpg';
  
  const originalNameWithoutExt = originalName.split('.')[0] || 'image';
  return `${originalNameWithoutExt}.${extension}`;
}

export function logCompressionStats(
  originalFile: File,
  compressedFile: File,
  originalDimensions: { width: number; height: number },
  finalDimensions: { width: number; height: number },
  outputMimeType: string
): void {
  console.log('✅ Compressão concluída:', {
    larguraOriginal: originalDimensions.width,
    alturaOriginal: originalDimensions.height,
    larguraFinal: finalDimensions.width,
    alturaFinal: finalDimensions.height,
    tamanhoOriginal: (originalFile.size / 1024).toFixed(2) + 'KB',
    tamanhoFinal: (compressedFile.size / 1024).toFixed(2) + 'KB',
    taxaCompressao: ((originalFile.size - compressedFile.size) / originalFile.size * 100).toFixed(2) + '%',
    tipoOriginal: originalFile.type,
    tipoFinal: outputMimeType
  });
}
