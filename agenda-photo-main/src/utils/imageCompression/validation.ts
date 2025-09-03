
export interface ImageValidationConfig {
  maxSize: number;
  validTypes: string[];
}

export const defaultValidationConfig: ImageValidationConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  validTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
};

export function validateImageFile(file: File, config: ImageValidationConfig = defaultValidationConfig): void {
  if (file.size > config.maxSize) {
    throw new Error(`A imagem é muito grande (${(file.size / (1024 * 1024)).toFixed(1)}MB). O tamanho máximo é ${(config.maxSize / (1024 * 1024)).toFixed(0)}MB`);
  }
  
  if (!config.validTypes.includes(file.type)) {
    throw new Error(`Tipo de imagem não suportado: ${file.type}. Use JPEG, PNG, WebP ou GIF.`);
  }
}
