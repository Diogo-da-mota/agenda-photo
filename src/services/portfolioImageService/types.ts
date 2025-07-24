
// Interface para resposta do serviço de upload
export interface N8NImageResponse {
  url: string;
  success: boolean;
  message?: string;
}

// Interface para callback de progresso
export interface ProgressCallback {
  (current: number, total: number, fileName: string): void;
}

// Interfaces antigas para compatibilidade (agora não usadas)
export interface ImagemPortfolio {
  id: string;
  url: string;
  thumbnail_url?: string;
  trabalho_id: string;
  ordem: number;
  filename: string;
  filesize: number;
  mimetype: string;
  criado_em: string;
}

export interface UploadImagemPortfolio {
  file: File;
  ordem: number;
}
