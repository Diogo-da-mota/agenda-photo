
import { toast } from '@/hooks/use-toast';

interface FormData {
  titulo: string;
  categoria: string;
  local: string;
  descricao: string;
  tags: string[];
  imagens: string[];
  arquivos: File[];
}

export const validateTrabalhoForm = (formData: FormData, toastFn: typeof toast): boolean => {
  if (!formData.titulo.trim()) {
    toastFn({
      title: "Erro de validação",
      description: "O título é obrigatório.",
      variant: "destructive"
    });
    return false;
  }

  if (!formData.categoria) {
    toastFn({
      title: "Erro de validação",
      description: "A categoria é obrigatória.",
      variant: "destructive"
    });
    return false;
  }

  return true;
};
