
import { toast } from "@/hooks/use-toast";

interface ValidateFileOptions {
  file: File;
  maxSize: number; // in MB
  allowedTypes: string[];
}

export const validateFile = ({ file, maxSize, allowedTypes }: ValidateFileOptions): { isValid: boolean; error?: string } => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const errorMsg = `Apenas ${allowedTypes.map(t => t.replace('image/', '.')).join(', ')} são permitidos.`;
    toast({
      title: "Tipo de arquivo inválido",
      description: errorMsg,
      variant: "destructive"
    });
    return { isValid: false, error: errorMsg };
  }
  
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSize) {
    const errorMsg = `O tamanho máximo permitido é ${maxSize}MB.`;
    toast({
      title: "Arquivo muito grande",
      description: errorMsg,
      variant: "destructive"
    });
    return { isValid: false, error: errorMsg };
  }
  
  return { isValid: true };
};
