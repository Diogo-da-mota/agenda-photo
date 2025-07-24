/**
 * Web Worker para processamento de imagens em background
 * Evita travamento da UI durante compressão e redimensionamento
 */

// Tipos de mensagens suportadas
const MESSAGE_TYPES = {
  COMPRESS_IMAGE: 'compress_image',
  RESIZE_IMAGE: 'resize_image',
  BATCH_PROCESS: 'batch_process',
  GENERATE_THUMBNAIL: 'generate_thumbnail'
};

// Configurações padrão
const DEFAULT_CONFIG = {
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
  format: 'webp',
  thumbnailSize: 300
};

/**
 * Comprimir uma imagem
 */
async function compressImage(imageData, config = {}) {
  const options = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // Criar bitmap da imagem
    const imageBitmap = await createImageBitmap(imageData);
    
    // Calcular dimensões finais
    const { width, height } = calculateDimensions(
      imageBitmap.width,
      imageBitmap.height,
      options.maxWidth,
      options.maxHeight
    );
    
    // Criar canvas off-screen
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Desenhar imagem redimensionada
    ctx.drawImage(imageBitmap, 0, 0, width, height);
    
    // Converter para blob comprimido
    const blob = await canvas.convertToBlob({
      type: `image/${options.format}`,
      quality: options.quality
    });
    
    // Calcular estatísticas
    const originalSize = imageData.size || 0;
    const compressedSize = blob.size;
    const compressionRatio = originalSize > 0 
      ? ((originalSize - compressedSize) / originalSize) * 100 
      : 0;
    
    return {
      blob,
      originalSize,
      compressedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      dimensions: { width, height },
      format: options.format
    };
    
  } catch (error) {
    throw new Error(`Erro na compressão: ${error.message}`);
  }
}

/**
 * Gerar thumbnail de uma imagem
 */
async function generateThumbnail(imageData, size = 300) {
  try {
    const imageBitmap = await createImageBitmap(imageData);
    
    // Calcular dimensões do thumbnail (quadrado)
    const { width, height } = calculateSquareDimensions(
      imageBitmap.width,
      imageBitmap.height,
      size
    );
    
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Preencher fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Centralizar e desenhar imagem
    const x = (size - width) / 2;
    const y = (size - height) / 2;
    ctx.drawImage(imageBitmap, x, y, width, height);
    
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: 0.9
    });
    
    return {
      blob,
      size: blob.size,
      dimensions: { width: size, height: size }
    };
    
  } catch (error) {
    throw new Error(`Erro na geração de thumbnail: ${error.message}`);
  }
}

/**
 * Processar lote de imagens
 */
async function batchProcess(images, config = {}) {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < images.length; i++) {
    try {
      // Enviar progresso
      self.postMessage({
        type: 'progress',
        current: i + 1,
        total: images.length,
        percentage: Math.round(((i + 1) / images.length) * 100)
      });
      
      const result = await compressImage(images[i], config);
      results.push({
        index: i,
        ...result
      });
      
    } catch (error) {
      errors.push({
        index: i,
        error: error.message
      });
    }
  }
  
  return { results, errors };
}

/**
 * Calcular dimensões mantendo proporção
 */
function calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
  let { width, height } = { width: originalWidth, height: originalHeight };
  
  // Redimensionar se necessário
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Calcular dimensões para thumbnail quadrado
 */
function calculateSquareDimensions(originalWidth, originalHeight, size) {
  const aspectRatio = originalWidth / originalHeight;
  
  let width, height;
  
  if (aspectRatio > 1) {
    // Landscape
    height = size;
    width = size * aspectRatio;
  } else {
    // Portrait ou quadrado
    width = size;
    height = size / aspectRatio;
  }
  
  // Garantir que não exceda o tamanho do thumbnail
  if (width > size) {
    width = size;
    height = size / aspectRatio;
  }
  
  if (height > size) {
    height = size;
    width = size * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Listener principal para mensagens
 */
self.addEventListener('message', async (event) => {
  const { type, data, id } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case MESSAGE_TYPES.COMPRESS_IMAGE:
        result = await compressImage(data.imageData, data.config);
        break;
        
      case MESSAGE_TYPES.RESIZE_IMAGE:
        result = await compressImage(data.imageData, {
          ...data.config,
          quality: 1.0 // Sem compressão para resize puro
        });
        break;
        
      case MESSAGE_TYPES.GENERATE_THUMBNAIL:
        result = await generateThumbnail(data.imageData, data.size);
        break;
        
      case MESSAGE_TYPES.BATCH_PROCESS:
        result = await batchProcess(data.images, data.config);
        break;
        
      default:
        throw new Error(`Tipo de mensagem não suportado: ${type}`);
    }
    
    // Enviar resultado de volta
    self.postMessage({
      type: 'success',
      id,
      result
    });
    
  } catch (error) {
    // Enviar erro de volta
    self.postMessage({
      type: 'error',
      id,
      error: error.message
    });
  }
});

/**
 * Listener para erros não tratados
 */
self.addEventListener('error', (error) => {
  self.postMessage({
    type: 'worker_error',
    error: error.message
  });
});

// Sinalizar que o worker está pronto
self.postMessage({
  type: 'ready',
  message: 'Image Worker inicializado e pronto para uso'
}); 