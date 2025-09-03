
export interface ResizeConfig {
  maxWidth: number;
  maxHeight: number;
}

export interface ResizeResult {
  width: number;
  height: number;
  wasResized: boolean;
}

export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  config: ResizeConfig
): ResizeResult {
  let width = originalWidth;
  let height = originalHeight;
  let wasResized = false;

  const aspectRatio = width / height;

  if (width > config.maxWidth) {
    width = config.maxWidth;
    height = Math.round(width / aspectRatio);
    wasResized = true;
  }

  if (height > config.maxHeight) {
    height = config.maxHeight;
    width = Math.round(height * aspectRatio);
    wasResized = true;
  }

  return { width, height, wasResized };
}

export function drawImageToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  width: number,
  height: number,
  fillBackground: boolean = true
): CanvasRenderingContext2D {
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível processar a imagem (contexto 2D indisponível)');
  }

  // Melhor qualidade de renderização
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fundo branco para imagens com transparência (exceto PNG e WebP)
  if (fillBackground) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(image, 0, 0, width, height);
  return ctx;
}
