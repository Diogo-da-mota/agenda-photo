
import { useCallback } from "react";
import { useImageUploadUI } from "./useImageUploadUI";
import { useImageUploadLogic } from "./useImageUploadLogic";
import { useImageUploadError } from "./useImageUploadError";

// Interface de opções (mantida e exportada para outros components)
export interface UseImageUploadOptions {
  onUploadComplete?: (url: string) => void;
  onBatchComplete?: (results: Array<{ url: string; success: boolean }>) => void;
  produtoId?: string;
  maxSize?: number;
  allowedTypes?: string[];
  generateThumbnails?: boolean;
  withStats?: boolean;
}

// Exporta o hook unificado para o app, mas usando hooks específicos de UI/Lógica/Erros
export function useImageUpload(options: UseImageUploadOptions = {}) {
  const ui = useImageUploadUI(options);
  const logic = useImageUploadLogic(options, ui);
  const error = useImageUploadError(ui);

  return {
    ...ui,
    ...logic,
    ...error,
  };
}
